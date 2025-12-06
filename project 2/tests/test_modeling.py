"""
Tests for modeling modules.
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import tempfile
import shutil

from food_delivery_analysis import ModelTrainer, ModelPredictor


class TestModelTrainer:
    """Test cases for ModelTrainer."""
    
    @pytest.fixture
    def sample_data(self):
        """Create sample training data."""
        np.random.seed(42)
        X = pd.DataFrame({
            'feature1': np.random.randn(100),
            'feature2': np.random.randn(100)
        })
        y = pd.Series(2 * X['feature1'] + 3 * X['feature2'] + np.random.randn(100))
        return X, y
    
    @pytest.fixture
    def temp_models_dir(self):
        """Create temporary directory for models."""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir)
    
    def test_init(self, temp_models_dir):
        """Test ModelTrainer initialization."""
        trainer = ModelTrainer(models_dir=temp_models_dir)
        assert trainer.models_dir == Path(temp_models_dir)
        assert trainer.models == {}
    
    def test_get_default_models(self, temp_models_dir):
        """Test getting default models."""
        trainer = ModelTrainer(models_dir=temp_models_dir)
        models = trainer.get_default_models()
        
        assert 'linear_regression' in models
        assert 'random_forest' in models
        assert 'gradient_boosting' in models
    
    def test_train_model(self, temp_models_dir, sample_data):
        """Test training a single model."""
        X, y = sample_data
        X_train, X_test = X[:80], X[80:]
        y_train, y_test = y[:80], y[80:]
        
        trainer = ModelTrainer(models_dir=temp_models_dir)
        from sklearn.linear_model import LinearRegression
        
        model = trainer.train_model(
            LinearRegression(), 'test_model', X_train, y_train
        )
        
        assert 'test_model' in trainer.models
        assert model is not None
    
    def test_evaluate_model(self, temp_models_dir, sample_data):
        """Test model evaluation."""
        X, y = sample_data
        X_train, X_test = X[:80], X[80:]
        y_train, y_test = y[:80], y[80:]
        
        trainer = ModelTrainer(models_dir=temp_models_dir)
        from sklearn.linear_model import LinearRegression
        
        model = trainer.train_model(
            LinearRegression(), 'test_model', X_train, y_train
        )
        
        metrics = trainer.evaluate_model(model, X_test, y_test)
        
        assert 'mse' in metrics
        assert 'rmse' in metrics
        assert 'mae' in metrics
        assert 'r2' in metrics
        assert metrics['rmse'] >= 0
    
    def test_train_all_models(self, temp_models_dir, sample_data):
        """Test training all default models."""
        X, y = sample_data
        X_train, X_test = X[:80], X[80:]
        y_train, y_test = y[:80], y[80:]
        
        trainer = ModelTrainer(models_dir=temp_models_dir)
        scores = trainer.train_all_models(X_train, y_train, X_test, y_test)
        
        assert len(scores) > 0
        assert trainer.best_model is not None
        assert trainer.best_model_name is not None
    
    def test_save_and_load_model(self, temp_models_dir, sample_data):
        """Test saving and loading models."""
        X, y = sample_data
        X_train = X[:80]
        y_train = y[:80]
        
        trainer = ModelTrainer(models_dir=temp_models_dir)
        from sklearn.linear_model import LinearRegression
        
        model = trainer.train_model(
            LinearRegression(), 'test_model', X_train, y_train
        )
        
        trainer.save_model(model, 'test_model')
        
        loaded_model = trainer.load_model('test_model')
        assert loaded_model is not None


class TestModelPredictor:
    """Test cases for ModelPredictor."""
    
    @pytest.fixture
    def sample_model_and_data(self, tmp_path):
        """Create a trained model and sample data."""
        import pickle
        from sklearn.linear_model import LinearRegression
        
        # Train a simple model
        X_train = pd.DataFrame({'feature1': [1, 2, 3], 'feature2': [4, 5, 6]})
        y_train = pd.Series([10, 20, 30])
        
        model = LinearRegression()
        model.fit(X_train, y_train)
        
        # Save model
        model_path = tmp_path / "test_model.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
        
        X_test = pd.DataFrame({'feature1': [4, 5], 'feature2': [7, 8]})
        
        return model_path, X_test, model
    
    def test_load_model(self, sample_model_and_data):
        """Test loading a model."""
        model_path, _, _ = sample_model_and_data
        predictor = ModelPredictor(model_path=model_path)
        assert predictor.model is not None
    
    def test_predict(self, sample_model_and_data):
        """Test making predictions."""
        model_path, X_test, _ = sample_model_and_data
        predictor = ModelPredictor(model_path=model_path)
        
        predictions = predictor.predict(X_test)
        
        assert len(predictions) == len(X_test)
        assert isinstance(predictions, np.ndarray)

