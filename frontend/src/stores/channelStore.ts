import { defineStore } from 'pinia';
import { api } from 'boot/api';
import { useQuasar } from 'quasar';

export interface Channel {
  id: number
  name: string
  adminId: number
  private: boolean
  highlighted?: boolean
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
        this.activeChannel = channel
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

    async leaveChannel(channelName:string) {
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
        await api.post(`/c/${this.activeChannel.name}/cancel`, { username })
      } catch (e) {
        console.error(e);
      }
    },
    setActiveChannel(chanelName: string) {
      const channel = this.activeChannel = this.channels.find(c => c.name === chanelName) || {} as Channel
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
