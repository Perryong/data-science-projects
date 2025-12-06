"""
Main Pipeline Script

Complete ML pipeline for food delivery route efficiency analysis.
This script demonstrates the end-to-end workflow.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from food_delivery_analysis import (
    DataLoader,
    DataPreprocessor,
    ExploratoryAnalysis,
    Visualizer,
    ModelTrainer,
    ModelPredictor,
    ConfigLoader,
    setup_logger
)
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns


def main():
    """Main pipeline function."""
    # Setup
    logger = setup_logger(log_file="outputs/reports/pipeline.log")
    config = ConfigLoader("configs/config.yaml")
    
    logger.info("=" * 80)
    logger.info("Food Delivery Route Efficiency Analysis Pipeline")
    logger.info("=" * 80)
    
    # Step 1: Load Data
    logger.info("\n[Step 1] Loading data...")
    loader = DataLoader()
    data_path = Path(config.get("data.input_file", "data/raw/Food_Delivery_Route_Efficiency_Dataset.csv"))
    
    if not data_path.is_absolute():
        data_path = Path(__file__).parent / data_path
    
    df = loader.load_csv(data_path)
    logger.info(f"Loaded {len(df)} records with {len(df.columns)} columns")
    
    # Step 2: Preprocessing
    logger.info("\n[Step 2] Preprocessing data...")
    preprocessor = DataPreprocessor()
    
    # Convert datetime
    datetime_col = config.get("preprocessing.datetime_column", "order_time")
    df = preprocessor.convert_datetime(df, datetime_col)
    df = preprocessor.extract_datetime_features(df, datetime_col)
    
    # Create efficiency feature
    df = preprocessor.create_efficiency_feature(df)
    
    # Handle missing values
    missing_strategy = config.get("preprocessing.missing_value_strategy", "mean")
    df = preprocessor.handle_missing_values(df, strategy=missing_strategy)
    
    # Remove outliers if configured
    if config.get("preprocessing.outlier_removal", False):
        numeric_cols = config.get("preprocessing.numeric_columns", [])
        outlier_method = config.get("preprocessing.outlier_method", "iqr")
        outlier_factor = config.get("preprocessing.outlier_factor", 1.5)
        df = preprocessor.remove_outliers(df, numeric_cols, method=outlier_method, factor=outlier_factor)
    
    logger.info(f"Preprocessed data shape: {df.shape}")
    
    # Step 3: Exploratory Data Analysis
    logger.info("\n[Step 3] Performing exploratory data analysis...")
    eda = ExploratoryAnalysis(df)
    
    # Get correlation with target
    target_col = config.get("preprocessing.target_column", "delivery_time_min")
    importance = eda.get_feature_importance_correlation(target_col)
    logger.info("Top 5 features correlated with delivery time:")
    for feature, corr in importance.head(5).items():
        logger.info(f"  {feature}: {corr:.3f}")
    
    # Step 4: Visualization - Generate All Charts
    logger.info("\n[Step 4] Generating all visualizations...")
    output_dir = Path(config.get("outputs.figures_dir", "outputs/figures"))
    output_dir.mkdir(parents=True, exist_ok=True)
    viz = Visualizer(df, output_dir=output_dir)
    
    # Ensure datetime features are available
    if 'hour' not in df.columns:
        df['hour'] = df[datetime_col].dt.hour
    if 'weekday' not in df.columns:
        df['weekday'] = df[datetime_col].dt.day_name()
    
    # Define columns
    num_cols = ['distance_km', 'delivery_time_min', 'route_length_km']
    cat_cols = ['traffic_level', 'delivery_mode', 'weather', 'restaurant_zone', 'customer_zone']
    
    # 1. Distribution plots for numeric columns
    logger.info("  1. Generating distribution plots for numeric columns...")
    for col in num_cols:
        if col in df.columns:
            plt.figure(figsize=(8, 5))
            sns.histplot(df[col], bins=30, kde=True)
            plt.title(f"Distribution of {col}")
            plt.tight_layout()
            plt.savefig(output_dir / f"01_distribution_{col}.png", dpi=300, bbox_inches='tight')
            plt.close()
            logger.info(f"     Saved: 01_distribution_{col}.png")
    
    # 2. Boxplot for numeric columns
    logger.info("  2. Generating boxplot for numeric columns...")
    plt.figure(figsize=(10, 6))
    sns.boxplot(data=df[num_cols])
    plt.title("Boxplot for Numeric Columns")
    plt.tight_layout()
    plt.savefig(output_dir / "02_boxplot_numeric_columns.png", dpi=300, bbox_inches='tight')
    plt.close()
    logger.info("     Saved: 02_boxplot_numeric_columns.png")
    
    # 3. Scatter plot: Distance vs Delivery Time
    logger.info("  3. Generating scatter plot: Distance vs Delivery Time...")
    plt.figure(figsize=(8, 6))
    sns.scatterplot(data=df, x='distance_km', y='delivery_time_min', hue='traffic_level')
    plt.title("Distance vs Delivery Time")
    plt.tight_layout()
    plt.savefig(output_dir / "03_scatter_distance_vs_delivery_time.png", dpi=300, bbox_inches='tight')
    plt.close()
    logger.info("     Saved: 03_scatter_distance_vs_delivery_time.png")
    
    # 4. Scatter plot: Route Length vs Delivery Time
    logger.info("  4. Generating scatter plot: Route Length vs Delivery Time...")
    plt.figure(figsize=(8, 6))
    sns.scatterplot(data=df, x='route_length_km', y='delivery_time_min', hue='weather')
    plt.title("Route Length vs Delivery Time")
    plt.tight_layout()
    plt.savefig(output_dir / "04_scatter_route_length_vs_delivery_time.png", dpi=300, bbox_inches='tight')
    plt.close()
    logger.info("     Saved: 04_scatter_route_length_vs_delivery_time.png")
    
    # 5. Correlation heatmap
    logger.info("  5. Generating correlation heatmap...")
    plt.figure(figsize=(6, 4))
    sns.heatmap(df[num_cols].corr(), annot=True, cmap="coolwarm")
    plt.title("Correlation Matrix")
    plt.tight_layout()
    plt.savefig(output_dir / "05_correlation_heatmap.png", dpi=300, bbox_inches='tight')
    plt.close()
    logger.info("     Saved: 05_correlation_heatmap.png")
    
    # 6. Count plots for categorical columns
    logger.info("  6. Generating count plots for categorical columns...")
    for col in cat_cols:
        if col in df.columns:
            plt.figure(figsize=(7, 4))
            sns.countplot(data=df, x=col)
            plt.title(f"Count of {col}")
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig(output_dir / f"06_countplot_{col}.png", dpi=300, bbox_inches='tight')
            plt.close()
            logger.info(f"     Saved: 06_countplot_{col}.png")
    
    # 7. Pie chart: Average Delivery Time by Delivery Mode
    logger.info("  7. Generating pie chart: Average Delivery Time by Delivery Mode...")
    if 'delivery_mode' in df.columns:
        mode_speed = df.groupby("delivery_mode")["delivery_time_min"].mean().sort_values()
        fastest_mode = mode_speed.index[0]
        fastest_time = round(mode_speed.iloc[0], 2)
        logger.info(f"     Fastest delivery mode: {fastest_mode} with an average time of: {fastest_time} minutes")
        
        plt.figure(figsize=(7, 7))
        plt.pie(mode_speed, labels=mode_speed.index, autopct="%1.1f%%", startangle=90)
        plt.title("Average Delivery Time by Delivery Mode (Lower Means Faster)")
        plt.tight_layout()
        plt.savefig(output_dir / "07_pie_avg_delivery_time_by_mode.png", dpi=300, bbox_inches='tight')
        plt.close()
        logger.info("     Saved: 07_pie_avg_delivery_time_by_mode.png")
    
    # 8. Boxplot: Efficiency by Delivery Mode
    logger.info("  8. Generating boxplot: Efficiency by Delivery Mode...")
    if 'efficiency' in df.columns and 'delivery_mode' in df.columns:
        plt.figure(figsize=(8, 5))
        sns.boxplot(data=df, x="delivery_mode", y="efficiency", palette="viridis")
        plt.title("Delivery Efficiency Score by Delivery Mode")
        plt.tight_layout()
        plt.savefig(output_dir / "08_boxplot_efficiency_by_delivery_mode.png", dpi=300, bbox_inches='tight')
        plt.close()
        logger.info("     Saved: 08_boxplot_efficiency_by_delivery_mode.png")
    
    # 9. Boxplots: Delivery Time vs each categorical column
    logger.info("  9. Generating boxplots: Delivery Time vs categorical columns...")
    for col in cat_cols:
        if col in df.columns:
            plt.figure(figsize=(8, 5))
            sns.boxplot(data=df, x=col, y='delivery_time_min')
            plt.title(f"Delivery Time vs {col}")
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig(output_dir / f"09_boxplot_delivery_time_vs_{col}.png", dpi=300, bbox_inches='tight')
            plt.close()
            logger.info(f"     Saved: 09_boxplot_delivery_time_vs_{col}.png")
    
    # 10. Count plot: Orders Per Hour
    logger.info("  10. Generating count plot: Orders Per Hour...")
    if 'hour' in df.columns:
        plt.figure(figsize=(10, 5))
        sns.countplot(data=df, x='hour')
        plt.title("Orders Per Hour")
        plt.tight_layout()
        plt.savefig(output_dir / "10_countplot_orders_per_hour.png", dpi=300, bbox_inches='tight')
        plt.close()
        logger.info("     Saved: 10_countplot_orders_per_hour.png")
    
    # 11. Line plot: Avg Delivery Time by Hour
    logger.info("  11. Generating line plot: Avg Delivery Time by Hour...")
    if 'hour' in df.columns:
        df.groupby('hour')['delivery_time_min'].mean().plot(kind='line', figsize=(10, 5))
        plt.title("Avg Delivery Time by Hour")
        plt.ylabel("Avg Delivery Time")
        plt.xlabel("Hour")
        plt.tight_layout()
        plt.savefig(output_dir / "11_line_avg_delivery_time_by_hour.png", dpi=300, bbox_inches='tight')
        plt.close()
        logger.info("     Saved: 11_line_avg_delivery_time_by_hour.png")
    
    # 12. Bar plot: Avg Delivery Time by Weekday
    logger.info("  12. Generating bar plot: Avg Delivery Time by Weekday...")
    if 'weekday' in df.columns:
        weekday_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekday_avg = df.groupby('weekday')['delivery_time_min'].mean().reindex(weekday_order)
        weekday_avg.plot(kind='bar', figsize=(10, 5))
        plt.title("Avg Delivery Time by Weekday")
        plt.xlabel("Weekday")
        plt.ylabel("Avg Delivery Time")
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(output_dir / "12_bar_avg_delivery_time_by_weekday.png", dpi=300, bbox_inches='tight')
        plt.close()
        logger.info("     Saved: 12_bar_avg_delivery_time_by_weekday.png")
    
    # 13. Heatmap: Order Flow (Restaurant Zone -> Customer Zone)
    logger.info("  13. Generating heatmap: Order Flow (Restaurant Zone -> Customer Zone)...")
    if 'restaurant_zone' in df.columns and 'customer_zone' in df.columns:
        pivot = df.pivot_table(index='restaurant_zone', columns='customer_zone', values='order_id', aggfunc='count')
        plt.figure(figsize=(8, 6))
        sns.heatmap(pivot, annot=True, cmap="Greens", fmt='.0f')
        plt.title("Order Flow: Restaurant Zone → Customer Zone")
        plt.tight_layout()
        plt.savefig(output_dir / "13_heatmap_order_flow_zones.png", dpi=300, bbox_inches='tight')
        plt.close()
        logger.info("     Saved: 13_heatmap_order_flow_zones.png")
    
    # 14. Pairplot
    logger.info("  14. Generating pairplot...")
    pairplot_cols = ['distance_km', 'delivery_time_min', 'route_length_km', 'traffic_level']
    pairplot_df = df[pairplot_cols].copy()
    # Handle any infinite values
    pairplot_df = pairplot_df.replace([np.inf, -np.inf], np.nan).dropna()
    
    if len(pairplot_df) > 0:
        plt.figure(figsize=(12, 10))
        sns.pairplot(pairplot_df, hue='traffic_level')
        plt.suptitle("Pairplot: Distance, Delivery Time, Route Length by Traffic Level", y=1.02)
        plt.tight_layout()
        plt.savefig(output_dir / "14_pairplot_numeric_by_traffic.png", dpi=300, bbox_inches='tight')
        plt.close()
        logger.info("     Saved: 14_pairplot_numeric_by_traffic.png")
    
    # 15. Heatmap: Order Density (Weekday vs Hour)
    logger.info("  15. Generating heatmap: Order Density (Weekday vs Hour)...")
    if 'weekday' in df.columns and 'hour' in df.columns:
        pivot = df.pivot_table(index="weekday", columns="hour", values="order_id", aggfunc="count")
        # Reorder weekdays
        weekday_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        pivot = pivot.reindex(weekday_order)
        
        plt.figure(figsize=(14, 6))
        sns.heatmap(pivot, cmap="magma", linewidths=.5, fmt='.0f')
        plt.title("Order Density: Weekday vs Hour")
        plt.tight_layout()
        plt.savefig(output_dir / "15_heatmap_order_density_weekday_hour.png", dpi=300, bbox_inches='tight')
        plt.close()
        logger.info("     Saved: 15_heatmap_order_density_weekday_hour.png")
    
    logger.info(f"\nAll visualizations saved to {output_dir}/")
    logger.info(f"Total charts generated: {len(list(output_dir.glob('*.png')))}")
    
    # Step 5: Prepare Features for Modeling
    logger.info("\n[Step 5] Preparing features for modeling...")
    feature_columns = config.get("preprocessing.feature_columns", [])
    categorical_cols = config.get("preprocessing.categorical_columns", [])
    scale_features = config.get("preprocessing.scale_features", False)
    
    X, y = preprocessor.prepare_features(
        df,
        feature_columns=feature_columns,
        target_column=target_col,
        encode_categorical_cols=categorical_cols if config.get("preprocessing.encode_categorical", True) else None,
        scale_features=scale_features
    )
    
    logger.info(f"Features: {X.shape[1]}, Samples: {X.shape[0]}")
    
    # Step 6: Split Data
    logger.info("\n[Step 6] Splitting data...")
    test_size = config.get("modeling.test_size", 0.2)
    random_state = config.get("modeling.random_state", 42)
    
    X_train, X_test, y_train, y_test = preprocessor.train_test_split_data(
        X, y, test_size=test_size, random_state=random_state
    )
    
    # Step 7: Train Models
    logger.info("\n[Step 7] Training models...")
    models_dir = Path(config.get("outputs.models_dir", "data/models"))
    trainer = ModelTrainer(models_dir=models_dir)
    
    # Get models to train
    model_names = config.get("modeling.models", ["random_forest", "gradient_boosting"])
    models = trainer.get_default_models()
    models_to_train = {name: models[name] for name in model_names if name in models}
    
    cv_folds = config.get("modeling.cv_folds", 5)
    scores = trainer.train_all_models(
        X_train, y_train, X_test, y_test,
        models=models_to_train,
        cv=cv_folds
    )
    
    # Step 8: Display Results
    logger.info("\n[Step 8] Model Performance Summary:")
    logger.info("-" * 80)
    results_df = pd.DataFrame(scores).T
    results_df = results_df.sort_values("rmse")
    
    for model_name, metrics in results_df.iterrows():
        logger.info(f"{model_name:20s} | RMSE: {metrics['rmse']:6.2f} | "
                   f"MAE: {metrics['mae']:6.2f} | R²: {metrics['r2']:6.3f}")
    
    logger.info("-" * 80)
    logger.info(f"\nBest Model: {trainer.best_model_name}")
    best_metrics = scores[trainer.best_model_name]
    logger.info(f"  RMSE: {best_metrics['rmse']:.2f} minutes")
    logger.info(f"  MAE: {best_metrics['mae']:.2f} minutes")
    logger.info(f"  R²: {best_metrics['r2']:.3f}")
    
    # Step 9: Save Best Model
    if config.get("modeling.save_models", True):
        logger.info("\n[Step 9] Saving best model...")
        trainer.save_model(
            trainer.best_model,
            "best_delivery_time_model",
            metadata={
                "rmse": best_metrics["rmse"],
                "mae": best_metrics["mae"],
                "r2": best_metrics["r2"],
                "feature_columns": list(X.columns),
                "target_column": target_col
            }
        )
        logger.info(f"Model saved to {models_dir}/best_delivery_time_model.pkl")
    
    # Step 10: Feature Importance
    if hasattr(trainer.best_model, 'feature_importances_'):
        logger.info("\n[Step 10] Feature Importance (Top 10):")
        importance = trainer.get_feature_importance(
            trainer.best_model,
            list(X.columns),
            top_n=10
        )
        for idx, row in importance.iterrows():
            logger.info(f"  {row['feature']:30s}: {row['importance']:.4f}")
    
    logger.info("\n" + "=" * 80)
    logger.info("Pipeline completed successfully!")
    logger.info("=" * 80)


if __name__ == "__main__":
    main()

