# predict.py
# Loads saved BERT classifier + distilgpt2 generator
# Classifies news headline → generates business insight

from transformers import pipeline

# ─────────────────────────────────────────────
# LABEL MAP (must match AG News training order)
# 0=World, 1=Sports, 2=Business, 3=Sci/Tech
# ─────────────────────────────────────────────
LABELS = ["World", "Sports", "Business", "Tech"]

# ─────────────────────────────────────────────
# 1. LOAD CLASSIFIER (fine-tuned BERT from train.py)
# ─────────────────────────────────────────────
print("Loading classifier...")
classifier = pipeline(
    "text-classification",
    model="./model",
    tokenizer="./model",
)

# ─────────────────────────────────────────────
# 2. LOAD GENERATOR (distilgpt2 — no fine-tuning needed)
# ─────────────────────────────────────────────
print("Loading generator...")
generator = pipeline(
    "text-generation",
    model="distilgpt2",
)

# ─────────────────────────────────────────────
# 3. INSIGHT GENERATION FUNCTION
# ─────────────────────────────────────────────
def generate_insight(text: str, category: str) -> str:
    """
    Given a news headline and its category,
    generate a short business insight using distilgpt2.
    """
    prompt = (
        f"News: {text}\n"
        f"Category: {category}\n"
        f"Business Insight:"
    )

    output = generator(
        prompt,
        max_new_tokens=50,       # generate 50 new tokens after the prompt
        num_return_sequences=1,
        do_sample=True,
        temperature=0.8,         # slight randomness for varied outputs
        pad_token_id=50256,      # required for distilgpt2 (no native pad token)
    )

    full_text = output[0]["generated_text"]

    # Extract only the part after "Business Insight:"
    if "Business Insight:" in full_text:
        insight = full_text.split("Business Insight:")[-1].strip()
    else:
        insight = full_text.strip()

    return insight


# ─────────────────────────────────────────────
# 4. MAIN PREDICTION FUNCTION
# ─────────────────────────────────────────────
def predict(text: str):
    """
    Full pipeline:
      1. Classify news headline into one of 4 categories
      2. Generate a business insight based on headline + category

    Returns:
        category (str): e.g. "Tech"
        insight  (str): generated insight text
    """
    # Step 1: Classify
    result = classifier(text)
    # result looks like: [{'label': 'LABEL_3', 'score': 0.97}]
    label_str = result[0]["label"]           # e.g. "LABEL_3"
    idx = int(label_str.split("_")[-1])      # extract index → 3
    category = LABELS[idx]                   # → "Tech"
    confidence = round(result[0]["score"] * 100, 1)

    # Step 2: Generate insight
    insight = generate_insight(text, category)

    return category, confidence, insight


# ─────────────────────────────────────────────
# 5. TEST (runs when you execute predict.py directly)
# ─────────────────────────────────────────────
if __name__ == "__main__":
    test_headlines = [
        "Tesla launches new AI chip for self-driving cars",
        "India wins cricket World Cup in a thrilling final",
        "Federal Reserve raises interest rates by 0.5%",
        "UN Security Council meets over rising tensions in Middle East",
    ]

    print("\n" + "="*60)
    for headline in test_headlines:
        category, confidence, insight = predict(headline)
        print(f"\nHeadline  : {headline}")
        print(f"Category  : {category} ({confidence}% confidence)")
        print(f"Insight   : {insight}")
        print("-"*60)
