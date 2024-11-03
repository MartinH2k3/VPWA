<template>
  <q-layout view="lHr LpR lFf ">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Frens
        </q-toolbar-title>
        <q-btn-dropdown class="text-right" :label="userStore.getUsername">
          <div class="row no-wrap q-pa-md">
            <div class="column justify-around">
              <q-btn outline rounded class="q-mr-md" @click="logout">
                Logout
              </q-btn>
              <q-toggle v-model="onlyMentions" checked-icon="check" unchecked-icon="clear" label="Only mentions"
                left-label />
            </div>
            <q-separator vertical inset class="text-white" />
            <div class="column justify-around">
              <q-radio v-model="status" val="online" label="online"
                @update:model-value="userStore.setStatus('online')" />
              <q-radio v-model="status" val="away" label="away" @update:model-value="userStore.setStatus('away')" />
              <q-radio v-model="status" val="offline" label="offline"
                @update:model-value="userStore.setStatus('offline')" />
            </div>
          </div>
        </q-btn-dropdown>
        <q-btn flat dense round icon="group" aria-label="Members" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <SideBar />
    </q-drawer>
    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <MembersSideBar />
    </q-drawer>
    <q-page-container>
      <message-page />
    </q-page-container>
    <q-footer class="bg-white">
      <message-field />
    </q-footer>


  </q-layout>
</template>

<script lang="ts">
import MessageField from 'components/MessageField.vue';
import SideBar from 'components/SideBar.vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'stores/userStore';
import { useSocketStore } from 'stores/socketStore';
import MessagePage from 'pages/MessagePage.vue';
// import NotificationWindow from 'components/NotificationWindow.vue';
import { api } from 'boot/api';
import { useChannelStore } from 'stores/channelStore';
import { useMessageStore } from 'stores/messageStore';
import MembersSideBar from 'src/components/MembersSideBar.vue';

export default {
  name: 'MainLayout',
  components: {
    MessageField,
    SideBar,
    MessagePage,
    MembersSideBar,
    // NotificationWindow
  },
  data() {
    return {
      leftDrawerOpen: false,
      rightDrawerOpen: false,
      status: 'online',
      onlyMentions: false,
    };
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const socketStore = useSocketStore();
    const channelStore = useChannelStore();
    const messageStore = useMessageStore();
    return { router, userStore, socketStore, channelStore, messageStore };
  },
  mounted() {
    // connect through socket store
    this.socketStore.connect()
    if (this.channelStore.channels.length > 0)
      this.channelStore.setActiveChannel(this.channelStore.channels[0].name)

  },
  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    toggleRightDrawer() {
      this.rightDrawerOpen = !this.rightDrawerOpen;
    },
    async logout() {
      try {
        await api.post('/logout');
        this.channelStore.clear();
        this.messageStore.clear();
        await this.router.push('/login');
      } catch (e) {
        console.error(e);
      }
    }
  }
};
</script>

<style scoped lang="sass">
.q-footer
  position: fixed
  padding: 0 3rem 1rem 3rem


@media (max-width: 600px)
  .q-footer
    padding: 0 0.5rem 1rem 0.5rem

</style>
