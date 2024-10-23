import Channel from '#models/channel'
import User from '#models/user'
import { IncomingMessage } from 'node:http'
import { createServer } from 'node:http'
import WebSocket from 'ws'
import { WebSocketServer } from 'ws'

const server = createServer()
const wss = new WebSocketServer({ server })

export interface ActiveSocket {
  user: User
  token: string
}

; (global as any).activeSockets = [] as ActiveSocket[]

interface SocketData {
  event: string
  message: any
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  console.log('A new connection')
  let user: User | null = null

  // function updateChannels() {

  ws.on('message', (data: WebSocket.Data) => {
    const parsedData: SocketData = JSON.parse(data.toString())
    const event = parsedData.event
    const message = parsedData.message

    switch (event) {
      case 'auth':
        // Find token in activeSockets
        const activeSocket = (global as any).activeSockets.find(
          (socket: ActiveSocket) => socket.token === message.token
        )
        if (!activeSocket) {
          console.error('Invalid token')
          return
        }
        console.log('Authenticated', activeSocket.user.username)
        user = activeSocket.user
        break

      case 'message':

        break;

      default:
        console.log(user?.username, event, message)
        // Send ack reply
        ws.send(JSON.stringify({ event: 'ack', message: 'Message received' }))

        break
    }
  })

  ws.on('close', () => {
    //remove user from activeSockets
    const index = (global as any).activeSockets.findIndex(
      (socket: ActiveSocket) => socket.user.id === user?.id
    )
    if (index !== -1) {
      ; (global as any).activeSockets.splice(index, 1)
    }
    console.log('Disconnected', user?.username)
  })

  ws.on('error', (error) => {
    const index = (global as any).activeSockets.findIndex(
      (socket: ActiveSocket) => socket.user.id === user?.id
    )
    if (index !== -1) {
      ; (global as any).activeSockets.splice(index, 1)
    }
    console.error('WebSocket error:', error)
  })
})

server.listen(9594, () => {
  console.log('Server is listening on port 9594')
})



