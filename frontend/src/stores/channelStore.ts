import { defineStore } from 'pinia';
import { api } from 'boot/api';

export interface Channel {
  id: number
  name: string
  adminId: number
  private: boolean
  highlighted?: boolean
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
    async fetchChannels() {
      // TODO implement the fetchChannels functionality
    },
    async joinChannel(channelName: string, isPrivate: boolean) {

      // Generate a test channel
      this.addChannel({
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        name: channelName,
        adminId: 1,
        private: false,
      })
      return;
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
    async leaveChannel() {
      try {
        await api.post(`/c/${this.activeChannel.name}/leave`)
        // remove channel based on name from store
        this.removeChannel(this.activeChannel.name)
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
        await api.post(`/c/${this.activeChannel.name}/cancel`, { username })
      } catch (e) {
        console.error(e);
      }
    },
    setActiveChannel(channel: Channel) {
      this.activeChannel = channel
    },
    addChannel(channel: Channel) {
      channel.highlighted = true
      this.channels.unshift(channel)
    },
    // better to remove the channel from the store, than to fetch all channels again
    removeChannel(channelName: string) {
      const index = this.channels.findIndex(c => c.name === channelName)
      if (index !== -1) {
        this.channels.splice(index, 1)
      }
    },
    async test() {
      await api.post('/ws')
    }
  },
});
