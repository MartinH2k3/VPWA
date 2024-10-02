import Channel from '#models/channel'
import User from '#models/user'
import { IncomingMessage } from 'node:http'
import { createServer } from 'node:http'
import WebSocket from 'ws'
import { WebSocketServer } from 'ws'

const server = createServer()
const wss = new WebSocketServer({ server })




interface ActiveSocket {
  user: User;
  token: string;
  methods: {
    send: (message: any) => void;
    addChannel: (channel: Channel) => void;
    removeChannel: (channel: Channel) => void;
    sendNotification: (notification: any) => void; //TODO type Notification

  }

}


(global as any).activeSockets = [] as ActiveSocket[];

interface SocketData {
  event: string;
  message: any;
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  console.log('A new connection')
  let user: User | null = null

  // function updateChannels() {

  ws.on('message', (data: WebSocket.Data) => {
    console.log('New message', data.toString())
    const parsedData: SocketData = JSON.parse(data.toString())
    const event = parsedData.event
    const message = parsedData.message


    switch (event) {
      case 'auth':
        // Find token in activeSockets
        const activeSocket = (global as any).activeSockets.find((socket: ActiveSocket) => socket.token === message.token)
        if (!activeSocket) {
          console.error('Invalid token')
          return
        }
        console.log('Authenticated', activeSocket.user.username)
        user = activeSocket.user

        activeSocket.send = (param: any) => {

          ws.send(JSON.stringify({ event: 'updateChannels', message: 'Channels updated' }))
        }


        break;

      default:
        console.log(user?.username, event, message);
        // Send ack reply
        ws.send(JSON.stringify({ event: 'ack', message: 'Message received' }))

        break;
    }

  })

  ws.on('close', () => {
    console.log('Disconnected')
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

server.listen(3334, () => {
  console.log('Server is listening on port 3334')
})
