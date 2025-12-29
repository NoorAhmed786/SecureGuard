"""
WebSocket Connection Manager

Manages active WebSocket connections for real-time alerts and notifications.
"""
from fastapi import WebSocket
from typing import List


class ConnectionManager:
    """
    Manages WebSocket connections for real-time communication.
    
    This class handles connection lifecycle (connect, disconnect) and
    broadcasting messages to all connected clients.
    """
    
    def __init__(self):
        """Initialize the connection manager with an empty connection list."""
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """
        Accept and register a new WebSocket connection.
        
        Args:
            websocket: The WebSocket connection to register
        """
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        """
        Remove a WebSocket connection from the active list.
        
        Args:
            websocket: The WebSocket connection to remove
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def broadcast(self, message: str):
        """
        Send a message to all active WebSocket connections.
        
        Args:
            message: The message to broadcast
        """
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # If sending fails, the connection is likely dead
                # It will be removed on the next disconnect call
                pass
