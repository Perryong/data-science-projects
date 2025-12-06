"""
Tests for DataLoader module.
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import tempfile
import os

from food_delivery_analysis import DataLoader


class TestDataLoader:
    """Test cases for DataLoader."""
    
    def test_init(self):
        """Test DataLoader initialization."""
        loader = DataLoader()
        assert loader.df is None
        assert loader.data_path is None
    
    def test_load_csv(self):
        """Test loading CSV file."""
        # Create temporary CSV file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write("col1,col2,col3\n1,2,3\n4,5,6\n")
            temp_path = f.name
        
        try:
            loader = DataLoader()
            df = loader.load_csv(temp_path)
            
            assert df is not None
            assert df.shape == (2, 3)
            assert list(df.columns) == ['col1', 'col2', 'col3']
        finally:
            os.unlink(temp_path)
    
    def test_load_csv_file_not_found(self):
        """Test loading non-existent file raises error."""
        loader = DataLoader()
        with pytest.raises(FileNotFoundError):
            loader.load_csv("nonexistent_file.csv")
    
    def test_get_data_info(self):
        """Test getting data information."""
        loader = DataLoader()
        df = pd.DataFrame({
            'col1': [1, 2, 3],
            'col2': [4.0, 5.0, 6.0],
            'col3': ['a', 'b', 'c']
        })
        loader.df = df
        
        info = loader.get_data_info()
        
        assert 'shape' in info
        assert 'columns' in info
        assert 'dtypes' in info
        assert 'missing_values' in info
        assert info['shape'] == (3, 3)
    
    def test_get_data_info_no_data(self):
        """Test getting info when no data is loaded."""
        loader = DataLoader()
        with pytest.raises(ValueError, match="No data loaded"):
            loader.get_data_info()
    
    def test_get_summary_statistics(self):
        """Test getting summary statistics."""
        loader = DataLoader()
        df = pd.DataFrame({
            'col1': [1, 2, 3, 4, 5],
            'col2': [10, 20, 30, 40, 50]
        })
        loader.df = df
        
        stats = loader.get_summary_statistics()
        
        assert isinstance(stats, pd.DataFrame)
        assert 'col1' in stats.columns
        assert 'col2' in stats.columns
        assert 'mean' in stats.index
    
    def test_get_dataframe(self):
        """Test getting DataFrame copy."""
        loader = DataLoader()
        original_df = pd.DataFrame({'col1': [1, 2, 3]})
        loader.df = original_df
        
        df_copy = loader.get_dataframe()
        
        assert df_copy is not original_df
        assert df_copy.equals(original_df)

