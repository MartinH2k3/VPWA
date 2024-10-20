import { defineStore } from 'pinia';
import { api } from 'boot/api';
import { useQuasar } from 'quasar';

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
    channels: [
      {
        id: 1,
        name: 'general',
        adminId: 1,
        private: false,
      },
      {
        id: 2,
        name: 'random',
        adminId: 1,
        private: false,
      },
      {
        id: 3,
        name: 'secret',
        adminId: 1,
        private: true,
      }
    ] as Channel[],
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
      try {
        // Generate a test channel for now
        const channel = {
          id: Math.random() * Number.MAX_SAFE_INTEGER,
          name: channelName,
          adminId: 1,
          private: false,
        }
        // const channel = (await api.post('/c/join', {
        //   channelName,
        //   private: isPrivate
        // })).data
        this.activeChannel = channel
        this.channels.unshift(channel)
      } catch (e) {
        console.error(e);
      }
    },
    async leaveChannel() {
      if (!this.activeChannel.name) {
        console.error('No active channel to leave');
      }
      try {
        // await api.post(`/c/${this.activeChannel.name}/leave`)
        // remove channel based on name from store
        this.removeChannel(this.activeChannel.name)
        this.activeChannel = {}
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
