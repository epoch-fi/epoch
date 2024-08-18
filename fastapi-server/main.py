import asyncio
import logging
import subprocess
import time
import redis.asyncio as redis
import uvicorn
from dotenv import load_dotenv
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache
from fastapi_limiter import FastAPILimiter
from langchain.memory import RedisChatMessageHistory
from pydantic import BaseModel

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, Response, StreamingResponse
from agents.router import create_agent, agent_executor, create_hierarchical_agent, test_agent_executor, ws_agent_executor


load_dotenv()

from config import settings

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=settings.LOG_LEVEL.upper())
agent = create_hierarchical_agent(use_portkey=True)


class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str


class Message(BaseModel):
    message: str
    user_id: str
    
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()


@app.post("/epoch", response_class=StreamingResponse)
async def generate_club_response(message: Message) -> StreamingResponse:
    """Endpoint for chat requests.
    It uses the StreamingConversationChain instance to generate responses,
    and then sends these responses as a streaming response.
    :param data: The request data.
    """
    # history = RedisChatMessageHistory(message.user_id, url=settings.REDIS_URL)
    history = []
    
    response_msg = agent_executor(
            agent,
            message.message,
            redis_history=history,
        )
    
    return StreamingResponse(
        response_msg,
        media_type="text/event-stream",
    )
    
@app.websocket("/epoch-ws")
async def generate_chat_response(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            message = await websocket.receive_text()     
            print(f"Message received: {message}")
            history = []
            response_msg = ws_agent_executor(
                agent,
                message,
                redis_history=history,
            )
            await manager.broadcast(response_msg)
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.post("/epoch-test", response_class=StreamingResponse)
async def generate_club_response(message: Message) -> StreamingResponse:
    """Endpoint for testing chat requests.
    It uses the StreamingConversationChain instance to generate responses,
    and then sends these responses as a streaming response.
    :param data: The request data.
    """
    
    print("Query received by the user: ", message.message)
    response_msg = test_agent_executor()
    
    return StreamingResponse(
        response_msg,
        media_type="text/event-stream",
    )


@app.on_event("startup")
async def startup():
    try:
        red = redis.from_url(
            settings.REDIS_URL, encoding="utf-8", decode_responses=True
        )
        await FastAPILimiter.init(red)
    except Exception:
        raise Exception(
            "Redis connection failed, ensure redis is running on the default port 6379"
        )

    FastAPICache.init(RedisBackend(red), prefix="fastapi-cache")
    
html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            var ws = new WebSocket("ws://0.0.0.0:8000/epoch-ws");
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""


@app.get("/")
async def get():
    return HTMLResponse(html)


@app.middleware("http")
async def time_request(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["Server-Timing"] = str(process_time)
    logger.info(f"{request.method} {round(process_time, 5)}s {request.url}")
    return response


def dev():
    try:
        subprocess.check_output(["redis-cli", "ping"], stderr=subprocess.STDOUT)
    except subprocess.CalledProcessError:
        logger.warning(
            "Redis is not already running, have you started it with redis-server?"
        )
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
