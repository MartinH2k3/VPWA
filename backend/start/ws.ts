import Channel from '#models/channel'
import User from '#models/user'
import { IncomingMessage } from 'node:http'
import { createServer } from 'node:http'
import WebSocket from 'ws'
import { WebSocketServer } from 'ws'
import WebSocketController from '#controllers/web_socket_controller'

const server = createServer()
const wss = new WebSocketServer({ server })

export interface ActiveSocket {
  user: User
  token: string
  activeChannelId: number | null
  send: (event: string, data: any) => void
}

; (global as any).activeSockets = [] as ActiveSocket[]

interface SocketData {
  event: string
  data: any
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  console.log('A new connection')
  let user: User | null = null
  let activeSocket: ActiveSocket
  // function updateChannels() {

  ws.on('message', (message: WebSocket.Data) => {
    const parsedMessage: SocketData = JSON.parse(message.toString())
    const event = parsedMessage.event
    const data = parsedMessage.data

    if (event == 'auth') {
      // Find token in activeSockets
      activeSocket = (global as any).activeSockets.find(
        (socket: ActiveSocket) => socket.token === data.token
      )
      if (!activeSocket) {
        console.error('Invalid token')
        return
      }
      console.log('Authenticated', activeSocket.user.username)
      user = activeSocket.user
      activeSocket.send = function (event: string, data: any) {
        ws.send(JSON.stringify({ event, data }))
      }
    }
    if (!user) {
      console.error('User not authenticated')
      return
    }

    switch (event) {


      case 'sendMessage':

        console.log('Received message', data);

        WebSocketController.sendMessage(activeSocket, data.message, data.channel)

        break;

      default:
        console.log(user?.username, event, message)
        // Send ack reply
        ws.send(JSON.stringify({ event: 'ack', data: 'Message received' }))

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



