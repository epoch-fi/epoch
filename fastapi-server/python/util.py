import functools
import json
import requests
import pandas as pd
import re

from typing import Optional
from pathlib import Path
from llama_index.core.base.llms.types import ChatMessage
from llama_index.tools.database.base import DatabaseToolSpec

API_JSON_PATH = Path(__file__).parent / 'api_key.json'


def request(url: str, method: str = 'get', timeout: int = 10, **kwargs):
    """Helper to make requests from a url."""
    method = method.lower()
    assert method in ["delete", "get", "head", "patch", "post", "put"],  "Invalid request method."

    headers = kwargs.pop("headers", {})
    func = getattr(requests, method)
    return func(url, headers=headers, timeout=timeout, **kwargs)


def get_df(url: str, header: Optional[int]=None) -> pd.DataFrame:
    html = request(url).text
    # use regex to replace radio button html entries.
    html_clean = re.sub(r"(<span class=\"Fz\(0\)\">).*?(</span>)", "", html)
    dfs = pd.read_html(html_clean, header=header)
    return dfs


def get_api_key(key_name:Optional[str]=None):
    
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            with open(API_JSON_PATH) as f:
                json_dict = json.load(f)

            api_key = json_dict if key_name is None else {key_name: json_dict.get(key_name, '')}
            
            return func(api_key, *args, **kwargs)
        return wrapper
    return decorator


def get_table_info(db_spec: DatabaseToolSpec) -> str:
    """Given a db_spec, construct table info for the all tables in DB
    which includes information about the columns of the table and also 
    shows top row of the table
    """
    all_table_info = ""
    for table_name in db_spec.list_tables(): 
        table_info = db_spec.sql_database.get_single_table_info(table_name)
        table_info += f"\n\nHere is the DDL statement for this table:\n"
        table_info += db_spec.describe_tables([table_name])
        _, output = (db_spec.sql_database.run_sql(f"SELECT * FROM {table_name} LIMIT 1"))
        table_info += f"\nTop row of {table_name}:\n\n"
        for colname in output['col_keys']:
            table_info += colname + "\t"
        table_info += "\n"
        for data in output['result']:
            for val in data:
                table_info += str(val) + "\t"
            table_info += "\n"
        all_table_info += f"\n{table_info}\n"
    return all_table_info


def construct_prefix_db_message(db_spec: DatabaseToolSpec) -> str:
    table_info = get_table_info(db_spec)
    system_prompt=f"""
    You are a smart data scientist working in a reputed trading firm like Jump Trading developing automated trading algorithms. Take a deep breathe and think
    step by step to design queries over a SQL database.

    Here is a complete description of tables in SQL database you have access to:

    {table_info}

    Use responses to past questions also to guide you.


    """

    prefix_messages = []
    prefix_messages.append(ChatMessage(role="system", content=system_prompt))
    
    prefix_messages.append(ChatMessage(role="user", content="What is the average price of Google in the month of July in 2023"))
    prefix_messages.append(ChatMessage(role="assistant",content="""
    SELECT AVG(close) AS AvgPrice
    FROM stock_data
    WHERE stock = 'GOOG'
        AND date >= '2023-07-01'
        AND date <= '2023-07-31';
    """))
    
    prefix_messages.append(ChatMessage(role="user", content="Which stock has the maximum % change in any month in 2023"))
    #prefix_messages.append(ChatMessage(role="user", content="Which stocks gave more than 2% return constantly in month of July from past 5 years"))
    prefix_messages.append(ChatMessage(role="assistant", content="""
    WITH MonthlyPrices AS (
        SELECT
            stock,
            EXTRACT(YEAR FROM date) AS year,
            EXTRACT(MONTH FROM date) AS month,
            FIRST_VALUE(close) OVER (PARTITION BY stock, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date) ORDER BY date ASC) AS opening_price,
            LAST_VALUE(close) OVER (PARTITION BY stock, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date) ORDER BY date ASC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS closing_price
        FROM
            stock_data
        WHERE
            EXTRACT(YEAR FROM date) = 2023
    ),
    PercentageChanges AS (
        SELECT
            stock,
            year,
            month,
            CASE
                WHEN opening_rice IS NULL OR closing_price IS NULL THEN NULL
                WHEN opening_price = 0 THEN NULL
                ELSE ((closing_price - opening_price) / opening_price) * 100 
            END AS pct
        FROM
            MonthlyPrices
    )
    SELECT *
    FROM
        PercentageChanges
    WHERE pct IS NOT NULL
    ORDER BY
        pct DESC
    LIMIT 1;
    """))
    
    prefix_messages.append(ChatMessage(role="user", content="How many times Microsoft beat earnings estimates in 2022"))
    prefix_messages.append(ChatMessage(role="assistant", content="""
    SELECT
        COUNT(*)
    FROM
        earnings
    WHERE
        stock = 'MSFT' AND reported > estimated and EXTRACT(YEAR FROM date) = 2022
    """))
    
    prefix_messages.append(ChatMessage(role="user", content="Which stocks have beaten earnings estimate by more than 1$ consecutively from last 4 reportings?"))
    prefix_messages.append(ChatMessage(role="assistant", content="""
    WITH RankedEarnings AS(
        SELECT
            stock,
            date,
            reported,
            estimated,
            RANK() OVER (PARTITION BY stock ORDER BY date DESC) as ranking
        FROM
            earnings
    )
    SELECT
        stock
    FROM
        RankedEarnings
    WHERE
        ranking <= 4 AND reported - estimated > 1
    GROUP BY
        stock
    HAVING COUNT(*) = 4
    """))
    
    return prefix_messages


