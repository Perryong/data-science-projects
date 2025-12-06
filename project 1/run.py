#!/usr/bin/env python
"""
Simple script to run the stock prediction pipeline.
Usage: python run.py
"""

import sys
from pathlib import Path

# Add src to path if running from project root
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from src.pipeline.main_pipeline import run_pipeline

if __name__ == "__main__":
    print("=" * 60)
    print("Stock Market Prediction Pipeline")
    print("=" * 60)
    print()
    
    try:
        run_pipeline()
        print()
        print("=" * 60)
        print("Pipeline completed successfully!")
        print("=" * 60)
    except Exception as e:
        print()
        print("=" * 60)
        print(f"Error: {str(e)}")
        print("=" * 60)
        sys.exit(1)

