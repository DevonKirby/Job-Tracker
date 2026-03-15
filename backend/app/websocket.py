import uuid
from collections import defaultdict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # One user can have multiple open connections (multiple tabs/devices)
        self.active_connections: dict[uuid.UUID, list[WebSocket]] = defaultdict(list)

    async def connect(self, user_id: uuid.UUID, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: uuid.UUID, websocket: WebSocket):
        self.active_connections[user_id].remove(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]

    async def send_to_user(self, user_id: uuid.UUID, message: dict):
        connections = self.active_connections.get(user_id, [])
        disconnected = []
        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(websocket)
        for websocket in disconnected:
            self.disconnect(user_id, websocket)


manager = ConnectionManager()