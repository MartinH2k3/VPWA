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
    return { channelStore, router, messageStore, userStore, $q};
  },
  data() {
    return {
      message: '', // Define message in data()
      draftTimeout: null as NodeJS.Timeout | null,
    };
  },
  computed: {
    members() {
      return this.channelStore?.activeChannel?.members;
    },
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
    message() {
      if (this.draftTimeout != null) {
        clearTimeout(this.draftTimeout);
      }
      console.log('Typing...');

      // After 100 ms, send a 'draft' message to the server
      const self = this;
      this.draftTimeout = setTimeout(() => {
        if (this.message.trim()) {
          console.log('Sending typing notification');

          this.channelStore.sendTyping(self.message);
        } else {
          this.channelStore.stopTyping();
        }
        self.draftTimeout = null;
      }, 100);

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
        if (!this.channelStore.activeChannel.name) {
          this.$q.notify('You are currently not in a channel');
          return;
        }
        this.messageStore.sendMessage(this.channelStore.activeChannel.name, this.message);
      }

      // Handle message commands
      if (this.message[0] === '/') {
        const splitMessage = this.message.split(' ');
        const command = splitMessage[0].substring(1);
        const args = splitMessage.slice(1);
        let username: string;
        let channelName: string;
        let response: string = '';
        if (!this.channelStore.activeChannel.name && command !== 'join') {
          this.$q.notify('You are currently not in a channel');
          return;
        }

        switch (command) {
          case 'join':
            channelName = args[0];
            let isPrivate = args.length > 1 && args[1] === 'private';
            response = await this.channelStore.joinChannel(channelName, isPrivate);
            break;

          case 'invite':
            username = args[0];
            response = await this.channelStore.inviteUser(username);
            break;
          case 'quit': //fallback for now, since for now they are the same
          case 'cancel':
          case 'leave':
            response = await this.channelStore.leaveActiveChannel(); //works for active channel so no params
            break;

          case 'kick':
            username = args[0];
            response = await this.channelStore.kickUser(username); //works for active channel so no param for that
            break;

          case 'revoke':
            username = args[0];
            response = await this.channelStore.revokeUser(username); //works for active channel so no param for that
            break;
          case 'list':
            //TODO get all users in channel
            const users = this.channelStore.getActiveChannelMembers();

            this.messageStore.addMessageToActiveChannel({
              id: 0,
              username: 'system',
              content: 'Users in channel: ' + users,
              byMe: false,
              taggedMe: false,
            },
              true);
            break;
          case 'help':
            this.messageStore.addMessageToActiveChannel({
                id: 0,
                username: 'system',
                content: 'Available commands: /join, /invite, /quit, /kick, /revoke, /list, /help',
                byMe: false,
                taggedMe: false,
              },
              true);
            break;
          case 'info':
            let message: string = '';
            const command = args[0] ? args[0] : '';
            switch (command) {
              case '':
                message = '/info <command> for information on a specific command';
                break;
              case 'join':
                message = 'Join a channel: /join <channel-name> [private]';
                break;
              case 'invite':
                message = 'Invite a user to the channel: /invite <username>';
                break;
              case 'leave':
              case 'cancel':
              case 'quit':
                message = 'Leave the channel: /quit, /leave or /cancel';
                break;
              case 'kick':
                message = 'Kick a user from the channel: /kick <username>';
                break;
              case 'revoke':
                message = 'Revoke a user from the channel: /revoke <username>';
                break;
              case 'list':
                message = 'List all users in the channel: /list';
                break;
              case 'help':
                message = 'List all available commands: /help';
                break;
            }
            this.messageStore.addMessageToActiveChannel({
                id: 0,
                username: 'system',
                content: message,
                byMe: false,
                taggedMe: false,
              },
              true);
            break;
          default:
            // Inform user that command is unknown
            this.messageStore.addMessageToActiveChannel({
                id: 0,
                username: 'system',
                content: 'Unknown command, type /help for a list of commands',
                byMe: false,
                taggedMe: false,
              },
              true);
            break;
        }
        this.$q.notify(response);
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
