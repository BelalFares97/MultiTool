"""
miqyas.py — Miqyas Credit Risk Model Service
─────────────────────────────────────────────
Plug in your own ML model files under backend/models/:
  - decision_model.joblib
  - target_encoder.joblib
  - feature_encoders.joblib
  - feature_names.joblib

Expected predict() output shape:
  [{ "decision": str, "confidence": float, "all_probabilities": {label: float} }]
"""

import joblib
import os
import pandas as pd
import numpy as np
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class RiskModelService:
    def __init__(self, model_dir='models'):
        self.model_dir = model_dir
        self.model_loaded = False
        self.model = None
        self.features_info = None
        print(f"[Miqyas] Service initialized. Model dir: {model_dir}")
        self._load_model()

    def _load_model(self):
        try:
            model_path = os.path.join(self.model_dir, 'loan_risk_model.joblib')
            features_path = os.path.join(self.model_dir, 'features_info.joblib')
            
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.model_loaded = True
                print("[Miqyas] Model loaded successfully.")
            else:
                print(f"[Miqyas] Model file not found at {model_path}")

            if os.path.exists(features_path):
                self.features_info = joblib.load(features_path)
                print("[Miqyas] Features info loaded.")
        except Exception as e:
            print(f"[Miqyas] Model load failed: {e}")

    def predict(self, data):
        """
        Run prediction on incoming feature data.
        'data' can be a dictionary or a list of dictionaries.
        """
        if not self.model_loaded:
            return [{
                "decision": "Error: Model not loaded",
                "confidence": 0.0,
                "all_probabilities": {}
            }]

        try:
            # Convert input data to DataFrame
            if isinstance(data, dict):
                df_input = pd.DataFrame([data])
            else:
                df_input = pd.DataFrame(data)

            # Ensure all expected columns are present (even if empty)
            # The pipeline handles missing values, but the DataFrame needs the columns
            if self.features_info:
                all_features = self.features_info['numeric_features'] + self.features_info['categorical_features']
                for col in all_features:
                    if col not in df_input.columns:
                        df_input[col] = np.nan

                # Reorder columns to match training order (optional but good practice)
                df_input = df_input[all_features]

            # Get predictions
            predictions = self.model.predict(df_input)
            probabilities = self.model.predict_proba(df_input)
            classes = self.model.classes_

            results = []
            for i, pred in enumerate(predictions):
                prob_dict = {classes[j]: float(probabilities[i][j]) for j in range(len(classes))}
                confidence = float(np.max(probabilities[i]))
                results.append({
                    "decision": str(pred),
                    "confidence": confidence,
                    "all_probabilities": prob_dict
                })
            
            return results
        except Exception as e:
            print(f"[Miqyas] Prediction error: {e}")
            return [{
                "decision": f"Error: {str(e)}",
                "confidence": 0.0,
                "all_probabilities": {}
            }]

    def get_status(self):
        return {
            "model_loaded": self.model_loaded,
            "numeric_features_count": len(self.features_info['numeric_features']) if self.features_info else 0,
            "categorical_features_count": len(self.features_info['categorical_features']) if self.features_info else 0
        }

    def deep_analyze(self, data):
        """
        Send all fetched / input data to OpenAI for deep pattern and discrepancy analysis.
        """
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return {
                "status": "error",
                "message": "OpenAI API Key not configured in .env"
            }

        try:
            client = OpenAI(api_key=api_key)
            
            # Prepare the data as JSON string for the prompt
            data_json = json.dumps(data, indent=2)

            system_prompt = """You are a senior credit risk analyst and discrepancy detection engine. 
Analyze the following loan application data (JSON format) to identify hidden patterns, discrepancies, and red flags.

Return your response EXCLUSIVELY as a structured Markdown Table with no preceding or trailing text.
The table MUST have exactly these columns:
| Type (Discrepancy/Red Flag) | Details | Risk Level (High/Medium) |

Only output the Markdown table. Do NOT use bullet points or any other formats and make your response short as possible.
"""

            response = client.chat.completions.create(
                model="gpt-5.2",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": data_json}
                ],
                temperature=0.3
            )

            return {
                "status": "success",
                "analysis": response.choices[0].message.content,
                "model_used": "GPT-5.2 (Premium Risk Analysis)"
            }
        except Exception as e:
            print(f"[Miqyas AI] Analysis error: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
