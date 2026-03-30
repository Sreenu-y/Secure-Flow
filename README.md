# SecureFlow: Real-Time Fraud Detection System

SecureFlow is a comprehensive, real-time transaction monitoring and fraud detection system. It combines a robust Machine Learning pipeline with a modern web dashboard to identify and visualize potentially fraudulent activity.

---

## 🚀 Overview

SecureFlow uses an advanced Gradient Boosting / Random Forest model trained on large datasets to predict the likelihood of fraud for financial transactions. It provides a real-time API for external integrations and a sleek frontend for monitoring transactions, visualizing trends, and managing security alerts.

---

## 🏗️ Project Structure

The project is divided into two main components:

-   **`model/`**: Contains the Machine Learning logic, including model training scripts, the pre-trained pipeline (`.joblib`), and a FastAPI server for real-time predictions.
-   **`frontend/`**: A modern Next.js 15 web application providing a dashboard for transaction monitoring, authentication, and reporting.
-   **Architecture Diagrams**: See `architecture.puml`, `frontend.puml`, and `backend.puml` for detailed system designs.

---

## 🛠️ Tech Stack

### ML Backend
-   **Language**: Python 3.9+
-   **API Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Real-time serving)
-   **ML Libraries**: Scikit-learn, Pandas, imbalanced-learn
-   **Serialization**: Joblib
-   **Database/Search**: MongoDB (via `mongodb-mcp-server`)

### Frontend Dashboard
-   **Framework**: [Next.js 15](https://nextjs.org/)
-   **Styling**: Tailwind CSS
-   **Authentication**: [Clerk](https://clerk.com/)
-   **Payments**: [Stripe](https://stripe.com/)
-   **Charts**: Recharts
-   **State Management**: Zustand
-   **UI Components**: Radix UI, Lucide React, Sonner

---

## ⚙️ Getting Started

### 📦 Prerequisites
-   Node.js (v18.x or later)
-   Python (v3.9 or later)
-   npm or yarn

### 1. ML Backend Setup (FastAPI)
Navigate to the `model/` directory and set up the environment:

```bash
cd model
# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn api:app --reload --port 8000
```
-   The API will be available at: `http://localhost:8000`
-   Swagger Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup (Next.js)
Navigate to the `frontend/` directory and set up the dashboard:

```bash
cd frontend
# Install dependencies
npm install

# Run the development server
npm run dev
```
-   The dashboard will be available at: `http://localhost:3000`

---

## 🤖 Model Information

The core of SecureFlow is a pre-trained machine learning pipeline:
-   **Inputs**: Transaction details (step, type, amount, old/new balances).
-   **Logic**: Predicts `isFraud` (0 or 1) and calculates a probability score.
-   **Pipeline**: Includes feature engineering for balance errors (`errorBalanceOrig`, etc.) to enhance detection accuracy.

---

## 🔭 Architecture

The system follows a decoupled architecture where the Next.js frontend interacts with the FastAPI backend over REST. Visual representations can be found in the root directory as `.puml` files, which can be rendered using PlantUML.
