# Data Science Projects

A collection of comprehensive data science and machine learning projects covering various domains including financial prediction, logistics optimization, and reinforcement learning.

## 📚 Projects Overview

This repository contains three distinct data science projects, each demonstrating different aspects of machine learning and data analysis:

1. **[Stock Market Prediction](#project-1-stock-market-prediction)** - ML pipeline for stock price forecasting
2. **[Food Delivery Route Efficiency](#project-2-food-delivery-route-efficiency-analysis)** - Production-ready analysis and prediction system
3. **[Reinforcement Learning on Frozen Lake](#project-3-reinforcement-learning-on-frozen-lake)** - Q-Learning and Deep Q-Network implementations

---

## 🎯 Project 1: Stock Market Prediction

**Location:** [`project 1/`](project%201/)

A comprehensive machine learning project for stock market price prediction using historical data and technical indicators.

### Key Features

- **Automated Data Fetching**: Retrieves stock data from Yahoo Finance using `yfinance`
- **Technical Indicators**: Calculates SMA, EMA, RSI, MACD, Bollinger Bands, and more
- **Multiple Models**: Supports Random Forest, Gradient Boosting, and Linear Regression
- **End-to-End Pipeline**: Complete workflow from data collection to visualization
- **Auto-Update**: Automatically checks and updates cached data
- **Rate Limit Handling**: Graceful fallback to cached data when rate limits are encountered

### Technologies

- Python, pandas, numpy
- scikit-learn
- yfinance
- matplotlib, seaborn
- YAML configuration

### Quick Start

```bash
cd "project 1"
pip install -r requirements.txt
python run.py
```

### Project Structure

```
project 1/
├── data/          # Raw, interim, and processed data
├── notebooks/     # EDA and model testing notebooks
├── src/           # Source code modules
├── conf/          # Configuration files
├── models/        # Trained models
└── reports/       # Metrics and visualizations
```

**📖 [Full Documentation →](project%201/README.md)**

---

## 🚚 Project 2: Food Delivery Route Efficiency Analysis

**Location:** [`project 2/`](project%202/)

A production-ready Python package for analyzing food delivery route efficiency and predicting delivery times using machine learning.

### Key Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **Comprehensive EDA**: Automated exploratory data analysis with statistical insights
- **Rich Visualizations**: Multiple visualization types (distributions, correlations, time series, heatmaps)
- **ML Pipeline**: Complete machine learning pipeline with multiple algorithms
- **Production Ready**: Proper logging, configuration management, and error handling
- **Well Tested**: Unit tests for all major components

### Technologies

- Python, pandas, numpy
- scikit-learn
- matplotlib, seaborn, plotly
- pytest (testing)
- YAML configuration

### Quick Start

```bash
cd "project 2"
pip install -r requirements.txt
pip install -e .
python main.py
```

### Project Structure

```
project 2/
├── src/food_delivery_analysis/  # Main package
│   ├── data/                    # Data loading
│   ├── preprocessing/           # Data preprocessing
│   ├── eda/                     # Exploratory analysis
│   ├── visualization/           # Plotting utilities
│   ├── modeling/                # ML models
│   └── utils/                   # Utilities
├── notebooks/                   # Example notebooks
├── tests/                       # Unit tests
├── configs/                     # Configuration files
└── outputs/                     # Generated outputs
```

**📖 [Full Documentation →](project%202/README.md)**

---

## 🎮 Project 3: Reinforcement Learning on Frozen Lake

**Location:** [`project 3/`](project%203/)

Two reinforcement learning implementations for solving the Frozen Lake environment from OpenAI Gym using Q-Learning and Deep Q-Network (DQN) algorithms.

### Key Features

- **Q-Learning**: Tabular Q-learning with epsilon-greedy exploration
- **Deep Q-Network**: Neural network-based Q-learning with experience replay
- **Real-Time Visualization**: Animated visualization of agent navigation
- **Customizable Parameters**: Command-line arguments for hyperparameter tuning
- **Performance Metrics**: Tracks rewards, steps, and success rates

### Technologies

- Python, numpy
- OpenAI Gym
- Keras (for DQN)
- matplotlib

### Quick Start

```bash
cd "project 3"
pip install -r requirements.txt

# Q-Learning
python q-learning.py

# Deep Q-Network
python deep-q-network.py

# With visualization
python q-learning.py --render
python deep-q-network.py --render
```

### Algorithm Details

**Q-Learning:**
- Tabular Q-table approach
- Epsilon-greedy action selection
- Q-value updates using Bellman equation

**Deep Q-Network:**
- Neural network approximates Q-function
- Experience replay mechanism
- Target Q-value calculation

**📖 [Full Documentation →](project%203/README.md)**

---

## 🛠️ General Setup

### Prerequisites

- Python 3.8 or higher
- pip or conda package manager

### Installation

Each project has its own `requirements.txt` file. Navigate to the project directory and install dependencies:

```bash
# For any project
cd "project X"
pip install -r requirements.txt
```

### Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## 📊 Project Comparison

| Feature | Project 1 | Project 2 | Project 3 |
|---------|-----------|-----------|-----------|
| **Domain** | Finance | Logistics | Reinforcement Learning |
| **ML Type** | Supervised Learning | Supervised Learning | Reinforcement Learning |
| **Models** | Random Forest, Gradient Boosting, Linear Regression | Multiple regression models | Q-Learning, DQN |
| **Data Source** | Yahoo Finance API | CSV dataset | OpenAI Gym environment |
| **Visualization** | ✅ | ✅ | ✅ |
| **Testing** | ❌ | ✅ (pytest) | ❌ |
| **Production Ready** | ⚠️ | ✅ | ⚠️ |
| **Configuration** | YAML | YAML | Command-line args |

---

## 📁 Repository Structure

```
data-science-projects/
├── README.md                 # This file
├── project 1/               # Stock Market Prediction
│   ├── README.md
│   ├── requirements.txt
│   ├── data/
│   ├── notebooks/
│   ├── src/
│   └── ...
├── project 2/               # Food Delivery Analysis
│   ├── README.md
│   ├── requirements.txt
│   ├── src/
│   ├── notebooks/
│   ├── tests/
│   └── ...
└── project 3/               # Reinforcement Learning
    ├── README.md
    ├── requirements.txt
    ├── q-learning.py
    └── deep-q-network.py
```

---

## 🎓 Learning Outcomes

These projects demonstrate:

- **End-to-End ML Pipelines**: From data collection to model deployment
- **Best Practices**: Code organization, testing, documentation
- **Multiple ML Paradigms**: Supervised learning, reinforcement learning
- **Real-World Applications**: Finance, logistics, game AI
- **Production Considerations**: Logging, configuration, error handling

---

## 📝 Notes

- Each project is self-contained with its own dependencies
- Projects can be run independently
- All projects include detailed documentation in their respective README files
- Code follows best practices for maintainability and extensibility

---

## 🤝 Contributing

Contributions are welcome! Please feel free to:
- Report bugs
- Suggest improvements
- Submit pull requests

---

## 📄 License

[Specify your license here]

---

## 🙏 Acknowledgments

- **Project 1**: Data provided by Yahoo Finance via `yfinance`
- **Project 2**: Food delivery dataset analysis
- **Project 3**: OpenAI Gym for the Frozen Lake environment

---

## 📧 Contact

For questions or issues, please open an issue on the repository.
