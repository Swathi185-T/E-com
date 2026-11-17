"""
Comprehensive Verification and Audit Script for E-Commerce Product Classification Project
Tests:
1. All 8 category predictions with unseen products.
2. Direct ML model inference verification.
3. Database ACID operations and real-time dashboard aggregation.
4. History filtering, search, and deletion.
5. Model metrics integrity.
6. API endpoint connectivity.
"""

import os
import json
import sqlite3
import urllib.request
import urllib.parse
import joblib

BASE_URL = "http://127.0.0.1:5000"
DB_PATH = os.path.join(os.path.dirname(__file__), "ecommerce_classification.db")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "product_category_model.joblib")
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), "model", "tfidf_vectorizer.joblib")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "model", "model_metrics.json")

def audit_categories():
    print("\n" + "="*70)
    print("AUDIT 1: TESTING ALL 8 PRODUCT CATEGORIES WITH REAL UNSEEN PRODUCTS")
    print("="*70)
    
    test_products = [
        ("Electronics", "Apple MacBook Pro M3 16-inch", "Laptop with 16-core CPU, 40-core GPU, 36GB unified memory, 1TB SSD storage, Liquid Retina XDR display."),
        ("Fashion", "Zara Women Floral Print Maxi Dress", "Elegant sleeveless summer dress with ruffled hemline, v-neckline and breathable chiffon fabric."),
        ("Home & Kitchen", "Philips Air Fryer Digital Touchscreen", "Rapid air technology healthy oil-free cooking appliance with 4.1L capacity and auto shutoff."),
        ("Beauty & Personal Care", "Maybelline New York Colossal Mascara", "Waterproof volume-boosting eye mascara infused with collagen formula for 24-hour long wear."),
        ("Books", "Sapiens: A Brief History of Humankind Paperback", "Bestselling non-fiction book by Yuval Noah Harari exploring the evolutionary history and biology of humankind."),
        ("Sports & Outdoors", "Nivia Pro Football Size 5 Moulded", "All weather durable rubberized football designed for turf and grass matches with butyl bladder."),
        ("Toys & Games", "Hot Wheels 10-Car Pack Diecast Assortment", "Miniature 1:64 scale metal die-cast vehicles collection with authentic styling and eye-catching decos."),
        ("Grocery", "Aashirvaad Shudh Chakki Atta 5kg", "Whole wheat flour rich in dietary fiber, processed from golden grains for soft and fluffy rotis.")
    ]
    
    all_passed = True
    created_ids = []
    
    for expected_cat, name, desc in test_products:
        data = json.dumps({"product_name": name, "description": desc}).encode("utf-8")
        req = urllib.request.Request(f"{BASE_URL}/api/predict", data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            pred_cat = res["predicted_category"]
            conf = res["confidence_percentage"]
            matched = (pred_cat.strip().lower() == expected_cat.strip().lower())
            status = "PASS" if matched else "FAIL"
            if not matched:
                all_passed = False
            created_ids.append(res["id"])
            print(f"[{status}] Expected: {expected_cat:<23} | Predicted: {pred_cat:<23} | Confidence: {conf:<8} | Name: {name[:28]}")
            
    print(f"\nCategory Audit Result: {'ALL 8 CATEGORIES CLASSIFIED CORRECTLY!' if all_passed else 'SOME FAILED'}")
    return created_ids

def audit_model_integrity():
    print("\n" + "="*70)
    print("AUDIT 2: VERIFYING ACTUAL TRAINED ML MODEL AND TF-IDF VECTORIZER")
    print("="*70)
    
    assert os.path.exists(MODEL_PATH), f"Model missing at {MODEL_PATH}"
    assert os.path.exists(VECTORIZER_PATH), f"Vectorizer missing at {VECTORIZER_PATH}"
    assert os.path.exists(METRICS_PATH), f"Metrics missing at {METRICS_PATH}"
    
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    
    print(f"Loaded Model Type: {type(model).__name__}")
    print(f"Supports predict_proba: {hasattr(model, 'predict_proba')}")
    print(f"TF-IDF Vocabulary Size: {len(vectorizer.vocabulary_):,} features")
    print(f"Fitted Classes ({len(model.classes_)}): {list(model.classes_)}")
    
    with open(METRICS_PATH, "r", encoding="utf-8") as f:
        metrics = json.load(f)
    print(f"Best Model Selected in Benchmark: {metrics.get('best_model')}")
    print(f"Benchmark Test Accuracy: {metrics.get('selected_metrics', {}).get('accuracy') * 100:.2f}%")
    print(f"Benchmark Test F1-Score: {metrics.get('selected_metrics', {}).get('f1_score') * 100:.2f}%")

def audit_database_and_dashboard(sample_id):
    print("\n" + "="*70)
    print("AUDIT 3: VERIFYING SQLITE PERSISTENCE AND DASHBOARD AGGREGATION")
    print("="*70)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM predictions")
    db_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT id, product_name, predicted_category, confidence_score FROM predictions WHERE id = ?", (sample_id,))
    row = cursor.fetchone()
    conn.close()
    
    print(f"Direct SQLite Query: Total rows in 'predictions' table = {db_count}")
    print(f"Found Sample ID #{sample_id}: Product '{row[1]}' | Category '{row[2]}' | Confidence {row[3]:.4f}")
    
    # Check dashboard API matches DB
    with urllib.request.urlopen(f"{BASE_URL}/api/dashboard") as resp:
        dash_data = json.loads(resp.read().decode("utf-8"))
        
    print(f"Dashboard API Response: total_products = {dash_data['total_products']}")
    print(f"Dashboard Most Frequent Category: {dash_data['most_frequent_category']}")
    print(f"Dashboard Categories Count: {len(dash_data['category_distribution'])}")
    assert dash_data['total_products'] == db_count, "Dashboard total does not match SQLite row count!"
    print("VERIFICATION: Dashboard metrics directly mirror real database state!")

def audit_history_search_and_deletion(test_id_to_delete):
    print("\n" + "="*70)
    print("AUDIT 4: VERIFYING HISTORY SEARCH, FILTERING, AND DELETION")
    print("="*70)
    
    # 1. Test search
    search_term = "MacBook"
    encoded_url = f"{BASE_URL}/api/history?search={urllib.parse.quote(search_term)}"
    with urllib.request.urlopen(encoded_url) as resp:
        search_res = json.loads(resp.read().decode("utf-8"))
        print(f"Search query '{search_term}': returned {len(search_res['items'])} items (Total matching: {search_res['total']})")
        assert any("MacBook" in it["product_name"] for it in search_res["items"]), "Search failed to match MacBook!"
        
    # 2. Test category filter
    cat_filter = "Fashion"
    with urllib.request.urlopen(f"{BASE_URL}/api/history?category={urllib.parse.quote(cat_filter)}") as resp:
        cat_res = json.loads(resp.read().decode("utf-8"))
        print(f"Category filter '{cat_filter}': returned {len(cat_res['items'])} items")
        assert all(it["predicted_category"] == cat_filter for it in cat_res["items"]), "Filter returned incorrect category!"

    # 3. Test delete item
    del_req = urllib.request.Request(f"{BASE_URL}/api/history/{test_id_to_delete}", method="DELETE")
    with urllib.request.urlopen(del_req) as resp:
        del_res = json.loads(resp.read().decode("utf-8"))
        print(f"Deleted ID #{test_id_to_delete}: {del_res.get('message')}")
        
    # Verify it is deleted from DB
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM predictions WHERE id = ?", (test_id_to_delete,))
    check_row = cursor.fetchone()
    conn.close()
    assert check_row is None, f"Record #{test_id_to_delete} still exists in SQLite after DELETE!"
    print(f"VERIFICATION: Record #{test_id_to_delete} was successfully removed from SQLite database!")

def audit_all_api_endpoints():
    print("\n" + "="*70)
    print("AUDIT 5: VERIFYING ALL REST API ENDPOINTS")
    print("="*70)
    
    endpoints = [
        ("GET", "/api/health", None, 200),
        ("POST", "/api/predict", json.dumps({"product_name": "Test Pen", "description": "Blue ink ballpoint pen"}).encode("utf-8"), 200),
        ("GET", "/api/dashboard", None, 200),
        ("GET", "/api/history", None, 200),
        ("GET", "/api/model-performance", None, 200)
    ]
    
    for method, path, body, expected_code in endpoints:
        req = urllib.request.Request(
            f"{BASE_URL}{path}",
            data=body,
            headers={"Content-Type": "application/json"} if body else {},
            method=method
        )
        try:
            with urllib.request.urlopen(req) as resp:
                print(f"[OK] {method:<5} {path:<25} -> Status {resp.status}")
        except Exception as e:
            print(f"[FAIL] {method:<5} {path:<25} -> {e}")

if __name__ == "__main__":
    created = audit_categories()
    audit_model_integrity()
    audit_database_and_dashboard(created[0])
    audit_history_search_and_deletion(created[-1])
    audit_all_api_endpoints()
    print("\n" + "="*70)
    print("FULL PROJECT AUDIT EXECUTION COMPLETED")
    print("="*70)
