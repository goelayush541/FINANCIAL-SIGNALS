-- Create database and schema for financial signals
CREATE DATABASE IF NOT EXISTS financial_signals;
USE DATABASE financial_signals;

CREATE SCHEMA IF NOT EXISTS analytics;
USE SCHEMA analytics;

-- Create table for market data
CREATE OR REPLACE TABLE market_data (
    symbol STRING,
    timestamp TIMESTAMP_NTZ,
    open NUMBER(20, 6),
    high NUMBER(20, 6),
    low NUMBER(20, 6),
    close NUMBER(20, 6),
    volume NUMBER(20, 2),
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Create table for news sentiment analysis
CREATE OR REPLACE TABLE news_sentiment (
    article_id STRING,
    symbol STRING,
    headline STRING,
    content STRING,
    source STRING,
    published_at TIMESTAMP_NTZ,
    sentiment_score NUMBER(10, 6),
    sentiment_label STRING,
    entities VARIANT,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Create table for trading signals
CREATE OR REPLACE TABLE trading_signals (
    signal_id STRING,
    symbol STRING,
    signal_type STRING,
    strength NUMBER(10, 6),
    source STRING,
    description STRING,
    confidence NUMBER(10, 6),
    triggers VARIANT,
    price_data VARIANT,
    timestamp TIMESTAMP_NTZ,
    expiration TIMESTAMP_NTZ,
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- Create view for signal analysis
CREATE OR REPLACE VIEW signal_analytics AS
SELECT 
    symbol,
    signal_type,
    AVG(strength) as avg_strength,
    AVG(confidence) as avg_confidence,
    COUNT(*) as signal_count,
    MAX(timestamp) as latest_signal
FROM trading_signals
WHERE timestamp >= DATEADD(day, -7, CURRENT_TIMESTAMP())
GROUP BY symbol, signal_type;

-- Create view for sentiment trends
CREATE OR REPLACE VIEW sentiment_trends AS
SELECT 
    symbol,
    DATE_TRUNC('day', published_at) as date,
    AVG(sentiment_score) as avg_sentiment,
    COUNT(*) as article_count
FROM news_sentiment
WHERE published_at >= DATEADD(day, -30, CURRENT_TIMESTAMP())
GROUP BY symbol, date
ORDER BY date DESC;