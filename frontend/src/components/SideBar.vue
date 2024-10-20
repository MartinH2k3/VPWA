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
      :class="{active: channel.id===activeChannel.id, highlighted: channel.highlighted}"
    >
      <q-item-section >
        <q-item class="row flex-row flex-nowrap" >
        <span class="q-mr-auto flex items-center">{{ channel.name }}</span>
        <q-button-dropdown @click.stop>
          <q-btn
            flat
            round
            dense
            icon="more_vert"
            class="q-ml-sm"

          />
          <q-menu anchor="bottom right" self="bottom left">
            <q-item clickable @click.exact.prevent.stop="leaveChannel(channel.name)">
              <q-item-section >Leave</q-item-section>
            </q-item>
          </q-menu>
        </q-button-dropdown>
      </q-item>

      </q-item-section>
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
      this.channelStore.setActiveChannel(channel);
    },

    async leaveChannel(channelName: string) {
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
    setInterval(() => {
      const channelName = Math.random().toString(36).substring(7);
      this.channelStore.addInvitedChannel({
        id: Math.random() * Number.MAX_SAFE_INTEGER,
        name: channelName,
        adminId: 1,
        private: false, // or set this to `isPrivate` if available
        highlighted: true
      });
      this.$q.notify({'message':'You have been invited to channel ' + channelName})
    }, 30000); // every 30 seconds
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
