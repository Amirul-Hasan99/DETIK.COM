---
title: News Mining Analytics
emoji: 📰
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

# News Mining Analytics System

> Indonesian News Classification & Analytics Platform powered by Machine Learning

A full-stack web application for crawling, preprocessing, analyzing, and classifying Indonesian news articles using NLP and Machine Learning.

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** with custom design system
- **Framer Motion** for animations
- **Recharts** for interactive charts
- **Sonner** for toast notifications

### Backend
- **FastAPI** (Python)
- **SQLAlchemy** (async) with SQLite
- **scikit-learn** for ML models
- **Sastrawi** for Indonesian NLP
- **BeautifulSoup4** for web crawling
- **joblib** for model serialization

### Authentication
- JWT with role-based access (Admin/User)

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **npm** or **yarn**

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Swagger: `http://localhost:8000/redoc`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

## 🔐 Default Credentials

| Role  | Username | Password |
|-------|----------|----------|
| Admin | admin    | admin123 |
| User  | user     | user123  |

---

## 📋 Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Dashboard** | KPI cards, category charts, system status |
| 2 | **Dynamic Crawling** | Configurable crawling from detik.com + CSV import |
| 3 | **Dataset Management** | Searchable, paginated table with category filter |
| 4 | **Data Understanding** | Auto-computed stats: rows, duplicates, nulls, etc. |
| 5 | **Preprocessing** | NLP pipeline with Sastrawi (Indonesian) |
| 6 | **EDA** | Category charts, word cloud, histograms |
| 7 | **TF-IDF Engineering** | Configurable feature extraction |
| 8 | **Model Training** | NB, LR, SVM, Random Forest |
| 9 | **Evaluation** | Metrics, bar/line charts, confusion matrices |
| 10 | **Prediction** | Real-time classification with confidence |
| 11 | **Insights** | Auto-generated analytics insights |
| 12 | **Export** | CSV export for all datasets |

---

## 📁 Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── config.py             # Settings
│   ├── database.py           # SQLAlchemy setup
│   ├── models/               # ORM models
│   ├── schemas/              # Pydantic schemas
│   ├── repositories/         # Data access layer
│   ├── services/             # Business logic
│   ├── routers/              # API endpoints
│   └── utils/                # Helpers
│
├── frontend/
│   ├── src/app/              # Next.js pages
│   ├── src/components/       # UI components
│   ├── src/lib/              # API client, utils
│   └── src/types/            # TypeScript types
│
├── best_model.pkl            # Trained ML model
├── tfidf_vectorizer.pkl      # TF-IDF vectorizer
├── dataset_detik_*.csv       # Datasets
└── README.md
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/dashboard` | Dashboard KPIs |
| POST | `/api/crawl/import-csv` | Import CSV |
| POST | `/api/crawl/start` | Start crawling (SSE) |
| GET | `/api/dataset` | Paginated dataset |
| GET | `/api/analysis/understanding` | Data understanding |
| GET | `/api/analysis/eda` | EDA results |
| POST | `/api/preprocess/run` | Run preprocessing |
| POST | `/api/training/run` | Train models |
| GET | `/api/evaluation` | Evaluation metrics |
| POST | `/api/predict` | Predict category |
| GET | `/api/insights` | Auto insights |
| GET | `/api/export/raw` | Export raw CSV |
| GET | `/api/export/preprocessed` | Export preprocessed CSV |
| GET | `/api/export/predictions` | Export predictions CSV |

---

## 🎨 UI Design

- Dark/Light mode toggle
- Glassmorphism cards
- Gradient accents
- Responsive design (mobile-first)
- Framer Motion animations
- Skeleton loaders
- Toast notifications

---

## 📄 License

MIT License
