"""
Model Training Module

Handles training and evaluation of machine learning models.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Union
from pathlib import Path
import pickle
import json
import logging

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score,
    mean_absolute_percentage_error
)
from sklearn.model_selection import cross_val_score, GridSearchCV

logger = logging.getLogger(__name__)


class ModelTrainer:
    """Handles model training and evaluation."""
    
    def __init__(self, models_dir: Optional[Union[str, Path]] = None):
        """
        Initialize ModelTrainer.
        
        Args:
            models_dir: Directory to save trained models
        """
        self.models_dir = Path(models_dir) if models_dir else Path("data/models")
        self.models_dir.mkdir(parents=True, exist_ok=True)
        
        self.models: Dict[str, Any] = {}
        self.model_scores: Dict[str, Dict[str, float]] = {}
        self.best_model: Optional[Any] = None
        self.best_model_name: Optional[str] = None
        
    def get_default_models(self) -> Dict[str, Any]:
        """
        Get dictionary of default models to train.
        
        Returns:
            Dictionary of model name -> model instance
        """
        return {
            'linear_regression': LinearRegression(),
            'ridge': Ridge(alpha=1.0),
            'lasso': Lasso(alpha=1.0),
            'decision_tree': DecisionTreeRegressor(random_state=42),
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
            'gradient_boosting': GradientBoostingRegressor(n_estimators=100, random_state=42)
        }
    
    def train_model(
        self,
        model: Any,
        model_name: str,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_val: Optional[pd.DataFrame] = None,
        y_val: Optional[pd.Series] = None
    ) -> Any:
        """
        Train a single model.
        
        Args:
            model: Model instance
            model_name: Name of the model
            X_train: Training features
            y_train: Training target
            X_val: Validation features (optional)
            y_val: Validation target (optional)
            
        Returns:
            Trained model
        """
        logger.info(f"Training {model_name}...")
        model.fit(X_train, y_train)
        self.models[model_name] = model
        logger.info(f"{model_name} trained successfully")
        return model
    
    def evaluate_model(
        self,
        model: Any,
        X: pd.DataFrame,
        y: pd.Series,
        dataset_name: str = "test"
    ) -> Dict[str, float]:
        """
        Evaluate a model and return metrics.
        
        Args:
            model: Trained model
            X: Features
            y: True target values
            dataset_name: Name of the dataset (for logging)
            
        Returns:
            Dictionary of evaluation metrics
        """
        y_pred = model.predict(X)
        
        metrics = {
            'mse': mean_squared_error(y, y_pred),
            'rmse': np.sqrt(mean_squared_error(y, y_pred)),
            'mae': mean_absolute_error(y, y_pred),
            'r2': r2_score(y, y_pred),
            'mape': mean_absolute_percentage_error(y, y_pred) * 100
        }
        
        logger.info(f"{dataset_name} Metrics - RMSE: {metrics['rmse']:.2f}, "
                   f"MAE: {metrics['mae']:.2f}, R²: {metrics['r2']:.3f}")
        
        return metrics
    
    def train_all_models(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_test: pd.DataFrame,
        y_test: pd.Series,
        models: Optional[Dict[str, Any]] = None,
        cv: int = 5
    ) -> Dict[str, Dict[str, float]]:
        """
        Train multiple models and evaluate them.
        
        Args:
            X_train: Training features
            y_train: Training target
            X_test: Test features
            y_test: Test target
            models: Dictionary of models to train. If None, uses default models.
            cv: Number of cross-validation folds
            
        Returns:
            Dictionary of model scores
        """
        if models is None:
            models = self.get_default_models()
        
        self.model_scores = {}
        
        for model_name, model in models.items():
            # Train model
            trained_model = self.train_model(model, model_name, X_train, y_train)
            
            # Evaluate on test set
            test_metrics = self.evaluate_model(trained_model, X_test, y_test, "Test")
            
            # Cross-validation
            cv_scores = cross_val_score(
                model, X_train, y_train, cv=cv, 
                scoring='neg_mean_squared_error', n_jobs=-1
            )
            cv_rmse = np.sqrt(-cv_scores.mean())
            
            self.model_scores[model_name] = {
                **test_metrics,
                'cv_rmse': cv_rmse,
                'cv_std': np.sqrt(cv_scores.std())
            }
        
        # Find best model based on RMSE
        best_model_name = min(
            self.model_scores.keys(),
            key=lambda x: self.model_scores[x]['rmse']
        )
        self.best_model = self.models[best_model_name]
        self.best_model_name = best_model_name
        
        logger.info(f"Best model: {best_model_name} with RMSE: {self.model_scores[best_model_name]['rmse']:.2f}")
        
        return self.model_scores
    
    def hyperparameter_tuning(
        self,
        model: Any,
        param_grid: Dict[str, List[Any]],
        X_train: pd.DataFrame,
        y_train: pd.Series,
        cv: int = 5,
        scoring: str = 'neg_mean_squared_error',
        n_jobs: int = -1
    ) -> Any:
        """
        Perform hyperparameter tuning using GridSearchCV.
        
        Args:
            model: Model instance
            param_grid: Parameter grid for tuning
            X_train: Training features
            y_train: Training target
            cv: Number of cross-validation folds
            scoring: Scoring metric
            n_jobs: Number of parallel jobs
            
        Returns:
            Best model with tuned hyperparameters
        """
        logger.info("Performing hyperparameter tuning...")
        grid_search = GridSearchCV(
            model, param_grid, cv=cv, scoring=scoring,
            n_jobs=n_jobs, verbose=1
        )
        grid_search.fit(X_train, y_train)
        
        logger.info(f"Best parameters: {grid_search.best_params_}")
        logger.info(f"Best CV score: {np.sqrt(-grid_search.best_score_):.2f}")
        
        return grid_search.best_estimator_
    
    def save_model(
        self,
        model: Any,
        model_name: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Save a trained model to disk.
        
        Args:
            model: Trained model
            model_name: Name of the model
            metadata: Optional metadata to save with the model
        """
        model_path = self.models_dir / f"{model_name}.pkl"
        
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
        
        logger.info(f"Saved model to {model_path}")
        
        if metadata:
            metadata_path = self.models_dir / f"{model_name}_metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            logger.info(f"Saved metadata to {metadata_path}")
    
    def load_model(self, model_name: str) -> Any:
        """
        Load a trained model from disk.
        
        Args:
            model_name: Name of the model
            
        Returns:
            Loaded model
        """
        model_path = self.models_dir / f"{model_name}.pkl"
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")
        
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        logger.info(f"Loaded model from {model_path}")
        return model
    
    def get_feature_importance(
        self,
        model: Any,
        feature_names: List[str],
        top_n: int = 10
    ) -> pd.DataFrame:
        """
        Get feature importance from a model.
        
        Args:
            model: Trained model
            feature_names: List of feature names
            top_n: Number of top features to return
            
        Returns:
            DataFrame with feature importance
        """
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        elif hasattr(model, 'coef_'):
            importances = np.abs(model.coef_)
        else:
            raise ValueError("Model does not support feature importance")
        
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': importances
        }).sort_values('importance', ascending=False)
        
        return importance_df.head(top_n)

