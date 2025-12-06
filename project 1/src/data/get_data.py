"""
Module for fetching and loading stock market data
"""

import pandas as pd
import yfinance as yf
from typing import Optional, Tuple
import logging
from pathlib import Path
import time

logger = logging.getLogger(__name__)


def fetch_stock_data(
    ticker: str,
    start_date: str,
    end_date: str,
    interval: str = "1d",
    use_cache: bool = True,
    cache_dir: str = "data/raw"
) -> pd.DataFrame:
    """
    Fetch historical stock data from Yahoo Finance
    
    Parameters:
    -----------
    ticker : str
        Stock ticker symbol (e.g., 'AAPL', 'MSFT')
    start_date : str
        Start date in 'YYYY-MM-DD' format
    end_date : str
        End date in 'YYYY-MM-DD' format
    interval : str
        Data interval (1d, 1wk, 1mo, etc.)
    use_cache : bool
        If True, check for existing cached data first and use it if rate limit is hit
    cache_dir : str
        Directory to check for cached data
    
    Returns:
    --------
    pd.DataFrame
        DataFrame with OHLCV data
    """
    cache_file = Path(cache_dir) / f"{ticker}_raw.csv"
    
    # Check for existing data first if use_cache is True
    if use_cache and cache_file.exists():
        logger.info(f"Found existing data file: {cache_file}")
        try:
            cached_data = pd.read_csv(cache_file, index_col=0, parse_dates=True)
            cached_end_date = cached_data.index.max()
            config_end_date = pd.to_datetime(end_date)
            
            logger.info(f"Cache date range: {cached_data.index.min()} to {cached_end_date}")
            logger.info(f"Config end_date: {config_end_date}")
            
            # Check if cached end_date matches config end_date
            if cached_end_date >= config_end_date:
                logger.info(f"Cached data is up to date (end_date: {cached_end_date} >= config: {config_end_date})")
                logger.info(f"Using cached data with {len(cached_data)} records")
                return cached_data
            else:
                logger.info(f"Cached data is outdated. Cache ends at {cached_end_date}, config requires {config_end_date}")
                logger.info("Fetching latest data to update cache...")
                # Continue to fetch new data below
        except Exception as e:
            logger.warning(f"Error loading cached data: {str(e)}. Will attempt to fetch new data.")
    
    # Attempt to fetch new data
    try:
        logger.info(f"Fetching data for {ticker} from {start_date} to {end_date}")
        stock = yf.Ticker(ticker)
        
        # Add small delay to avoid rate limiting
        time.sleep(0.5)
        
        data = stock.history(start=start_date, end=end_date, interval=interval)
        
        if data.empty:
            # If empty and we have cached data, use that instead
            if use_cache and cache_file.exists():
                logger.warning(f"No new data retrieved for {ticker}. Using cached data.")
                return load_data(str(cache_file))
            raise ValueError(f"No data retrieved for ticker {ticker}")
        
        logger.info(f"Successfully fetched {len(data)} records")
        return data
    
    except Exception as e:
        error_msg = str(e).lower()
        
        # Check if it's a rate limit error
        is_rate_limit = any(keyword in error_msg for keyword in [
            'rate limit', 'ratelimit', '429', 'too many requests',
            'forbidden', '403', 'temporarily unavailable'
        ])
        
        if is_rate_limit:
            logger.warning(f"Rate limit encountered: {str(e)}")
            
            # Try to use cached data if available
            if use_cache and cache_file.exists():
                logger.info(f"Using existing cached data from {cache_file} due to rate limit")
                try:
                    cached_data = pd.read_csv(cache_file, index_col=0, parse_dates=True)
                    logger.info(f"Proceeding with {len(cached_data)} records from cache")
                    return cached_data
                except Exception as cache_error:
                    logger.error(f"Error loading cached data: {str(cache_error)}")
                    raise Exception(f"Rate limit hit and failed to load cached data: {str(cache_error)}")
            else:
                logger.error("Rate limit hit and no cached data available")
                raise Exception(f"Rate limit encountered and no cached data found. Please try again later or use existing data file.")
        else:
            # For other errors, try cached data as fallback
            if use_cache and cache_file.exists():
                logger.warning(f"Error fetching data: {str(e)}. Attempting to use cached data.")
                try:
                    cached_data = pd.read_csv(cache_file, index_col=0, parse_dates=True)
                    logger.info(f"Using cached data with {len(cached_data)} records")
                    return cached_data
                except Exception as cache_error:
                    logger.error(f"Error loading cached data: {str(cache_error)}")
            
            logger.error(f"Error fetching data: {str(e)}")
            raise


def load_data(file_path: str) -> pd.DataFrame:
    """
    Load stock data from a CSV file
    
    Parameters:
    -----------
    file_path : str
        Path to the CSV file
    
    Returns:
    --------
    pd.DataFrame
        DataFrame with stock data
    """
    try:
        logger.info(f"Loading data from {file_path}")
        data = pd.read_csv(file_path, index_col=0, parse_dates=True)
        logger.info(f"Successfully loaded {len(data)} records")
        return data
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        raise

