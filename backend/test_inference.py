from services.miqyas import RiskModelService
import os

# Initialize service
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')
service = RiskModelService(model_dir=MODEL_DIR)

# Sample data (empty or partial)
sample_data = {
    "age": 30,
    "gender": "Male",
    "monthly_salary": 15000,
    "credit_score": 750,
    "nationality_group": "Local"
}

print("Running prediction...")
result = service.predict(sample_data)
print("Result:", result)
