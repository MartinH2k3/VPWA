<script setup lang="ts">
import { ref } from 'vue';
import {useRouter} from 'vue-router';
import {api} from 'boot/api';
import { useUserStore } from 'stores/userStore';

const firstName = ref('');
const lastName = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const router = useRouter();
const userStore = useUserStore();

async function register() {
  try {
    const response = await api.post('/register', {
      username: username.value,
      email: email.value,
      password: password.value,
      first_name: firstName.value,
      last_name: lastName.value
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
        <q-form @submit.prevent="register" class="custom-form shadow-5">
          <q-input v-model="firstName" label="First Name" />
          <q-input v-model="lastName" label="Last Name" />
          <q-input v-model="username" label="Username" />
          <q-input v-model="email" label="Email" />
          <q-input v-model="password" label="Password" type="password" />
          <q-btn label="Register" type="submit"/>
          <div class="text-center q-pt-none">
            Already a user? <router-link to="/login">Log In</router-link>
          </div>
        </q-form>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
