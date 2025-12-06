"""
Module for calculating technical indicators
"""

import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)


def calculate_sma(data: pd.Series, window: int) -> pd.Series:
    """
    Calculate Simple Moving Average (SMA)
    
    Parameters:
    -----------
    data : pd.Series
        Price data (typically Close prices)
    window : int
        Window size for moving average
    
    Returns:
    --------
    pd.Series
        SMA values
    """
    return data.rolling(window=window).mean()


def calculate_ema(data: pd.Series, window: int, alpha: float = None) -> pd.Series:
    """
    Calculate Exponential Moving Average (EMA)
    
    Parameters:
    -----------
    data : pd.Series
        Price data (typically Close prices)
    window : int
        Window size for moving average
    alpha : float
        Smoothing factor (if None, uses 2/(window+1))
    
    Returns:
    --------
    pd.Series
        EMA values
    """
    if alpha is None:
        alpha = 2.0 / (window + 1.0)
    return data.ewm(alpha=alpha, adjust=False).mean()


def calculate_rsi(data: pd.Series, window: int = 14) -> pd.Series:
    """
    Calculate Relative Strength Index (RSI)
    
    Parameters:
    -----------
    data : pd.Series
        Price data (typically Close prices)
    window : int
        Window size for RSI calculation (default: 14)
    
    Returns:
    --------
    pd.Series
        RSI values (0-100)
    """
    delta = data.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    
    return rsi


def calculate_macd(
    data: pd.Series,
    fast_period: int = 12,
    slow_period: int = 26,
    signal_period: int = 9
) -> pd.DataFrame:
    """
    Calculate MACD (Moving Average Convergence Divergence)
    
    Parameters:
    -----------
    data : pd.Series
        Price data (typically Close prices)
    fast_period : int
        Fast EMA period (default: 12)
    slow_period : int
        Slow EMA period (default: 26)
    signal_period : int
        Signal line EMA period (default: 9)
    
    Returns:
    --------
    pd.DataFrame
        DataFrame with MACD, Signal, and Histogram columns
    """
    ema_fast = calculate_ema(data, window=fast_period)
    ema_slow = calculate_ema(data, window=slow_period)
    
    macd = ema_fast - ema_slow
    signal = calculate_ema(macd, window=signal_period)
    histogram = macd - signal
    
    return pd.DataFrame({
        'MACD': macd,
        'Signal': signal,
        'Histogram': histogram
    })


def calculate_bollinger_bands(
    data: pd.Series,
    window: int = 20,
    num_std: float = 2.0
) -> pd.DataFrame:
    """
    Calculate Bollinger Bands
    
    Parameters:
    -----------
    data : pd.Series
        Price data (typically Close prices)
    window : int
        Window size for moving average (default: 20)
    num_std : float
        Number of standard deviations (default: 2.0)
    
    Returns:
    --------
    pd.DataFrame
        DataFrame with Upper, Middle, and Lower band columns
    """
    middle = calculate_sma(data, window=window)
    std = data.rolling(window=window).std()
    
    upper = middle + (std * num_std)
    lower = middle - (std * num_std)
    
    return pd.DataFrame({
        'Upper': upper,
        'Middle': middle,
        'Lower': lower
    })

