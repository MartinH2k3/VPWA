import { defineStore } from 'pinia';

import { useChannelStore } from './channelStore';
const channelStore = useChannelStore();
export interface Message {
  id: number;
  username: string;
  content: string;
  byMe: boolean;
  taggedMe: boolean;
}

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: {} as Record<string, Message[]>,
  }),
  actions: {
    addMessage(channel: string, message: Message) {
      if (!this.messages[channel]) {
        this.messages[channel] = [];
      }
      this.messages[channel].unshift(message);

    },
    addMessageToActiveChannel(message: Message) {
      // Add message to active channel
      console.log('channelStore.activeChannel.name', channelStore.activeChannel.name);
      this.addMessage(channelStore.activeChannel.name, message);
    },
    clearMessages(channel: string) {
      this.messages[channel] = [];
    },
  },

  getters: {
    messages: (state) => (channel: string) => {
      return state.messages[channel] || [];
    },
    activeChannelMessages: (state) => {
      console.log('channelStore.activeChannel.name', channelStore.activeChannel.name);
      return state.messages[channelStore.activeChannel.name] || [];
    }
  },



});
