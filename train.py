
import numpy as np
import evaluate
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
)

print("Loading AG News dataset...")
dataset = load_dataset("ag_news")

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

def tokenize(example):
    return tokenizer(example["text"], truncation=True, padding="max_length", max_length=128)

print("Tokenizing dataset...")
dataset = dataset.map(tokenize, batched=True)

train_ds = dataset["train"].shuffle(seed=42).select(range(2000))
test_ds  = dataset["test"].shuffle(seed=42).select(range(400))

train_ds.set_format(type="torch", columns=["input_ids", "attention_mask", "label"])
test_ds.set_format(type="torch",  columns=["input_ids", "attention_mask", "label"])

print(f"Train samples: {len(train_ds)} | Eval samples: {len(test_ds)}")

print("Loading BERT model...")
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    num_labels=4
)

# Enable gradient checkpointing to save VRAM on T4
model.gradient_checkpointing_enable()

accuracy = evaluate.load("accuracy")

def compute_metrics(eval_pred):
    logits, labels_ = eval_pred
    preds = np.argmax(logits, axis=1)
    return accuracy.compute(predictions=preds, references=labels_)

training_args = TrainingArguments(
    output_dir="./model",
    num_train_epochs=2,

    # T4 has 16GB VRAM — batch 32 train + 64 eval is safe for BERT-base + fp16
    per_device_train_batch_size=32,
    per_device_eval_batch_size=64,

    # fp16 mixed precision — biggest T4 speedup (3–4x vs fp32)
    fp16=True,

    # Fused AdamW is faster on CUDA
    optim="adamw_torch_fused",

    # LR warmup — good practice with larger batches
    warmup_steps=50,
    learning_rate=3e-5,
    weight_decay=0.01,

    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    logging_steps=20,
    report_to="none",
    dataloader_num_workers=2,       # parallel data loading
    dataloader_pin_memory=True,     # faster CPU→GPU transfers
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_ds,
    eval_dataset=test_ds,
    processing_class=tokenizer,
    compute_metrics=compute_metrics,
)

print("Starting training on T4 GPU...")
trainer.train()

print("Saving model...")
model.save_pretrained("./model")
tokenizer.save_pretrained("./model")
print("Training complete. Model saved to ./model")
