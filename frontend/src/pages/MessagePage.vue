<template>
  <q-page padding>
    <q-infinite-scroll :offset="40" @load="paginateMessages" :initial-index="0" reverse>
      <q-list>
        <q-item v-for="message in messages.toReversed()" :key="message.id">
          <q-item-section :class="['msg', message.byMe ? 'myMsg' : '', message.taggedMe ? 'taggedMsg' : '']">
            <q-item-label>
              {{ message.byMe ? "You" : message.username }}
            </q-item-label>
            <div class="msgText">{{ message.content }}</div>
          </q-item-section>
        </q-item>
      </q-list>
      <template #loading>
        <q-spinner class="row justify-center" />
      </template>
    </q-infinite-scroll>


  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

interface Message {
  id: number;
  username: string;
  content: string;
  byMe: boolean;
  taggedMe: boolean;
}

export default defineComponent({
  data() {
    return {
      messages: [] as Message[],
      limit: 10,
      cursor: null as number | null
    };
  },
  methods: {
    paginateMessages(index: number, done: () => void) {
      // TODO implement for real, instead of mock function
      // add 10 random messages
      for (let i = 0; i < 10; i++) {
        this.messages.push({
          id: Math.floor(Math.random() * 1000),
          username: 'user' + Math.floor(Math.random() * 10),
          content: 'message' + Math.floor(Math.random() * 100),
          byMe: Math.random() > 0.8,
          taggedMe: Math.random() > 0.9
        });
      }
      done();
    }
  }
});
</script>

<style scoped lang="scss">
.msg {
  padding: 0.3rem 0.8rem;
  align-items: flex-start;
}

.myMsg {
  align-items: flex-end;
}

.taggedMsg {
  border-left: 2px solid;
  border-image: linear-gradient(180deg, #610099, #002599) 1;
}

.msgText {
  max-width: 60%;
  padding: 0.5rem 1rem;
  margin-top: 0.25rem;
  border-radius: 1rem;
  overflow-wrap: break-word;
  background-color: #61009944;
}

.myMsg .msgText {
  background-color: #00259944;
}

@media (max-width: 600px) {
  .msgText {
    max-width: 90%;
  }
}
</style>
