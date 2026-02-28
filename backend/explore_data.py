import pandas as pd

try:
    df = pd.read_excel(r'd:\Full Projects\PoC - Aafaq\MultiTool\backend\dataset\aafaq.xlsx')
    print("Columns and Types:")
    print(df.dtypes)
    print("\nMissing values:\n", df.isnull().sum())
except Exception as e:
    print(f"Error: {e}")
