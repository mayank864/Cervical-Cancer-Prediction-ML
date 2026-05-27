import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import io

app = FastAPI(title="Cervical Cancer Risk Prediction API")

# CORS - allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model artifacts at startup
BASE_DIR = Path(__file__).resolve().parent


def load_artifacts():
    """Load the trained model, scaler, and feature column list from disk."""
    model_path = BASE_DIR / "cancer_model.pkl"
    scaler_path = BASE_DIR / "scaler.pkl"
    columns_path = BASE_DIR / "feature_columns.json"

    if not model_path.exists():
        return None, None, None

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    with open(columns_path, "r") as f:
        feature_columns = json.load(f)
    return model, scaler, feature_columns


model, scaler, feature_columns = load_artifacts()


@app.get("/health")
def health_check():
    """Return service health status and whether the ML model is loaded."""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Accept a CSV file and return per-row cervical cancer risk predictions."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please ensure cancer_model.pkl exists.",
        )

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        # Handle missing values the same way as during training
        df = df.replace("?", np.nan)
        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
        df = df.fillna(df.median())

        # Drop target columns if they happen to be present
        for target_col in ["Hinselmann", "Schiller", "Citology", "Biopsy"]:
            if target_col in df.columns:
                df = df.drop(columns=[target_col])

        # Align columns with the features seen during training
        missing_cols = set(feature_columns) - set(df.columns)
        for col in missing_cols:
            df[col] = 0
        df = df[feature_columns]

        # Scale features
        df_scaled = scaler.transform(df)

        # Predict
        predictions = model.predict(df_scaled).tolist()
        probabilities = model.predict_proba(df_scaled)[:, 1].tolist()

        results = []
        for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
            risk_percentage = round(prob * 100, 2)
            results.append(
                {
                    "row": i + 1,
                    "prediction": int(pred),
                    "risk_level": "High Risk" if pred == 1 else "Low Risk",
                    "probability_percentage": risk_percentage,
                }
            )

        return {
            "total_records": len(results),
            "predictions": results,
            "summary": {
                "high_risk_count": sum(
                    1 for r in results if r["prediction"] == 1
                ),
                "low_risk_count": sum(
                    1 for r in results if r["prediction"] == 0
                ),
                "average_risk_percentage": round(
                    sum(r["probability_percentage"] for r in results)
                    / len(results),
                    2,
                ),
            },
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing file: {str(e)}"
        )
