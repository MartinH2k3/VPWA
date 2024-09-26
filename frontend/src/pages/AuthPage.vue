<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useUserStore } from 'stores/userStore';
import { api } from 'boot/api';

const userStore = useUserStore();
</script>


<template>

  <q-layout>
    <q-page-container>
      <q-page class="flex-container width-full w-auto">
        <div class="m-auto text-center">
          <img width="86px" class='mb-5' src="logo.svg">
          <div class="flex flex-row gap-2 mb-3">
            <h5 class="m-0 mr-auto font-bold">Login</h5>
            <router-link to="/register" class="tab-button my-auto"
              :class="{ 'active': !isLogin }">Register</router-link>
            <router-link to="/login" class="tab-button my-auto" :class="{ 'active': isLogin }">Login</router-link>
          </div>
          <hr class="mb-4">
          <q-form v-if="isLogin" @submit.prevent="login" class="flex flex-column gap-4">

            <q-input v-model="email" label="Email" />
            <q-input v-model="password" label="Password" type="password" />
            <q-btn label="Login" type="submit" />
            <pre class=" text-negative">{{ warning }}</pre>
          </q-form>
          <q-form v-else @submit.prevent="register" class="flex flex-column gap-4">
            <q-input v-model="firstName" label="First Name" />
            <q-input v-model="lastName" label="Last Name" />
            <q-input v-model="username" label="Username" />
            <q-input v-model="email" label="Email" />
            <q-input v-model="password" label="Password" type="password" />
            <q-btn label="Register" type="submit" />
            <pre style="max-width: 100%;" class=" text-negative">{{ warning }}</pre>

            <div class="text-center q-pt-none">
              Already a user? <router-link to="/login">Log In</router-link>
            </div>
          </q-form>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>

</template>


<script lang="ts">
export default {
  data() {
    return {
      isLogin: true,
      email: '',
      password: '',
      warning: '',
      firstName: '',
      username: '',
      lastName: '',
    }
  },
  props: {
    type: String
  },

  watch: {
    type(newType) {
      this.isLogin = newType == 'login';

    }
  },

  mounted() {
    this.isLogin = this.type == 'login';
  },

  methods: {
    async login() {


      // can't login if already logged in
      try {
        const sessionResponse = await api.get('/auth');
        console.log(sessionResponse);

        if (sessionResponse.data.authenticated) {
          console.warn('User is already logged in');

          await this.$router.push('/');
          return;
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const response = await api.post('/login', {
          email: this.email,
          password: this.password
        });
        this.warning = '';

        const userData = response.data;
        userStore.setActiveUser(userData); // Set the active user in the store
        await this.$router.push('/');
      } catch (e: any) {
        const errors = e.response.data.errors
        this.warning = '';
        for (const error of errors) {
          this.warning += error.message + '\n'
        }
        console.error(e);
      }
    },
    async register() {

      try {
        const response = await api.post('/register', {
          username: this.username,
          email: this.email,
          password: this.password,
          first_name: this.firstName,
          last_name: this.lastName
        });
        console.log(response);

        this.warning = '';
        const userData = response.data;
        userStore.setActiveUser(userData); // Set the active user in the store
        await this.$router.push('/');
      } catch (e: any) {
        const errors = e.response.data?.errors
        console.log(errors);

        this.warning = '';
        for (const error of errors) {
          this.warning += error.message + '\n'
        }
        console.log(this.warning);

      }
    }
  }
};

</script>
