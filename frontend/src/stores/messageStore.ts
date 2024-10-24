import { defineStore } from 'pinia';
import { api } from 'boot/api';

import { useChannelStore } from './channelStore';
import { useUserStore } from './userStore';
import { useSocketStore } from './socketStore';
import { useQuasar } from 'quasar';
const channelStore = useChannelStore();
const userStore = useUserStore();
const socketStore = useSocketStore();
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
    channelMessagesInfo: {} as Record<string, { limit: number, cursor: number, reachedTop: boolean }>,
    fetchingMessages: false,
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
      if (!channelStore.activeChannel.name) {
        useQuasar().notify({
          message: 'Please select a channel to send a message',
          color: 'warning'
        });
        return;
      }
      this.addMessage(channelStore.activeChannel.name, message, toFront);
    },
    clearMessages(channel: string) {
      this.messages[channel] = [];
      delete this.messages[channel];
    },
    clearActiveChannelMessages() {
      this.clearMessages(channelStore.activeChannel.name);
    },
    sendMessage(channelName: string, message: string) {

      // Send message to server
      console.log('Sending message', message);

      socketStore.sendMessage('message', {
        channel: channelName,
        message: message
      });

      // Add message to local store
      this.addMessage(channelName, {
        id: Math.floor(Math.random() * 1000),
        username: userStore.getUsername,
        content: message,
        byMe: true,
        taggedMe: false
      }, true);
    },
    async fetchMessages(channelName: string, limit: number = 10, cursor: number = 0, toFront: boolean = false) {

      if (this.fetchingMessages || this.channelMessagesInfo[channelName]?.reachedTop)
        return

      this.fetchingMessages = true;

      if (!this.channelMessagesInfo[channelName]) {
        this.channelMessagesInfo[channelName] = {
          limit: limit,
          cursor: cursor,
          reachedTop: false
        }
      }

      // Fetch messages from server
      console.log('Fetching messages for', channelName);
      let response
      try {
        response = await api.get(`/c/${channelName}/messages`, {
          params: {
            limit: limit,
            cursor: cursor
          }
        });

      } catch (error) {
        console.error('Error fetching messages', error);
        this.fetchingMessages = false;
        return;
      }

      this.fetchingMessages = false;
      console.log('Fetched messages', response.data);

      this.channelMessagesInfo[channelName].cursor += limit;

      // If response data was smalelr then limit, we reached the top
      if (response.data.length < limit) {
        this.channelMessagesInfo[channelName].reachedTop = true;
      }


      const messages = response.data;
      if (toFront) {
        messages.reverse();
      }

      // Add messages to local store
      for (const message of messages) {
        console.log('Adding message', message);

        this.addMessage(channelName, {
          id: message.id,
          username: message.username,
          content: message.content,
          byMe: message.userId === userStore.user.id,
          taggedMe: message.content.includes(`@${userStore.getUsername}`)
        }, toFront);
      }




      // for (let i = 0; i < limit; i++) {
      //   const byMe = Math.random() > 0.8;
      //   const taggedMe = Math.random() > 0.8 && !byMe;
      //   this.addMessage(channelName, {
      //     id: Math.floor(Math.random() * 1000),
      //     username: 'user' + Math.floor(Math.random() * 10),
      //     content: (taggedMe ? `@${userStore.getUsername}  ` : '') + generateMessage(),
      //     byMe: byMe,
      //     taggedMe: taggedMe
      //   }, toFront);
      // }
    },
    async fetchActiveChannelMessages(limit: number, cursor: (number | null)) {
      if (!channelStore?.activeChannel?.name) {
        return;
      }
      cursor = cursor || (this.channelMessagesInfo[channelStore.activeChannel.name]?.cursor ?? 0);
      await this.fetchMessages(channelStore.activeChannel.name, limit, cursor);
    },
  },

  getters: {
    // messages: (state) => (channel: string) => {
    //   // If messages for channel don't exist, return empty array
    //   if (!state.messages[channel]) {
    //     state.messages[channel] = [];
    //     // Fetch messages for channel
    //     this.fetchMessages(channel, 10, null);
    //   }
    //   return state.messages[channel];
    // },
    activeChannelMessages: (state) => {
      return state.messages[channelStore.activeChannel.name] || [];
    },
    activeChannelMessagesInfo: (state) => {
      return state.channelMessagesInfo[channelStore.activeChannel.name] || { limit: 10, cursor: 0, reachedTop: false };
    }
  },



});
