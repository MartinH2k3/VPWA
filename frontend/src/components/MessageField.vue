<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const message = ref('');
const router = useRouter()

async function sendMessage() {
  if (!message.value.trim()) {
    return;
  }

  const isInChannel = true // TODO check if user is in channel

  if (message.value[0] !== '/' && isInChannel) {
    // TODO api call to send message
  }
  if (message.value[0] === '/') {
    const splitMessage = message.value.split(' ');
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
        // TODO api call to create channel
        break;
      case 'invite':
        // username = args[0];
        // TODO api call to invite
        break;
      case 'leave':
        // TODO api call to leave channel
        await router.push('/')
        break;
      case 'kick':
        // username = args[0];
        // TODO api call to kick from channel
        break;
      default:
        // TODO tell user that command is unknown
        console.log('Unknown command');
        break;
    }
  }
  console.log('Message sent:', message.value);
  message.value = '';
}
</script>

<template>
  <q-input rounded outlined autogrow v-model="message" @keydown.enter.prevent="sendMessage">
    <!-- just so text doesn't start leftmost of the text field-->
    <template v-slot:prepend/>
  </q-input>
</template>

<style scoped>
textarea {
  padding: 0 12rem;
}
</style>
