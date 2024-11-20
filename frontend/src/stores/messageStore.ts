import { defineStore } from 'pinia';
import { api } from 'boot/api';

import { useChannelStore } from './channelStore';
import { useUserStore, User } from './userStore';
import { useSocketStore } from './socketStore';
import { useQuasar } from 'quasar';
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
    clear() {
      this.messages = {};
      this.channelMessagesInfo = {};
    },
    makeMessage(username: string, messageContent: string, messageId: number): Message {
      const userStore = useUserStore();
      return {
        id: messageId,
        username: username,
        content: messageContent,
        byMe: username === userStore.user.username,
        taggedMe: messageContent.includes(`@${userStore.getUsername}`)
      }
    },
    addMessage(channelName: string, message: Message, toFront: boolean) {
      if (!this.messages[channelName]) {
        this.messages[channelName] = [];
      }
      if (toFront) {
        // If the scroll is at the bottom, scroll to the bottom
        const htmlEl = window.document.querySelector('html')
        if (htmlEl && htmlEl.scrollTop + htmlEl.clientHeight >= htmlEl.scrollHeight - 10) {
          setTimeout(() => {
            htmlEl.scrollTop = htmlEl.scrollHeight
          }, 0);
        }
        this.messages[channelName].unshift(message);

      } else {
        this.messages[channelName].push(message);
      }
    },
    addMessageToActiveChannel(message: Message, toFront: boolean = false) {
      const channelStore = useChannelStore();
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
      this.channelMessagesInfo[channel] = { limit: 10, cursor: 0, reachedTop: false };
    },
    clearActiveChannelMessages() {
      this.clearMessages(useChannelStore().activeChannel.name);
    },
    sendMessage(channelName: string, message: string) {
      const socketStore = useSocketStore();
      const userStore = useUserStore();
      // Send message to server
      console.log('Sending message', message);

      socketStore.sendMessage('message', {
        channelName: channelName,
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
      const userStore = useUserStore();
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

        this.addMessage(channelName, {
          id: message.id,
          username: message.user.username,
          content: message.content,
          byMe: message.userId === userStore.user.id,
          taggedMe: message.content.includes(`@${userStore.getUsername}`)
        }, toFront);
      }
    },
    async fetchActiveChannelMessages(limit: number, cursor: (number | null)) {
      const channelStore = useChannelStore();
      if (!channelStore?.activeChannel?.name) {
        return;
      }
      cursor = cursor || (this.channelMessagesInfo[channelStore.activeChannel.name]?.cursor ?? 0);
      await this.fetchMessages(channelStore.activeChannel.name, limit, cursor);
    },
  },

  getters: {
    activeChannelMessages: (state) => {
      const channelStore = useChannelStore();
      return state.messages[channelStore.activeChannel.name] || [];
    },
    activeChannelMessagesInfo: (state) => {
      const channelStore = useChannelStore();
      return state.channelMessagesInfo[channelStore.activeChannel.name] || { limit: 10, cursor: 0, reachedTop: false };
    }
  },
});
