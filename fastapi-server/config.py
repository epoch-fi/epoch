from typing import List, Union

from dotenv import load_dotenv
from pydantic import BaseSettings, validator
import os

load_dotenv()


class Settings(BaseSettings):
    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:8000",
        "http://localhost:3000",
        "https://epoch-fi.com",
        "https://www.epoch-fi.com",
    ]
    # allow any localhost port
    BACKEND_CORS_ORIGINS_REGEX: str = r"^(http://localhost:\d+|https://your-app\.com)$"

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # credentials
    REDISUSER: str = os.environ["REDISUSER"]
    REDISPASSWORD: str = os.environ["REDISPASSWORD"]
    REDISHOST: str = os.environ["REDISHOST"]
    REDISPORT: str = os.environ["REDISPORT"]
    OPENAI_API_KEY: str = os.environ["OPENAI_API_KEY"]
    SUPABASE_URL: str = os.environ["SUPABASE_URL"]
    SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_KEY"]
    REDIS_URL = f"redis://{REDISUSER}:{REDISPASSWORD}@{REDISHOST}:{REDISPORT}"
    SERPAPI_API_KEY: str = os.environ["SERPAPI_API_KEY"]
    GPT_MODEL_NAME: str = os.environ["GPT_MODEL_NAME"]
    POSTGRES_DB_URI: str = os.environ["POSTGRES_DB_URI"]
    ALPHA_VANTAGE_API_KEY: str = os.environ["ALPHA_VANTAGE_API_KEY"]

    @validator(
        "OPENAI_API_KEY",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_KEY",
        "SERPAPI_API_KEY",
        "GPT_MODEL_NAME",
        "POSTGRES_DB_URI"
    )
    def check_env(cls, v, field):
        if not v:
            raise ValueError(
                f"{field.name} must be defined. For local development, you can use the default value in your .env '{field.name}={field.default}'"
            )
        return v

    LOG_LEVEL: str = "info"

    @validator("LOG_LEVEL")
    def check_log_level(cls, v, field):
        if v not in ["debug", "info", "warning", "error", "critical"]:
            raise ValueError(
                f"{field.name} must be a standard log level. For local development, you can use the default value in your .env '{field.name}={field.default}'"
            )
        return v

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
