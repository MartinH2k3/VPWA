import { defineStore } from 'pinia';

export interface Message {
  id: number;
  username: string;
  content: string;
  byMe: boolean;
  taggedMe: boolean;
}

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: [] as Message[],
  }),
  actions: {
    addMessage(message: Message) {
      this.messages.unshift(message);
    },
  },
});
