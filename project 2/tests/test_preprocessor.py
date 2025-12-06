"""
Tests for DataPreprocessor module.
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime

from food_delivery_analysis import DataPreprocessor


class TestDataPreprocessor:
    """Test cases for DataPreprocessor."""
    
    def test_init(self):
        """Test DataPreprocessor initialization."""
        preprocessor = DataPreprocessor()
        assert preprocessor.label_encoders == {}
        assert preprocessor.feature_columns is None
    
    def test_convert_datetime(self):
        """Test datetime conversion."""
        preprocessor = DataPreprocessor()
        df = pd.DataFrame({
            'date': ['2023-01-01', '2023-01-02', '2023-01-03']
        })
        
        result = preprocessor.convert_datetime(df, 'date')
        
        assert pd.api.types.is_datetime64_any_dtype(result['date'])
    
    def test_extract_datetime_features(self):
        """Test datetime feature extraction."""
        preprocessor = DataPreprocessor()
        df = pd.DataFrame({
            'order_time': pd.date_range('2023-01-01', periods=7, freq='D')
        })
        
        result = preprocessor.extract_datetime_features(df, 'order_time')
        
        assert 'hour' in result.columns
        assert 'weekday' in result.columns
        assert 'day_of_week' in result.columns
        assert 'month' in result.columns
        assert 'is_weekend' in result.columns
    
    def test_create_efficiency_feature(self):
        """Test efficiency feature creation."""
        preprocessor = DataPreprocessor()
        df = pd.DataFrame({
            'distance_km': [10, 20, 30],
            'delivery_time_min': [20, 40, 60]
        })
        
        result = preprocessor.create_efficiency_feature(df)
        
        assert 'efficiency' in result.columns
        assert np.allclose(result['efficiency'], [0.5, 0.5, 0.5])
    
    def test_encode_categorical_label(self):
        """Test label encoding."""
        preprocessor = DataPreprocessor()
        df = pd.DataFrame({
            'category': ['A', 'B', 'C', 'A', 'B']
        })
        
        result = preprocessor.encode_categorical(df, ['category'], method='label')
        
        assert pd.api.types.is_numeric_dtype(result['category'])
        assert len(result['category'].unique()) == 3
    
    def test_handle_missing_values_mean(self):
        """Test missing value handling with mean strategy."""
        preprocessor = DataPreprocessor()
        df = pd.DataFrame({
            'col1': [1, 2, np.nan, 4, 5]
        })
        
        result = preprocessor.handle_missing_values(df, strategy='mean')
        
        assert result['col1'].isnull().sum() == 0
        assert result['col1'].mean() == pytest.approx(3.0, abs=0.1)
    
    def test_remove_outliers_iqr(self):
        """Test outlier removal using IQR method."""
        preprocessor = DataPreprocessor()
        # Create data with outliers
        data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]  # 100 is an outlier
        df = pd.DataFrame({'col1': data})
        
        result = preprocessor.remove_outliers(df, ['col1'], method='iqr')
        
        assert len(result) < len(df)
        assert result['col1'].max() < 100
    
    def test_prepare_features(self):
        """Test feature preparation."""
        preprocessor = DataPreprocessor()
        df = pd.DataFrame({
            'feature1': [1, 2, 3],
            'feature2': [4, 5, 6],
            'target': [10, 20, 30]
        })
        
        X, y = preprocessor.prepare_features(
            df,
            feature_columns=['feature1', 'feature2'],
            target_column='target'
        )
        
        assert X.shape == (3, 2)
        assert y.shape == (3,)
        assert list(X.columns) == ['feature1', 'feature2']
        assert preprocessor.feature_columns == ['feature1', 'feature2']
        assert preprocessor.target_column == 'target'
    
    def test_train_test_split_data(self):
        """Test train-test split."""
        preprocessor = DataPreprocessor()
        X = pd.DataFrame({'col1': range(100), 'col2': range(100, 200)})
        y = pd.Series(range(200, 300))
        
        X_train, X_test, y_train, y_test = preprocessor.train_test_split_data(
            X, y, test_size=0.2, random_state=42
        )
        
        assert len(X_train) == 80
        assert len(X_test) == 20
        assert len(y_train) == 80
        assert len(y_test) == 20

