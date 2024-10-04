import { defineStore } from 'pinia';
import { api } from 'boot/api';

export interface Channel {
  id: number
  name: string
  adminId: number
  private: boolean
  highlighted: boolean
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
        highlighted: false
      },
      {
        id: 2,
        name: 'random',
        adminId: 2,
        private: false,
        highlighted: false
      },
      {
        id: 3,
        name: 'secret',
        adminId: 3,
        private: true,
        highlighted: false
      },
      {
        id: 4,
        name: 'private',
        adminId: 4,
        private: true,
        highlighted: false
      },
      {
        id: 5,
        name: 'highlighted',
        adminId: 5,
        private: false,
        highlighted: true
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
        this.removeChannel(this.channels.find(c => c.name === channelName))
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
    setActiveChannel(channel: Channel) {
      this.activeChannel = channel
    },
    // better to remove the channel from the store, than to fetch all channels again
    removeChannel(channel: Channel | undefined){
      this.channels.splice(this.channels.indexOf(channel), 1)
    }
  },
});
