<script setup lang="ts">
import { ref } from 'vue';
import MessageField from 'components/MessageField.vue';
import Sidebar from 'components/Sidebar.vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'stores/userStore';
import MessagePage from 'pages/MessagePage.vue';
import NotificationWindow from 'components/NotificationWindow.vue';

defineOptions({
  name: 'MainLayout'
});

const leftDrawerOpen = ref(false);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const router = useRouter();
const userStore = useUserStore();
const status = ref('online');

async function logout() {
  try {
    // TODO api logout call
    await router.push('/login');
  } catch (e) {
    console.error(e);
  }
}
</script>

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
        <q-btn-dropdown class="inverseColor text-right" :label="userStore.getUsername">
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
      <sidebar/>
    </q-drawer>

    <q-page-container>
      <message-page/>
    </q-page-container>
    <q-footer>
      <message-field/>
    </q-footer>
  </q-layout>
</template>


