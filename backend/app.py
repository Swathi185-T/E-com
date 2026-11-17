"""
Flask REST API for E-Commerce Product Category Classification
Exposes endpoints for prediction, dashboard analytics, prediction history, and model metrics.
"""

import os
import json
import re
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

from database import (
    init_db,
    save_prediction,
    get_history,
    delete_prediction,
    clear_all_history,
    get_dashboard_stats
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

MODEL_PATH = os.path.join(MODEL_DIR, "product_category_model.joblib")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")
CLASSES_PATH = os.path.join(MODEL_DIR, "label_classes.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "model_metrics.json")

app = Flask(__name__)
# Enable CORS for all routes (allows React frontend on port 5173 / localhost to talk to Flask)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Global model state
model = None
vectorizer = None
classes = None
model_metrics = None

def preprocess_text(text):
    """Sanitizes text by stripping HTML, URLs, and special characters."""
    if not isinstance(text, str):
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

def load_ml_assets():
    """Loads the serialized trained model, TF-IDF vectorizer, and evaluation metrics."""
    global model, vectorizer, classes, model_metrics
    try:
        if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
            model = joblib.load(MODEL_PATH)
            vectorizer = joblib.load(VECTORIZER_PATH)
            classes = joblib.load(CLASSES_PATH)
            print(f"[ML Engine] Successfully loaded model and vectorizer. Classes: {classes}")
        else:
            print("[ML Engine] WARNING: Model files not found. Train model using train_model.py first.")
            
        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, "r", encoding="utf-8") as f:
                model_metrics = json.load(f)
            print(f"[ML Engine] Loaded actual metrics for: {model_metrics.get('best_model')}")
        else:
            print("[ML Engine] WARNING: model_metrics.json not found.")
    except Exception as e:
        print(f"[ML Engine] Error loading ML assets: {e}")

# Initialize Database and load ML assets
init_db()
load_ml_assets()

# -------------------------------------------------------------
# REST API Endpoints
# -------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify backend server and model readiness."""
    return jsonify({
        "status": "healthy",
        "service": "E-Commerce Product Category Classification API",
        "model_loaded": model is not None,
        "active_model": model_metrics.get("best_model") if model_metrics else "Not Loaded",
        "total_categories": len(classes) if classes else 0,
        "database": "SQLite (Connected)"
    }), 200

@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Predict product category from product name and description.
    Accepts:
      {
        "product_name": "Samsung Galaxy S24",
        "description": "Android smartphone with 256GB storage..."
      }
    Returns:
      {
        "predicted_category": "Electronics",
        "confidence_score": 0.985,
        "confidence_percentage": "98.50%",
        "top_three": [...],
        "all_probabilities": [...],
        "probability_note": "Probability scores are mathematical estimates based on TF-IDF word frequencies, not guaranteed certainties."
      }
    """
    if model is None or vectorizer is None:
        return jsonify({
            "error": "Machine Learning model is not loaded. Please ensure train_model.py was executed."
        }), 503

    data = request.get_json(silent=True) or {}
    product_name = data.get("product_name", "").strip()
    description = data.get("description", "").strip()

    # Input validation
    if not product_name and not description:
        return jsonify({
            "error": "Please provide at least a Product Name or a Product Description."
        }), 400

    # Clean text and construct feature string (matching training preprocessing)
    clean_name = preprocess_text(product_name)
    clean_desc = preprocess_text(description)
    
    # Combined feature representation
    feature_text = (clean_name + " " + clean_name + " " + clean_desc).strip()
    if not feature_text:
        return jsonify({
            "error": "Input text contains only invalid or punctuation-only characters. Please provide meaningful text."
        }), 400

    # Transform with TF-IDF vectorizer
    X_vec = vectorizer.transform([feature_text])

    # Category prediction
    predicted_cat = str(model.predict(X_vec)[0])

    # Probability extraction (calibrated confidence score)
    top_three = []
    all_probabilities = []
    confidence_score = 0.0

    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X_vec)[0]
        model_classes = list(model.classes_)
        
        # Sort classes by probability descending
        ranked_indices = np.argsort(probs)[::-1]
        
        confidence_score = float(probs[model_classes.index(predicted_cat)])
        
        for idx in ranked_indices[:3]:
            cat_name = model_classes[idx]
            prob_val = float(probs[idx])
            top_three.append({
                "category": cat_name,
                "score": round(prob_val, 4),
                "percentage": f"{prob_val * 100:.2f}%"
            })
            
        for idx in ranked_indices:
            cat_name = model_classes[idx]
            prob_val = float(probs[idx])
            all_probabilities.append({
                "category": cat_name,
                "score": round(prob_val, 4),
                "percentage": f"{prob_val * 100:.2f}%"
            })
    else:
        # Fallback if model doesn't support probabilities
        confidence_score = 1.0
        top_three = [{"category": predicted_cat, "score": 1.0, "percentage": "100.0%"}]
        all_probabilities = top_three

    # Save prediction into SQLite
    try:
        pred_id = save_prediction(
            product_name=product_name if product_name else "Unnamed Product",
            description=description if description else "No description provided",
            predicted_category=predicted_cat,
            confidence_score=confidence_score,
            top_categories=top_three,
            all_probabilities=all_probabilities
        )
    except Exception as e:
        print(f"Error saving prediction to DB: {e}")
        pred_id = None

    return jsonify({
        "id": pred_id,
        "product_name": product_name,
        "description": description,
        "predicted_category": predicted_cat,
        "confidence_score": round(confidence_score, 4),
        "confidence_percentage": f"{confidence_score * 100:.2f}%",
        "top_three": top_three,
        "all_probabilities": all_probabilities,
        "probability_note": "Probability scores are statistical estimates derived from TF-IDF feature distributions and do not represent absolute certainty.",
        "model_used": model_metrics.get("best_model") if model_metrics else "Trained Classifier"
    }), 200

@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    """
    Returns aggregated dashboard metrics and category distributions for Recharts.
    """
    stats = get_dashboard_stats()
    
    # Include actual model accuracy and best model info
    stats["model_summary"] = {
        "best_model": model_metrics.get("best_model") if model_metrics else "Not Loaded",
        "test_accuracy": model_metrics.get("selected_metrics", {}).get("accuracy", 0.0) if model_metrics else 0.0,
        "test_f1_score": model_metrics.get("selected_metrics", {}).get("f1_score", 0.0) if model_metrics else 0.0,
        "total_training_samples": model_metrics.get("total_samples", 0) if model_metrics else 0,
        "vocabulary_size": model_metrics.get("vocabulary_size", 0) if model_metrics else 0
    }
    
    return jsonify(stats), 200

@app.route("/api/history", methods=["GET"])
def history():
    """
    Returns paginated prediction history with optional search and category filters.
    Query params:
      - search: string (matches product_name or description)
      - category: string (matches category or 'all')
      - limit: int (default 100)
      - offset: int (default 0)
    """
    search = request.args.get("search", "").strip()
    category = request.args.get("category", "").strip()
    limit = int(request.args.get("limit", 100))
    offset = int(request.args.get("offset", 0))
    
    results = get_history(search=search if search else None, category=category if category else None, limit=limit, offset=offset)
    return jsonify(results), 200

@app.route("/api/history/<int:prediction_id>", methods=["DELETE"])
def delete_history_item(prediction_id):
    """Deletes a specific prediction from history."""
    deleted = delete_prediction(prediction_id)
    if deleted:
        return jsonify({"message": f"Prediction #{prediction_id} deleted successfully."}), 200
    else:
        return jsonify({"error": f"Prediction #{prediction_id} not found."}), 404

@app.route("/api/history", methods=["DELETE"])
def clear_all_history_endpoint():
    """Clears all prediction records."""
    clear_all_history()
    return jsonify({"message": "All prediction history cleared successfully."}), 200

@app.route("/api/model-performance", methods=["GET"])
def model_performance():
    """
    Returns actual evaluation metrics, comparison across the 4 algorithms,
    confusion matrix, and top keywords per category.
    """
    if not model_metrics:
        return jsonify({"error": "Model metrics not available. Run train_model.py first."}), 404
        
    return jsonify(model_metrics), 200

if __name__ == "__main__":
    # Flask development server running on port 5000
    print("\nStarting E-Commerce Classification Flask Server on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)
