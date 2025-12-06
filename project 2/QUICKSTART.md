# Quick Start Guide

This guide will help you get started with the Food Delivery Route Efficiency Analysis package quickly.

## Installation

1. **Clone or navigate to the project directory**

2. **Create a virtual environment** (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Install the package**:
```bash
pip install -e .
```

## Quick Example

### Option 1: Run the Complete Pipeline

Run the main pipeline script that executes the entire workflow:

```bash
python main.py
```

This will:
- Load the data
- Preprocess it
- Perform EDA
- Generate visualizations
- Train multiple models
- Save the best model

### Option 2: Use in Python Script

```python
from food_delivery_analysis import (
    DataLoader,
    DataPreprocessor,
    ModelTrainer,
    setup_logger
)

# Setup
logger = setup_logger()

# Load data
loader = DataLoader()
df = loader.load_csv("data/raw/Food_Delivery_Route_Efficiency_Dataset.csv")

# Preprocess
preprocessor = DataPreprocessor()
df = preprocessor.convert_datetime(df, "order_time")
df = preprocessor.extract_datetime_features(df, "order_time")

# Prepare features
X, y = preprocessor.prepare_features(
    df,
    feature_columns=["distance_km", "route_length_km", "hour"],
    target_column="delivery_time_min",
    encode_categorical_cols=["traffic_level", "delivery_mode"]
)

# Split and train
X_train, X_test, y_train, y_test = preprocessor.train_test_split_data(X, y)
trainer = ModelTrainer()
scores = trainer.train_all_models(X_train, y_train, X_test, y_test)

print(f"Best model: {trainer.best_model_name}")
```

### Option 3: Use Jupyter Notebooks

1. Start Jupyter:
```bash
jupyter notebook
```

2. Open notebooks in order:
   - `notebooks/01_data_loading.ipynb` - Load and explore data
   - `notebooks/02_eda.ipynb` - Exploratory data analysis
   - `notebooks/03_preprocessing.ipynb` - Data preprocessing
   - `notebooks/04_modeling.ipynb` - Model training

## Configuration

Edit `configs/config.yaml` to customize:
- Data paths
- Preprocessing options
- Model selection
- Output directories

## Testing

Run tests to verify everything works:

```bash
pytest
```

## Project Structure

```
project/
├── src/food_delivery_analysis/  # Main package
│   ├── data/                     # Data loading
│   ├── preprocessing/            # Data preprocessing
│   ├── eda/                      # Exploratory analysis
│   ├── visualization/           # Plotting utilities
│   ├── modeling/                 # ML models
│   └── utils/                    # Utilities
├── tests/                        # Unit tests
├── notebooks/                    # Example notebooks
├── configs/                      # Configuration files
├── data/                         # Data files
└── outputs/                      # Generated outputs
```

## Next Steps

1. Review the `README.md` for detailed documentation
2. Explore the example notebooks
3. Customize the configuration file
4. Run the pipeline and analyze results

## Troubleshooting

**Import errors**: Make sure you've installed the package with `pip install -e .`

**File not found**: Check that the data file is in `data/raw/` directory

**Module not found**: Ensure you're in the project root directory or have added `src` to your Python path

