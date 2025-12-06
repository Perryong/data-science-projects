"""
Module for making predictions with trained models
"""

import pandas as pd
import numpy as np
import joblib
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def load_model(filepath: str) -> Dict[str, Any]:
    """
    Load a trained model and scaler from disk
    
    Parameters:
    -----------
    filepath : str
        Path to the saved model file
    
    Returns:
    --------
    dict
        Dictionary with 'model' and 'scaler' keys
    """
    logger.info(f"Loading model from {filepath}")
    model_data = joblib.load(filepath)
    logger.info("Model loaded successfully")
    return model_data


def predict(
    model: Any,
    scaler: Any,
    features: pd.DataFrame
) -> np.ndarray:
    """
    Make predictions using a trained model
    
    Parameters:
    -----------
    model : Any
        Trained model
    scaler : Any
        Fitted scaler
    features : pd.DataFrame
        Feature matrix for prediction
    
    Returns:
    --------
    np.ndarray
        Array of predictions
    """
    logger.info(f"Making predictions for {len(features)} samples")
    
    # Scale features
    features_scaled = scaler.transform(features)
    
    # Make predictions
    predictions = model.predict(features_scaled)
    
    logger.info("Predictions completed")
    return predictions


def predict_with_confidence(
    model: Any,
    scaler: Any,
    features: pd.DataFrame,
    return_std: bool = True
) -> Dict[str, np.ndarray]:
    """
    Make predictions with confidence intervals (for models that support it)
    
    Parameters:
    -----------
    model : Any
        Trained model (should support predict with return_std)
    scaler : Any
        Fitted scaler
    features : pd.DataFrame
        Feature matrix for prediction
    return_std : bool
        Whether to return standard deviation
    
    Returns:
    --------
    dict
        Dictionary with 'predictions' and optionally 'std' keys
    """
    logger.info(f"Making predictions with confidence for {len(features)} samples")
    
    features_scaled = scaler.transform(features)
    
    if hasattr(model, 'predict') and return_std:
        try:
            predictions, std = model.predict(features_scaled, return_std=True)
            return {'predictions': predictions, 'std': std}
        except:
            predictions = model.predict(features_scaled)
            return {'predictions': predictions}
    else:
        predictions = model.predict(features_scaled)
        return {'predictions': predictions}

