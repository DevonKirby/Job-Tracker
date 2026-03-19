import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

export default function useWebSocket(onMessage) {
  const { user, token } = useAuth()
  const ws = useRef(null)

  useEffect(() => {
    if (!user || !token) return

    const socket = new WebSocket(
      `ws://localhost:8000/ws/${user.id}?token=${token}`
    )

    socket.onopen = () => {
      console.log('WebSocket connected')
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onMessage(data)
    }

    socket.onclose = () => {
      console.log('WebSocket disconnected')
    }

    ws.current = socket

    return () => {
      socket.close()
    }
  }, [user, token])

  return ws
}