<template>
  <q-list>
    <q-item-label header>
      Channels
    </q-item-label>
    <hr style="width:90%; opacity:0.5">

    <q-item v-if="channels.length === 0">
      <q-item-section>
        <q-item-label>
          No channels available
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item v-else
      clickable
      v-for="channel in channels"
      :key="channel.id"
      @click="goToChannel(channel)"
      :class="{active: channel.id===activeChannel.id, highlighted: channel.highlighted}"
    >
      <div class="row flex-row flex-nowrap" style="width: 100%;">
        <span class="q-mr-auto flex items-center">
          {{ channel.name }}</span>
          <q-btn
        flat
        round
        dense
        icon="close"
        class="q-ml-sm"
        @click="leaveChannel(channel.name )"
        />

      </div>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useChannelStore, Channel } from 'stores/channelStore';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'SideBar',
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    return {router, $q};
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
      this.channelStore.setActiveChannel(channel.name);
    },

    async leaveChannel(channelName: string) {

      // Make a confirm alert
      let confirm : boolean =  window.confirm('Do you really wanna leave ' + channelName + '?');
      if(!confirm) return;

      await this.channelStore.leaveChannel(channelName);
      // Notify
      this.$q.notify({
        message: 'You have left ' + channelName,
        color: 'negative',
        position: 'bottom',
        timeout: 2000
      });
    }

  },
  mounted() {
  }
});

</script>

<style scoped lang="sass">
@import 'src/css/quasar.variables'
.active
  background-color: $primary
  color: white

.highlighted
  background-color: $secondary
  color: white
</style>
