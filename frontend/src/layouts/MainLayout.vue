<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Frens
        </q-toolbar-title>
        <q-btn-dropdown flat icon="notifications">
          <notification-window/>
        </q-btn-dropdown>
        <q-btn-dropdown class="text-right" :label="userStore.getUsername">
          <div class="row no-wrap q-pa-md">
            <div class="column justify-around">
              <q-btn outline rounded class="q-mr-md" @click="logout">
                Logout
              </q-btn>
              <q-btn
                outline
                rounded
                class="q-mr-md"
                href="https://www.wikipedia.org/wiki/monkey"
                target="_blank">
                Info
              </q-btn>
            </div>
            <q-separator vertical inset class="text-white" />
            <div class="column justify-around">
              <q-radio v-model="status" val="online" label="online" @update:model-value="userStore.setStatus('online')"/>
              <q-radio v-model="status" val="do not disturb" label="away" @update:model-value="userStore.setStatus('online')"/>
              <q-radio v-model="status" val="offline" label="offline" @update:model-value="userStore.setStatus('online')"/>
            </div>
          </div>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <SideBar/>
    </q-drawer>

    <q-page-container>
      <message-page/>
    </q-page-container>
    <q-footer>
      <message-field/>
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
import NotificationWindow from 'components/NotificationWindow.vue';
import { api } from 'boot/api';

export default {
  name: 'MainLayout',
  components: {
    MessageField,
    SideBar,
    MessagePage,
    NotificationWindow
  },
  data() {
    return {
      leftDrawerOpen: false,
      status: 'online'
    };
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    return { router, userStore };
  },
  mounted(){
    // connect through socket store
    useSocketStore().connect()


  },
  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    async logout() {
      try {
        await api.post('/logout');
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
