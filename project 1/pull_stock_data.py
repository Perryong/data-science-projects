# coding: utf-8

"""
Stock Data Puller using Seeking Alpha API via RapidAPI
This script fetches historical stock prices from Seeking Alpha API
"""

import requests
import pandas as pd
import json
from datetime import datetime
import os

# API Configuration
RAPIDAPI_KEY = "301a4fb04emshc3a8951e1a63c4ep19ba19jsn20a9ad345bb7"
RAPIDAPI_HOST = "seeking-alpha.p.rapidapi.com"
BASE_URL = "https://seeking-alpha.p.rapidapi.com/symbols/get-historical-prices"


def fetch_stock_data(symbol, show_by="week", sort="as_of_date"):
    """
    Fetch historical stock prices from Seeking Alpha API
    
    Parameters:
    -----------
    symbol : str
        Stock ticker symbol (e.g., 'AAPL', 'MSFT')
    show_by : str
        Time period aggregation ('day', 'week', 'month', 'year')
    sort : str
        Sort order ('as_of_date' or 'as_of_date_desc')
    
    Returns:
    --------
    dict : JSON response from API
    """
    url = BASE_URL
    
    querystring = {
        "symbol": symbol.upper(),
        "show_by": show_by,
        "sort": sort
    }
    
    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST
    }
    
    try:
        print(f"Fetching data for {symbol.upper()}...")
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        data = response.json()
        print(f"Successfully fetched data for {symbol.upper()}")
        return data
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        return None


def convert_to_dataframe(data):
    """
    Convert API response to pandas DataFrame
    
    Parameters:
    -----------
    data : dict
        JSON response from API
    
    Returns:
    --------
    pd.DataFrame : Stock data in DataFrame format
    """
    if not data:
        return None
    
    try:
        # The structure may vary, so we'll try to extract the data
        # Check if data has a 'data' key or if it's directly a list
        if isinstance(data, dict):
            if 'data' in data:
                records = data['data']
            elif 'attributes' in data:
                records = data['attributes'].get('historicalPrices', [])
            else:
                # Try to find any list in the response
                records = None
                for key, value in data.items():
                    if isinstance(value, list) and len(value) > 0:
                        records = value
                        break
        elif isinstance(data, list):
            records = data
        else:
            print("Unexpected data format")
            return None
        
        if records is None or len(records) == 0:
            print("No data found in response")
            return None
        
        # Convert to DataFrame
        df = pd.DataFrame(records)
        
        # Try to convert date columns if they exist
        date_columns = ['date', 'as_of_date', 'timestamp', 'time']
        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
                df.set_index(col, inplace=True)
                break
        
        # Convert numeric columns
        numeric_columns = ['open', 'high', 'low', 'close', 'adj_close', 'volume', 'price']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        return df
    
    except Exception as e:
        print(f"Error converting to DataFrame: {e}")
        print(f"Data structure: {json.dumps(data, indent=2)[:500]}")  # Print first 500 chars
        return None


def save_data(data, symbol, format='both'):
    """
    Save data to file(s)
    
    Parameters:
    -----------
    data : dict or pd.DataFrame
        Data to save
    symbol : str
        Stock ticker symbol
    format : str
        'json', 'csv', or 'both'
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    symbol_upper = symbol.upper()
    
    if format in ['json', 'both']:
        json_filename = f"{symbol_upper}_data_{timestamp}.json"
        with open(json_filename, 'w') as f:
            json.dump(data if isinstance(data, dict) else data.to_dict(), f, indent=2, default=str)
        print(f"Data saved to {json_filename}")
    
    if format in ['csv', 'both'] and isinstance(data, pd.DataFrame):
        csv_filename = f"{symbol_upper}_data_{timestamp}.csv"
        data.to_csv(csv_filename)
        print(f"Data saved to {csv_filename}")
    elif format in ['csv', 'both']:
        print("Cannot save to CSV: data is not a DataFrame")


def main():
    """
    Main function to pull and analyze stock data
    """
    # Configuration
    symbol = "AAPL"  # Change this to any stock symbol
    show_by = "week"  # Options: 'day', 'week', 'month', 'year'
    sort = "as_of_date"  # Options: 'as_of_date', 'as_of_date_desc'
    
    # Fetch data
    raw_data = fetch_stock_data(symbol, show_by=show_by, sort=sort)
    
    if raw_data is None:
        print("Failed to fetch data. Exiting.")
        return
    
    # Print raw JSON for inspection
    print("\n" + "="*50)
    print("Raw API Response (first 1000 characters):")
    print("="*50)
    print(json.dumps(raw_data, indent=2)[:1000])
    print("="*50 + "\n")
    
    # Convert to DataFrame
    df = convert_to_dataframe(raw_data)
    
    if df is not None:
        print("\n" + "="*50)
        print("DataFrame Info:")
        print("="*50)
        print(f"Shape: {df.shape}")
        print(f"\nColumns: {list(df.columns)}")
        print(f"\nFirst few rows:")
        print(df.head())
        print(f"\nData types:")
        print(df.dtypes)
        print(f"\nBasic statistics:")
        print(df.describe())
        print("="*50 + "\n")
        
        # Save data
        save_data(raw_data, symbol, format='json')
        save_data(df, symbol, format='csv')
    else:
        # Save raw JSON even if DataFrame conversion fails
        save_data(raw_data, symbol, format='json')
        print("\nNote: Could not convert to DataFrame, but raw JSON has been saved.")


if __name__ == "__main__":
    main()

