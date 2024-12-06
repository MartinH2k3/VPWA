<template>
  <q-layout>
    <q-page-container>
      <q-page class="column flex-center text-center">
        <img alt="logo" width="86px" class='q-mb-sm' src="public/logo.svg">
        <q-form v-if="isLogin" @submit.prevent="login" class="custom-form">
          <q-input v-model="email" label="Email"
            :rules="[val => /.+@.+\..+/.test(val) || 'Please enter a valid email address']" />
          <q-input v-model="password" label="Password" type="password"
            :rules="[val => !!val || 'Password is required']" />
          <q-btn label="Login" type="submit" />
          <pre v-if="warning" class="text-negative">{{ warning }}</pre>

          <div class="text-center q-pt-md">
            New to the website? <router-link to="/register">Register</router-link>
          </div>
        </q-form>
        <q-form v-else @submit.prevent="register" class="custom-form">
          <q-input v-model="firstName" label="First Name" :rules="[val => !!val || 'First Name is required']" />
          <q-input v-model="lastName" label="Last Name" :rules="[val => !!val || 'Last Name is required']" />
          <q-input v-model="username" label="Username"
            :rules="[val => val.length >= 3 || 'Username must be at least 3 characters']" />
          <q-input v-model="email" label="Email" type="email"
            :rules="[val => /.+@.+\..+/.test(val) || 'Please enter a valid email address']" />
          <q-input v-model="password" label="Password" type="password"
            :rules="[val => val.length >= 8 || 'Password must be at least 8 characters']" />
          <q-btn label="Register" type="submit" />
          <pre v-if="warning" class=" text-negative">{{ warning }}</pre>

          <div class="text-center">
            Already a user? <router-link to="/login">Log In</router-link>
          </div>
        </q-form>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="sass">
.custom-form
  padding: 1rem
  border-radius: 2%
  color: black
  min-width: 16rem

.custom-form button
  margin: 1rem 0
  width: 100%
</style>

<script lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from 'stores/userStore';
import { useChannelStore } from 'stores/channelStore';
import { useMessageStore } from 'stores/messageStore';
import { api } from 'boot/api';

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

	setup() {
		const router = useRouter();
		const userStore = useUserStore();
		const channelStore = useChannelStore();
		const messageStore = useMessageStore();
		return { router, userStore, channelStore, messageStore };
	},

	props: {
		type: String
	},

	watch: {
		type(newType) {
			this.isLogin = newType == 'login';

		}
	},

	async mounted() {
		this.isLogin = this.type == 'login';


		// if navigator status if offline return
		if (navigator.onLine === false) {
			this.warning = 'You are offline. Please check your internet connection.';
			return;
		}
		// Check if the user is already logged in
		try {
			const sessionResponse = await api.get('/auth');
			console.log(sessionResponse);

			if (sessionResponse.data.authenticated) {
				console.warn('User is already logged in');

				await this.router.push('/');
				return;
			}
		} catch (e) {
			console.error(e);
		}
	},

	methods: {

		clearStore() {
			this.channelStore.clear();
			this.messageStore.clear();
		},

		async login() {



			try {
				const response = await api.post('/login', {
					email: this.email,
					password: this.password
				});
				this.warning = '';

				const userData = response.data;
				this.userStore.setActiveUser(userData); // Set the active user in the store
				await this.router.push('/');
			} catch (e: any) {
				try {
					const errors = e.response.data.errors
					this.warning = '';
					for (const error of errors) {
						this.warning += error.message + '\n'
					}
				} catch (e) { // If there is no response
					this.warning = 'Couldn\'t connect to the server.\nTry checking your internet connection.';
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
				this.userStore.setActiveUser(userData); // Set the active user in the store
				await this.router.push('/');
			} catch (e: any) {
				try {
					const errors = [e.response.data.message]
					console.log(e.response.data.message);

					this.warning = '';
					for (const error of errors) {
						this.warning += error + '\n'
					}
				} catch (e) { // If there is no response
					console.log(e);

					this.warning = 'Couldn\'t connect to the server.\nTry checking your internet connection.';
				}
				console.error(e);
			}
		}
	}
};

</script>
