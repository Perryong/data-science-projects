"""
Module for building features from raw stock data
"""

import pandas as pd
import numpy as np
from typing import List, Optional
import logging

from .indicators import (
    calculate_sma,
    calculate_ema,
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands
)

logger = logging.getLogger(__name__)


def build_features(
    data: pd.DataFrame,
    feature_list: Optional[List[str]] = None
) -> pd.DataFrame:
    """
    Build features from raw stock data
    
    Parameters:
    -----------
    data : pd.DataFrame
        Raw stock data with OHLCV columns
    feature_list : list
        List of features to create. If None, creates all available features
    
    Returns:
    --------
    pd.DataFrame
        DataFrame with original data and new features
    """
    logger.info("Building features from raw data")
    features = data.copy()
    
    if feature_list is None:
        feature_list = [
            'sma_short', 'sma_long',
            'ema_short', 'ema_long',
            'rsi',
            'macd', 'macd_signal', 'macd_hist',
            'bb_upper', 'bb_middle', 'bb_lower',
            'price_change', 'price_change_pct',
            'volume_change', 'volume_change_pct',
            'high_low_ratio', 'close_open_ratio'
        ]
    
    # Price-based features
    if any('price_change' in f for f in feature_list):
        features['price_change'] = features['Close'].diff()
        features['price_change_pct'] = features['Close'].pct_change()
    
    if 'high_low_ratio' in feature_list:
        features['high_low_ratio'] = features['High'] / features['Low']
    
    if 'close_open_ratio' in feature_list:
        features['close_open_ratio'] = features['Close'] / features['Open']
    
    # Volume-based features
    if any('volume_change' in f for f in feature_list):
        features['volume_change'] = features['Volume'].diff()
        features['volume_change_pct'] = features['Volume'].pct_change()
    
    # Technical indicators
    if any('sma' in f for f in feature_list):
        features['sma_short'] = calculate_sma(features['Close'], window=20)
        features['sma_long'] = calculate_sma(features['Close'], window=50)
    
    if any('ema' in f for f in feature_list):
        features['ema_short'] = calculate_ema(features['Close'], window=12)
        features['ema_long'] = calculate_ema(features['Close'], window=26)
    
    if 'rsi' in feature_list:
        features['rsi'] = calculate_rsi(features['Close'], window=14)
    
    if any('macd' in f for f in feature_list):
        macd_data = calculate_macd(features['Close'])
        features['macd'] = macd_data['MACD']
        features['macd_signal'] = macd_data['Signal']
        features['macd_hist'] = macd_data['Histogram']
    
    if any('bb' in f for f in feature_list):
        bb_data = calculate_bollinger_bands(features['Close'])
        features['bb_upper'] = bb_data['Upper']
        features['bb_middle'] = bb_data['Middle']
        features['bb_lower'] = bb_data['Lower']
    
    # Remove rows with NaN values created by feature engineering
    features = features.dropna()
    
    logger.info(f"Built {len(feature_list)} features. Final dataset shape: {features.shape}")
    return features


def create_target_variable(
    data: pd.DataFrame,
    target_type: str = "next_day_close",
    prediction_horizon: int = 1
) -> pd.Series:
    """
    Create target variable for prediction
    
    Parameters:
    -----------
    data : pd.DataFrame
        DataFrame with features
    target_type : str
        Type of target: 'next_day_close', 'next_day_return', 'direction'
    prediction_horizon : int
        Number of days ahead to predict
    
    Returns:
    --------
    pd.Series
        Target variable series
    """
    logger.info(f"Creating target variable: {target_type} with horizon {prediction_horizon}")
    
    if target_type == "next_day_close":
        target = data['Close'].shift(-prediction_horizon)
    elif target_type == "next_day_return":
        target = data['Close'].pct_change(prediction_horizon).shift(-prediction_horizon)
    elif target_type == "direction":
        target = (data['Close'].shift(-prediction_horizon) > data['Close']).astype(int)
    else:
        raise ValueError(f"Unknown target_type: {target_type}")
    
    return target

