"""
Generate All Charts from Original Notebook

This script recreates all visualizations from the original 
food-delivery-route-efficiency-dataset.ipynb notebook.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from food_delivery_analysis import (
    DataLoader,
    DataPreprocessor,
    Visualizer,
    setup_logger
)
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Setup
logger = setup_logger()
logger.info("=" * 80)
logger.info("Generating All Charts from Original Notebook")
logger.info("=" * 80)

# Load and preprocess data
logger.info("\n[Step 1] Loading and preprocessing data...")
loader = DataLoader()
data_path = Path("data/raw/Food_Delivery_Route_Efficiency_Dataset.csv")
df = loader.load_csv(data_path)

# Preprocess (same as original notebook)
preprocessor = DataPreprocessor()
df = preprocessor.convert_datetime(df, "order_time")
df['hour'] = df['order_time'].dt.hour
df['weekday'] = df['order_time'].dt.day_name()
df["efficiency"] = df["distance_km"] / df["delivery_time_min"]

logger.info(f"Data shape: {df.shape}")

# Initialize visualizer
output_dir = Path("outputs/figures")
output_dir.mkdir(parents=True, exist_ok=True)
viz = Visualizer(df, output_dir=output_dir)

# Define columns
num_cols = ['distance_km', 'delivery_time_min', 'route_length_km']
cat_cols = ['traffic_level', 'delivery_mode', 'weather', 'restaurant_zone', 'customer_zone']

logger.info("\n[Step 2] Generating visualizations...")

# 1. Distribution plots for numeric columns (Cell 11)
logger.info("1. Generating distribution plots for numeric columns...")
for col in num_cols:
    plt.figure(figsize=(8, 5))
    sns.histplot(df[col], bins=30, kde=True)
    plt.title(f"Distribution of {col}")
    plt.tight_layout()
    plt.savefig(output_dir / f"01_distribution_{col}.png", dpi=300, bbox_inches='tight')
    plt.close()
    logger.info(f"   Saved: 01_distribution_{col}.png")

# 2. Boxplot for numeric columns (Cell 12)
logger.info("2. Generating boxplot for numeric columns...")
plt.figure(figsize=(10, 6))
sns.boxplot(data=df[num_cols])
plt.title("Boxplot for Numeric Columns")
plt.tight_layout()
plt.savefig(output_dir / "02_boxplot_numeric_columns.png", dpi=300, bbox_inches='tight')
plt.close()
logger.info("   Saved: 02_boxplot_numeric_columns.png")

# 3. Scatter plot: Distance vs Delivery Time (Cell 13)
logger.info("3. Generating scatter plot: Distance vs Delivery Time...")
plt.figure(figsize=(8, 6))
sns.scatterplot(data=df, x='distance_km', y='delivery_time_min', hue='traffic_level')
plt.title("Distance vs Delivery Time")
plt.tight_layout()
plt.savefig(output_dir / "03_scatter_distance_vs_delivery_time.png", dpi=300, bbox_inches='tight')
plt.close()
logger.info("   Saved: 03_scatter_distance_vs_delivery_time.png")

# 4. Scatter plot: Route Length vs Delivery Time (Cell 14)
logger.info("4. Generating scatter plot: Route Length vs Delivery Time...")
plt.figure(figsize=(8, 6))
sns.scatterplot(data=df, x='route_length_km', y='delivery_time_min', hue='weather')
plt.title("Route Length vs Delivery Time")
plt.tight_layout()
plt.savefig(output_dir / "04_scatter_route_length_vs_delivery_time.png", dpi=300, bbox_inches='tight')
plt.close()
logger.info("   Saved: 04_scatter_route_length_vs_delivery_time.png")

# 5. Correlation heatmap (Cell 15)
logger.info("5. Generating correlation heatmap...")
plt.figure(figsize=(6, 4))
sns.heatmap(df[num_cols].corr(), annot=True, cmap="coolwarm")
plt.title("Correlation Matrix")
plt.tight_layout()
plt.savefig(output_dir / "05_correlation_heatmap.png", dpi=300, bbox_inches='tight')
plt.close()
logger.info("   Saved: 05_correlation_heatmap.png")

# 6. Count plots for categorical columns (Cell 16)
logger.info("6. Generating count plots for categorical columns...")
for col in cat_cols:
    plt.figure(figsize=(7, 4))
    sns.countplot(data=df, x=col)
    plt.title(f"Count of {col}")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(output_dir / f"06_countplot_{col}.png", dpi=300, bbox_inches='tight')
    plt.close()
    logger.info(f"   Saved: 06_countplot_{col}.png")

# 7. Pie chart: Average Delivery Time by Delivery Mode (Cell 17)
logger.info("7. Generating pie chart: Average Delivery Time by Delivery Mode...")
mode_speed = df.groupby("delivery_mode")["delivery_time_min"].mean().sort_values()
fastest_mode = mode_speed.index[0]
fastest_time = round(mode_speed.iloc[0], 2)
logger.info(f"   Fastest delivery mode: {fastest_mode} with an average time of: {fastest_time} minutes")

plt.figure(figsize=(7, 7))
plt.pie(mode_speed, labels=mode_speed.index, autopct="%1.1f%%", startangle=90)
plt.title("Average Delivery Time by Delivery Mode (Lower Means Faster)")
plt.tight_layout()
plt.savefig(output_dir / "07_pie_avg_delivery_time_by_mode.png", dpi=300, bbox_inches='tight')
plt.close()
logger.info("   Saved: 07_pie_avg_delivery_time_by_mode.png")

# 8. Boxplot: Efficiency by Delivery Mode (Cell 18)
logger.info("8. Generating boxplot: Efficiency by Delivery Mode...")
plt.figure(figsize=(8, 5))
sns.boxplot(data=df, x="delivery_mode", y="efficiency", palette="viridis")
plt.title("Delivery Efficiency Score by Delivery Mode")
plt.tight_layout()
plt.savefig(output_dir / "08_boxplot_efficiency_by_delivery_mode.png", dpi=300, bbox_inches='tight')
plt.close()
logger.info("   Saved: 08_boxplot_efficiency_by_delivery_mode.png")

# 9. Boxplots: Delivery Time vs each categorical column (Cell 19)
logger.info("9. Generating boxplots: Delivery Time vs categorical columns...")
for col in cat_cols:
    plt.figure(figsize=(8, 5))
    sns.boxplot(data=df, x=col, y='delivery_time_min')
    plt.title(f"Delivery Time vs {col}")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(output_dir / f"09_boxplot_delivery_time_vs_{col}.png", dpi=300, bbox_inches='tight')
    plt.close()
    logger.info(f"   Saved: 09_boxplot_delivery_time_vs_{col}.png")

# 10. Count plot: Orders Per Hour (Cell 20)
logger.info("10. Generating count plot: Orders Per Hour...")
plt.figure(figsize=(10, 5))
sns.countplot(data=df, x='hour')
plt.title("Orders Per Hour")
plt.tight_layout()
plt.savefig(output_dir / "10_countplot_orders_per_hour.png", dpi=300, bbox_inches='tight')
plt.close()
logger.info("   Saved: 10_countplot_orders_per_hour.png")

# 11. Line plot: Avg Delivery Time by Hour (Cell 21)
logger.info("11. Generating line plot: Avg Delivery Time by Hour...")
df.groupby('hour')['delivery_time_min'].mean().plot(kind='line', figsize=(10, 5))
plt.title("Avg Delivery Time by Hour")
plt.ylabel("Avg Delivery Time")
plt.xlabel("Hour")
plt.tight_layout()
plt.savefig(output_dir / "11_line_avg_delivery_time_by_hour.png", dpi=300, bbox_inches='tight')
plt.close()
logger.info("   Saved: 11_line_avg_delivery_time_by_hour.png")

# 12. Bar plot: Avg Delivery Time by Weekday (Cell 22)
logger.info("12. Generating bar plot: Avg Delivery Time by Weekday...")
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
logger.info("   Saved: 12_bar_avg_delivery_time_by_weekday.png")

# 13. Heatmap: Order Flow (Restaurant Zone -> Customer Zone) (Cell 23)
logger.info("13. Generating heatmap: Order Flow (Restaurant Zone -> Customer Zone)...")
pivot = df.pivot_table(index='restaurant_zone', columns='customer_zone', values='order_id', aggfunc='count')
plt.figure(figsize=(8, 6))
sns.heatmap(pivot, annot=True, cmap="Greens", fmt='.0f')
plt.title("Order Flow: Restaurant Zone → Customer Zone")
plt.tight_layout()
plt.savefig(output_dir / "13_heatmap_order_flow_zones.png", dpi=300, bbox_inches='tight')
plt.close()
logger.info("   Saved: 13_heatmap_order_flow_zones.png")

# 14. Pairplot (Cell 24)
logger.info("14. Generating pairplot...")
pairplot_cols = ['distance_km', 'delivery_time_min', 'route_length_km', 'traffic_level']
pairplot_df = df[pairplot_cols].copy()
# Handle any infinite values
pairplot_df = pairplot_df.replace([np.inf, -np.inf], np.nan).dropna()

plt.figure(figsize=(12, 10))
sns.pairplot(pairplot_df, hue='traffic_level')
plt.suptitle("Pairplot: Distance, Delivery Time, Route Length by Traffic Level", y=1.02)
plt.tight_layout()
plt.savefig(output_dir / "14_pairplot_numeric_by_traffic.png", dpi=300, bbox_inches='tight')
plt.close()
logger.info("   Saved: 14_pairplot_numeric_by_traffic.png")

# 15. Heatmap: Order Density (Weekday vs Hour) (Cell 26)
logger.info("15. Generating heatmap: Order Density (Weekday vs Hour)...")
# Ensure hour and weekday are set
df["hour"] = df["order_time"].dt.hour
df["weekday"] = df["order_time"].dt.day_name()

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
logger.info("   Saved: 15_heatmap_order_density_weekday_hour.png")

logger.info("\n" + "=" * 80)
logger.info("All charts generated successfully!")
logger.info(f"Total charts saved: {len(list(output_dir.glob('*.png')))}")
logger.info(f"Output directory: {output_dir}")
logger.info("=" * 80)

