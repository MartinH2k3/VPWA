<script setup lang="ts">

import { ref, Ref } from 'vue';

const notifications: Ref<Notification[]> = ref([])
const scrollTargetRef = ref()

// const $q = useQuasar() // will be used to stop notifications if not $q.appVisible
interface Channel {
  id: number;
  name: string;
}

interface Notification {
  id: number;
  type: string;
  channel: Channel;
  snippet: string;
  read: boolean;
  senderName: string;
  createdAt: string;
}

async function paginateNotifications(index: number, done: () => void) {
  // TODO implement for real, instead of mock function
  for (let i = 0; i < 10; i++) {
    notifications.value.push({
      id: Math.floor(Math.random() * 1000),
      type: 'mention',
      channel: {
        id: Math.floor(Math.random() * 1000),
        name: 'channel' + Math.floor(Math.random() * 100)
      },
      snippet: 'snippet' + Math.floor(Math.random() * 100),
      read: Math.random() > 0.5,
      senderName: 'sender' + Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString()
    })
  }
  done()
}

</script>

<template>
  <div ref="scrollTargetRef" style="max-height: 150px; overflow: auto">
    <q-infinite-scroll
      :offset="10"
      :scroll-target="scrollTargetRef"
      @load="paginateNotifications"
    >
      <q-list>
        <q-item v-for="notification in notifications" :key="notification.id">
          <q-item-section>
            <q-item-label>{{notification.channel.name}}</q-item-label>
            <span v-if="notification.senderName">{{notification.senderName}}</span>
            <div>{{notification.snippet}}</div>
          </q-item-section>
        </q-item>
      </q-list>
      <template #loading>
        <q-spinner class="row justify-center"/>
      </template>
    </q-infinite-scroll>
  </div>
</template>

<style scoped>

</style>
