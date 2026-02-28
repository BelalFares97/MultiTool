import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

# Create models directory if it doesn't exist
models_dir = r'd:\Full Projects\PoC - Aafaq\MultiTool\backend\models'
if not os.path.exists(models_dir):
    os.makedirs(models_dir)

# Load data
print("Loading data...")
df = pd.read_excel(r'd:\Full Projects\PoC - Aafaq\MultiTool\backend\dataset\aafaq.xlsx')

# Drop ID columns and date columns
cols_to_drop = ['customer_id', 'national_id', 'application_time', 'pd12_estimate', 'default_12m_flag']
df = df.drop(columns=[col for col in cols_to_drop if col in df.columns])

# Separate features and target
X = df.drop(columns=['decision'])
y = df['decision']

# Identify numerical and categorical columns
numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
categorical_features = X.select_dtypes(include=['object']).columns.tolist()

print(f"Numerical features: {len(numeric_features)}")
print(f"Categorical features: {len(categorical_features)}")

# Preprocessing for numerical data: Impute missing with median and scale
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

# Preprocessing for categorical data: Impute missing with 'missing' and OneHotEncode
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

# Combine preprocessing
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# Create the pipeline with a classifier
model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1))
])

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Train model
print("Training model...")
model_pipeline.fit(X_train, y_train)

# Evaluate model
print("Evaluating model...")
y_pred = model_pipeline.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save the model
model_path = os.path.join(models_dir, 'loan_risk_model.joblib')
joblib.dump(model_pipeline, model_path)
print(f"Model saved to {model_path}")

# Save feature list for reference
features_info = {
    'numeric_features': numeric_features,
    'categorical_features': categorical_features
}
joblib.dump(features_info, os.path.join(models_dir, 'features_info.joblib'))
print("Feature info saved.")
