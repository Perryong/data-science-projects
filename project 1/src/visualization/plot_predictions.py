"""
Module for visualizing model predictions and performance
"""

import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional, Tuple
import logging
from sklearn.metrics import r2_score

logger = logging.getLogger(__name__)

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (14, 8)


def plot_predictions_vs_actual(
    y_test: np.ndarray,
    y_pred: np.ndarray,
    ticker: str,
    save_path: Optional[str] = None,
    show_plot: bool = True
) -> None:
    """
    Plot predicted vs actual values
    
    Parameters:
    -----------
    y_test : np.ndarray
        Actual target values
    y_pred : np.ndarray
        Predicted target values
    ticker : str
        Stock ticker symbol (for title)
    save_path : str, optional
        Path to save the figure
    show_plot : bool
        Whether to display the plot
    """
    # Ensure arrays are 1D
    y_test = np.asarray(y_test).flatten()
    y_pred = np.asarray(y_pred).flatten()
    
    if len(y_test) != len(y_pred):
        raise ValueError(f"y_test and y_pred must have the same length. Got {len(y_test)} and {len(y_pred)}")
    
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle(f'{ticker} - Model Predictions vs Actual', fontsize=16, fontweight='bold')
    
    # Plot 1: Time series comparison
    ax1 = axes[0, 0]
    indices = range(len(y_test))
    ax1.plot(indices, y_test, label='Actual', alpha=0.7, linewidth=2)
    ax1.plot(indices, y_pred, label='Predicted', alpha=0.7, linewidth=2)
    ax1.set_xlabel('Sample Index')
    ax1.set_ylabel('Price ($)')
    ax1.set_title('Time Series: Actual vs Predicted')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Plot 2: Scatter plot (Actual vs Predicted)
    ax2 = axes[0, 1]
    ax2.scatter(y_test, y_pred, alpha=0.5, s=50)
    
    # Perfect prediction line
    min_val = min(y_test.min(), y_pred.min())
    max_val = max(y_test.max(), y_pred.max())
    ax2.plot([min_val, max_val], [min_val, max_val], 'r--', linewidth=2, label='Perfect Prediction')
    
    ax2.set_xlabel('Actual Price ($)')
    ax2.set_ylabel('Predicted Price ($)')
    ax2.set_title('Actual vs Predicted (Scatter)')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # Calculate R² for display
    r2 = r2_score(y_test, y_pred)
    ax2.text(0.05, 0.95, f'R² = {r2:.4f}', transform=ax2.transAxes,
             fontsize=12, verticalalignment='top',
             bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    # Plot 3: Residuals
    ax3 = axes[1, 0]
    residuals = y_test - y_pred
    ax3.scatter(y_pred, residuals, alpha=0.5, s=50)
    ax3.axhline(y=0, color='r', linestyle='--', linewidth=2)
    ax3.set_xlabel('Predicted Price ($)')
    ax3.set_ylabel('Residuals (Actual - Predicted)')
    ax3.set_title('Residual Plot')
    ax3.grid(True, alpha=0.3)
    
    # Plot 4: Error distribution
    ax4 = axes[1, 1]
    ax4.hist(residuals, bins=30, edgecolor='black', alpha=0.7)
    ax4.axvline(x=0, color='r', linestyle='--', linewidth=2)
    ax4.set_xlabel('Residuals')
    ax4.set_ylabel('Frequency')
    ax4.set_title('Residual Distribution')
    ax4.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        logger.info(f"Saved prediction plot to {save_path}")
    
    if show_plot:
        plt.show()
    else:
        plt.close()


def plot_prediction_timeseries(
    dates: pd.DatetimeIndex,
    y_test: np.ndarray,
    y_pred: np.ndarray,
    ticker: str,
    save_path: Optional[str] = None,
    show_plot: bool = True
) -> None:
    """
    Plot predictions as a time series with dates
    
    Parameters:
    -----------
    dates : pd.DatetimeIndex
        Date index for the test set
    y_test : np.ndarray
        Actual target values
    y_pred : np.ndarray
        Predicted target values
    ticker : str
        Stock ticker symbol
    save_path : str, optional
        Path to save the figure
    show_plot : bool
        Whether to display the plot
    """
    # Ensure arrays are 1D
    y_test = np.asarray(y_test).flatten()
    y_pred = np.asarray(y_pred).flatten()
    
    if len(y_test) != len(y_pred):
        raise ValueError(f"y_test and y_pred must have the same length. Got {len(y_test)} and {len(y_pred)}")
    
    if len(dates) != len(y_test):
        raise ValueError(f"dates and y_test must have the same length. Got {len(dates)} and {len(y_test)}")
    
    plt.figure(figsize=(16, 8))
    
    plt.plot(dates, y_test, label='Actual', linewidth=2, alpha=0.8, color='blue')
    plt.plot(dates, y_pred, label='Predicted', linewidth=2, alpha=0.8, color='red')
    
    plt.fill_between(dates, y_test, y_pred, alpha=0.3, color='gray', label='Error')
    
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Price ($)', fontsize=12)
    plt.title(f'{ticker} - Stock Price Predictions Over Time', fontsize=14, fontweight='bold')
    plt.legend(fontsize=11)
    plt.grid(True, alpha=0.3)
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        logger.info(f"Saved time series plot to {save_path}")
    
    if show_plot:
        plt.show()
    else:
        plt.close()


def plot_feature_importance(
    model: any,
    feature_names: list,
    ticker: str,
    top_n: int = 15,
    save_path: Optional[str] = None,
    show_plot: bool = True
) -> None:
    """
    Plot feature importance for tree-based models
    
    Parameters:
    -----------
    model : any
        Trained model (must have feature_importances_ attribute)
    feature_names : list
        List of feature names
    ticker : str
        Stock ticker symbol
    top_n : int
        Number of top features to display
    save_path : str, optional
        Path to save the figure
    show_plot : bool
        Whether to display the plot
    """
    if not hasattr(model, 'feature_importances_'):
        logger.warning("Model does not have feature_importances_ attribute. Skipping feature importance plot.")
        return
    
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:top_n]
    
    plt.figure(figsize=(12, 8))
    
    plt.barh(range(top_n), importances[indices], align='center')
    plt.yticks(range(top_n), [feature_names[i] for i in indices])
    plt.xlabel('Feature Importance', fontsize=12)
    plt.ylabel('Features', fontsize=12)
    plt.title(f'{ticker} - Top {top_n} Feature Importances', fontsize=14, fontweight='bold')
    plt.gca().invert_yaxis()
    plt.grid(True, alpha=0.3, axis='x')
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        logger.info(f"Saved feature importance plot to {save_path}")
    
    if show_plot:
        plt.show()
    else:
        plt.close()


def plot_metrics_comparison(
    metrics: dict,
    ticker: str,
    save_path: Optional[str] = None,
    show_plot: bool = True
) -> None:
    """
    Create a bar chart of model metrics
    
    Parameters:
    -----------
    metrics : dict
        Dictionary of metric names and values
    ticker : str
        Stock ticker symbol
    save_path : str, optional
        Path to save the figure
    show_plot : bool
        Whether to display the plot
    """
    # Separate metrics for better visualization
    error_metrics = {k: v for k, v in metrics.items() if k in ['mse', 'rmse', 'mae']}
    score_metrics = {k: v for k, v in metrics.items() if k in ['r2']}
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    fig.suptitle(f'{ticker} - Model Performance Metrics', fontsize=14, fontweight='bold')
    
    # Error metrics
    ax1 = axes[0]
    if error_metrics:
        bars = ax1.bar(error_metrics.keys(), error_metrics.values(), color=['#e74c3c', '#3498db', '#2ecc71'])
        ax1.set_ylabel('Error Value', fontsize=11)
        ax1.set_title('Error Metrics (Lower is Better)', fontsize=12)
        ax1.grid(True, alpha=0.3, axis='y')
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax1.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.2f}',
                    ha='center', va='bottom', fontsize=10)
    
    # Score metrics
    ax2 = axes[1]
    if score_metrics:
        bars = ax2.bar(score_metrics.keys(), score_metrics.values(), color='#9b59b6')
        ax2.set_ylabel('Score Value', fontsize=11)
        ax2.set_title('Score Metrics (Higher is Better)', fontsize=12)
        ax2.set_ylim([0, 1])
        ax2.grid(True, alpha=0.3, axis='y')
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            ax2.text(bar.get_x() + bar.get_width()/2., height,
                    f'{height:.4f}',
                    ha='center', va='bottom', fontsize=10)
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        logger.info(f"Saved metrics plot to {save_path}")
    
    if show_plot:
        plt.show()
    else:
        plt.close()


def create_all_visualizations(
    model: any,
    X_test: np.ndarray,
    y_test: np.ndarray,
    y_pred: np.ndarray,
    feature_names: list,
    ticker: str,
    dates: Optional[pd.DatetimeIndex] = None,
    metrics: Optional[dict] = None,
    output_dir: str = "reports/figures",
    show_plots: bool = False
) -> None:
    """
    Create all visualization plots and save them
    
    Parameters:
    -----------
    model : any
        Trained model
    X_test : np.ndarray
        Test features
    y_test : np.ndarray
        Actual test targets
    y_pred : np.ndarray
        Predicted test targets
    feature_names : list
        List of feature names
    ticker : str
        Stock ticker symbol
    dates : pd.DatetimeIndex, optional
        Date index for time series plot
    metrics : dict, optional
        Dictionary of evaluation metrics
    output_dir : str
        Directory to save plots
    show_plots : bool
        Whether to display plots
    """
    # Create output directory
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Ensure arrays are 1D
    y_test = np.asarray(y_test).flatten()
    y_pred = np.asarray(y_pred).flatten()
    
    logger.info("Creating visualization plots...")
    
    # 1. Predictions vs Actual (comprehensive)
    plot_predictions_vs_actual(
        y_test, y_pred, ticker,
        save_path=f"{output_dir}/{ticker}_predictions.png",
        show_plot=show_plots
    )
    
    # 2. Time series plot (if dates provided)
    if dates is not None and len(dates) == len(y_test):
        plot_prediction_timeseries(
            dates, y_test, y_pred, ticker,
            save_path=f"{output_dir}/{ticker}_timeseries.png",
            show_plot=show_plots
        )
    
    # 3. Feature importance (if model supports it)
    plot_feature_importance(
        model, feature_names, ticker,
        save_path=f"{output_dir}/{ticker}_feature_importance.png",
        show_plot=show_plots
    )
    
    # 4. Metrics comparison
    if metrics:
        plot_metrics_comparison(
            metrics, ticker,
            save_path=f"{output_dir}/{ticker}_metrics.png",
            show_plot=show_plots
        )
    
    logger.info(f"All visualizations saved to {output_dir}")

