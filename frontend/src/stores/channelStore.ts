import { defineStore } from 'pinia';
import { api } from 'boot/api';
import { useSocketStore } from './socketStore';

let socketStore = useSocketStore()

interface ChannelMember {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  status: 'online' | 'offline' | 'do not disturb';
}

export interface Channel {
  id: number
  name: string
  adminId: number
  private: boolean
  highlighted?: boolean,
  members: ChannelMember[],
  currentlyTyping: string[]
}

export const useChannelStore = defineStore('channel', {
  state: () => ({
    // list of joined channels
    channels: [] as Channel[],
    // channel user is currently viewing
    activeChannel: {} as Channel
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
    async fetchChannels() {
      try {
        this.channels = (await api.get('/c')).data
      } catch (e) {
        console.error(e);
      }
    },
    async joinChannel(channelName: string, isPrivate: boolean) {

      // If that channel is already in the list, set it as active channel
      const channel = this.channels.find(c => c.name === channelName)
      if (channel) {
        await this.setActiveChannel(channelName)
        return
      }

      try {
        const channel = (await api.post('/c/join', {
          channelName,
          private: isPrivate
        })).data
        this.activeChannel = channel
        this.channels.unshift(channel)
      } catch (e) {
        console.error(e);
      }
    },
    async leaveActiveChannel() {
      if (!this.activeChannel.name) {
        console.error('No active channel to leave');
      }
      this.leaveChannel(this.activeChannel.name);
    },

    async leaveChannel(channelName: string) {
      try {
        await api.post(`/c/${this.activeChannel.name}/cancel`)
        // remove channel based on name from store
        this.removeChannel(channelName)
        this.activeChannel = {} as Channel
      } catch (e) {
        console.error(e);
      }
    },
    async kickUser(username: string) {
      try {
        await api.post(`/c/${this.activeChannel.name}/kick`, { username })
      } catch (e) {
        console.error(e);
      }
    },
    async inviteUser(username: string) {
      try {
        await api.post(`/c/${this.activeChannel.name}/invite`, { username })
      } catch (e) {
        console.error(e);
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
    async setActiveChannel(chanelName: string) {
      const channel = this.channels.find(c => c.name === chanelName) || {} as Channel

      // Fetch members of the channel
      await this.fetchChannelMembers(chanelName)

      // Set an interval to notify the server that the channel is active only if the websocket is not connected
      if (socketStore.isAuthenticated) {
        socketStore.sendMessage('update_active_channel', { channelName: chanelName });
      }

      this.activeChannel = channel


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
      this.channels.unshift(channel)
    },
    // better to remove the channel from the store, than to fetch all channels again
    removeChannel(channelName: string) {
      const index = this.channels.findIndex(c => c.name === channelName)
      if (index !== -1) {
        this.channels.splice(index, 1)
      }
    }
  },
});
