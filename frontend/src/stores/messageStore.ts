import { defineStore } from 'pinia';

import { useChannelStore } from './channelStore';
import { useUserStore } from './userStore';
const channelStore = useChannelStore();
const userStore = useUserStore();
export interface Message {
  id: number;
  username: string;
  content: string;
  byMe: boolean;
  taggedMe: boolean;
}

function generateMessage() {
  const lines = ['Never gonna give you up',
    'Never gonna run around and desert you',
    'Never gonna say goodbye',
    "You wouldn't get this from any other guy",
    'You know the rules and so do I (do I)',
    "Inside, we both know what's been going on (going on)",
    "Your heart's been aching, but you're too shy to say it (say it)",
    "We're no strangers to love",
    'Never gonna tell a lie and hurt you',
    'Never gonna let you down',
    "We've known each other for so long",
    'Never gonna make you cry',
    'Gotta make you understand',
    "And if you ask me how I'm feeling",
    "A full commitment's what I'm thinking of",
    "We know the game and we're gonna play it",
    "I just wanna tell you how I'm feeling",
    "Your heart's been aching, but you're too shy to say it (to say it)",
    "Don't tell me you're too blind to see"]
  return lines[Math.floor(Math.random() * lines.length)];
}

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: {} as Record<string, Message[]>,
  }),
  actions: {
    addMessage(channelName: string, message: Message, toFront: boolean) {
      if (!this.messages[channelName]) {
        this.messages[channelName] = [];
      }
      if (toFront) {
        this.messages[channelName].unshift(message);
      } else {
        this.messages[channelName].push(message);
      }
    },
    addMessageToActiveChannel(message: Message, toFront: boolean = false) {
      // Add message to active channel
      console.log('channelStore.activeChannel.name', channelStore.activeChannel.name);
      this.addMessage(channelStore.activeChannel.name, message, toFront);
    },
    clearMessages(channel: string) {
      this.messages[channel] = [];
    },
    fetchMessages(channelName: string, limit: number, cursor: (number | null), toFront: boolean = false) {
      for (let i = 0; i < limit; i++) {
        const byMe = Math.random() > 0.8;
        const taggedMe = Math.random() > 0.8 && !byMe;
        this.addMessage(channelName,{
          id: Math.floor(Math.random() * 1000),
          username: 'user' + Math.floor(Math.random() * 10),
          content: (taggedMe ? `@${userStore.getUsername}  ` : '') + generateMessage(),
          byMe: byMe,
          taggedMe: taggedMe
        }, toFront);
      }
    },
    fetchActiveChannelMessages(limit: number, cursor: (number | null)) {
      this.fetchMessages(channelStore.activeChannel.name, limit, cursor);
    },
  },

  getters: {
    messages: (state) => (channel: string) => {
      // If messages for channel don't exist, return empty array
      if (!state.messages[channel]) {
        state.messages[channel] = [];
        // Fetch messages for channel
        this.fetchMessages(channel, 10, null);
      }
      return state.messages[channel];
    },
    activeChannelMessages: (state) => {
      return state.messages[channelStore.activeChannel.name] || [];
    }
  },



});
