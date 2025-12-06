"""
Module for cleaning and preprocessing stock market data
"""

import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)


def remove_missing_values(data: pd.DataFrame, method: str = "drop") -> pd.DataFrame:
    """
    Handle missing values in the dataset
    
    Parameters:
    -----------
    data : pd.DataFrame
        Input DataFrame
    method : str
        Method to handle missing values: 'drop', 'forward_fill', 'backward_fill', 'interpolate'
    
    Returns:
    --------
    pd.DataFrame
        DataFrame with missing values handled
    """
    logger.info(f"Handling missing values using method: {method}")
    
    if method == "drop":
        cleaned_data = data.dropna()
    elif method == "forward_fill":
        cleaned_data = data.ffill()
    elif method == "backward_fill":
        cleaned_data = data.bfill()
    elif method == "interpolate":
        cleaned_data = data.interpolate()
    else:
        raise ValueError(f"Unknown method: {method}")
    
    logger.info(f"Removed {len(data) - len(cleaned_data)} rows with missing values")
    return cleaned_data


def remove_outliers(data: pd.DataFrame, columns: list, method: str = "iqr", threshold: float = 3.0) -> pd.DataFrame:
    """
    Remove outliers from the dataset
    
    Parameters:
    -----------
    data : pd.DataFrame
        Input DataFrame
    columns : list
        List of column names to check for outliers
    method : str
        Method to detect outliers: 'iqr' or 'zscore'
    threshold : float
        Threshold for outlier detection
    
    Returns:
    --------
    pd.DataFrame
        DataFrame with outliers removed
    """
    logger.info(f"Removing outliers using {method} method")
    original_len = len(data)
    cleaned_data = data.copy()
    
    for col in columns:
        if col not in data.columns:
            logger.warning(f"Column {col} not found in data")
            continue
        
        if method == "iqr":
            Q1 = cleaned_data[col].quantile(0.25)
            Q3 = cleaned_data[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            mask = (cleaned_data[col] >= lower_bound) & (cleaned_data[col] <= upper_bound)
        
        elif method == "zscore":
            z_scores = np.abs((cleaned_data[col] - cleaned_data[col].mean()) / cleaned_data[col].std())
            mask = z_scores < threshold
        
        else:
            raise ValueError(f"Unknown method: {method}")
        
        cleaned_data = cleaned_data[mask]
    
    logger.info(f"Removed {original_len - len(cleaned_data)} outlier rows")
    return cleaned_data


def validate_data(data: pd.DataFrame, required_columns: list = None) -> bool:
    """
    Validate that the dataset has required columns and is not empty
    
    Parameters:
    -----------
    data : pd.DataFrame
        Input DataFrame
    required_columns : list
        List of required column names
    
    Returns:
    --------
    bool
        True if data is valid
    """
    if required_columns is None:
        required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
    
    missing_columns = [col for col in required_columns if col not in data.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")
    
    if data.empty:
        raise ValueError("DataFrame is empty")
    
    logger.info("Data validation passed")
    return True

