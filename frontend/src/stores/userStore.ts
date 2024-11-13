import { defineStore } from 'pinia'
import { useSocketStore } from './socketStore'


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
    status: 'online' as ('online' | 'offline' | 'away'),
    socketStore: useSocketStore(),

  }),
  actions: {
    setActiveUser(user: User) {
      this.user = user
    },
    removeActiveUser() {
      this.user = {} as User
    },
    setStatus(status: 'online' | 'offline' | 'away') {
      this.socketStore.updateStatus(status);
      this.status = status
    },
    setOnlyMentions(onlyMentions: boolean) {
      this.socketStore.updateOnlyMentions(onlyMentions);
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
