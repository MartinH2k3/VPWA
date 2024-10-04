<template>
  <q-list>
    <q-item-label header>
      Channels
    </q-item-label>
    <hr style="width:90%; opacity:0.5">
    <q-item clickable v-for="channel in channels" :key="channel.id" @click="goToChannel(channel)"> <q-item-section>
        {{ channel.name }}
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useChannelStore } from 'stores/channelStore';
import { useRouter } from 'vue-router';

interface Channel {
  id: number
  name: string
  adminId: number
  private: boolean
  highlighted: boolean
}


export default defineComponent({
  name: 'SideBar',
  setup() {
    const router = useRouter();
    return {router};
  },
  data() {
    return {
      channelStore: useChannelStore(),
    };
  },
  computed: {
    channels() {
      return this.channelStore.channels;
    }
  },
  methods: {
    goToChannel(channel: Channel) {
      // this.router.push(`/c/${channel.name}`);
      this.channelStore.setActiveChannel(channel);
    }
  }
});

</script>

<style scoped lang="sass">
@import 'src/css/quasar.variables'
.q-item:hover
  background-color: $accent
  cursor: pointer
</style>
