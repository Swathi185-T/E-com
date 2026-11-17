# E-Commerce Product Category Classification Using Machine Learning

A complete, modern, responsive full-stack machine learning web application that classifies e-commerce products into retail categories based on product names and descriptions.

---

## 🚀 Live Demo & Ports
- **Frontend Dashboard:** `http://localhost:5173`
- **Backend Flask REST API:** `http://127.0.0.1:5000`
- **Supported Categories:**
  1. `Electronics`
  2. `Fashion`
  3. `Home & Kitchen`
  4. `Beauty & Personal Care`
  5. `Books`
  6. `Sports & Outdoors`
  7. `Toys & Games`
  8. `Grocery`

---

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Lucide React icons
- **Data Visualization:** Recharts (Interactive category probability breakdown, distribution bar & pie charts, model comparison)
- **Backend:** Python Flask REST API, Flask-CORS
- **Machine Learning:** Scikit-learn, Pandas, NumPy, Joblib, TF-IDF Vectorizer
- **Database:** SQLite (ACID-compliant storage for prediction audit logs and dashboard analytics)

---

## 📊 Dataset & Provenance

The system trains on **5,200+ real-world e-commerce product records** collected and standardized across three public open-data sources:
1. **Flipkart Product Catalog Dataset:** 20,000 real products covering Fashion, Electronics, Home & Kitchen, Beauty, Sports, and Toys.
2. **E-Commerce Text Classification Dataset:** Multi-thousand product catalog covering Books, Electronics, and Household.
3. **BigBasket Products Dataset:** Real grocery, foodgrain, beverage, and gourmet retail products.

All data is cleaned of HTML tags, URLs, and non-alphanumeric noise, deduplicated, and split into **80% training** and **20% testing** using **Stratified Sampling** to maintain class proportions.

---

## 📈 Real Model Evaluation Results (Test Set)

Four candidate classification algorithms were trained and benchmarked on identical test sets:

| Algorithm | Accuracy | Precision (Weighted) | Recall (Weighted) | F1-Score (Weighted) |
| :--- | :---: | :---: | :---: | :---: |
| **Linear Support Vector Machine (LinearSVC + Calibrated)** | **97.12%** | **97.15%** | **97.12%** | **97.12%** |
| **Logistic Regression (Softmax)** | 96.64% | 96.68% | 96.64% | 96.63% |
| **Multinomial Naive Bayes** | 95.20% | 95.38% | 95.20% | 95.23% |
| **Random Forest Classifier** | 93.47% | 93.73% | 93.47% | 93.42% |

> **Selected Model:** **Linear Support Vector Machine** with calibrated probability outputs, achieving **97.12% F1-score**.

---

## 📁 Project Structure

```
Ecommerce_Product_Classification/
├── backend/
│   ├── app.py                     # Flask REST API endpoints & inference engine
│   ├── train_model.py             # ML pipeline: train, benchmark, evaluate & persist
│   ├── database.py                # SQLite schema, queries, and analytics aggregation
│   ├── ecommerce_classification.db# SQLite database
│   ├── dataset/
│   │   ├── prepare_dataset.py     # Multi-source real dataset aggregator
│   │   └── ecommerce_products.csv # Standardized 8-category dataset (5,214 samples)
│   ├── model/
│   │   ├── product_category_model.joblib # Serialized best classifier
│   │   ├── tfidf_vectorizer.joblib       # Fitted TF-IDF vectorizer (12,000 features)
│   │   ├── label_classes.joblib          # Ordered list of category classes
│   │   └── model_metrics.json            # Actual test metrics & confusion matrix
│   ├── requirements.txt           # Python dependencies
│   └── venv/                      # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Sidebar.jsx    # Responsive sidebar navigation
│   │   │       └── Header.jsx     # Top status bar & backend connectivity pill
│   │   ├── pages/
│   │   │   ├── PredictPage.jsx    # Live classifier with 1-click presets & Recharts chart
│   │   │   ├── DashboardPage.jsx  # Recharts Bar & Pie distribution charts + stats
│   │   │   ├── HistoryPage.jsx    # Searchable SQLite table with record deletion
│   │   │   ├── ModelPerformancePage.jsx # True accuracy, confusion matrix, keyword weights
│   │   │   └── AboutPage.jsx      # Architectural & ML documentation
│   │   ├── services/
│   │   │   └── api.js             # REST API service connector
│   │   ├── App.jsx                # Layout & state manager
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Tailwind CSS styles
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
└── README.md
```

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status & active model verification |
| `POST` | `/api/predict` | Predicts category, confidence, and top probabilities |
| `GET` | `/api/dashboard` | Aggregated dashboard statistics and category breakdown |
| `GET` | `/api/history` | Paginated prediction log with search & category filter |
| `DELETE` | `/api/history/<id>` | Deletes a single prediction from SQLite |
| `DELETE` | `/api/history` | Wipes all prediction history |
| `GET` | `/api/model-performance` | Actual trained metrics, confusion matrix & keyword weights |

---

## 💻 How to Run the Project

### 1. Backend Setup & Run

Open a terminal in the project root:

```bash
# Navigate to backend
cd d:\Ecommerce_Product_Classification\backend

# Activate the virtual environment
.\venv\Scripts\activate

# (Optional) Re-run dataset preparation or model training
python dataset\prepare_dataset.py
python train_model.py

# Start Flask API server
python app.py
```
The backend starts at `http://127.0.0.1:5000`.

### 2. Frontend Setup & Run

Open a separate terminal:

```bash
# Navigate to frontend
cd d:\Ecommerce_Product_Classification\frontend

# Install dependencies (already installed)
npm install

# Start Vite dev server
npm run dev
```
Open **`http://localhost:5173`** in your browser.
