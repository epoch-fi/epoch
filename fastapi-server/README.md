## Start FastAPI Server

For running all the agents, you need to create accounts with:

1. [OpenAI](https://platform.openai.com/signup)
2. [SerpAPI](https://serpapi.com/)
3. [Polygon](https://polygon.io/)
4. [AlphaVantage](https://www.alphavantage.co/)
5. [Finnhub](https://finnhub.io/)
6. [NEWSAPI](https://newsapi.org/)
7. [PORTKEY](https://portkey.ai/)
8. [TAVILY](https://tavily.com/)

TODO: Currently, we use [Supabase](https://supabase.com/) to store the pricing and earnings data ourselves. We'll be looking into what is the best way to share the access to supabase tables soon.

First, create a `.env` file inside this directory and add the following variables to the `.env` file.

```
LOG_LEVEL=info
GPT_MODEL_NAME='gpt-4-0613'

OPENAI_API_KEY=<OPENAI_API_KEY>
SERPAPI_API_KEY=<SERPAPI_API_KEY>
SUPABASE_URL=<SUPABASE_URL>
SUPABASE_SERVICE_KEY=<SUPABASE_SERVICE_KEY>
POLYGON_KEY=<POLYGON_KEY>
POSTGRES_DB_URI=<POSTGRES_DB_URI>
ALPHA_VANTAGE_API_KEY = <ALPHA_VANTAGE_API_KEY>

# Required if using Redis to save context.
REDISUSER=
REDISPASSWORD=
REDISHOST=localhost
REDISPORT=6379
```

First, create a file `api_key.json` under the python directory as we need to some more keys to the `api_key.json` file. (TODO: We'll combine these files together.)

```
cd python
```

```
{
  "OPENAI" : <OPENAI_API_KEY>,
  "ALPHA_VANTAGE" : <ALPHA_VANTAGE_API_KEY>,
  "POLYGON" : <POLYGON_KEY>,
  "FINNHUB": <FINNHUB>,
  "NEWSAPI": <NEWSAPI>,
  "PORTKEY": <PORTKEY>,
  "TAVILY" : <TAVILY>
}
```

1. Create a Poetry virtual environment

```bash
poetry env use 3.11
```

Start a shell within the virtual environment

```bash
poetry shell
```

2. Install dependencies

```bash
poetry install
```

3. Run the application

First make sure to start a redis server in a different tab with

```bash
redis-server
```

Then run the application with:

```bash
poetry run dev
```

You should now be able to access the API at http://localhost:8000 on your machine.
