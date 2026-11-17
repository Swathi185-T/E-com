"""
SQLite Database Layer for E-Commerce Product Category Classification
Handles prediction logging, retrieval, deletion, and dashboard analytics aggregation.
"""

import os
import sqlite3
import json
from datetime import datetime

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "ecommerce_classification.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes SQLite tables for predictions and feedback if they don't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        description TEXT NOT NULL,
        predicted_category TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        top_categories TEXT NOT NULL,
        all_probabilities TEXT,
        created_at TEXT NOT NULL
    );
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prediction_id INTEGER NOT NULL,
        corrected_category TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE
    );
    """)
    
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pred_cat ON predictions(predicted_category);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pred_created ON predictions(created_at);")
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")

def save_prediction(product_name, description, predicted_category, confidence_score, top_categories, all_probabilities=None):
    """
    Saves a product classification prediction to the SQLite database.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    top_json = json.dumps(top_categories) if isinstance(top_categories, (list, dict)) else str(top_categories)
    all_json = json.dumps(all_probabilities) if isinstance(all_probabilities, (list, dict)) else str(all_probabilities or {})
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute("""
    INSERT INTO predictions (product_name, description, predicted_category, confidence_score, top_categories, all_probabilities, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (product_name, description, predicted_category, float(confidence_score), top_json, all_json, timestamp))
    
    pred_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return pred_id

def get_history(search=None, category=None, limit=100, offset=0):
    """
    Fetches historical predictions with optional text search and category filtering.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM predictions WHERE 1=1"
    params = []
    
    if search:
        query += " AND (product_name LIKE ? OR description LIKE ?)"
        like_term = f"%{search}%"
        params.extend([like_term, like_term])
        
    if category and category.lower() != 'all':
        query += " AND predicted_category = ?"
        params.append(category)
        
    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "product_name": r["product_name"],
            "description": r["description"],
            "predicted_category": r["predicted_category"],
            "confidence_score": round(r["confidence_score"], 4),
            "top_categories": json.loads(r["top_categories"]) if r["top_categories"] else [],
            "all_probabilities": json.loads(r["all_probabilities"]) if r["all_probabilities"] else {},
            "created_at": r["created_at"]
        })
        
    # Get total count matching query
    count_query = "SELECT COUNT(*) as total FROM predictions WHERE 1=1"
    count_params = []
    if search:
        count_query += " AND (product_name LIKE ? OR description LIKE ?)"
        count_params.extend([like_term, like_term])
    if category and category.lower() != 'all':
        count_query += " AND predicted_category = ?"
        count_params.append(category)
        
    cursor.execute(count_query, count_params)
    total = cursor.fetchone()["total"]
    
    conn.close()
    return {"items": results, "total": total}

def delete_prediction(prediction_id):
    """
    Deletes a single prediction record by ID.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM predictions WHERE id = ?", (prediction_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def clear_all_history():
    """
    Clears all prediction records from the database.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM predictions;")
    cursor.execute("DELETE FROM sqlite_sequence WHERE name='predictions';")
    conn.commit()
    conn.close()
    return True

def get_dashboard_stats():
    """
    Aggregates database metrics for the dashboard charts:
    - Total products classified
    - Total unique categories classified
    - Most frequently predicted category
    - Category-wise distribution for Recharts Bar & Pie
    - Recent predictions
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Total products classified
    cursor.execute("SELECT COUNT(*) as total FROM predictions")
    total_products = cursor.fetchone()["total"]
    
    # 2. Category distribution
    cursor.execute("""
    SELECT predicted_category, COUNT(*) as count, AVG(confidence_score) as avg_confidence
    FROM predictions
    GROUP BY predicted_category
    ORDER BY count DESC
    """)
    category_rows = cursor.fetchall()
    
    category_distribution = [
        {
            "category": row["predicted_category"],
            "count": row["count"],
            "avg_confidence": round(row["avg_confidence"], 4) if row["avg_confidence"] else 0
        }
        for row in category_rows
    ]
    
    total_categories = len(category_distribution)
    most_frequent_category = category_distribution[0]["category"] if category_distribution else "None"
    
    # 3. Average confidence across all predictions
    cursor.execute("SELECT AVG(confidence_score) as avg_conf FROM predictions")
    avg_conf_row = cursor.fetchone()["avg_conf"]
    avg_confidence = round(avg_conf_row, 4) if avg_conf_row is not None else 0.0
    
    # 4. Recent 5 predictions
    cursor.execute("""
    SELECT id, product_name, description, predicted_category, confidence_score, created_at
    FROM predictions
    ORDER BY id DESC LIMIT 5
    """)
    recent_rows = cursor.fetchall()
    recent_predictions = [
        {
            "id": r["id"],
            "product_name": r["product_name"],
            "description": r["description"][:100] + "..." if len(r["description"]) > 100 else r["description"],
            "predicted_category": r["predicted_category"],
            "confidence_score": round(r["confidence_score"], 4),
            "created_at": r["created_at"]
        }
        for r in recent_rows
    ]
    
    conn.close()
    
    return {
        "total_products": total_products,
        "total_categories": total_categories,
        "most_frequent_category": most_frequent_category,
        "average_confidence": avg_confidence,
        "category_distribution": category_distribution,
        "recent_predictions": recent_predictions
    }

if __name__ == "__main__":
    init_db()
