"""
Exploratory Data Analysis Module

Provides functions for statistical analysis and data exploration.
"""

import pandas as pd
import numpy as np
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class ExploratoryAnalysis:
    """Handles exploratory data analysis operations."""
    
    def __init__(self, df: pd.DataFrame):
        """
        Initialize ExploratoryAnalysis.
        
        Args:
            df: Input DataFrame
        """
        self.df = df.copy()
    
    def get_numeric_columns(self) -> List[str]:
        """Get list of numeric columns."""
        return self.df.select_dtypes(include=[np.number]).columns.tolist()
    
    def get_categorical_columns(self) -> List[str]:
        """Get list of categorical columns."""
        return self.df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    def get_datetime_columns(self) -> List[str]:
        """Get list of datetime columns."""
        return self.df.select_dtypes(include=['datetime64']).columns.tolist()
    
    def get_correlation_matrix(
        self, 
        columns: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Calculate correlation matrix for numeric columns.
        
        Args:
            columns: Specific columns to include. If None, uses all numeric columns.
            
        Returns:
            Correlation matrix DataFrame
        """
        if columns is None:
            columns = self.get_numeric_columns()
        
        return self.df[columns].corr()
    
    def get_summary_by_category(
        self,
        category_col: str,
        numeric_col: str,
        agg_func: str = 'mean'
    ) -> pd.Series:
        """
        Get summary statistics by category.
        
        Args:
            category_col: Categorical column name
            numeric_col: Numeric column name
            agg_func: Aggregation function ('mean', 'median', 'sum', 'count')
            
        Returns:
            Series with aggregated values
        """
        if agg_func == 'mean':
            return self.df.groupby(category_col)[numeric_col].mean()
        elif agg_func == 'median':
            return self.df.groupby(category_col)[numeric_col].median()
        elif agg_func == 'sum':
            return self.df.groupby(category_col)[numeric_col].sum()
        elif agg_func == 'count':
            return self.df.groupby(category_col)[numeric_col].count()
        else:
            raise ValueError(f"Unknown aggregation function: {agg_func}")
    
    def get_distribution_stats(
        self,
        column: str
    ) -> Dict[str, Any]:
        """
        Get distribution statistics for a numeric column.
        
        Args:
            column: Column name
            
        Returns:
            Dictionary with distribution statistics
        """
        if column not in self.df.columns:
            raise ValueError(f"Column {column} not found")
        
        stats = {
            'mean': self.df[column].mean(),
            'median': self.df[column].median(),
            'std': self.df[column].std(),
            'min': self.df[column].min(),
            'max': self.df[column].max(),
            'q25': self.df[column].quantile(0.25),
            'q75': self.df[column].quantile(0.75),
            'skewness': self.df[column].skew(),
            'kurtosis': self.df[column].kurtosis()
        }
        
        return stats
    
    def detect_outliers(
        self,
        column: str,
        method: str = 'iqr'
    ) -> pd.Series:
        """
        Detect outliers in a numeric column.
        
        Args:
            column: Column name
            method: Method for outlier detection ('iqr' or 'zscore')
            
        Returns:
            Boolean Series indicating outliers
        """
        if method == 'iqr':
            Q1 = self.df[column].quantile(0.25)
            Q3 = self.df[column].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            return (self.df[column] < lower_bound) | (self.df[column] > upper_bound)
        
        elif method == 'zscore':
            z_scores = np.abs((self.df[column] - self.df[column].mean()) / self.df[column].std())
            return z_scores > 3
        
        else:
            raise ValueError(f"Unknown method: {method}")
    
    def get_pivot_table(
        self,
        index: str,
        columns: str,
        values: str,
        aggfunc: str = 'count'
    ) -> pd.DataFrame:
        """
        Create a pivot table.
        
        Args:
            index: Index column
            columns: Columns for pivot
            values: Values column
            aggfunc: Aggregation function
            
        Returns:
            Pivot table DataFrame
        """
        return self.df.pivot_table(
            index=index,
            columns=columns,
            values=values,
            aggfunc=aggfunc
        )
    
    def get_feature_importance_correlation(
        self,
        target_column: str
    ) -> pd.Series:
        """
        Get correlation of all numeric features with target.
        
        Args:
            target_column: Target column name
            
        Returns:
            Series with correlations sorted by absolute value
        """
        numeric_cols = self.get_numeric_columns()
        if target_column in numeric_cols:
            numeric_cols.remove(target_column)
        
        correlations = {}
        for col in numeric_cols:
            correlations[col] = self.df[col].corr(self.df[target_column])
        
        return pd.Series(correlations).sort_values(key=abs, ascending=False)

