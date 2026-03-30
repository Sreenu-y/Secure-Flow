"""
=============================================================
  Real-Time Fraud Detection System — PaySim Mobile Money
=============================================================
Steps:
  1. Data Preprocessing  — filter types, drop noisy columns
  2. Feature Engineering — balance-discrepancy features
  3. Data Preparation    — stratified split + Random Under-Sampling
  4. Model Training      — (A) Random Forest
                           (B) Histogram Gradient Boosting
  5. Evaluation          — Classification Report, AUPRC, F1
                           side-by-side comparison table
  6. Model Export        — save both models as .joblib files
=============================================================
"""

import pandas as pd
import numpy as np
import joblib
import os
import shutil

from sklearn.model_selection import train_test_split
from sklearn.ensemble import (
    RandomForestClassifier,
    HistGradientBoostingClassifier,   # sklearn's fast gradient booster
)
from sklearn.metrics import (
    classification_report,
    average_precision_score,
    precision_recall_curve,
    f1_score,
    recall_score,
    precision_score,
)
from imblearn.under_sampling import RandomUnderSampler
import matplotlib
matplotlib.use("Agg")                 # headless — no display window needed
import matplotlib.pyplot as plt
import warnings

warnings.filterwarnings("ignore")


# ─────────────────────────────────────────────────────────────
# STEP 1 — Data Preprocessing
# ─────────────────────────────────────────────────────────────

def load_and_preprocess(filepath: str) -> pd.DataFrame:
    """
    Load PaySim CSV and perform initial cleaning.

    • Keep only TRANSFER and CASH_OUT — fraud-relevant transaction types.
    • Drop identifier columns and the rule-based isFlaggedFraud flag.
    • Encode type as binary (CASH_OUT=1, TRANSFER=0).
    """
    print("[1/5] Loading and preprocessing data …")

    df = pd.read_csv(filepath)

    df = df[df["type"].isin(["TRANSFER", "CASH_OUT"])].copy()
    df.drop(columns=["nameOrig", "nameDest", "isFlaggedFraud"], inplace=True)
    df["type"] = df["type"].map({"CASH_OUT": 1, "TRANSFER": 0})

    print(f"    ✓ Rows after filtering : {len(df):,}")
    print(f"    ✓ Fraud rate           : {df['isFraud'].mean():.4%}\n")
    return df


# ─────────────────────────────────────────────────────────────
# STEP 2 — Feature Engineering
# ─────────────────────────────────────────────────────────────

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create two accounting-discrepancy features.

    In a legitimate transaction balances must satisfy:
        newbalanceOrig = oldbalanceOrg  - amount  (sender)
        newbalanceDest = oldbalanceDest + amount  (receiver)

    Any deviation is a potential fraud signal.
    """
    print("[2/5] Engineering features …")

    df["errorBalanceOrig"] = df["newbalanceOrig"] - (df["oldbalanceOrg"] - df["amount"])
    df["errorBalanceDest"] = df["newbalanceDest"] - (df["oldbalanceDest"] + df["amount"])

    print("    ✓ Created: errorBalanceOrig, errorBalanceDest\n")
    return df


# ─────────────────────────────────────────────────────────────
# STEP 3 — Data Preparation (split + undersample)
# ─────────────────────────────────────────────────────────────

def prepare_data(df: pd.DataFrame, target: str = "isFraud"):
    """
    Stratified train/test split followed by Random Under-Sampling on the
    training set only.

    • Stratified split  — preserves the real fraud ratio in both sets
                          so test-set metrics reflect real-world performance.
    • Under-Sampling    — reduces the majority class (Non-Fraud) to match
                          Fraud on the training set, forcing both models to
                          genuinely learn fraud patterns.
    • Applied to train only — the test set keeps the original distribution,
                          so there is no data leakage.

    Returns
    -------
    X_train_res, X_test, y_train_res, y_test, feature_cols
    """
    print("[3/5] Splitting and under-sampling …")

    feature_cols = [c for c in df.columns if c != target]
    X, y = df[feature_cols], df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    rus = RandomUnderSampler(random_state=42)
    X_train_res, y_train_res = rus.fit_resample(X_train, y_train)

    print(f"    ✓ Training (after resampling) : {len(X_train_res):,} "
          f"({y_train_res.sum():,} fr   aud / {(y_train_res==0).sum():,} legit)")
    print(f"    ✓ Test set (original dist.)   : {len(X_test):,}\n")

    return X_train_res, X_test, y_train_res, y_test, feature_cols


# ─────────────────────────────────────────────────────────────
# STEP 4A — Random Forest
# ─────────────────────────────────────────────────────────────

def build_random_forest() -> RandomForestClassifier:
    """
    Random Forest — ensemble of decision trees.
    We increased the number of estimators and allowed deeper trees to capture finer patterns.
    """
    return RandomForestClassifier(
        n_estimators=150,           # Increased from 100
        max_depth=None,
        min_samples_split=4,        # Decreased to allow finer splits
        class_weight="balanced",   # extra guard against residual imbalance
        random_state=42,
        n_jobs=-1,
    )


# ─────────────────────────────────────────────────────────────
# STEP 4B — Histogram Gradient Boosting
# ─────────────────────────────────────────────────────────────

def build_gradient_boosting() -> HistGradientBoostingClassifier:
    """
    Histogram Gradient Boosting (sklearn's fast variant of XGBoost/LightGBM).
    We tweaked the learning rate and max iterations for better performance.
    """
    return HistGradientBoostingClassifier(
        max_iter=300,              # Increased from 200
        learning_rate=0.08,        # Slightly faster learning rate
        max_depth=8,               # Deeper trees
        min_samples_leaf=15,       # Allow slightly more granular leaf nodes
        random_state=42,
    )


# ─────────────────────────────────────────────────────────────
# STEP 5 — Evaluate a trained model
# ─────────────────────────────────────────────────────────────

def evaluate_model(model, X_test, y_test, feature_cols: list, model_name: str) -> dict:
    """
    Print a full classification report and return key metrics for comparison.
    """
    y_pred  = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    print(f"\n{'═' * 62}")
    print(f"  CLASSIFICATION REPORT — {model_name}")
    print(f"{'═' * 62}")
    print(classification_report(y_test, y_pred, target_names=["Non-Fraud", "Fraud"]))

    auprc          = average_precision_score(y_test, y_proba)
    f1_macro       = f1_score(y_test, y_pred, average="macro")
    fraud_recall   = recall_score(y_test, y_pred, pos_label=1)
    fraud_precision= precision_score(y_test, y_pred, pos_label=1)

    print(f"  AUPRC (Precision-Recall AUC) : {auprc:.4f}")
    print(f"  Macro F1-Score               : {f1_macro:.4f}")
    print(f"  Fraud Precision              : {fraud_precision:.4f}")
    print(f"  Fraud Recall                 : {fraud_recall:.4f}")
    print(f"{'═' * 62}")

    # ── Feature importances (if available) ────────────────────
    if hasattr(model, "feature_importances_"):
        importances = pd.Series(model.feature_importances_, index=feature_cols)
        importances = importances.sort_values(ascending=False)
        print(f"\n  Top Feature Importances — {model_name}:")
        for feat, imp in importances.items():
            bar = "█" * int(imp * 50)
            print(f"    {feat:<25} {imp:.4f}  {bar}")

    return {
        "auprc"          : auprc,
        "f1_macro"       : f1_macro,
        "fraud_recall"   : fraud_recall,
        "fraud_precision": fraud_precision,
        "y_proba"        : y_proba,
    }


# ─────────────────────────────────────────────────────────────
# COMPARISON TABLE
# ─────────────────────────────────────────────────────────────

def print_comparison(results: dict):
    """
    Print a side-by-side comparison table for all trained models.

    Parameters
    ----------
    results : dict  { model_name: metrics_dict }
    """
    metric_labels = {
        "auprc"          : "AUPRC",
        "f1_macro"       : "Macro F1",
        "fraud_recall"   : "Fraud Recall",
        "fraud_precision": "Fraud Precision",
    }
    col_w = 22
    print(f"\n{'═' * 80}")
    print("  📊  MODEL COMPARISON")
    print(f"{'═' * 80}")

    header = f"  {'Metric':<22}" + "".join(f"{name:>{col_w}}" for name in results)
    print(header)
    print(f"  {'-' * (22 + col_w * len(results))}")

    for key, label in metric_labels.items():
        row = f"  {label:<22}"
        scores = [results[m][key] for m in results]
        best   = max(scores)
        for name, score in zip(results, scores):
            cell = f"{score:.4f}" + (" ✦" if score == best else "  ")
            row += f"{cell:>{col_w}}"
        print(row)

    print(f"{'═' * 80}")
    print("  ✦ = best score for that metric\n")


# ─────────────────────────────────────────────────────────────
# PRECISION-RECALL CURVES — both models on one plot
# ─────────────────────────────────────────────────────────────

def plot_pr_curves(results: dict, y_test, save_path: str = "pr_curves_comparison.png"):
    """
    Draw and save Precision-Recall curves for all models on the same axes.
    """
    colors = ["#e84393", "#00bfff", "#39d353", "#ffa500"]
    plt.figure(figsize=(9, 6))

    for (model_name, metrics), color in zip(results.items(), colors):
        precision, recall, _ = precision_recall_curve(y_test, metrics["y_proba"])
        plt.plot(recall, precision, color=color, lw=2,
                 label=f"{model_name}  (AUPRC = {metrics['auprc']:.4f})")

    plt.xlabel("Recall", fontsize=12)
    plt.ylabel("Precision", fontsize=12)
    plt.title("Precision-Recall Curve Comparison — Fraud Detection", fontsize=13)
    plt.legend(loc="upper right", fontsize=10)
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(save_path, dpi=150)
    plt.close()
    print(f"  ✓ P-R curve comparison saved → {save_path}")


# ─────────────────────────────────────────────────────────────
# STEP 6 — Save a model
# ─────────────────────────────────────────────────────────────

def save_model(model, output_path: str):
    """
    Serialize a trained model to disk with joblib (compress=3).

    To reload:
        import joblib
        model = joblib.load("model_name.joblib")
        pred  = model.predict(new_data)
    """
    joblib.dump(model, output_path, compress=3)
    size_mb = os.path.getsize(output_path) / (1024 ** 2)
    print(f"  ✓ Model saved → {output_path}  ({size_mb:.1f} MB)")


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

def main():
    DATA_PATH = "PS_20174392719_1491204439457_log.csv"

    print("\n" + "═" * 62)
    print("   REAL-TIME FRAUD DETECTION — PaySim Mobile Money")
    print("═" * 62 + "\n")

    # ── Steps 1-3: shared data preparation ────────────────────
    df = load_and_preprocess(DATA_PATH)
    df = engineer_features(df)
    X_train, X_test, y_train, y_test, feature_cols = prepare_data(df)

    # ── Step 4A: Random Forest ─────────────────────────────────
    print("[4/5] Training models …\n")
    print("  ▶ Training Random Forest …")
    rf = build_random_forest()
    rf.fit(X_train, y_train)
    print("    ✓ Random Forest trained.\n")

    # ── Step 4B: Histogram Gradient Boosting ───────────────────
    print("  ▶ Training Histogram Gradient Boosting …")
    hgb = build_gradient_boosting()
    hgb.fit(X_train, y_train)
    print("    ✓ Gradient Boosting trained.\n")

    # ── Step 5: Evaluate both models ───────────────────────────
    print("[5/5] Evaluating both models …")
    rf_metrics  = evaluate_model(rf,  X_test, y_test, feature_cols, "Random Forest")
    hgb_metrics = evaluate_model(hgb, X_test, y_test, feature_cols, "Gradient Boosting")

    # ── Comparison table ───────────────────────────────────────
    all_results = {
        "Random Forest"     : rf_metrics,
        "Gradient Boosting" : hgb_metrics,
    }
    print_comparison(all_results)

    # ── Precision-Recall curves ────────────────────────────────
    plot_pr_curves(all_results, y_test)

    # ── Step 6: Save both models ───────────────────────────────
    print("\n  Saving models …")
    save_model(rf,  "model_random_forest.joblib")
    save_model(hgb, "model_gradient_boosting.joblib")
    
    # ── Step 7: Export best to API pipeline ────────────────────
    print("\n  Updating API pipeline with best model (highest AUPRC) …")
    if rf_metrics["auprc"] >= hgb_metrics["auprc"]:
        shutil.copy("model_random_forest.joblib", "fraud_detection_pipeline.joblib")
        print("    → Random Forest selected for production API!")
    else:
        shutil.copy("model_gradient_boosting.joblib", "fraud_detection_pipeline.joblib")
        print("    → Histogram Gradient Boosting selected for production API!")

    print("\n" + "═" * 62)
    print("  ✅ Done. Both models trained, evaluated, and saved.")
    print("═" * 62 + "\n")


if __name__ == "__main__":
    main()
