import { defineStore } from 'pinia';
import { api } from 'boot/api';
import { useChannelStore } from 'stores/channelStore';

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
}

interface Message {
  event: string;
  cookies: string;
  message: any;
}

const URL = 'ws://127.0.0.1:3334';

const useSocketStore = defineStore('socket', {
  state: (): SocketState => ({
    socket: null,
    isConnected: false,
  }),
  actions: {
    async connect() {

      // MAke a request to authWS
      let token: string | null = null;
      const channelStore = useChannelStore();
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

      this.socket.onmessage = (event) => {
        console.log("Received message", event);
        const data = JSON.parse(event.data);
        switch (data.category) {
          case 'newMessage':
            // TODO implement
            break;
          case 'notification':
            // TODO implement
            break;
          case 'messageDraft':
            // TODO implement
            break;
          case 'addChannel':
            channelStore.addChannel(data.message);
            break;
          case 'removeChannel':
            channelStore.removeChannel(data.message.name);
            break;
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        console.log('Disconnected from', URL);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
    },
    //TODO add comments
    disconnect() {
      if (this.socket) {
        this.socket.close();
        this.isConnected = false;
        this.socket = null;
      }
    },
    sendMessage(event: string, message: any) {
      if (this.socket && this.isConnected) {
        const cookies = document.cookie;
        const payload: Message = { event, cookies, message };
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
