"""
Main pipeline for end-to-end stock prediction workflow
"""

import pandas as pd
import numpy as np
import yaml
import logging
from pathlib import Path
from typing import Dict, Any

from ..data.get_data import fetch_stock_data, load_data
from ..data.clean_data import remove_missing_values, remove_outliers, validate_data
from ..features.build_features import build_features, create_target_variable
from ..models.train_model import prepare_data, train_model, evaluate_model, save_model
from ..models.predict_model import load_model, predict
from ..visualization.plot_predictions import create_all_visualizations

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_config(config_path: str) -> Dict[str, Any]:
    """
    Load configuration from YAML file
    
    Parameters:
    -----------
    config_path : str
        Path to configuration file
    
    Returns:
    --------
    dict
        Configuration dictionary
    """
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    return config


def run_pipeline(config_path: str = "conf/config.yaml"):
    """
    Run the complete stock prediction pipeline
    
    Parameters:
    -----------
    config_path : str
        Path to configuration file
    """
    logger.info("Starting stock prediction pipeline")
    
    # Load configuration
    config = load_config(config_path)
    logger.info(f"Loaded configuration from {config_path}")
    
    # Create output directories
    Path("data/raw").mkdir(parents=True, exist_ok=True)
    Path("data/interim").mkdir(parents=True, exist_ok=True)
    Path("data/processed").mkdir(parents=True, exist_ok=True)
    Path("models").mkdir(parents=True, exist_ok=True)
    Path("reports/figures").mkdir(parents=True, exist_ok=True)
    Path("reports/metrics").mkdir(parents=True, exist_ok=True)
    
    # Step 1: Fetch/load data
    logger.info("Step 1: Fetching data")
    if config['data']['source'] == 'yfinance':
        ticker = config['data']['ticker']
        cache_file = f"data/raw/{ticker}_raw.csv"
        use_cache = config['data'].get('use_cache', True)
        cache_dir = config['data'].get('cache_dir', 'data/raw')
        
        # Try to fetch new data (will use cache if rate limited or if dates match)
        try:
            raw_data = fetch_stock_data(
                ticker=ticker,
                start_date=config['data']['start_date'],
                end_date=config['data']['end_date'],
                use_cache=use_cache,
                cache_dir=cache_dir
            )
            
            # Always save fetched data to cache (updates cache with latest data)
            if len(raw_data) > 0:
                raw_data.to_csv(cache_file)
                logger.info(f"Saved/updated data to {cache_file}")
                logger.info(f"Data date range: {raw_data.index.min()} to {raw_data.index.max()}")
        except Exception as e:
            # Final fallback: try to load from cache if fetch completely fails
            if use_cache and Path(cache_file).exists():
                logger.warning(f"Fetch failed: {str(e)}. Loading from existing cache.")
                raw_data = load_data(cache_file)
            else:
                logger.error(f"Failed to fetch data and no cache available: {str(e)}")
                raise
    else:
        raw_data = load_data(config['data']['file_path'])
    
    # Step 2: Clean data
    logger.info("Step 2: Cleaning data")
    cleaned_data = remove_missing_values(
        raw_data,
        method=config['data']['missing_values_method']
    )
    
    if config['data'].get('remove_outliers', False):
        cleaned_data = remove_outliers(
            cleaned_data,
            columns=config['data'].get('outlier_columns', ['Close', 'Volume']),
            method=config['data'].get('outlier_method', 'iqr')
        )
    
    validate_data(cleaned_data)
    cleaned_data.to_csv(f"data/interim/{config['data']['ticker']}_cleaned.csv")
    
    # Step 3: Build features
    logger.info("Step 3: Building features")
    features = build_features(
        cleaned_data,
        feature_list=config['features'].get('feature_list')
    )
    features.to_csv(f"data/processed/{config['data']['ticker']}_features.csv")
    
    # Step 4: Create target variable
    logger.info("Step 4: Creating target variable")
    target = create_target_variable(
        features,
        target_type=config['model']['target_type'],
        prediction_horizon=config['model'].get('prediction_horizon', 1)
    )
    
    # Step 5: Prepare data for training
    logger.info("Step 5: Preparing data for training")
    X_train, X_test, y_train, y_test, scaler, feature_names, test_dates = prepare_data(
        features,
        target,
        test_size=config['model'].get('test_size', 0.2),
        random_state=config['model'].get('random_state', 42)
    )
    
    # Step 6: Train model
    logger.info("Step 6: Training model")
    model = train_model(
        X_train,
        y_train,
        model_type=config['model']['model_type'],
        **config['model'].get('hyperparameters', {})
    )
    
    # Step 7: Evaluate model
    logger.info("Step 7: Evaluating model")
    metrics, y_pred = evaluate_model(model, X_test, y_test, return_predictions=True)
    
    # Save metrics
    metrics_df = pd.DataFrame([metrics])
    metrics_df.to_csv(f"reports/metrics/{config['data']['ticker']}_metrics.csv", index=False)
    
    # Step 8: Create visualizations
    logger.info("Step 8: Creating visualizations")
    create_all_visualizations(
        model=model,
        X_test=X_test,
        y_test=y_test,
        y_pred=y_pred,
        feature_names=feature_names,
        ticker=config['data']['ticker'],
        dates=test_dates,
        metrics=metrics,
        output_dir="reports/figures",
        show_plots=False
    )
    
    # Step 9: Save model
    logger.info("Step 9: Saving model")
    model_path = f"models/{config['data']['ticker']}_{config['model']['model_type']}.pkl"
    save_model(model, scaler, model_path)
    
    logger.info("Pipeline completed successfully")
    logger.info(f"Model saved to {model_path}")
    logger.info(f"Metrics: {metrics}")
    logger.info(f"Visualizations saved to reports/figures/")
    
    return {
        'model': model,
        'scaler': scaler,
        'metrics': metrics,
        'features': features,
        'target': target,
        'predictions': y_pred
    }


if __name__ == "__main__":
    run_pipeline()

