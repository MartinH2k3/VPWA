import { defineStore } from 'pinia'
import { useSocketStore } from './socketStore'
import { useChannelStore } from './channelStore'


export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  //...
}


export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      id: 1,
      username: 'Bob',
      email: 'bob@bob.bob',
      firstName: 'Bob',
      lastName: 'Bobson',
    } as User,
    onlyMentions: false,
    status: 'online' as ('online' | 'offline' | 'away'),

  }),
  actions: {
    setActiveUser(user: User) {
      this.user = user
    },
    removeActiveUser() {
      this.user = {} as User
    },
    setStatus(status: 'online' | 'offline' | 'away') {
      const socketStore = useSocketStore();
      socketStore.updateStatus(status);
      // Update the status in the active channel
      const userInChannel = useChannelStore().findUserInChannel(useChannelStore().activeChannel.name, this.user.username);
      userInChannel && (userInChannel.status = status);
      this.status = status
    },
    setOnlyMentions(onlyMentions: boolean) {
      const socketStore = useSocketStore();
      socketStore.updateOnlyMentions(onlyMentions);
      this.onlyMentions = onlyMentions
    }
  },
  getters: {
    getUsername: (state) => {
      return state.user.username || ''
    },
  },

  persist: {
    key: 'userStore',
  }
})
