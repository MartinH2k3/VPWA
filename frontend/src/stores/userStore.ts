import { defineStore } from 'pinia'

interface User {
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
    status: 'online' as ('online' | 'offline' | 'do not disturb'),
  }),
  actions: {
    setActiveUser(user: User) {
      this.user = user
    },
    removeActiveUser() {
      this.user = {} as User
    },
    setStatus(status: 'online' | 'offline' | 'do not disturb') {
      this.status = status
    },
  },
  getters: {
    getUsername: (state) =>{
      return state.user.username || ''
    },
  },
  persist: {
    key: 'userStore',
  }
})
