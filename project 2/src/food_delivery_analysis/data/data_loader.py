"""
Data Loading Module

Handles loading and initial inspection of food delivery datasets.
"""

import pandas as pd
import os
from pathlib import Path
from typing import Optional, Union
import logging

logger = logging.getLogger(__name__)


class DataLoader:
    """Handles data loading operations."""
    
    def __init__(self, data_path: Optional[Union[str, Path]] = None):
        """
        Initialize DataLoader.
        
        Args:
            data_path: Path to the data file or directory. If None, uses default.
        """
        self.data_path = data_path
        self.df: Optional[pd.DataFrame] = None
        
    def load_csv(
        self, 
        file_path: Union[str, Path],
        **kwargs
    ) -> pd.DataFrame:
        """
        Load data from CSV file.
        
        Args:
            file_path: Path to CSV file
            **kwargs: Additional arguments to pass to pd.read_csv
            
        Returns:
            Loaded DataFrame
        """
        try:
            file_path = Path(file_path)
            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")
            
            logger.info(f"Loading data from {file_path}")
            self.df = pd.read_csv(file_path, **kwargs)
            logger.info(f"Data loaded successfully. Shape: {self.df.shape}")
            return self.df
            
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise
    
    def get_data_info(self) -> dict:
        """
        Get basic information about the loaded dataset.
        
        Returns:
            Dictionary with dataset information
        """
        if self.df is None:
            raise ValueError("No data loaded. Call load_csv() first.")
        
        info = {
            "shape": self.df.shape,
            "columns": list(self.df.columns),
            "dtypes": self.df.dtypes.to_dict(),
            "missing_values": self.df.isnull().sum().to_dict(),
            "memory_usage_mb": self.df.memory_usage(deep=True).sum() / 1024**2
        }
        
        return info
    
    def get_summary_statistics(self) -> pd.DataFrame:
        """
        Get summary statistics for numeric columns.
        
        Returns:
            DataFrame with summary statistics
        """
        if self.df is None:
            raise ValueError("No data loaded. Call load_csv() first.")
        
        return self.df.describe()
    
    def get_dataframe(self) -> pd.DataFrame:
        """
        Get the loaded DataFrame.
        
        Returns:
            DataFrame
        """
        if self.df is None:
            raise ValueError("No data loaded. Call load_csv() first.")
        
        return self.df.copy()

