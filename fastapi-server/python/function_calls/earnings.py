import sys
import csv
import requests
import numpy as np
import pandas as pd
import yfinance as yf
import datetime

from config import settings


def get_earnings_history(symbol: str) -> pd.DataFrame:
    """
    Get actual, estimated earnings and surprise history for a given stock ticker symbol.

    If somehow api repsonse is not found, returns an empty dataframe.
    """
    
    earnings_df = pd.DataFrame()

    response = requests.request("GET", f'https://www.alphavantage.co/query?function=EARNINGS&symbol={symbol}&apikey={settings.ALPHA_VANTAGE_API_KEY}')
    if response.status_code != 200:
        return earnings_df

    earnings_df = pd.json_normalize(response.json())

    earnings_df = pd.DataFrame(earnings_df["quarterlyEarnings"][0])
    earnings_df = earnings_df[
            [
                "fiscalDateEnding",
                "reportedDate",
                "reportedEPS",
                "estimatedEPS",
                "surprise",
                "surprisePercentage"
            ]
        ]
    earnings_df = earnings_df.rename(
            columns={
                "fiscalDateEnding": "Fiscal Date Ending",
                "reportedEPS": "Reported EPS",
                "estimatedEPS": "Estimated EPS",
                "reportedDate": "Reported Date",
                "surprise": "Surprise",
                "surprisePercentage": "Surprise Percentage",
            }
        )
    return earnings_df
    

def get_latest_earning_estimate(symbol: str) -> float:
    """Gets latest actual and estimated earning estimate for a stock symbol."""
    df = yf.Ticker(symbol).earnings_dates
    return df["EPS Estimate"].loc[df["EPS Estimate"].first_valid_index()]


def get_upcoming_earnings(start_date: str, end_date: str, country: str, only_sp500: bool, api_key: str = settings.ALPHA_VANTAGE_API_KEY):
    """Returns stocks announcing there earnings in next 3 months."""
    CSV_URL = f'https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey={api_key}'
    with requests.Session() as s:
        download = s.get(CSV_URL)
        decoded_content = download.content.decode('utf-8')
        cr = list(csv.reader(decoded_content.splitlines(), delimiter=','))
        df = pd.DataFrame(columns=cr[0], data=cr[1:])
        sd = pd.to_datetime(start_date, format='%Y-%m-%d')
        ed = pd.to_datetime(end_date, format='%Y-%m-%d')
        df['reportDate'] = pd.to_datetime(df['reportDate'])
        df = df[df['currency']==country][df['reportDate'] > sd][df['reportDate'] < ed]
        if only_sp500:
            sp500 = pd.read_html("https://en.wikipedia.org/wiki/List_of_S%26P_500_companies")[0]
            sp500_tickers = [ticker for ticker in sp500["Symbol"]]
            df = df[df['symbol'].isin(sp500_tickers)]
        return df[['symbol', 'name', 'reportDate']]


if __name__ == "__main__":
    print(get_upcoming_earnings(start_date=datetime.datetime.now().strftime('%Y-%m-%d'), 
        end_date=(datetime.datetime.now() + datetime.timedelta(days=10)).strftime('%Y-%m-%d'), 
        country='USD', only_sp500=True))

