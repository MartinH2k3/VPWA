<script setup lang="ts">
import { ref } from 'vue';
import {useRouter} from 'vue-router';
import {api} from 'boot/api';
import { useUserStore } from 'stores/userStore';

const email = ref('');
const password = ref('');
const router = useRouter();
const userStore = useUserStore();
const warning = ref('');

async function login() {
  // can't login if already logged in
  try {
    const sessionResponse = await api.get('/auth');
    if (sessionResponse.data.authenticated) {
      console.warn('User is already logged in');
      await router.push('/');
      return;
    }
  } catch (e) {
    warning.value = 'Invalid email or password';
    console.error(e);
  }

  try {
    const response = await api.post('/login', {
      email: email.value,
      password: password.value
    });
    const userData = response.data;
    userStore.setActiveUser(userData); // Set the active user in the store
    await router.push('/');
  } catch (e) {
    console.error(e);
  }
}
</script>

<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center bg-secondary">
        <q-form @submit.prevent="login" class="custom-form shadow-5">
          <q-input v-model="email" label="Email" />
          <q-input v-model="password" label="Password" type="password" />
          <q-btn label="Login" type="submit"/>
          <div class="text-center q-pt-none">
            Don't have an account yet? <router-link to="/register">Sign Up</router-link>
          </div>
          <div class="text-center text-negative">{{ warning }}</div>
        </q-form>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
