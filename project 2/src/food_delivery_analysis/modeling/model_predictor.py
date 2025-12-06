"""
Model Prediction Module

Handles making predictions with trained models.
"""

import pandas as pd
import numpy as np
from typing import Optional, Union, Dict, Any
from pathlib import Path
import pickle
import logging

logger = logging.getLogger(__name__)


class ModelPredictor:
    """Handles model predictions."""
    
    def __init__(self, model_path: Optional[Union[str, Path]] = None, model: Optional[Any] = None):
        """
        Initialize ModelPredictor.
        
        Args:
            model_path: Path to saved model file
            model: Pre-loaded model instance
        """
        if model_path:
            self.model = self.load_model(model_path)
        elif model:
            self.model = model
        else:
            raise ValueError("Either model_path or model must be provided")
    
    def load_model(self, model_path: Union[str, Path]) -> Any:
        """
        Load a trained model from disk.
        
        Args:
            model_path: Path to model file
            
        Returns:
            Loaded model
        """
        model_path = Path(model_path)
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")
        
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        logger.info(f"Loaded model from {model_path}")
        return model
    
    def predict(
        self,
        X: pd.DataFrame,
        return_confidence: bool = False
    ) -> Union[np.ndarray, tuple]:
        """
        Make predictions.
        
        Args:
            X: Feature DataFrame
            return_confidence: Whether to return prediction confidence intervals
            
        Returns:
            Predictions array or tuple of (predictions, confidence_intervals)
        """
        predictions = self.model.predict(X)
        
        if return_confidence and hasattr(self.model, 'predict_proba'):
            # For models that support probability prediction
            proba = self.model.predict_proba(X)
            confidence = np.max(proba, axis=1)
            return predictions, confidence
        
        return predictions
    
    def predict_batch(
        self,
        X: pd.DataFrame,
        batch_size: int = 1000
    ) -> np.ndarray:
        """
        Make predictions in batches (useful for large datasets).
        
        Args:
            X: Feature DataFrame
            batch_size: Size of each batch
            
        Returns:
            Predictions array
        """
        predictions = []
        
        for i in range(0, len(X), batch_size):
            batch = X.iloc[i:i+batch_size]
            batch_pred = self.model.predict(batch)
            predictions.extend(batch_pred)
            logger.info(f"Processed batch {i//batch_size + 1}/{(len(X)-1)//batch_size + 1}")
        
        return np.array(predictions)

