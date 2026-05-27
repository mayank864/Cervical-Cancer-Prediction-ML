"""
Cervical Cancer Risk Prediction - Model Training Pipeline
==========================================================
Trains a Random Forest classifier on the UCI Cervical Cancer Risk Factors dataset.
Target variable: Biopsy
"""

import pandas as pd
import numpy as np
import json
import os
import shutil
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix,
)

# ── Paths ─────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_PATH = os.path.join(SCRIPT_DIR, "risk_factors_cervical_cancer.csv")
MODEL_PATH = os.path.join(SCRIPT_DIR, "cancer_model.pkl")
SCALER_PATH = os.path.join(SCRIPT_DIR, "scaler.pkl")
FEATURES_PATH = os.path.join(SCRIPT_DIR, "feature_columns.json")
SAMPLE_INPUT_PATH = os.path.join(SCRIPT_DIR, "sample_input.csv")
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")


def load_and_clean(path: str) -> pd.DataFrame:
    """Load CSV, replace '?' with NaN, cast to numeric."""
    print(f"\n{'='*60}")
    print("STEP 1: Loading and Cleaning Data")
    print(f"{'='*60}")
    
    df = pd.read_csv(path)
    print(f"Raw shape: {df.shape}")
    
    # Replace '?' with NaN and convert to numeric
    df = df.replace("?", np.nan)
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    
    missing_pct = (df.isnull().sum() / len(df) * 100).sort_values(ascending=False)
    print(f"\nTop 10 columns by missing %:")
    for col, pct in missing_pct.head(10).items():
        print(f"  {col}: {pct:.1f}%")
    
    # Impute with median
    df = df.fillna(df.median())
    print(f"\nAfter imputation, remaining NaNs: {df.isnull().sum().sum()}")
    
    return df


def prepare_features(df: pd.DataFrame):
    """Separate features and target, drop extra target columns."""
    print(f"\n{'='*60}")
    print("STEP 2: Preparing Features and Target")
    print(f"{'='*60}")
    
    # Drop the other diagnosis columns
    drop_cols = ["Hinselmann", "Schiller", "Citology"]
    existing_drop = [c for c in drop_cols if c in df.columns]
    print(f"Dropping extra target columns: {existing_drop}")
    df = df.drop(columns=existing_drop, errors="ignore")
    
    target = "Biopsy"
    y = df[target]
    X = df.drop(columns=[target])
    
    print(f"Feature matrix shape: {X.shape}")
    print(f"Target distribution:\n{y.value_counts().to_string()}")
    print(f"Positive rate: {y.mean()*100:.1f}%")
    
    return X, y


def scale_features(X_train, X_test, feature_cols):
    """Apply StandardScaler."""
    print(f"\n{'='*60}")
    print("STEP 3: Scaling Features")
    print(f"{'='*60}")
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print(f"Scaler fitted on {len(feature_cols)} features")
    print(f"Train mean (sample): {X_train_scaled.mean(axis=0)[:5].round(4)}")
    
    return X_train_scaled, X_test_scaled, scaler


def train_model(X_train, y_train):
    """Train RandomForestClassifier."""
    print(f"\n{'='*60}")
    print("STEP 4: Training Random Forest Model")
    print(f"{'='*60}")
    
    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    print(f"Model trained with {model.n_estimators} trees")
    print(f"Max depth (auto): varies per tree")
    
    return model


def evaluate_model(model, X_test, y_test):
    """Print evaluation metrics."""
    print(f"\n{'='*60}")
    print("STEP 5: Model Evaluation")
    print(f"{'='*60}")
    
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_proba)
    
    print(f"\n  Accuracy:  {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1-Score:  {f1:.4f}")
    print(f"  AUC-ROC:   {auc:.4f}")
    
    print(f"\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"  TN={cm[0,0]}  FP={cm[0,1]}")
    print(f"  FN={cm[1,0]}  TP={cm[1,1]}")
    
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["No Cancer", "Cancer"]))
    
    return {"accuracy": acc, "precision": prec, "recall": rec, "f1": f1, "auc_roc": auc}


def print_feature_importances(model, feature_cols, top_n=15):
    """Print top feature importances."""
    print(f"\n{'='*60}")
    print(f"STEP 6: Top {top_n} Feature Importances")
    print(f"{'='*60}")
    
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:top_n]
    
    for rank, idx in enumerate(indices, 1):
        print(f"  {rank:2d}. {feature_cols[idx]:<45s} {importances[idx]:.4f}")


def create_sample_input(df, feature_cols):
    """Create sample input CSV with 5 rows using dataset statistics."""
    print(f"\n{'='*60}")
    print("STEP 7: Creating Sample Input CSV")
    print(f"{'='*60}")
    
    sample_data = []
    
    # Row 1: all medians
    medians = df[feature_cols].median()
    sample_data.append(medians.to_dict())
    
    # Row 2: all means
    means = df[feature_cols].mean()
    sample_data.append(means.to_dict())
    
    # Row 3: low-risk profile (young, low values)
    low_risk = medians.copy()
    if "Age" in low_risk.index:
        low_risk["Age"] = 20
    if "Number of sexual partners" in low_risk.index:
        low_risk["Number of sexual partners"] = 1
    if "Smokes" in low_risk.index:
        low_risk["Smokes"] = 0
    if "Hormonal Contraceptives" in low_risk.index:
        low_risk["Hormonal Contraceptives"] = 0
    if "STDs" in low_risk.index:
        low_risk["STDs"] = 0
    sample_data.append(low_risk.to_dict())
    
    # Row 4: higher-risk profile
    high_risk = medians.copy()
    if "Age" in high_risk.index:
        high_risk["Age"] = 45
    if "Number of sexual partners" in high_risk.index:
        high_risk["Number of sexual partners"] = 6
    if "Smokes" in high_risk.index:
        high_risk["Smokes"] = 1
    if "Smokes (years)" in high_risk.index:
        high_risk["Smokes (years)"] = 15
    if "STDs" in high_risk.index:
        high_risk["STDs"] = 1
    if "STDs (number)" in high_risk.index:
        high_risk["STDs (number)"] = 2
    sample_data.append(high_risk.to_dict())
    
    # Row 5: 75th percentile values
    q75 = df[feature_cols].quantile(0.75)
    sample_data.append(q75.to_dict())
    
    sample_df = pd.DataFrame(sample_data)
    sample_df.to_csv(SAMPLE_INPUT_PATH, index=False)
    print(f"Sample input saved with {len(sample_df)} rows and {len(sample_df.columns)} columns")
    print(f"  Path: {SAMPLE_INPUT_PATH}")
    
    return sample_df


def save_artifacts(model, scaler, feature_cols):
    """Save model, scaler, feature columns, and copy to backend."""
    print(f"\n{'='*60}")
    print("STEP 8: Saving Artifacts")
    print(f"{'='*60}")
    
    joblib.dump(model, MODEL_PATH)
    print(f"  Model saved: {MODEL_PATH}")
    
    joblib.dump(scaler, SCALER_PATH)
    print(f"  Scaler saved: {SCALER_PATH}")
    
    with open(FEATURES_PATH, "w") as f:
        json.dump(feature_cols, f, indent=2)
    print(f"  Feature columns saved: {FEATURES_PATH}")
    
    # Copy to backend
    os.makedirs(BACKEND_DIR, exist_ok=True)
    for src in [MODEL_PATH, SCALER_PATH, FEATURES_PATH, SAMPLE_INPUT_PATH]:
        if os.path.exists(src):
            dst = os.path.join(BACKEND_DIR, os.path.basename(src))
            shutil.copy2(src, dst)
            print(f"  Copied to backend: {dst}")


def main():
    print("=" * 60)
    print("CERVICAL CANCER RISK PREDICTION - TRAINING PIPELINE")
    print("=" * 60)
    
    # Download dataset if needed
    if not os.path.exists(DATA_PATH):
        print("Dataset not found, attempting download...")
        from download_data import download_dataset
        download_dataset()
    
    # Load and clean
    df = load_and_clean(DATA_PATH)
    
    # Prepare features
    X, y = prepare_features(df)
    feature_cols = list(X.columns)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    print(f"\nTrain set: {X_train.shape[0]} samples")
    print(f"Test set:  {X_test.shape[0]} samples")
    
    # Scale
    X_train_scaled, X_test_scaled, scaler = scale_features(X_train, X_test, feature_cols)
    
    # Train
    model = train_model(X_train_scaled, y_train)
    
    # Evaluate
    metrics = evaluate_model(model, X_test_scaled, y_test)
    
    # Feature importances
    print_feature_importances(model, feature_cols)
    
    # Sample input
    # Use the full cleaned df (before dropping targets) for sample creation
    # Reload to get feature columns only
    create_sample_input(df.drop(columns=["Biopsy"], errors="ignore"), feature_cols)
    
    # Save
    save_artifacts(model, scaler, feature_cols)
    
    # Summary
    print(f"\n{'='*60}")
    print("PIPELINE COMPLETE")
    print(f"{'='*60}")
    print(f"  Features used: {len(feature_cols)}")
    print(f"  Accuracy:  {metrics['accuracy']:.4f}")
    print(f"  AUC-ROC:   {metrics['auc_roc']:.4f}")
    print(f"  F1-Score:  {metrics['f1']:.4f}")
    print(f"\nFiles exported:")
    print(f"  ml_research/cancer_model.pkl")
    print(f"  ml_research/scaler.pkl")
    print(f"  ml_research/feature_columns.json")
    print(f"  ml_research/sample_input.csv")
    print(f"  backend/cancer_model.pkl")
    print(f"  backend/scaler.pkl")
    print(f"  backend/feature_columns.json")
    print(f"  backend/sample_input.csv")


if __name__ == "__main__":
    main()
