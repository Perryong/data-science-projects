"""
Tests for ExploratoryAnalysis module.
"""

import pytest
import pandas as pd
import numpy as np

from food_delivery_analysis import ExploratoryAnalysis


class TestExploratoryAnalysis:
    """Test cases for ExploratoryAnalysis."""
    
    @pytest.fixture
    def sample_df(self):
        """Create sample DataFrame for testing."""
        return pd.DataFrame({
            'numeric1': [1, 2, 3, 4, 5],
            'numeric2': [10.0, 20.0, 30.0, 40.0, 50.0],
            'category': ['A', 'B', 'A', 'B', 'A'],
            'datetime': pd.date_range('2023-01-01', periods=5, freq='D')
        })
    
    def test_get_numeric_columns(self, sample_df):
        """Test getting numeric columns."""
        eda = ExploratoryAnalysis(sample_df)
        numeric_cols = eda.get_numeric_columns()
        
        assert 'numeric1' in numeric_cols
        assert 'numeric2' in numeric_cols
        assert 'category' not in numeric_cols
    
    def test_get_categorical_columns(self, sample_df):
        """Test getting categorical columns."""
        eda = ExploratoryAnalysis(sample_df)
        categorical_cols = eda.get_categorical_columns()
        
        assert 'category' in categorical_cols
        assert 'numeric1' not in categorical_cols
    
    def test_get_correlation_matrix(self, sample_df):
        """Test correlation matrix calculation."""
        eda = ExploratoryAnalysis(sample_df)
        corr = eda.get_correlation_matrix()
        
        assert isinstance(corr, pd.DataFrame)
        assert 'numeric1' in corr.columns
        assert 'numeric2' in corr.columns
    
    def test_get_summary_by_category(self, sample_df):
        """Test summary by category."""
        eda = ExploratoryAnalysis(sample_df)
        summary = eda.get_summary_by_category('category', 'numeric1', agg_func='mean')
        
        assert isinstance(summary, pd.Series)
        assert len(summary) == 2  # Two categories: A and B
    
    def test_get_distribution_stats(self, sample_df):
        """Test distribution statistics."""
        eda = ExploratoryAnalysis(sample_df)
        stats = eda.get_distribution_stats('numeric1')
        
        assert 'mean' in stats
        assert 'median' in stats
        assert 'std' in stats
        assert 'min' in stats
        assert 'max' in stats
        assert stats['mean'] == 3.0
    
    def test_detect_outliers_iqr(self, sample_df):
        """Test outlier detection using IQR."""
        eda = ExploratoryAnalysis(sample_df)
        outliers = eda.detect_outliers('numeric1', method='iqr')
        
        assert isinstance(outliers, pd.Series)
        assert outliers.dtype == bool
    
    def test_get_pivot_table(self, sample_df):
        """Test pivot table creation."""
        eda = ExploratoryAnalysis(sample_df)
        pivot = eda.get_pivot_table('category', 'numeric1', 'numeric2', aggfunc='mean')
        
        assert isinstance(pivot, pd.DataFrame)

