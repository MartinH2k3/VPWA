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
    <q-item v-else clickable v-for="channel in channels" :key="channel.id" @click="goToChannel(channel)"
      :class="{ active: channel.id === activeChannel.id, highlighted: channel.highlighted }">
      <div class="row flex-row flex-nowrap" style="width: 100%;">
        <q-icon class="q-my-auto q-mr-sm" :name="channel.isPrivate ? 'lock' : 'public'"></q-icon>
        <span class="q-mr-auto flex items-center">
          {{ channel.name }}</span>
        <q-btn v-if="activeChannel.id == channel.id" flat round dense icon="close" class="q-ml-sm" @click="leaveChannel(channel.name)" />

      </div>
    </q-item>
    <!-- Button with input that will create channel -->
    <q-item>
      <q-item-section>
        <q-input v-model="newChannelName" label="Create/join channel" @keyup.enter="createChannel()" />
        <q-toggle v-model="isPrivate" label="Private" />
        <q-btn @click="createChannel()" label="Create" />
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
		return { router, $q };
	},
	data() {
		return {
			channelStore: useChannelStore(),
			newChannelName: '',
			isPrivate: false,
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
		createChannel() {
			if (this.newChannelName.trim() === '') {
				this.$q.notify({
					message: 'Channel name cannot be empty',
					color: 'negative',
					position: 'bottom',
					timeout: 2000
				});
				return;
			}
      // Check for whitespaces
      if (/\s/.test(this.newChannelName)) {
        this.$q.notify({
          message: 'Channel name cannot contain whitespaces',
          color: 'negative',
          position: 'bottom',
          timeout: 2000
        });
        return;
      }
			this.channelStore.joinChannel(this.newChannelName, this.isPrivate);
			this.newChannelName = '';
		},

		async leaveChannel(channelName: string) {

			// Make a confirm alert
			let confirm: boolean = window.confirm('Do you really wanna leave ' + channelName + '?');
			if (!confirm) return;

			await this.channelStore.leaveActiveChannel();
			// Notify
			this.$q.notify({
				message: 'You have left ' + channelName,
				color: 'negative',
				position: 'bottom',
				timeout: 2000
			});
		}

	},
	async mounted() {
		await this.channelStore.fetchChannels();
		this.channelStore.setActiveChannel(this.channelStore.channels[0].name);
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
