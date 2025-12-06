# Food Delivery Route Efficiency Analysis

A comprehensive, production-ready Python package for analyzing food delivery route efficiency and predicting delivery times using machine learning. This project follows software engineering best practices including Separation of Concerns (SOC), DRY principles, and modular architecture.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Configuration](#configuration)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules for data loading, preprocessing, EDA, visualization, and modeling
- **Comprehensive EDA**: Automated exploratory data analysis with statistical insights
- **Rich Visualizations**: Multiple visualization types including distributions, correlations, time series, and heatmaps
- **ML Pipeline**: Complete machine learning pipeline with multiple algorithms and hyperparameter tuning
- **Production Ready**: Proper logging, configuration management, and error handling
- **Well Tested**: Unit tests for all major components
- **Documented**: Comprehensive documentation and examples

## 📁 Project Structure

```
food-delivery-analysis/
├── src/
│   └── food_delivery_analysis/
│       ├── __init__.py
│       ├── data/
│       │   ├── __init__.py
│       │   └── data_loader.py          # Data loading utilities
│       ├── preprocessing/
│       │   ├── __init__.py
│       │   └── preprocessor.py         # Data preprocessing and feature engineering
│       ├── eda/
│       │   ├── __init__.py
│       │   └── exploratory_analysis.py # Exploratory data analysis
│       ├── visualization/
│       │   ├── __init__.py
│       │   └── visualizer.py          # Visualization utilities
│       ├── modeling/
│       │   ├── __init__.py
│       │   ├── model_trainer.py       # Model training and evaluation
│       │   └── model_predictor.py     # Model prediction utilities
│       └── utils/
│           ├── __init__.py
│           ├── logger.py              # Logging configuration
│           └── config_loader.py      # Configuration management
├── tests/
│   ├── __init__.py
│   ├── test_data_loader.py
│   ├── test_preprocessor.py
│   ├── test_eda.py
│   ├── test_visualization.py
│   └── test_modeling.py
├── configs/
│   └── config.yaml                    # Configuration file
├── notebooks/
│   ├── 01_data_loading.ipynb
│   ├── 02_eda.ipynb
│   ├── 03_preprocessing.ipynb
│   └── 04_modeling.ipynb
├── data/
│   ├── raw/                           # Raw data files
│   ├── processed/                     # Processed data files
│   └── models/                        # Trained models
├── outputs/
│   ├── figures/                       # Generated visualizations
│   └── reports/                       # Analysis reports
├── requirements.txt
├── setup.py
├── .gitignore
└── README.md
```

## 🚀 Installation

### Prerequisites

- Python 3.8 or higher
- pip or conda

### Install from Source

1. Clone the repository:
```bash
git clone <repository-url>
cd food-delivery-analysis
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Install the package in development mode:
```bash
pip install -e .
```

## 🏃 Quick Start

### Basic Usage

```python
from food_delivery_analysis import (
    DataLoader,
    DataPreprocessor,
    ExploratoryAnalysis,
    Visualizer,
    ModelTrainer,
    setup_logger
)

# Setup logging
logger = setup_logger()

# Load data
loader = DataLoader()
df = loader.load_csv("data/raw/Food_Delivery_Route_Efficiency_Dataset.csv")

# Preprocess data
preprocessor = DataPreprocessor()
df = preprocessor.convert_datetime(df, "order_time")
df = preprocessor.extract_datetime_features(df, "order_time")
df = preprocessor.create_efficiency_feature(df)

# Exploratory Analysis
eda = ExploratoryAnalysis(df)
correlation = eda.get_correlation_matrix()

# Visualization
viz = Visualizer(df, output_dir="outputs/figures")
viz.plot_distribution("delivery_time_min", save=True)
viz.plot_correlation_heatmap(save=True)

# Prepare features for modeling
X, y = preprocessor.prepare_features(
    df,
    feature_columns=["distance_km", "route_length_km", "hour", "day_of_week"],
    target_column="delivery_time_min",
    encode_categorical_cols=["traffic_level", "delivery_mode", "weather"]
)

# Split data
X_train, X_test, y_train, y_test = preprocessor.train_test_split_data(X, y)

# Train models
trainer = ModelTrainer(models_dir="data/models")
scores = trainer.train_all_models(X_train, y_train, X_test, y_test)

# Get best model
print(f"Best model: {trainer.best_model_name}")
print(f"RMSE: {scores[trainer.best_model_name]['rmse']:.2f}")
```

## 📖 Usage

### Data Loading

```python
from food_delivery_analysis import DataLoader

loader = DataLoader()
df = loader.load_csv("path/to/data.csv")
info = loader.get_data_info()
```

### Data Preprocessing

```python
from food_delivery_analysis import DataPreprocessor

preprocessor = DataPreprocessor()

# Convert datetime
df = preprocessor.convert_datetime(df, "order_time")

# Extract datetime features
df = preprocessor.extract_datetime_features(df, "order_time")

# Handle missing values
df = preprocessor.handle_missing_values(df, strategy="mean")

# Remove outliers
df = preprocessor.remove_outliers(df, columns=["distance_km", "delivery_time_min"])

# Encode categorical variables
df = preprocessor.encode_categorical(df, columns=["traffic_level", "delivery_mode"])

# Prepare features
X, y = preprocessor.prepare_features(
    df,
    feature_columns=["distance_km", "route_length_km", "hour"],
    target_column="delivery_time_min"
)
```

### Exploratory Data Analysis

```python
from food_delivery_analysis import ExploratoryAnalysis

eda = ExploratoryAnalysis(df)

# Get column types
numeric_cols = eda.get_numeric_columns()
categorical_cols = eda.get_categorical_columns()

# Correlation analysis
correlation = eda.get_correlation_matrix()

# Summary statistics by category
avg_delivery_by_mode = eda.get_summary_by_category("delivery_mode", "delivery_time_min")

# Distribution statistics
stats = eda.get_distribution_stats("delivery_time_min")
```

### Visualization

```python
from food_delivery_analysis import Visualizer

viz = Visualizer(df, output_dir="outputs/figures")

# Distribution plots
viz.plot_distribution("delivery_time_min", save=True)

# Boxplots
viz.plot_boxplot(columns=["distance_km", "delivery_time_min"], save=True)

# Scatter plots
viz.plot_scatter("distance_km", "delivery_time_min", hue="traffic_level", save=True)

# Correlation heatmap
viz.plot_correlation_heatmap(save=True)

# Time series
viz.plot_time_series("order_time", "delivery_time_min", agg_func="mean", save=True)
```

### Model Training

```python
from food_delivery_analysis import ModelTrainer

trainer = ModelTrainer(models_dir="data/models")

# Train all default models
scores = trainer.train_all_models(X_train, y_train, X_test, y_test)

# Access best model
best_model = trainer.best_model
best_model_name = trainer.best_model_name

# Hyperparameter tuning
from sklearn.ensemble import RandomForestRegressor

param_grid = {
    'n_estimators': [100, 200],
    'max_depth': [10, 20, None]
}

best_rf = trainer.hyperparameter_tuning(
    RandomForestRegressor(),
    param_grid,
    X_train,
    y_train
)

# Save model
trainer.save_model(best_model, "best_model", metadata={"rmse": scores[best_model_name]['rmse']})
```

### Model Prediction

```python
from food_delivery_analysis import ModelPredictor

# Load model and make predictions
predictor = ModelPredictor(model_path="data/models/best_model.pkl")
predictions = predictor.predict(X_test)

# Batch predictions
predictions = predictor.predict_batch(X_test, batch_size=1000)
```

## ⚙️ Configuration

The project uses YAML configuration files for easy customization. See `configs/config.yaml` for all available options:

- Data paths and file locations
- Preprocessing settings (missing value handling, outlier removal, etc.)
- Model training parameters
- Visualization settings
- Logging configuration

You can load configuration in your code:

```python
from food_delivery_analysis import ConfigLoader

config = ConfigLoader("configs/config.yaml")
data_path = config.get("data.input_file")
test_size = config.get("modeling.test_size", 0.2)
```

## 🧪 Testing

Run tests using pytest:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src/food_delivery_analysis --cov-report=html

# Run specific test file
pytest tests/test_data_loader.py
```

## 📊 Example Notebooks

The `notebooks/` directory contains example Jupyter notebooks demonstrating:

1. **01_data_loading.ipynb**: Loading and initial data inspection
2. **02_eda.ipynb**: Exploratory data analysis
3. **03_preprocessing.ipynb**: Data preprocessing and feature engineering
4. **04_modeling.ipynb**: Model training and evaluation

## 🏗️ Architecture Principles

### Separation of Concerns (SOC)
- **Data Layer**: Data loading and I/O operations
- **Preprocessing Layer**: Data cleaning and transformation
- **Analysis Layer**: Statistical analysis and insights
- **Visualization Layer**: Plot generation
- **Modeling Layer**: Machine learning operations
- **Utility Layer**: Shared utilities (logging, config)

### DRY (Don't Repeat Yourself)
- Reusable functions and classes
- Centralized configuration
- Shared utilities for common operations
- Modular design for easy extension

### Best Practices
- Type hints for better code clarity
- Comprehensive logging
- Error handling and validation
- Documentation strings
- Unit tests for reliability

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or issues, please open an issue on GitHub.

