""" Find similar companies across different indexes based on available open source models."""
import sys

from typing import Dict
from python.util import get_api_key
from python.util import request


@get_api_key()
def find_similar_companies(api_key: Dict[str, str], symbol: str, country=None):
    """
    Returns a list of companies similar to provided stock symbol.
    If country is None, performs a global search across all indices.
    """
    
    similar = []

    if 'POLYGON' in api_key:
        key = api_key['POLYGON']
        result = request(f"https://api.polygon.io/v1/meta/symbols/{symbol.upper()}/company?&apiKey={key}")
        if result.status_code == 200:
            similar.extend(result.json()["similar"])
    if 'FINNHUB' in api_key:
        result = request(f"https://finnhub.io/api/v1/stock/peers?symbol={symbol}&token={api_key['FINNHUB']}")
        if result.status_code == 200:
            similar.extend(result.json())

    return similar


if __name__ == '__main__':
    print(find_similar_companies(symbol=sys.argv[1]))

