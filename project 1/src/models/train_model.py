"""
Module for training machine learning models
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import logging
from typing import Dict, Any, Tuple, Union

logger = logging.getLogger(__name__)


def prepare_data(
    features: pd.DataFrame,
    target: pd.Series,
    test_size: float = 0.2,
    random_state: int = 42
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, Any, list, pd.DatetimeIndex]:
    """
    Prepare data for training by splitting and scaling
    
    Parameters:
    -----------
    features : pd.DataFrame
        Feature matrix
    target : pd.Series
        Target variable
    test_size : float
        Proportion of data to use for testing
    random_state : int
        Random seed for reproducibility
    
    Returns:
    --------
    tuple
        X_train, X_test, y_train, y_test arrays, scaler, feature_names, test_dates
    """
    logger.info("Preparing data for training")
    
    # Align features and target, removing NaN values
    aligned_data = pd.concat([features, target], axis=1).dropna()
    X = aligned_data.drop(columns=[target.name])
    y = aligned_data[target.name]
    
    # Store feature names and dates
    feature_names = X.columns.tolist()
    dates = aligned_data.index
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, shuffle=False
    )
    
    # Get test dates
    test_dates = dates[len(X_train):]
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    logger.info(f"Training set size: {len(X_train)}, Test set size: {len(X_test)}")
    
    return X_train_scaled, X_test_scaled, y_train.values, y_test.values, scaler, feature_names, test_dates


def train_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    model_type: str = "random_forest",
    **kwargs
) -> Any:
    """
    Train a machine learning model
    
    Parameters:
    -----------
    X_train : np.ndarray
        Training features
    y_train : np.ndarray
        Training target
    model_type : str
        Type of model: 'random_forest', 'gradient_boosting', 'linear_regression'
    **kwargs
        Additional hyperparameters for the model
    
    Returns:
    --------
    Trained model object
    """
    logger.info(f"Training {model_type} model")
    
    if model_type == "random_forest":
        model = RandomForestRegressor(
            n_estimators=kwargs.get('n_estimators', 100),
            max_depth=kwargs.get('max_depth', None),
            random_state=kwargs.get('random_state', 42),
            **{k: v for k, v in kwargs.items() if k not in ['n_estimators', 'max_depth', 'random_state']}
        )
    elif model_type == "gradient_boosting":
        model = GradientBoostingRegressor(
            n_estimators=kwargs.get('n_estimators', 100),
            learning_rate=kwargs.get('learning_rate', 0.1),
            max_depth=kwargs.get('max_depth', 3),
            random_state=kwargs.get('random_state', 42),
            **{k: v for k, v in kwargs.items() if k not in ['n_estimators', 'learning_rate', 'max_depth', 'random_state']}
        )
    elif model_type == "linear_regression":
        model = LinearRegression(**kwargs)
    else:
        raise ValueError(f"Unknown model_type: {model_type}")
    
    model.fit(X_train, y_train)
    logger.info("Model training completed")
    
    return model


def evaluate_model(
    model: Any,
    X_test: np.ndarray,
    y_test: np.ndarray,
    return_predictions: bool = False
) -> Union[Dict[str, float], Tuple[Dict[str, float], np.ndarray]]:
    """
    Evaluate model performance
    
    Parameters:
    -----------
    model : Any
        Trained model
    X_test : np.ndarray
        Test features
    y_test : np.ndarray
        Test target
    return_predictions : bool
        Whether to return predictions along with metrics
    
    Returns:
    --------
    dict or tuple
        Dictionary with evaluation metrics, optionally with predictions
    """
    logger.info("Evaluating model performance")
    
    y_pred = model.predict(X_test)
    
    metrics = {
        'mse': mean_squared_error(y_test, y_pred),
        'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
        'mae': mean_absolute_error(y_test, y_pred),
        'r2': r2_score(y_test, y_pred)
    }
    
    logger.info(f"Metrics - MSE: {metrics['mse']:.4f}, RMSE: {metrics['rmse']:.4f}, "
                f"MAE: {metrics['mae']:.4f}, R2: {metrics['r2']:.4f}")
    
    if return_predictions:
        return metrics, y_pred
    return metrics


def save_model(model: Any, scaler: Any, filepath: str):
    """
    Save trained model and scaler to disk
    
    Parameters:
    -----------
    model : Any
        Trained model
    scaler : Any
        Fitted scaler
    filepath : str
        Path to save the model
    """
    logger.info(f"Saving model to {filepath}")
    joblib.dump({'model': model, 'scaler': scaler}, filepath)
    logger.info("Model saved successfully")

