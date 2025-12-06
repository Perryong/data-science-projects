"""
Visualization Module

Provides functions for creating various types of plots and visualizations.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from typing import List, Optional, Union
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (10, 6)


class Visualizer:
    """Handles data visualization operations."""
    
    def __init__(self, df: pd.DataFrame, output_dir: Optional[Union[str, Path]] = None):
        """
        Initialize Visualizer.
        
        Args:
            df: Input DataFrame
            output_dir: Directory to save plots. If None, plots are only displayed.
        """
        self.df = df.copy()
        self.output_dir = Path(output_dir) if output_dir else None
        
        if self.output_dir:
            self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def _save_plot(self, filename: str):
        """Save plot if output directory is specified."""
        if self.output_dir:
            filepath = self.output_dir / filename
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            logger.info(f"Saved plot to {filepath}")
    
    def plot_distribution(
        self,
        column: str,
        bins: int = 30,
        kde: bool = True,
        title: Optional[str] = None,
        save: bool = False
    ):
        """
        Plot distribution of a numeric column.
        
        Args:
            column: Column name
            bins: Number of bins
            kde: Whether to show KDE curve
            title: Plot title
            save: Whether to save the plot
        """
        plt.figure(figsize=(8, 5))
        sns.histplot(self.df[column], bins=bins, kde=kde)
        plt.title(title or f"Distribution of {column}")
        plt.xlabel(column)
        plt.ylabel("Frequency")
        
        if save:
            self._save_plot(f"distribution_{column}.png")
        else:
            plt.show()
        plt.close()
    
    def plot_boxplot(
        self,
        columns: Optional[List[str]] = None,
        by: Optional[str] = None,
        title: Optional[str] = None,
        save: bool = False
    ):
        """
        Plot boxplot(s).
        
        Args:
            columns: List of columns to plot. If None, plots all numeric columns.
            by: Optional categorical column for grouping
            title: Plot title
            save: Whether to save the plot
        """
        if columns is None:
            columns = self.df.select_dtypes(include=[np.number]).columns.tolist()
        
        plt.figure(figsize=(10, 6))
        
        if by:
            for col in columns:
                sns.boxplot(data=self.df, x=by, y=col)
                plt.title(title or f"Boxplot: {col} by {by}")
                plt.xticks(rotation=45)
                
                if save:
                    self._save_plot(f"boxplot_{col}_by_{by}.png")
                else:
                    plt.show()
                plt.close()
        else:
            sns.boxplot(data=self.df[columns])
            plt.title(title or "Boxplot for Numeric Columns")
            
            if save:
                self._save_plot("boxplot_numeric.png")
            else:
                plt.show()
            plt.close()
    
    def plot_scatter(
        self,
        x: str,
        y: str,
        hue: Optional[str] = None,
        title: Optional[str] = None,
        save: bool = False
    ):
        """
        Plot scatter plot.
        
        Args:
            x: X-axis column
            y: Y-axis column
            hue: Optional column for color coding
            title: Plot title
            save: Whether to save the plot
        """
        plt.figure(figsize=(8, 6))
        sns.scatterplot(data=self.df, x=x, y=y, hue=hue)
        plt.title(title or f"{x} vs {y}")
        plt.xlabel(x)
        plt.ylabel(y)
        
        if save:
            filename = f"scatter_{x}_vs_{y}.png"
            if hue:
                filename = f"scatter_{x}_vs_{y}_by_{hue}.png"
            self._save_plot(filename)
        else:
            plt.show()
        plt.close()
    
    def plot_correlation_heatmap(
        self,
        columns: Optional[List[str]] = None,
        title: Optional[str] = None,
        save: bool = False
    ):
        """
        Plot correlation heatmap.
        
        Args:
            columns: List of columns to include. If None, uses all numeric columns.
            title: Plot title
            save: Whether to save the plot
        """
        if columns is None:
            columns = self.df.select_dtypes(include=[np.number]).columns.tolist()
        
        corr_matrix = self.df[columns].corr()
        
        plt.figure(figsize=(10, 8))
        sns.heatmap(corr_matrix, annot=True, cmap="coolwarm", center=0, fmt='.2f')
        plt.title(title or "Correlation Matrix")
        
        if save:
            self._save_plot("correlation_heatmap.png")
        else:
            plt.show()
        plt.close()
    
    def plot_countplot(
        self,
        column: str,
        title: Optional[str] = None,
        save: bool = False
    ):
        """
        Plot count plot for categorical column.
        
        Args:
            column: Categorical column name
            title: Plot title
            save: Whether to save the plot
        """
        plt.figure(figsize=(7, 4))
        sns.countplot(data=self.df, x=column)
        plt.title(title or f"Count of {column}")
        plt.xticks(rotation=45)
        plt.xlabel(column)
        plt.ylabel("Count")
        
        if save:
            self._save_plot(f"countplot_{column}.png")
        else:
            plt.show()
        plt.close()
    
    def plot_time_series(
        self,
        datetime_col: str,
        value_col: str,
        agg_func: str = 'mean',
        title: Optional[str] = None,
        save: bool = False
    ):
        """
        Plot time series.
        
        Args:
            datetime_col: Datetime column name
            value_col: Value column name
            agg_func: Aggregation function ('mean', 'sum', 'count')
            title: Plot title
            save: Whether to save the plot
        """
        df_ts = self.df.copy()
        df_ts[datetime_col] = pd.to_datetime(df_ts[datetime_col])
        df_ts = df_ts.set_index(datetime_col)
        
        if agg_func == 'mean':
            ts_data = df_ts[value_col].resample('H').mean()
        elif agg_func == 'sum':
            ts_data = df_ts[value_col].resample('H').sum()
        elif agg_func == 'count':
            ts_data = df_ts[value_col].resample('H').count()
        else:
            raise ValueError(f"Unknown aggregation function: {agg_func}")
        
        plt.figure(figsize=(12, 5))
        ts_data.plot()
        plt.title(title or f"Time Series: {value_col} ({agg_func})")
        plt.xlabel(datetime_col)
        plt.ylabel(value_col)
        
        if save:
            self._save_plot(f"timeseries_{value_col}_{agg_func}.png")
        else:
            plt.show()
        plt.close()
    
    def plot_grouped_bar(
        self,
        category_col: str,
        value_col: str,
        agg_func: str = 'mean',
        title: Optional[str] = None,
        save: bool = False
    ):
        """
        Plot grouped bar chart.
        
        Args:
            category_col: Categorical column
            value_col: Value column
            agg_func: Aggregation function
            title: Plot title
            save: Whether to save the plot
        """
        if agg_func == 'mean':
            grouped = self.df.groupby(category_col)[value_col].mean()
        elif agg_func == 'sum':
            grouped = self.df.groupby(category_col)[value_col].sum()
        elif agg_func == 'count':
            grouped = self.df.groupby(category_col)[value_col].count()
        else:
            raise ValueError(f"Unknown aggregation function: {agg_func}")
        
        plt.figure(figsize=(10, 5))
        grouped.plot(kind='bar')
        plt.title(title or f"{value_col} by {category_col} ({agg_func})")
        plt.xlabel(category_col)
        plt.ylabel(value_col)
        plt.xticks(rotation=45)
        
        if save:
            self._save_plot(f"bar_{value_col}_by_{category_col}.png")
        else:
            plt.show()
        plt.close()
    
    def plot_pivot_heatmap(
        self,
        index: str,
        columns: str,
        values: str,
        aggfunc: str = 'count',
        title: Optional[str] = None,
        save: bool = False
    ):
        """
        Plot heatmap from pivot table.
        
        Args:
            index: Index column
            columns: Columns for pivot
            values: Values column
            aggfunc: Aggregation function
            title: Plot title
            save: Whether to save the plot
        """
        pivot = self.df.pivot_table(
            index=index,
            columns=columns,
            values=values,
            aggfunc=aggfunc
        )
        
        plt.figure(figsize=(10, 6))
        sns.heatmap(pivot, annot=True, cmap="Greens", fmt='.0f')
        plt.title(title or f"{values} by {index} and {columns}")
        
        if save:
            self._save_plot(f"heatmap_{index}_{columns}.png")
        else:
            plt.show()
        plt.close()
    
    def plot_pairplot(
        self,
        columns: List[str],
        hue: Optional[str] = None,
        save: bool = False
    ):
        """
        Plot pairplot.
        
        Args:
            columns: List of columns to include
            hue: Optional column for color coding
            save: Whether to save the plot
        """
        plt.figure(figsize=(12, 10))
        sns.pairplot(self.df[columns + ([hue] if hue else [])], hue=hue)
        
        if save:
            filename = f"pairplot_{'_'.join(columns)}.png"
            if hue:
                filename = f"pairplot_{'_'.join(columns)}_by_{hue}.png"
            self._save_plot(filename)
        else:
            plt.show()
        plt.close()

