import { defineStore } from 'pinia';
import { api } from 'boot/api';
import { useMessageStore } from './messageStore';
import { useSocketStore } from './socketStore';
import { useQuasar, Notify } from 'quasar';
import { useUserStore } from 'stores/userStore';

const $q = useQuasar()

export interface ChannelMember {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  status: 'online' | 'offline' | 'away';
}

export interface CurrentlyTyping {
  username: string;
  content: string;
  timeoutId?: NodeJS.Timeout;
}

export interface Channel {
  id: number
  name: string
  adminId: number
  isPrivate: boolean
  highlighted?: boolean
  members: ChannelMember[]
  currentlyTyping: CurrentlyTyping[]
}

export const useChannelStore = defineStore('channel', {
  state: () => ({
    // list of joined channels
    channels: [] as Channel[],
    // channel user is currently viewing
    activeChannel: {} as Channel,
  }),
  getters: {
    getChannels: (state) => {
      return state.channels
    }

  },
  actions: {
    clear() {
      this.channels = []
      this.activeChannel = {} as Channel
    },
    findUserInChannel(channelName: string, username: string) {
      const channel = this.channels.find(c => c.name === channelName)
      if (!channel) {
        return null
      }
      return channel.members.find(m => m.username === username)
    },
    getChannelByName(channelName: string) {
      return this.channels.find(c => c.name === channelName)
    },

    updateCurrentlyTyping(channelName: string, username: string, content: string) {
      // Find the currentlyTyping entry in the active channel
      const channel = this.getChannelByName(channelName);
      if (!channel) return;
      let currentlyTypingEntry = channel.currentlyTyping.find((entry) => entry.username === username);

      // If the scroll is at the bottom, scroll to the bottom
      const htmlEl = window.document.querySelector('html')
      if (htmlEl && htmlEl.scrollTop + htmlEl.clientHeight >= htmlEl.scrollHeight - 10) {
        setTimeout(() => {
          htmlEl.scrollTop = htmlEl.scrollHeight
        }, 0);
      }

      // Set up a 5 second timeout to remove the draft for the user in the channel
      if (currentlyTypingEntry?.timeoutId) {
        clearTimeout(currentlyTypingEntry.timeoutId);
      }


      if (currentlyTypingEntry)
        // Update the content
        currentlyTypingEntry.content = content;
      else
        // Add a new entry
        channel.currentlyTyping.push({ username: username, content: content });

      currentlyTypingEntry = channel.currentlyTyping[channel.currentlyTyping.length - 1];
      currentlyTypingEntry.timeoutId = setTimeout(() => {
        this.removeCurrentlyTyping(channelName, username);
      }, 7000);

    },

    removeCurrentlyTyping(channelName: string, username: string) {
      const channel = this.getChannelByName(channelName);
      if (!channel) return;
      const currentlyTypingEntryIndex = channel.currentlyTyping.findIndex((entry: CurrentlyTyping) => entry.username === username);
      if (currentlyTypingEntryIndex !== -1) {
        // Remove the entry
        channel.currentlyTyping.splice(currentlyTypingEntryIndex, 1);
      }
    },

    async sendTyping(content: string) {
      const socketStore = useSocketStore();
      if (!this.activeChannel.name) {
        console.error('No active channel to start typing');
        return
      }
      socketStore.sendMessage('typing', { channelName: this.activeChannel.name, content })
    },

    async stopTyping() {
      const socketStore = useSocketStore();
      if (!this.activeChannel.name) {
        console.error('No active channel to stop typing');
        return
      }
      socketStore.sendMessage('stop_typing', { channelName: this.activeChannel.name })
    },

    async fetchChannels() {
      try {
        this.channels = (await api.get('/c')).data
        for (const channel of this.channels) {
          channel.currentlyTyping = []
        }
      } catch (e) {
        console.error(e);
      }
    },
    // 4 following functions return strings to use with Quasar's notify
    async joinChannel(channelName: string, isPrivate: boolean): Promise<string> {

      // If that channel is already in the list, set it as active channel
      const channel = this.channels.find(c => c.name === channelName)
      if (channel) {
        await this.setActiveChannel(channelName)
        return 'Switching to ' + channelName
      }

      try {
        const channel: Channel = (await api.post('/c/join', {
          channelName,
          isPrivate
        })).data
        channel.currentlyTyping = channel.currentlyTyping || [];
        channel.members = channel.members || [];
        this.channels.unshift(channel)
        await this.setActiveChannel(channelName)
        return 'Joined ' + channelName
      } catch (e: any) {
        console.error(e);
        Notify.create({
          message: e?.response?.data?.message ?? 'An unexpected error occurred.',
          type: 'negative'
        })
        return e?.response?.data?.message || 'An unexpected error occurred.'
      }
    },
    async leaveActiveChannel(): Promise<string> {
      if (!this.activeChannel.name) {
        console.error('No active channel to leave');
        return 'No active channel to leave'
      }
      return await this.leaveChannel(this.activeChannel.name);
    },

    async leaveChannel(channelName: string): Promise<string> {
      try {
        await api.post(`/c/${this.activeChannel.name}/cancel`)
        // remove channel based on name from store
        this.removeChannel(channelName)
        return 'Left ' + channelName
      } catch (e: any) {
        console.error(e);
        return e?.response?.data?.message || 'An unexpected error occurred.'
      }
    },
    async kickUser(username: string): Promise<string> {
      try {
        await api.post(`/c/${this.activeChannel.name}/kick`, { username })
        return 'Voted to kick ' + username
      } catch (e: any) {
        console.error(e);
        return e?.response?.data?.message || 'An unexpected error occurred.'
      }
    },
    async revokeUser(username: string): Promise<string> {
      // only works if the logged in user is admin
      if (this.activeChannel.adminId !== useUserStore().user.id) {
        return 'Only the admin can revoke a user membership'
      }
      return await this.kickUser(username)
    },
    async inviteUser(username: string): Promise<string> {
      try {
        await api.post(`/c/${this.activeChannel.name}/invite`, { username })
        return 'Invited ' + username
      } catch (e: any) {
        console.error(e);
        return e?.response?.data?.message || 'An unexpected error occurred.'
      }
    },
    updateMembers(channelName: string, members: ChannelMember[]) {
      const channel = this.channels.find(c => c.name === channelName)
      if (channel) {
        channel.members = members
      }
    },
    async fetchChannelMembers(channelName: string) {
      try {
        const members = (await api.get(`/c/${channelName}/members`)).data
        const channel = this.channels.find(c => c.name === channelName)
        if (channel) {
          channel.members = members
        }
      } catch (e) {
        console.error(e);
      }
    },
    getActiveChannelMembers() {
      if (!this.activeChannel.name) {
        return 'No active channel'
      }
      return this.activeChannel.members
    },
    async setActiveChannel(chanelName: string) {
      const socketStore = useSocketStore();
      const messageStore = useMessageStore();
      const channel = this.channels.find(c => c.name === chanelName) || {} as Channel

      // Fetch members of the channel
      await this.fetchChannelMembers(chanelName)

      // Set an interval to notify the server that the channel is active only if the websocket is not connected
      if (socketStore.isAuthenticated) {
        socketStore.sendMessage('update_active_channel', { channelName: chanelName });
      }

      this.activeChannel = channel

      messageStore.clearActiveChannelMessages();
      // Fetch messages of the channel
      await messageStore.fetchActiveChannelMessages(10, 0);

      // if the the channel has highlighted property, remove it
      if (channel.highlighted) {
        channel.highlighted = false
      }
      setTimeout(() => {
        // Scroll 'html' to bottom
        window.scrollTo(0, document.body.scrollHeight)
      }, 0)
    },
    addInvitedChannel(channel: Channel) {
      channel.highlighted = true
      channel.currentlyTyping = []
      this.channels.unshift(channel)
    },
    // better to remove the channel from the store, than to fetch all channels again
    removeChannel(channelName: string) {
      const messageStore = useMessageStore();
      const index = this.channels.findIndex(c => c.name === channelName)
      if (index !== -1) {
        this.channels.splice(index, 1)
      }
      this.activeChannel = {} as Channel
      // Clear the messages of the channel
      messageStore.clearMessages(channelName)
    }
  },
});
