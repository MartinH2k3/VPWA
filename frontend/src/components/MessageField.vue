<template>
  <q-input rounded outlined autogrow v-model="message" @keydown.enter.prevent="sendMessage">
    <!-- just so text doesn't start leftmost of the text field-->
    <template v-slot:prepend/>
  </q-input>
</template>

<script lang="ts">
import { useRouter } from 'vue-router';
import { useMessageStore } from 'stores/messageStore';

export default {
  setup() {
    const router = useRouter();
    const messageStore = useMessageStore();
    return { router, messageStore };
  },
  data() {
    return {
      message: '', // Define message in data()
    };
  },
  methods: {
    async sendMessage() {
      if (!this.message.trim()) {
        return;
      }

      const isInChannel = true; // TODO: check if user is in channel

      // Handle message when it's not a command (i.e., doesn't start with "/")
      if (this.message[0] !== '/' && isInChannel) {
        // TODO: api call to send message
      }

      // Handle message commands
      if (this.message[0] === '/') {
        const splitMessage = this.message.split(' ');
        const command = splitMessage[0].substring(1);
        const args = splitMessage.slice(1);
        let username;

        if (!isInChannel && command !== 'join') {
          console.error('No channel to send message to');
          return;
        }

        switch (command) {
          case 'join':
            // channelName = args[0];
            // isPrivate = args.length > 1 && args[1] === 'private';
            // TODO: api call to create channel
            break;

          case 'invite':
            // username = args[0];
            // TODO: api call to invite user
            break;

          case 'leave':
            // TODO: api call to leave the channel
            await this.$router.push('/');
            break;

          case 'kick':
            // username = args[0];
            // TODO: api call to kick user from channel
            break;

          case 'list':
            //TODO get all users in channel
            const users = ['user1', 'user2', 'user3'];
            this.messageStore.addMessage({
              id: 0,
              username: 'system',
              content: 'Users in channel: ' + users.join(', '),
              byMe: false,
              taggedMe: false,
            });
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

<style scoped>
textarea {
  padding: 0 12rem;
}
</style>
