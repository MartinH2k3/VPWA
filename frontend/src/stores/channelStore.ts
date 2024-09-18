import { defineStore } from 'pinia';

interface Channel {
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
      // TODO implement the join channel functionality
    },
    setActiveChannel(channel: Channel) {
      // TODO implement the setActiveChannel functionality; one of the channels from channels is set as active channel
    },
    // better to remove the channel from the store, than to fetch all channels again
    removeChannel(channelId: number){
      // TODO implement the removeChannel functionality
    }
  },
});
