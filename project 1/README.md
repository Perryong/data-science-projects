# Stock Market Prediction Project

A comprehensive machine learning project for stock market price prediction using historical data and technical indicators.

## Project Structure

```
stock-prediction-repo/
├── data/
│   ├── raw/          # Raw, immutable data (historical stock prices)
│   ├── interim/      # Intermediate, preprocessed data (feature sets)
│   └── processed/    # Final, ready-to-model data (train/test splits)
├── notebooks/
│   ├── 01_eda.ipynb           # Exploratory Data Analysis
│   └── 02_model_test.ipynb    # Model testing with visualizations
├── src/               # Source code (reusable Python modules)
│   ├── data/          # Data loading and cleaning
│   ├── features/      # Feature engineering
│   ├── models/        # Model training and prediction
│   ├── pipeline/      # End-to-end pipeline
│   └── visualization/ # Prediction visualizations
├── conf/              # Configuration files
│   ├── config.yaml    # Master configuration
│   └── params.yaml    # Hyperparameters
├── models/            # Trained models (serialized)
└── reports/
    ├── figures/       # Visualizations (PNG files)
    └── metrics/       # Performance metrics (CSV files)
```

## Features

- **Data Fetching**: Automated data retrieval from Yahoo Finance using `yfinance`
- **Auto-Update**: Automatically checks if cached data matches config `end_date` and fetches latest data if needed
- **Rate Limit Handling**: Automatic fallback to cached data when rate limits are encountered
- **Data Cleaning**: Missing value handling and outlier removal
- **Feature Engineering**: Technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
- **Model Training**: Support for Random Forest, Gradient Boosting, and Linear Regression
- **Visualizations**: Comprehensive prediction plots and performance metrics
- **Pipeline**: End-to-end automated workflow
- **Configuration**: YAML-based configuration for easy parameter tuning

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Application

**Option A: Simple Run Script (Easiest)**

```bash
python run.py
```

**Option B: Run the Complete Pipeline**

```bash
python -m src.pipeline.main_pipeline
```

**Option C: Use Jupyter Notebooks**

```bash
jupyter notebook
# Then open notebooks/01_eda.ipynb or notebooks/02_model_test.ipynb
```

**Option D: Run from Python**

```python
from src.pipeline.main_pipeline import run_pipeline
run_pipeline()
```

## Configuration

### Changing Stock Ticker and Date Range

Edit `conf/config.yaml` to customize your analysis:

**File**: `conf/config.yaml` (lines 8-10)

```yaml
data:
  source: yfinance
  ticker: AAPL              # Change to any stock ticker (MSFT, GOOGL, TSLA, etc.)
  start_date: 2020-01-01    # Change start date (YYYY-MM-DD format)
  end_date: 2025-12-01      # Change end date (YYYY-MM-DD format)
```

**Examples**:

```yaml
# Analyze Microsoft stock from 2019 to 2024
ticker: MSFT
start_date: 2019-01-01
end_date: 2024-12-31

# Analyze Tesla stock from 2020 to 2024
ticker: TSLA
start_date: 2020-01-01
end_date: 2024-12-31
```

**Popular Stock Tickers**: AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, NFLX, JPM, V

### Complete Configuration Options

```yaml
data:
  source: yfinance          # 'yfinance' or 'file'
  ticker: AAPL
  start_date: 2020-01-01
  end_date: 2024-12-31
  use_cache: true           # Use cached data if rate limited
  cache_dir: data/raw       # Cache directory
  missing_values_method: forward_fill  # drop, forward_fill, backward_fill, interpolate
  remove_outliers: false

features:
  feature_list:             # Technical indicators to include
    - sma_short
    - sma_long
    - ema_short
    - ema_long
    - rsi
    - macd
    - macd_signal
    - macd_hist
    - bb_upper
    - bb_middle
    - bb_lower
    - price_change
    - price_change_pct
    - volume_change
    - volume_change_pct
    - high_low_ratio
    - close_open_ratio

model:
  model_type: random_forest  # random_forest, gradient_boosting, linear_regression
  target_type: next_day_close  # next_day_close, next_day_return, direction
  prediction_horizon: 1
  test_size: 0.2
  random_state: 42
  hyperparameters:
    n_estimators: 100
    max_depth: 10
    random_state: 42
```

## Usage

### Running the Pipeline

The main pipeline can be executed from the command line:

```bash
python -m src.pipeline.main_pipeline
```

Or use the simple run script:

```bash
python run.py
```

Or with a custom config file:

```python
from src.pipeline.main_pipeline import run_pipeline

run_pipeline(config_path="conf/config.yaml")
```

### Using Individual Modules

You can also use individual modules in your own scripts:

```python
from src.data.get_data import fetch_stock_data
from src.data.clean_data import remove_missing_values
from src.features.build_features import build_features
from src.models.train_model import prepare_data, train_model, evaluate_model
from src.visualization.plot_predictions import plot_predictions_vs_actual

# Fetch data
data = fetch_stock_data("AAPL", "2020-01-01", "2024-01-01")

# Clean data
cleaned_data = remove_missing_values(data, method="forward_fill")

# Build features
features = build_features(cleaned_data)

# Train model
X_train, X_test, y_train, y_test, scaler, feature_names, test_dates = prepare_data(features, target)
model = train_model(X_train, y_train, model_type="random_forest")
metrics, y_pred = evaluate_model(model, X_test, y_test, return_predictions=True)

# Visualize
plot_predictions_vs_actual(y_test, y_pred, "AAPL")
```

### Jupyter Notebooks

1. **01_eda.ipynb**: Exploratory data analysis and visualization
   - Data loading and inspection
   - Price and volume visualizations
   - Returns analysis
   - Feature engineering exploration

2. **02_model_test.ipynb**: Quick model testing and experimentation
   - Model training and evaluation
   - Prediction visualizations
   - Feature importance analysis
   - Performance metrics

Start Jupyter:

```bash
jupyter notebook
```

## Technical Indicators

The following technical indicators are automatically calculated:

- **SMA** (Simple Moving Average): Short (20) and Long (50) periods
- **EMA** (Exponential Moving Average): Short (12) and Long (26) periods
- **RSI** (Relative Strength Index): 14-period default
- **MACD** (Moving Average Convergence Divergence): With signal line and histogram
- **Bollinger Bands**: Upper, middle, and lower bands
- **Price Changes**: Absolute and percentage changes
- **Volume Changes**: Absolute and percentage changes
- **Ratios**: High/Low ratio, Close/Open ratio

## Model Types

- **Random Forest**: Ensemble method with multiple decision trees
  - Good for non-linear relationships
  - Provides feature importance
  - Handles missing values well

- **Gradient Boosting**: Sequential ensemble method
  - Often better accuracy than Random Forest
  - Can be slower to train
  - Also provides feature importance

- **Linear Regression**: Simple linear model baseline
  - Fast training and prediction
  - Interpretable coefficients
  - Good baseline for comparison

## Output

The pipeline generates the following outputs:

### Data Files
- **Raw data**: `data/raw/{TICKER}_raw.csv` - Original stock data
- **Cleaned data**: `data/interim/{TICKER}_cleaned.csv` - Preprocessed data
- **Features**: `data/processed/{TICKER}_features.csv` - Feature-engineered data

### Models
- **Trained models**: `models/{TICKER}_{MODEL_TYPE}.pkl` - Serialized model and scaler

### Reports
- **Metrics**: `reports/metrics/{TICKER}_metrics.csv` - Performance metrics (MSE, RMSE, MAE, R²)
- **Visualizations**: `reports/figures/` - PNG files:
  - `{TICKER}_predictions.png` - Comprehensive 4-panel prediction analysis
  - `{TICKER}_timeseries.png` - Time series plot with dates
  - `{TICKER}_feature_importance.png` - Top feature importances (tree models)
  - `{TICKER}_metrics.png` - Performance metrics visualization

## Auto-Update Feature

The system automatically checks if cached data is up to date:

- **If cache end_date >= config end_date**: Uses cache (no API call)
- **If cache end_date < config end_date**: Fetches latest data and updates cache

This ensures you always have the most recent data without manual cache management.

## Rate Limit Handling

If rate limits are encountered:

- **With cache**: Automatically uses cached data and continues
- **Without cache**: Provides clear error message with suggestions

Set `use_cache: true` in `config.yaml` to enable this feature.

## Troubleshooting

### Issue: "ModuleNotFoundError"
**Solution**: Make sure you're in the project root directory and dependencies are installed:
```bash
pip install -r requirements.txt
```

### Issue: "No data retrieved for ticker"
**Solution**: 
- Verify the ticker symbol is correct (use uppercase)
- Check internet connection
- Try a different date range
- Check if stock is listed on Yahoo Finance

### Issue: "Rate limit encountered"
**Solution**: 
- The system automatically uses cached data if available
- Check if `data/raw/{TICKER}_raw.csv` exists
- Set `use_cache: true` in config.yaml
- Wait a few minutes and try again

### Issue: "FileNotFoundError: conf/config.yaml"
**Solution**: Make sure you're running from the project root where `conf/` folder exists.

### Issue: Visualizations not showing
**Solution**: 
- Check `reports/figures/` directory for saved PNG files
- In Jupyter, ensure `%matplotlib inline` is set
- Restart kernel if plots don't appear

### Issue: Using old cached data
**Solution**: 
- Update `end_date` in config.yaml to a later date
- Or delete the cache file: `data/raw/{TICKER}_raw.csv`
- Or set `use_cache: false` to force fresh fetch

## Project Principles

This project follows best practices:

- **DRY (Don't Repeat Yourself)**: Reusable modules in `src/`
- **SOC (Separation of Concerns)**: Clear separation between data, features, models, and pipeline
- **SSOT (Single Source of Truth)**: Configuration files centralize all parameters

## Requirements

See `requirements.txt` for full list. Key dependencies:

- pandas >= 2.0.0
- numpy >= 1.24.0
- scikit-learn >= 1.3.0
- yfinance >= 0.2.0
- matplotlib >= 3.7.0
- seaborn >= 0.12.0
- pyyaml >= 6.0
- jupyter >= 1.0.0

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Specify your license here]

## Acknowledgments

- Data provided by Yahoo Finance via `yfinance`
- Built with Python, scikit-learn, pandas, and numpy
