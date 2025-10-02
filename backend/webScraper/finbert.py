import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import sqlite3

# Initialize the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")

# Connect to the NewsArticles.db and extract headlines with their row IDs
with sqlite3.connect("backend/webScraper/NewsArticles.db") as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT id, headline FROM articles WHERE headline IS NOT NULL")
    rows = cursor.fetchall()
    ids = [row[0] for row in rows]
    financial_texts = [row[1] for row in rows]

    if financial_texts:
        # Tokenize the financial texts
        inputs = tokenizer(
            financial_texts,
            padding=True,
            truncation=True,
            return_tensors='pt'  # Return PyTorch tensors
        )

        # Perform model inference
        with torch.no_grad():
            outputs = model(**inputs)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
            predicted_labels = torch.argmax(probabilities, dim=-1)

        # Map the numerical labels to sentiment words
        sentiment_mapping = {0: 'positive', 1: 'negative', 2: 'neutral'}  # Adjust based on model's output order

        # Update the database with the predicted sentiments
        for i, text in enumerate(financial_texts):
            sentiment = sentiment_mapping[predicted_labels[i].item()]
            capitalized_sentiment = sentiment.capitalize()
            print(f"Text: \"{text}\" -> Predicted Sentiment: {capitalized_sentiment}")
            cursor.execute(
                "UPDATE articles SET [Predicted Sentiment]=? WHERE id=?",
                (capitalized_sentiment, ids[i])
            )
        conn.commit()
    else:
        print("No headlines found in the database.")