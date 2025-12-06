"""
Data Preprocessing Module

Handles data cleaning, feature engineering, and transformation.
"""

import pandas as pd
import numpy as np
from typing import List, Optional, Dict, Any
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import logging

logger = logging.getLogger(__name__)


class DataPreprocessor:
    """Handles data preprocessing operations."""
    
    def __init__(self):
        """Initialize DataPreprocessor."""
        self.scaler = StandardScaler()
        self.label_encoders: Dict[str, LabelEncoder] = {}
        self.feature_columns: Optional[List[str]] = None
        self.target_column: Optional[str] = None
        
    def convert_datetime(
        self, 
        df: pd.DataFrame, 
        datetime_column: str,
        format: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Convert a column to datetime format.
        
        Args:
            df: Input DataFrame
            datetime_column: Name of the datetime column
            format: Optional datetime format string
            
        Returns:
            DataFrame with converted datetime column
        """
        df = df.copy()
        if format:
            df[datetime_column] = pd.to_datetime(df[datetime_column], format=format)
        else:
            df[datetime_column] = pd.to_datetime(df[datetime_column])
        
        logger.info(f"Converted {datetime_column} to datetime")
        return df
    
    def extract_datetime_features(
        self, 
        df: pd.DataFrame, 
        datetime_column: str
    ) -> pd.DataFrame:
        """
        Extract features from datetime column (hour, weekday, month, etc.).
        
        Args:
            df: Input DataFrame
            datetime_column: Name of the datetime column
            
        Returns:
            DataFrame with extracted datetime features
        """
        df = df.copy()
        
        if datetime_column not in df.columns:
            raise ValueError(f"Column {datetime_column} not found in DataFrame")
        
        if not pd.api.types.is_datetime64_any_dtype(df[datetime_column]):
            df = self.convert_datetime(df, datetime_column)
        
        df['hour'] = df[datetime_column].dt.hour
        df['weekday'] = df[datetime_column].dt.day_name()
        df['day_of_week'] = df[datetime_column].dt.dayofweek
        df['month'] = df[datetime_column].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        logger.info("Extracted datetime features: hour, weekday, day_of_week, month, is_weekend")
        return df
    
    def create_efficiency_feature(
        self, 
        df: pd.DataFrame, 
        distance_col: str = 'distance_km',
        time_col: str = 'delivery_time_min'
    ) -> pd.DataFrame:
        """
        Create efficiency feature (distance/time).
        
        Args:
            df: Input DataFrame
            distance_col: Name of distance column
            time_col: Name of time column
            
        Returns:
            DataFrame with efficiency feature
        """
        df = df.copy()
        df['efficiency'] = df[distance_col] / (df[time_col] + 1e-6)  # Add small epsilon to avoid division by zero
        logger.info("Created efficiency feature")
        return df
    
    def encode_categorical(
        self, 
        df: pd.DataFrame, 
        columns: List[str],
        method: str = 'label'
    ) -> pd.DataFrame:
        """
        Encode categorical columns.
        
        Args:
            df: Input DataFrame
            columns: List of categorical column names
            method: Encoding method ('label' or 'onehot')
            
        Returns:
            DataFrame with encoded categorical columns
        """
        df = df.copy()
        
        if method == 'label':
            for col in columns:
                if col in df.columns:
                    if col not in self.label_encoders:
                        self.label_encoders[col] = LabelEncoder()
                        df[col] = self.label_encoders[col].fit_transform(df[col].astype(str))
                    else:
                        df[col] = self.label_encoders[col].transform(df[col].astype(str))
                    logger.info(f"Label encoded {col}")
        
        elif method == 'onehot':
            df = pd.get_dummies(df, columns=columns, prefix=columns)
            logger.info(f"One-hot encoded {columns}")
        
        return df
    
    def handle_missing_values(
        self, 
        df: pd.DataFrame, 
        strategy: str = 'mean',
        columns: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Handle missing values in the dataset.
        
        Args:
            df: Input DataFrame
            strategy: Strategy for handling missing values ('mean', 'median', 'mode', 'drop')
            columns: Specific columns to handle. If None, handles all columns
            
        Returns:
            DataFrame with handled missing values
        """
        df = df.copy()
        
        if columns is None:
            columns = df.columns.tolist()
        
        for col in columns:
            if df[col].isnull().sum() > 0:
                if strategy == 'mean' and pd.api.types.is_numeric_dtype(df[col]):
                    df[col].fillna(df[col].mean(), inplace=True)
                elif strategy == 'median' and pd.api.types.is_numeric_dtype(df[col]):
                    df[col].fillna(df[col].median(), inplace=True)
                elif strategy == 'mode':
                    df[col].fillna(df[col].mode()[0], inplace=True)
                elif strategy == 'drop':
                    df.dropna(subset=[col], inplace=True)
                
                logger.info(f"Handled missing values in {col} using {strategy}")
        
        return df
    
    def remove_outliers(
        self, 
        df: pd.DataFrame, 
        columns: List[str],
        method: str = 'iqr',
        factor: float = 1.5
    ) -> pd.DataFrame:
        """
        Remove outliers from specified columns.
        
        Args:
            df: Input DataFrame
            columns: List of numeric columns to process
            method: Method for outlier detection ('iqr' or 'zscore')
            factor: Factor for IQR method (default 1.5)
            
        Returns:
            DataFrame with outliers removed
        """
        df = df.copy()
        initial_shape = df.shape[0]
        
        if method == 'iqr':
            for col in columns:
                if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                    Q1 = df[col].quantile(0.25)
                    Q3 = df[col].quantile(0.75)
                    IQR = Q3 - Q1
                    lower_bound = Q1 - factor * IQR
                    upper_bound = Q3 + factor * IQR
                    df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
                    logger.info(f"Removed outliers from {col} using IQR method")
        
        elif method == 'zscore':
            for col in columns:
                if col in df.columns and pd.api.types.is_numeric_dtype(df[col]):
                    z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
                    df = df[z_scores < factor]
                    logger.info(f"Removed outliers from {col} using Z-score method")
        
        removed = initial_shape - df.shape[0]
        logger.info(f"Removed {removed} outliers ({removed/initial_shape*100:.2f}%)")
        
        return df
    
    def scale_features(
        self, 
        X: pd.DataFrame,
        fit: bool = True
    ) -> pd.DataFrame:
        """
        Scale features using StandardScaler.
        
        Args:
            X: Feature DataFrame
            fit: Whether to fit the scaler (True for training, False for prediction)
            
        Returns:
            Scaled feature DataFrame
        """
        if fit:
            X_scaled = self.scaler.fit_transform(X)
            logger.info("Fitted and transformed features using StandardScaler")
        else:
            X_scaled = self.scaler.transform(X)
            logger.info("Transformed features using fitted StandardScaler")
        
        return pd.DataFrame(X_scaled, columns=X.columns, index=X.index)
    
    def prepare_features(
        self, 
        df: pd.DataFrame,
        feature_columns: List[str],
        target_column: str,
        encode_categorical_cols: Optional[List[str]] = None,
        scale_features: bool = False
    ) -> tuple:
        """
        Prepare features and target for modeling.
        
        Args:
            df: Input DataFrame
            feature_columns: List of feature column names
            target_column: Name of target column
            encode_categorical_cols: List of categorical columns to encode
            scale_features: Whether to scale features
            
        Returns:
            Tuple of (X, y) where X is features and y is target
        """
        df = df.copy()
        
        # Encode categorical columns if specified
        if encode_categorical_cols:
            df = self.encode_categorical(df, encode_categorical_cols)
            # Update feature columns if new one-hot encoded columns were created
            all_cols = df.columns.tolist()
            feature_columns = [col for col in all_cols if any(fc in col for fc in feature_columns)]
        
        # Select features and target
        X = df[feature_columns]
        y = df[target_column]
        
        # Scale features if requested
        if scale_features:
            X = self.scale_features(X, fit=True)
        
        self.feature_columns = feature_columns
        self.target_column = target_column
        
        logger.info(f"Prepared features: {len(feature_columns)} features, target: {target_column}")
        
        return X, y
    
    def train_test_split_data(
        self,
        X: pd.DataFrame,
        y: pd.Series,
        test_size: float = 0.2,
        random_state: int = 42
    ) -> tuple:
        """
        Split data into train and test sets.
        
        Args:
            X: Feature DataFrame
            y: Target Series
            test_size: Proportion of test set
            random_state: Random seed
            
        Returns:
            Tuple of (X_train, X_test, y_train, y_test)
        """
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        logger.info(f"Split data: Train {X_train.shape[0]} samples, Test {X_test.shape[0]} samples")
        
        return X_train, X_test, y_train, y_test

