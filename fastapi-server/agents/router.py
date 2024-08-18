import os
import sys
import io
import openai
import pandas as pd
import time
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from llama_index.llms.openai import OpenAI
from llama_index.agent.openai import OpenAIAgent
from llama_index.core.tools.tool_spec.base import BaseToolSpec
from llama_index.core.tools.query_engine import QueryEngineTool
from llama_index.tools.tavily_research.base import TavilyToolSpec

from portkey_ai import PORTKEY_GATEWAY_URL, createHeaders

from python.function_calls import news
from python.function_calls import comparisons
from python.function_calls import earnings
from python.util import get_api_key
from python.util import get_table_info
from python.util import construct_prefix_db_message
from agents.prompts import agent_prompt_template
from agents.db_tool import SQLDatabaseToolSpec
from config import settings

GPT_MODEL_NAME = settings.GPT_MODEL_NAME
POSTGRES_DB_URI = settings.POSTGRES_DB_URI

class FinTools(BaseToolSpec):
    spec_functions = [
        "find_similar_companies",
        "get_earnings_history",
        "get_stocks_with_upcoming_earnings",
        "get_current_gainer_stocks",
        "get_current_loser_stocks",
        "get_current_undervalued_growth_stocks",
        "get_current_technology_growth_stocks",
        "get_current_most_traded_stocks",
        "get_current_undervalued_large_cap_stocks",
        "get_current_aggressive_small_cap_stocks",
        "get_trending_finance_news",
        "get_google_trending_searches",
        "get_google_trends_for_query",
        "get_latest_news_for_stock",
        "get_current_stock_price_info",
        "get_insider_activity",
    ]

    def find_similar_companies(self, symbol: str) -> List[str]:
        """Given a stock's ticker symbol, returns a list of similar companies."""
        return comparisons.find_similar_companies(symbol)

    def get_earnings_history(self, symbol: str) -> pd.DataFrame:
        """Given a stock's ticker symbol, returns a dataframe storing actual and estimated

        earnings over past K quarterly reports.
        
        """

        return earnings.get_earnings_history(symbol)
    
    def get_latest_earning_estimate(self, symbol: str) -> float:
        """Given a stock's ticker symbole, returns it's earnings estimate for the upcoming

        quarterly report.
        
        """

        return earnings.get_latest_earning_estimate(symbol)

    def get_stocks_with_upcoming_earnings(self, num_days_from_now: int, only_sp500: bool) -> pd.DataFrame:
        """Returns a pandas dataframe containing all stocks which are announcing earnings in upcoming days.
           
           Arguments: 
            
            num_days_from_now: only returns stocks which announcing earnings from today's date to num_days_from_now.
            only_sp500: only returns sp500 stocks.

        """
        
        start_date = datetime.now().strftime('%Y-%m-%d')
        end_date = (datetime.now() + timedelta(num_days_from_now)).strftime('%Y-%m-%d')
        return earnings.get_upcoming_earnings(start_date=start_date, end_date=end_date, country='USD', only_sp500=only_sp500)

    def get_current_gainer_stocks(self) -> pd.DataFrame:
        """Return US stocks which are classified as day gainers as per Yahoo Finance.

        A US stock is classified as day gainer if %change in price > 3, price >=5, volume > 15_000

        """
        return news.get_current_gainer_stocks()

    def get_current_loser_stocks(self) -> pd.DataFrame:
        """Returns US stocks which are classified as day losers as per Yahoo Finance.

        A US stock is classified as day loser if %change in price < -2.5, price >=5, volume > 20_000

        """
        return news.get_current_loser_stocks()

    def get_current_undervalued_growth_stocks(self) -> pd.DataFrame:
        """Get list of undervalued growth stocks in US market as per Yahoo Finance.

        A stock with Price to Earnings ratio between 0-20, Price / Earnings to Growth < 1
        
        """
        return news.get_current_undervalued_growth_stocks()

    def get_current_technology_growth_stocks(self) -> pd.DataFrame:
        """Returns a data frame of growth stocks in technology sector in US market.

        If a stocks's quarterly revenue growth YoY% > 25%.

        """
        return news.get_current_technology_growth_stocks()

    def get_current_most_traded_stocks(self) -> pd.DataFrame:
        """Returns a dataframe storing stocks which were traded the most in current market.

        Stocks are ordered in decreasing order of activity i.e stock traded the most on top.

        """
        return news.get_current_most_traded_stocks()

    def get_current_undervalued_large_cap_stocks(self) -> pd.DataFrame:
        """Returns a dataframe storing US market large cap stocks with P/E < 20."""
        return news.get_current_undervalued_large_cap_stocks()

    def get_current_aggressive_small_cap_stocks(self) -> pd.DataFrame:
        """Returns a dataframe storing US market small cap stocks with 1 yr % change

        in earnings per share > 25

        """
        return news.get_current_aggressive_small_cap_stocks()

    def get_trending_finance_news(self) -> List[str]:
        """Returns a list of top 10 trending news in financial market as

        per seekingalpha.

        """

        trends = news.get_topk_trending_news()
        return [t['title'] for t in trends]

    def get_google_trending_searches(self) -> Optional[pd.DataFrame]:
        """Returns trending searches in US as per google trends.

        If unable to find any trends, returns None.

        """
        return news.get_google_trending_searches(region='united_states')

    def get_google_trends_for_query(self, query: str) -> Optional[pd.DataFrame]:
        """Finds google search trends for a given query in United States.

        Returns None if unable to find any trends.

        """
        return news.get_google_trends_for_query(query=query, region='united_states')

    def get_latest_news_for_stock(self, stock_id: str) -> List[str]:
        """Given a stock_id representing the name of a company or the stock ticker symbol,

        Return a list of news published related to top business articles in US in last 7
        days from now.

        """
        articles = news.get_latest_news_for_stock(stock_id=stock_id)
        return [a['title'] for a in articles]

    def get_current_stock_price_info(self, stock_ticker_symbol: str) -> Optional[Dict[str, Any]]:
        """
        Given a stock's ticker symbol, returns current price information of the stock.

        Returns None if the provided stock ticker symbol is invalid.
        """
        price_info = news.get_current_stock_price_info(stock_ticker_symbol)
        if price_info is not None:
            return {
                    "Current Price": price_info["c"],
                    "High Price of the day" : price_info["h"],
                    "Low Price of the day" : price_info["l"],
                    "Open Price of the day" : price_info["o"],
                    "Percentage change": price_info["dp"],
                    }

    def get_insider_activity(self, stock_ticker_symbol: str) -> pd.DataFrame:
        """
        Given a stock's ticker symbol, return information about it's insider
        trading activity. An insider trading activity happens when corporate 
        insiders trade in stock in their own companies. Insider trading 
        information is an indicator that can be used to gain valuable 
        insights and as a reflection of the prospect of the company.

        Returns a pandas dataframe
        """
        return news.get_insider_activity(stock_ticker_symbol)

@get_api_key()
def create_agent(api_key: Dict[str, str]):
    openai.api_key = api_key['OPENAI']
    tool_spec = FinTools()
    llm = OpenAI(temperature=0, model=GPT_MODEL_NAME)
    return OpenAIAgent.from_tools(tool_spec.to_tool_list(), llm=llm, verbose=True)

@get_api_key()
def create_hierarchical_agent(api_key: Dict[str, str], use_portkey: bool=False):
    openai.api_key = api_key['OPENAI']
    if use_portkey:
        portkey_headers = {
            "x-portkey-api-key": api_key["PORTKEY"],
            "x-portkey-provider": "openai",
        }
        llm = OpenAI(api_base=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, temperature=0, model=GPT_MODEL_NAME)
    else:
        llm = OpenAI(temperature=0, model=GPT_MODEL_NAME)

    db_tool_spec = SQLDatabaseToolSpec(uri=POSTGRES_DB_URI)
    table_info = get_table_info(db_tool_spec)
    prefix_messages = construct_prefix_db_message(db_tool_spec)
    # add some role play in the system .
    database_agent = OpenAIAgent.from_tools([tool for tool in db_tool_spec.to_tool_list() if tool.metadata.name == "run_sql_query"], 
            prefix_messages=prefix_messages,
            llm=llm, verbose=True)
    database_agent_tool = QueryEngineTool.from_defaults(
            database_agent,
            name="database_agent",
            description=""""
            This agent analyzes a text query and add further explainations and thoughts to help a data scientist who has access to following tables:

            {table_info}

            Be concise and do not lose any information about original query while passing to the data scientist.
            """)

    fin_tool_spec = FinTools()
    fin_api_agent = OpenAIAgent.from_tools(fin_tool_spec.to_tool_list(), 
            system_prompt=f"""
            You are a helpful AI financial assistant designed to understand the intent of the user query and then use relevant tools/apis to help answer it. 
            You can use more than one tool/api only if needed, but final response should be concise and relevant. If you are not able to find
            relevant tool/api, respond respectfully suggesting that you don't know. Think step by step""", llm=llm, verbose=True)
    
    fin_api_agent_tool = QueryEngineTool.from_defaults(
            fin_api_agent,
            name='fin_api_agent',
            description=f"""
            This agent has access to another agent which can access certain open APIs to provide information based on user query.
            Analyze the query and add any information if needed which can help to decide which API to call.
            Be concise and do not lose any information about original query.
            """,
            )
    
    tavily_tool_spec = TavilyToolSpec(api_key=api_key["TAVILY"])
    tavily_agent = OpenAIAgent.from_tools(tavily_tool_spec.to_tool_list(), 
            system_prompt=f"""
            You are a helpful external financial research assistant designed to understand the intent of the user query and then use external search to help answer it. 
            Don't do extensive search and try not to access any paid content. Always attribute your sources with short summaries while answering.""", llm=llm, verbose=True)
    
    tavily_agent_tool = QueryEngineTool.from_defaults(
            tavily_agent,
            name='tavily_agent',
            description=f"""
            This agent has access to external sources and can do external search to help answer the query.
            Only use it as a fallback if you are not able to find relevant information from the database or open APIs.
            """,
            )


    return OpenAIAgent.from_tools(
            [database_agent_tool, fin_api_agent_tool, tavily_agent_tool],
            system_prompt="""
            You are a specialized financial assistant with access to certain tools which can access open APIs and SP500 companies database containing information on
            daily opening price, closing price, high, low, volume, reported earnings, estimated earnings since 2010 to 2023. Before answering query you should check 
            if the question can be answered via querying the database or using specific open APIs. If you try to find answer via querying database first and it did
            not work out, think if you can use other tool APIs available before replying gracefully. If you are not able to find relevant information from the 
            database or open APIs, use the tavily agent to do external research.
            """, llm=llm, verbose=True)

def agent_executor(agent, query, redis_history):
    
    messages = agent_prompt_template.format_messages(
            message_history=[], #TODO: Add this if you'd like to save previous context: redis_history.messages[-3:],
            question=query,
        )
    
    response = agent.chat(str(messages))
    #TODO: Add this if you'd like to save the previous context.
    # redis_history.add_user_message(query)
    # redis_history.add_ai_message(str(response))
    
    stream = io.StringIO(str(response))
    stream.seek(0)
    return stream

def ws_agent_executor(agent, query, redis_history):
    
    messages = agent_prompt_template.format_messages(
            message_history=[], #TODO: Add this if you'd like to save previous context: redis_history.messages[-3:],
            question=query,
        )
    
    response = agent.chat(str(messages))
    #TODO: Add this if you'd like to save the previous context.
    # redis_history.add_user_message(query)
    # redis_history.add_ai_message(str(response))
    
    return str(response)

def test_agent_executor():
    # Introduce a 5-second delay
    time.sleep(5)
    
    response ='''**Current Market Conditions in the United States**

The current market conditions in the United States reflect a dynamic landscape shaped by various economic indicators and global events. As of [current date], several factors contribute to the market sentiment.

**Key Economic Indicators:**
- **Stock Market Performance:** The major stock indices, including the S&P 500, Dow Jones Industrial Average, and NASDAQ, play a crucial role in gauging market trends. Investors closely monitor these indices to assess the overall health of the equity markets.
- **Unemployment Rate:** The employment situation is a critical indicator of economic health. Changes in the unemployment rate can impact consumer spending and investor confidence.
- **Inflation and Consumer Price Index (CPI):** Inflation rates and CPI are essential for understanding the purchasing power of consumers. Central banks use these metrics to formulate monetary policies.

**Global Influences:**
Global events, such as geopolitical tensions, trade agreements, and public health crises, can significantly impact U.S. markets. For instance, ongoing trade negotiations, diplomatic relations, and the global response to the COVID-19 pandemic can influence investor decisions.

**Table: Recent Market Trends**
```markdown
| Indicator               | Value               |
|-------------------------|---------------------|
| S&P 500                 | [Link to S&P 500]   |
| Unemployment Rate       | [Link to Data]      |
| Inflation Rate (CPI)    | [Link to Inflation] |
```

**Useful Links:**
1. [S&P 500 Overview](https://www.marketwatch.com/investing/index/spx)
2. [Current Unemployment Data](https://www.bls.gov/news.release/empsit.nr0.htm)
3. [Understanding Inflation](https://www.investopedia.com/terms/c/consumerpriceindex.asp)

As the market conditions are subject to change, investors and analysts stay vigilant, keeping an eye on these indicators and adapting their strategies accordingly. It's essential to conduct thorough research and consult financial experts for the most accurate and up-to-date information.'''
    
    stream = io.StringIO(str(response))
    stream.seek(0)
    return stream

