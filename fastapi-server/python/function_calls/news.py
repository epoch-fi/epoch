import pandas as pd

from collections import defaultdict
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from pytrends.request import TrendReq
from typing import List, Dict, Optional, Any
from newsapi import NewsApiClient

from python.util import get_df
from python.util import request
from python.util import get_api_key


def get_current_gainer_stocks() -> pd.DataFrame:
    """Return gainers of the day from yahoo finance including all cap stocks."""
    df_gainers = get_df("https://finance.yahoo.com/screener/predefined/day_gainers")[0]
    df_gainers.dropna(how="all", axis=1, inplace=True)
    df_gainers = df_gainers.replace(float("NaN"), "")
    return df_gainers


def get_current_loser_stocks() -> pd.DataFrame:
    """Get data for today's losers from yahoo finance including all cap stocks."""
    df_losers = get_df("https://finance.yahoo.com/screener/predefined/day_losers")[0]
    df_losers.dropna(how="all", axis=1, inplace=True)
    df_losers = df_losers.replace(float("NaN"), "")
    return df_losers


def get_current_undervalued_growth_stocks() -> pd.DataFrame:
    """Get data for today's stocks with low PR ratio and growth rate better than 25%"""
    df = get_df(
        "https://finance.yahoo.com/screener/predefined/undervalued_growth_stocks"
    )[0]
    df.dropna(how="all", axis=1, inplace=True)
    df = df.replace(float("NaN"), "")
    return df


def get_current_technology_growth_stocks() -> pd.DataFrame:
    """Get data for today's stocks with low PR ratio and growth rate better than 25%"""
    df = get_df(
        "https://finance.yahoo.com/screener/predefined/growth_technology_stocks"
    )[0]
    df.dropna(how="all", axis=1, inplace=True)
    df = df.replace(float("NaN"), "")
    return df


def get_current_most_traded_stocks() -> pd.DataFrame:
    """Get data for today's stocks in descending order based on intraday trading volume."""
    df = get_df("https://finance.yahoo.com/screener/predefined/most_active")[0]
    df.dropna(how="all", axis=1, inplace=True)
    df = df.replace(float("NaN"), "")
    return df


def get_current_undervalued_large_cap_stocks() -> pd.DataFrame:
    """Get data for today's potentially undervalued large cap stocks from Yahoo finance."""
    df = get_df("https://finance.yahoo.com/screener/predefined/undervalued_large_caps")[
        0
    ]
    df.dropna(how="all", axis=1, inplace=True)
    df = df.replace(float("NaN"), "")
    return df


def get_current_aggressive_small_cap_stocks() -> pd.DataFrame:
    """Get data for today's aggressive / high growth small cap stocks from Yahoo finance."""
    df = get_df("https://finance.yahoo.com/screener/predefined/aggressive_small_caps")[
        0
    ]
    df.dropna(how="all", axis=1, inplace=True)
    df = df.replace(float("NaN"), "")
    return df


def get_current_hot_penny_stocks() -> pd.DataFrame:
    """Return data for today's hot penny stocks from pennystockflow.com"""
    df = get_df("https://www.pennystockflow.com", 0)[1]
    return df.drop([10])


@get_api_key()
def get_current_stock_price_info(
        api_key: Dict[str, str], stock_ticker: str
) -> Optional[Dict[str, Any]]:
    """
    Return current price information given a stock ticker symbol.
    """
    result = request(
        f"https://finnhub.io/api/v1/quote?symbol={stock_ticker}&token={api_key['FINNHUB']}"
    )
    if result.status_code != 200:
        return None
    return result.json()


@get_api_key()
def get_latest_news_for_stock(
        api_key: Dict[str, str], stock_id: str, limit: int = 10
) -> List[Dict[str, Any]]:
    """Returns latest news for a given stock_name by querying results via newsapi."""
    newsapi = NewsApiClient(api_key=api_key["NEWSAPI"])
    cat_to_id = defaultdict(list)
    for source in newsapi.get_sources()["sources"]:
        cat_to_id[source["category"]].append(source["id"])
    business_sources = [
        "bloomberg",
        "business-insider",
        "financial-post",
        "fortune",
        "info-money",
        "the-wall-street-journal",
    ]
    for source in business_sources:
        assert source in cat_to_id["business"]

    start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    end_date = datetime.now().strftime("%Y-%m-%d")
    articles = newsapi.get_everything(
        q=stock_id,
        sources=",".join(business_sources),
        from_param=start_date,
        to=end_date,
        language="en",
        sort_by="relevancy",
        page=1,
    )["articles"]
    return articles[:limit]


def get_top_trending_news(
        limit: int = 10, extract_content: bool = False
) -> List[Dict[str, Any]]:
    """Returns top Kk trending news from seekingalpha."""
    articles = []
    URL = "https://seekingalpha.com/news/trending_news"
    response = request(URL)
    if response.status_code == 200:
        for item in response.json():
            article_url = item["uri"]
            if not article_url.startswith("/news/"):
                continue

            article_id = article_url.split("/")[2].split("-")[0]

            content = ""
            if extract_content:
                article_url = f"https://seekingalpha.com/api/v3/news/{article_id}"
                article_response = request(article_url)
                jdata = article_response.json()
                try:
                    content = jdata["data"]["attributes"]["content"].replace(
                        "</li>", "</li>\n"
                    )
                    content = BeautifulSoup(content, features="html.parser").get_text()
                except Exception as e:
                    print(f"Unable to extract content for: {article_url}")

            articles.append(
                {
                    "title": item["title"],
                    "publishedAt": item["publish_on"][: item["publish_on"].rfind(".")],
                    "url": "https://seekingalpha.com" + article_url,
                    "id": article_id,
                    "content": content,
                }
            )

            if len(articles) > limit:
                break

    return articles[:limit]


def get_google_trending_searches(region: str = "") -> Optional[pd.DataFrame]:
    """Returns overall trending searches in US unless region is provided."""
    try:
        pytrend = TrendReq()
        return pytrend.trending_searches(pn="united_states" if not region else region)
    except Exception as e:
        print(f"Unable to find google trending searches, error: {e}")
        return None


def get_google_trends_for_query(
        query: str, find_related: bool = False, region: str = ""
) -> Optional[pd.DataFrame]:
    """Find google search trends for a given query filtered by region if provided."""
    try:
        pytrend = TrendReq()
        # 12 is the category for Business and Industrial which covers most of the related
        # topics related to fin-gpt
        # Ref: https://github.com/pat310/google-trends-api/wiki/Google-Trends-Categories

        # Only search for last 30 days from now
        pytrend.build_payload(
            kw_list=[query], timeframe="today 1-m", geo=region, cat=12
        )
        return pytrend.interest_over_time()
    except Exception as e:
        print(f"Unable to find google trend for {query}, error: {e}")
        return None


def get_insider_activity(symbol: str) -> pd.DataFrame:
    """Get insider activity. [Source: Business Insider]

    Parameters
    ----------
    symbol : str
        Ticker symbol to get insider activity data from

    Returns
    -------
    df_insider : pd.DataFrame
        Insider activity data
    """
    url_market_business_insider = (
        f"https://markets.businessinsider.com/stocks/{symbol.lower()}-stock"
    )
    response = request(url_market_business_insider)
    if response.status_code != 200:
        return None
    text_soup_market_business_insider = BeautifulSoup(response.content, "html.parser")

    d_insider = dict()
    l_insider_vals = list()
    for idx, insider_val in enumerate(
            text_soup_market_business_insider.findAll(
                "td", {"class": "table__td text-center"}
            )
    ):
        l_insider_vals.append(insider_val.text.strip())

        if (idx + 1) % 6 == 0:
            # Check if we are still parsing insider trading activity
            if "/" not in l_insider_vals[0]:
                break
            d_insider[(idx + 1) // 6] = l_insider_vals
            l_insider_vals = list()

    df_insider = pd.DataFrame.from_dict(
        d_insider,
        orient="index",
        columns=["Date", "Shares Traded", "Shares Held", "Price", "Type", "Option"],
    )

    df_insider["Date"] = pd.to_datetime(df_insider["Date"])

    l_names = list()
    for s_name in text_soup_market_business_insider.findAll(
            "a", {"onclick": "silentTrackPI()"}
    ):
        l_names.append(s_name.text.strip())
    df_insider["Insider"] = l_names
    df_insider = df_insider.set_index("Date")
    df_insider = df_insider.sort_index(ascending=True)
    return df_insider
