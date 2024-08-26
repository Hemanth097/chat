from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/chatbs")
async def chat(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast("A user has left the chat")

app.mount("/static", StaticFiles(directory="frontend"), name="static")


@app.get("/")
async def index():
    return FileResponse(os.path.join("frontend", "index.html"))

@app.get("/index.html")
async def indexhtml():
    return FileResponse(os.path.join("frontend", "index.html"))

@app.get("/chat")
async def chat():
    return FileResponse(os.path.join("frontend", "chat.html"))

@app.get("/styles")
async def chat():
    return FileResponse(os.path.join("frontend", "styles.css"))


@app.get("/script")
async def chat():
    return FileResponse(os.path.join("frontend", "script.js"))

