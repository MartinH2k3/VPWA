<template>
  <q-list>
    <q-item-label header>
      Channels
    </q-item-label>
    <hr style="width:90%; opacity:0.5">
    <q-item
      clickable
      v-for="channel in channels"
      :key="channel.id"
      @click="goToChannel(channel)"
      :class="{highlighted: channel.id===activeChannel.id}"
    >
      <q-item-section>
        {{ channel.name }}
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useChannelStore, Channel } from 'stores/channelStore';
import { useRouter } from 'vue-router';

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
    },
    activeChannel() {
      return this.channelStore.activeChannel;
    }
  },
  methods: {
    goToChannel(channel: Channel) {
      // this.router.push(`/c/${channel.name}`);
      console.log('goToChannel', channel);
      this.channelStore.setActiveChannel(channel);
      console.log('activeChannel', this.channelStore.activeChannel);
    }
  }
});

</script>

<style scoped lang="sass">
@import 'src/css/quasar.variables'
.highlighted
  background-color: $primary
  color: white
</style>
