import pandas as pd
from typing import List, Dict, Optional, Any
from python.util import request


def get_technical_summary_report(symbol: str) -> Optional[str]:
    """Get technical summary report provided by FinBrain's API
    Parameters
    ----------
    symbol : str
        Ticker symbol to get the technical summary
    Returns
    -------
    report: str
        technical summary report
    """
    response = request(f"https://api.finbrain.tech/v0/technicalSummary/{symbol}")

    report = ""
    if response.status_code == 200:
        if "technicalSummary" in response.json():
            report = response.json()["technicalSummary"]
        else:
            print("Technical summary not found from FinBrain's API")
    else:
        print("Request error in retrieving sentiment from FinBrain API")

    return report


if __name__ == "__main__":
    print(get_technical_summary_report("Meta"))

