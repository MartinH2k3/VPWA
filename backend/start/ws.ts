import Channel from '#models/channel'
import User from '#models/user'
import { IncomingMessage } from 'node:http'
import { createServer } from 'node:http'
import WebSocket from 'ws'
import { WebSocketServer } from 'ws'
import SocketSession from '../app/handlers/SocketSession.js'
import { pendingAuthentificationRequests, socketSessions } from '../app/globals.js'

const server = createServer()
const wss = new WebSocketServer({ server })

interface SocketData {
  event: string
  data: any
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  console.log('A new connection')
  let socketSession: SocketSession

  ws.on('message', async (message: WebSocket.Data) => {
    const parsedMessage: SocketData = JSON.parse(message.toString())
    const event = parsedMessage.event
    const data = parsedMessage.data

    if (event === 'auth') {
      // Find token in activeSockets
      let authRequest = pendingAuthentificationRequests.find(
        (request) => data.token === request.token
      )
      if (!authRequest) {
        console.error('Invalid token')
        return
      }
      const userChannels = await Channel.query().whereHas('members', (query) => {
        query.where('user_id', authRequest.user.id).where('kicked', false)
      })

      socketSession = new SocketSession(ws, authRequest.user, userChannels)
      console.log('Authenticated', socketSession.user.username)
      // Remove the request from pendingAuthentificationRequests
      const index = pendingAuthentificationRequests.indexOf(authRequest)
      if (index !== -1) pendingAuthentificationRequests.splice(index, 1)

      socketSessions.push(socketSession)

      socketSession.send('ack_auth', {})
      return
    }
    if (!socketSession?.user) {
      console.error('User not authenticated')
      ws.send(JSON.stringify({ event: 'unauthenticated', data: {} }))
      return
    }

    await socketSession.receive(event, data)
  })

  ws.on('close', () => {
    socketSession.destroy()
    socketSessions.splice(socketSessions.indexOf(socketSession), 1)
    console.log('Disconnected', socketSession?.user?.username)
  })

  ws.on('error', (error) => {
    const index = pendingAuthentificationRequests.findIndex(
      (request) => request.user.id === socketSession?.user?.id
    )
    if (index !== -1) pendingAuthentificationRequests.splice(index, 1)

    socketSessions.splice(socketSessions.indexOf(socketSession), 1)

    console.error('WebSocket error:', error)
  })
})

server.listen(9594, () => {
  console.log('Server is listening on port 9594')
})
