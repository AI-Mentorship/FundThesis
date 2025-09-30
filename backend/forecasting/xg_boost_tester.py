import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import RobustScaler  # ADD THIS LINE


def train_test_split(data, perc):  # trains with the first perc of the data and tests with the rest
    n = int(len(data) * (1 - perc))
    return data.iloc[:n].copy(), data.iloc[n:].copy()


def xgb_predict(train, test):
    X = train.iloc[:, :-1].values  # ignore the target column or else we get lookahead bias
    Y = train.iloc[:, -1].values   # we basically say that if the inputs (X) look like this, then the ouput (Y) looks like that

    X_test = test.iloc[:, :-1].values
    y_test = test.iloc[:, -1].values

    model = XGBRegressor(
        n_estimators=400,
        learning_rate=0.1,  # Higher learning rate
        max_depth=6,        # Deeper trees
        min_child_weight=1, # Less conservative
        subsample=0.9,
        colsample_bytree=0.9,
        reg_alpha=0.01,     # Much less regularization
        reg_lambda=0.01,    # Much less regularization
        random_state=42
    )
    
    model.fit(
        X, Y,
        eval_set=[(X_test, y_test)],
        verbose=False
    )

    y_pred = model.predict(X_test)
    return y_pred, y_test, model


df = pd.read_csv('data/example_data.csv')

new_df = df.copy()

# Add technical indicators
df['SMA_10'] = df['Close'].rolling(10).mean()
df['SMA_30'] = df['Close'].rolling(30).mean()
df['Volatility'] = df['Close'].rolling(10).std()
df['Volume_MA'] = df['Volume'].rolling(10).mean()

df['target'] = df['Close'].shift(-1)

df.dropna(inplace=True)  # cuz shifting everything creates some null values
training_df = df.copy()

print("Original data sample:")
print(training_df.head())

train_constant = 0.5  # subject to explosive change

training_df = training_df.drop(columns=["Unnamed: 0", "Date", "Stock Splits", "Dividends"])

# DEBUGGING AND FEATURE SCALING SECTION
print(f"\nDataset shape: {training_df.shape}")
print(f"Columns: {training_df.columns.tolist()}")

print("\nBefore scaling - feature statistics:")
feature_cols = [col for col in training_df.columns if col != 'target']
print(f"Feature columns: {feature_cols}")
print(training_df[feature_cols].describe())

# Check for any issues with the data
print(f"\nAny NaN values: {training_df.isnull().sum().sum()}")
print(f"Any infinite values: {np.isinf(training_df[feature_cols]).sum().sum()}")

# Split into train/test FIRST (to avoid leakage)
train, test = train_test_split(training_df, train_constant)

# Scale features cuz everything was innaccurate
scaler = RobustScaler()
train[feature_cols] = scaler.fit_transform(train[feature_cols])   # fit only on train
test[feature_cols] = scaler.transform(test[feature_cols])         # apply on test

print("\nAfter scaling - feature statistics (train):")
print(train[feature_cols].describe())

print("\nAfter scaling - feature statistics (test):")
print(test[feature_cols].describe())

# Check if scaling actually worked
print(f"\nFeature means after scaling (train): {train[feature_cols].mean().values}")
print(f"Feature stds after scaling (train): {train[feature_cols].std().values}")

print("\nScaled data sample (train):")
print(train.head())

# Additional debugging - check target variable
print(f"\nTarget variable stats:")
print(f"Min: {training_df['target'].min()}, Max: {training_df['target'].max()}")
print(f"Mean: {training_df['target'].mean()}, Std: {training_df['target'].std()}")
# END OF SCALING SECTION

# predict using the function
y_pred, y_test, model = xgb_predict(train, test)

mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\nModel Performance:")
print("Test MSE:", mse)
print("Test R2:", r2)

plt.figure(figsize=(12, 6))

# Plot actual closing prices
plt.plot(y_test, label="Actual Close", color='blue', linewidth=2)

# Plot predicted closing prices
plt.plot(y_pred, label="Predicted Close", color='orange', linestyle='--', linewidth=2)

# Add title and labels
plt.title("Actual vs Predicted Close Prices", fontsize=16)
plt.xlabel("Time Step", fontsize=14)
plt.ylabel("Close Price", fontsize=14)

# Show legend
plt.legend(fontsize=12)

# Optional: add grid
plt.grid(True, linestyle='--', alpha=0.5)

plt.show()
