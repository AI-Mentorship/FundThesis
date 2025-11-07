import sqlite3
import logging
from transformers import AutoTokenizer, AutoModelForSequenceClassification

try:
    import torch
    print("Torch imported successfully.")
except ImportError as e:
    print(f"Error importing torch: {e}")
    raise

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize the tokenizer and model
try:
    tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
    model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")
    logging.info("Model and tokenizer loaded successfully.")
except Exception as e:
    logging.error(f"Error loading model or tokenizer: {e}")
    raise

# Connect to the NewsArticles.db and extract headlines with their row IDs
try:
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
                logging.info(f"Text: \"{text}\" -> Predicted Sentiment: {capitalized_sentiment}")
                cursor.execute(
                    "UPDATE articles SET [Predicted Sentiment]=? WHERE id=?",
                    (capitalized_sentiment, ids[i])
                )
            conn.commit()
        else:
            logging.info("No headlines found in the database.")
except sqlite3.Error as db_error:
    logging.error(f"Database error: {db_error}")
except Exception as e:
    logging.error(f"An unexpected error occurred: {e}")
