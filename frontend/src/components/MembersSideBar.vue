<template>
  <q-list>
    <q-item-label header>
      Members
    </q-item-label>
    <hr style="width:90%; opacity:0.5">

    <q-item v-if="members?.length === 0">
      <q-item-section>
        <q-item-label>
          No channels available
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-item v-else v-for="member in members" :key="member.id"
      :class="{ active: userStore.user.id === member.id }">
      <div class="row flex-row flex-nowrap" style="width: 100%;">
        <q-avatar :icon="member.id == activeChannel.adminId ? 'star' : 'person'" class="q-mr-sm" />
        <span class="q-mr-auto flex items-center">
          {{ member.username }}
        </span>
      </div>
    </q-item>

  </q-list>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useChannelStore, Channel } from 'stores/channelStore';
import { useUserStore } from 'stores/userStore';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'MembersSideBar',
  setup() {
    const router = useRouter();
    const $q = useQuasar();
    return { router, $q };
  },
  data() {
    return {
      channelStore: useChannelStore(),
      userStore: useUserStore(),
    };
  },
  computed: {
    members() {
      return this.channelStore?.activeChannel?.members;
    },
    activeChannel() {
      return this.channelStore.activeChannel;
    }
  },
  methods: {

  },
  // async mounted() {
  //   await this.channelStore.fetchChannels();
  //   this.channelStore.setActiveChannel(this.channelStore.channels[0].name);
  // }
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
