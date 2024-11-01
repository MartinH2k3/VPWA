import { defineStore } from 'pinia';
import { api } from 'boot/api';
import { useChannelStore } from 'stores/channelStore';
import { useMessageStore } from 'stores/messageStore';

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  isAuthenticated: boolean;
}

interface SocketMessage {
  event: string;
  data: any;
}

const URL = 'ws://127.0.0.1:9594';

const useSocketStore = defineStore('socket', {
  state: (): SocketState => ({
    socket: null,
    isConnected: false,
    isAuthenticated: false
  }),
  actions: {
    async connect() {

      // MAke a request to authWS
      let token: string | null = null;
      const channelStore = useChannelStore();
      const messageStore = useMessageStore();
      try {
        const response = await api.get('/authWS');
        token = response.data;
      } catch (error) {
        console.error('Error', error);
      }

      if (!token) {
        console.error('No token');
        return;
      }

      this.socket = new WebSocket(URL);
      console.log('Connecting to', URL);

      this.socket.onopen = () => {
        this.isConnected = true;
        console.log('Connected to', URL);
        this.sendMessage('auth', { token });
      };

      this.socket.onmessage = (message) => {
        console.log('Received message', message);
        const socketMessage: SocketMessage = JSON.parse(message.data);

        switch (socketMessage.event) {
          case 'unauthenticated':
            console.error('Unauthenticated');
            // close the connection and try to reconnect again
            this.disconnect();
            this.connect();
            break;
          case 'add_message':
            console.log('Adding message to store', socketMessage.data);
            // Find the user
            let messageData = messageStore.makeMessage(socketMessage.data.username, socketMessage.data.messageContent, socketMessage.data.messageId);
            messageStore.addMessage(socketMessage.data.channelName, messageData, true);
            break;
          case 'notification':
            // TODO implement
            break;
          case 'message_draft':
            // TODO implement
            break;
          case 'add_channel':
            channelStore.addInvitedChannel(socketMessage.data);
            break;
          case 'remove_channel':
            channelStore.removeChannel(socketMessage.data.name);
            break;
          case 'ack_auth':
            this.isAuthenticated = true;
            // If a channel is active, notify the server
            if (channelStore.activeChannel.name) {
              this.sendMessage('update_active_channel', { channelName: channelStore.activeChannel.name });
            }
            break;
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        console.log('Disconnected from', URL);
        // Reconnect
        this.connect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
    },

    async waitTillConnected() {
      return new Promise((resolve) => {
        if (this.isConnected) {
          resolve(true);
        } else {
          const interval = setInterval(() => {
            if (this.isConnected) {
              clearInterval(interval);
              resolve(true);
            }
          }, 1000);
        }
      });
    },

    //TODO add comments
    disconnect() {
      if (this.socket) {
        this.socket.close();
        this.isConnected = false;
        this.socket = null;
      }
    },
    sendMessage(event: string, data: any) {
      if (this.socket && this.isConnected) {
        const cookies = document.cookie;
        const payload: SocketMessage = { event, data };
        this.socket.send(JSON.stringify(payload));
      }
    },
    //TODO add comments
    onMessage(callback: (message: any) => void) {
      if (this.socket) {
        this.socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          callback(message);
        };
      }
    }
  }
});

// @ts-ignore
window.socketStore = useSocketStore();

export { useSocketStore };
