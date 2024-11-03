<template>
  <q-input rounded outlined autogrow v-model="message" @keydown.enter.prevent="sendMessage">
    <!-- just so text doesn't start leftmost of the text field-->
    <template v-slot:prepend />
  </q-input>
</template>

<script lang="ts">
import { useRouter } from 'vue-router';
import { useMessageStore } from 'stores/messageStore';
import { useChannelStore } from 'stores/channelStore';
import { useUserStore } from 'stores/userStore';
import { useQuasar } from 'quasar';

export default {
  setup() {
    const router = useRouter();
    const messageStore = useMessageStore();
    const channelStore = useChannelStore();
    const userStore = useUserStore();
    const $q = useQuasar()
    return { channelStore, router, messageStore, userStore };
  },
  data() {
    return {
      message: '', // Define message in data()
    };
  },

  watch: {
    // Watch for changes in the active channel
    'channelStore.activeChannel': {
      handler() {
        // scroll to bottom of messages
        this.$nextTick(() => {
          const messageContainer = document.getElementById('message-container');
          if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
          }
        });
      },
      immediate: true,
    },
  },
  methods: {
    async sendMessage() {
      if (!this.message.trim()) {
        return;
      }

      // Handle message when it's not a command (i.e., doesn't start with "/")
      if (this.message[0] !== '/' && this.channelStore.activeChannel) {
        // TODO: api call to send message
        this.messageStore.sendMessage(this.channelStore.activeChannel.name, this.message);
      }

      // Handle message commands
      if (this.message[0] === '/') {
        const splitMessage = this.message.split(' ');
        const command = splitMessage[0].substring(1);
        const args = splitMessage.slice(1);
        let username;
        let channelName: string;
        if (!this.channelStore.activeChannel.name && command !== 'join') {
          this.$q.notify('You are currently not in a channel');
          return;
        }

        switch (command) {
          case 'join':
            channelName = args[0];
            // // If the channel already exists, print an appropriate message
            // if (this.channelStore.channels.find(channel => channel.name === channelName)) {
            //   this.$q.notify({
            //     message: `You're already a member of ${channelName}`,
            //     color: 'yellow',
            //     textColor: 'black',
            //     icon: 'warning'
            //   });
            //   return;
            // }
            let isPrivate = args.length > 1 && args[1] === 'private';
            await this.channelStore.joinChannel(channelName, isPrivate);
            break;

          case 'invite':
            username = args[0];
            await this.channelStore.inviteUser(username);
            break;
          case 'quit': //fallback for now, since for now they are the same
          case 'cancel':
          case 'leave':
            await this.channelStore.leaveActiveChannel(); //works for active channel so no params
            break;

          case 'kick':
            username = args[0];
            await this.channelStore.kickUser(username); //works for active channel so no param for that
            break;

          case 'list':
            //TODO get all users in channel
            const users = {
              'user1': 'online',
              'user2': 'away',
              'user3': 'offline'
            };
            console.log('Adding users to message store');

            this.messageStore.addMessageToActiveChannel({
              id: 0,
              username: 'system',
              content: 'Users in channel: ' + Object.entries(users)
                .map(([username, status]) => `${username} (${status})`)
                .join(', '), // display users and their status
              byMe: false,
              taggedMe: false,
            },
              true);
            break;
          default:
            // Inform user that command is unknown
            console.log('Unknown command');
            break;
        }
      }
      console.log('Message sent:', this.message);
      this.message = ''; // Clear the message
    },
  }
};
</script>

<style scoped lang="sass">
textarea
  padding: 0 12rem

</style>
