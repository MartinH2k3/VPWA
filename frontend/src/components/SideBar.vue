<script setup lang="ts">

import { computed } from 'vue';
import { useChannelStore } from 'stores/channelStore';
// import { useRouter } from 'vue-router';

const channelStore = useChannelStore();
const channels = computed(()=>channelStore.channels);
// const router = useRouter();

interface Channel {
  id: number
  name: string
  adminId: number
  private: boolean
  highlighted: boolean
}

function goToChannel(channel: Channel) {
  //router.push(`/c/${channel.name}`);
  channelStore.setActiveChannel(channel);
}
</script>

<template>
  <q-list>
    <q-item-label
      header
    >
      Channels
    </q-item-label>
    <q-item
      clickable
      v-for="channel in channels"
      :key="channel.id"
      @click="goToChannel(channel)"
    > <q-item-section>
      {{ channel.name }}
    </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped>

</style>
