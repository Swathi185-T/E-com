"""
Machine Learning Training and Model Comparison Pipeline for E-Commerce Product Classification

Tasks performed:
1. Loads real-world e-commerce product dataset.
2. Cleans text and handles missing / duplicate values.
3. Combines Product Name and Description into unified text features.
4. Performs Stratified 80/20 train/test split.
5. Transforms text into numerical features using TF-IDF (n-grams 1-2, sublinear TF).
6. Trains and rigorously benchmarks 4 algorithms:
   - Logistic Regression
   - Multinomial Naive Bayes
   - Linear Support Vector Machine (with probability calibration)
   - Random Forest Classifier
7. Evaluates Accuracy, Precision, Recall, F1-score, and Confusion Matrix on the test set.
8. Selects the top-performing model.
9. Extracts top informative keywords per category.
10. Persists artifacts to `backend/model/`:
    - product_category_model.joblib
    - tfidf_vectorizer.joblib
    - label_classes.joblib
    - model_metrics.json
"""

import os
import json
import re
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "ecommerce_products.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model")

os.makedirs(MODEL_DIR, exist_ok=True)

def preprocess_text(text):
    """
    Cleans raw text by removing HTML tags, URLs, special characters,
    and multiple whitespaces while preserving meaningful terms.
    """
    if not isinstance(text, str):
        return ""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

def train_and_evaluate():
    print("=" * 70)
    print("STARTING E-COMMERCE PRODUCT CLASSIFICATION TRAINING PIPELINE")
    print("=" * 70)

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at: {DATASET_PATH}. Run prepare_dataset.py first.")

    # 1. Load Data
    print(f"\n[1/7] Loading dataset from: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)
    print(f"Total raw rows loaded: {len(df)}")
    
    # 2. Data Cleaning & Validation
    print("\n[2/7] Cleaning text and handling missing values...")
    df = df.dropna(subset=['product_name', 'description', 'category']).copy()
    
    df['cleaned_name'] = df['product_name'].apply(preprocess_text)
    df['cleaned_desc'] = df['description'].apply(preprocess_text)
    
    # Combine title and description (giving extra weight to title)
    df['text_feature'] = df['cleaned_name'] + " " + df['cleaned_name'] + " " + df['cleaned_desc']
    df = df[df['text_feature'].str.len() > 10].copy()
    
    # Remove duplicates
    initial_len = len(df)
    df = df.drop_duplicates(subset=['text_feature']).copy()
    print(f"Deduplicated records: removed {initial_len - len(df)} duplicates. Remaining: {len(df)}")
    
    print("\nClass distribution across categories:")
    for cat, count in df['category'].value_counts().items():
        print(f"  - {cat:25s}: {count:4d} products")

    X = df['text_feature'].values
    y = df['category'].values
    categories = sorted(list(df['category'].unique()))

    # 3. Stratified Train-Test Split (80% Train, 20% Test)
    print("\n[3/7] Splitting dataset using Stratified Split (80% Train, 20% Test)...")
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )
    print(f"Training samples: {len(X_train_raw):,} | Test samples: {len(X_test_raw):,}")

    # 4. Feature Extraction using TF-IDF
    print("\n[4/7] Transforming text to numerical features using TF-IDF Vectorizer...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=12000,
        sublinear_tf=True,
        stop_words='english',
        min_df=2
    )
    
    X_train = vectorizer.fit_transform(X_train_raw)
    X_test = vectorizer.transform(X_test_raw)
    print(f"TF-IDF Vocabulary size: {len(vectorizer.vocabulary_):,} features")

    # 5. Model Definitions
    models = {
        "Logistic Regression": LogisticRegression(
            C=2.0,
            max_iter=1000,
            solver='lbfgs',
            random_state=42
        ),
        "Multinomial Naive Bayes": MultinomialNB(
            alpha=0.1
        ),
        "Linear Support Vector Machine": CalibratedClassifierCV(
            estimator=LinearSVC(C=1.0, random_state=42, max_iter=2500),
            cv=3
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=120,
            max_depth=35,
            random_state=42,
            n_jobs=-1
        )
    }

    # 6. Training & Comparative Evaluation
    print("\n[5/7] Training and evaluating all 4 candidate models...")
    comparison_results = {}
    detailed_metrics = {}
    trained_model_objs = {}

    for model_name, model in models.items():
        print(f"\n--> Training: {model_name}...")
        start_time = datetime.now()
        model.fit(X_train, y_train)
        duration = (datetime.now() - start_time).total_seconds()
        
        y_pred = model.predict(X_test)
        
        acc = float(accuracy_score(y_test, y_pred))
        precision_w, recall_w, f1_w, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted', zero_division=0)
        precision_m, recall_m, f1_m, _ = precision_recall_fscore_support(y_test, y_pred, average='macro', zero_division=0)
        
        report = classification_report(y_test, y_pred, target_names=categories, output_dict=True, zero_division=0)
        cm = confusion_matrix(y_test, y_pred, labels=categories).tolist()
        
        print(f"    Completed in {duration:.2f}s")
        print(f"    Accuracy : {acc * 100:.2f}%")
        print(f"    F1-Score : {f1_w * 100:.2f}% (Weighted) | {f1_m * 100:.2f}% (Macro)")
        print(f"    Precision: {precision_w * 100:.2f}%")
        print(f"    Recall   : {recall_w * 100:.2f}%")
        
        trained_model_objs[model_name] = model
        
        comparison_results[model_name] = {
            "accuracy": round(acc, 4),
            "precision": round(float(precision_w), 4),
            "recall": round(float(recall_w), 4),
            "f1_score": round(float(f1_w), 4),
            "training_time_seconds": round(duration, 2)
        }
        
        detailed_metrics[model_name] = {
            "accuracy": round(acc, 4),
            "precision_weighted": round(float(precision_w), 4),
            "recall_weighted": round(float(recall_w), 4),
            "f1_weighted": round(float(f1_w), 4),
            "f1_macro": round(float(f1_m), 4),
            "classification_report": report,
            "confusion_matrix": cm
        }

    # 7. Select Best Model
    print("\n[6/7] Selecting best-performing model based on test F1-score and Accuracy...")
    best_model_name = max(comparison_results, key=lambda k: comparison_results[k]['f1_score'])
    best_model = trained_model_objs[best_model_name]
    best_score = comparison_results[best_model_name]
    
    print(f"BEST MODEL: {best_model_name}")
    print(f"  Accuracy: {best_score['accuracy'] * 100:.2f}% | F1-Score: {best_score['f1_score'] * 100:.2f}%")

    # Extract Top Keywords per Category for Model Explainability
    print("\n[7/7] Extracting top distinguishing keywords per category...")
    top_keywords_per_category = {}
    feature_names = np.array(vectorizer.get_feature_names_out())
    
    # Fit a simple Logistic Regression to inspect coefficients if best model is calibrated
    lr_for_weights = LogisticRegression(max_iter=1000, C=1.0, random_state=42)
    lr_for_weights.fit(X_train, y_train)
    
    for i, category in enumerate(lr_for_weights.classes_):
        top_indices = np.argsort(lr_for_weights.coef_[i])[-12:][::-1]
        top_words = [
            {"word": feature_names[idx], "weight": round(float(lr_for_weights.coef_[i][idx]), 3)}
            for idx in top_indices
        ]
        top_keywords_per_category[category] = top_words

    # Save Model Artifacts
    model_save_path = os.path.join(MODEL_DIR, "product_category_model.joblib")
    vectorizer_save_path = os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")
    classes_save_path = os.path.join(MODEL_DIR, "label_classes.joblib")
    metrics_save_path = os.path.join(MODEL_DIR, "model_metrics.json")

    joblib.dump(best_model, model_save_path)
    joblib.dump(vectorizer, vectorizer_save_path)
    joblib.dump(categories, classes_save_path)

    metadata = {
        "best_model": best_model_name,
        "selected_metrics": comparison_results[best_model_name],
        "comparison": comparison_results,
        "detailed_metrics": detailed_metrics,
        "categories": categories,
        "vocabulary_size": len(vectorizer.vocabulary_),
        "total_samples": len(df),
        "train_samples": len(X_train_raw),
        "test_samples": len(X_test_raw),
        "top_keywords": top_keywords_per_category,
        "trained_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "supports_probabilities": hasattr(best_model, "predict_proba")
    }

    with open(metrics_save_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nModel artifacts saved successfully:")
    print(f" - Model file       : {model_save_path}")
    print(f" - TF-IDF Vectorizer: {vectorizer_save_path}")
    print(f" - Classes list     : {classes_save_path}")
    print(f" - Metrics & Report : {metrics_save_path}")
    print("\n" + "=" * 70)
    print("TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
    print("=" * 70)
    return metadata

if __name__ == "__main__":
    train_and_evaluate()
