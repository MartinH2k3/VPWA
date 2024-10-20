<template>
  <q-page padding>
    <q-infinite-scroll :offset="40" @load="paginateMessages" :initial-index="0" reverse>
      <q-list>
        <q-chat-message v-for="message in messages.toReversed()" :key="message.id + '-' + activeChannel.name"
          :name="message.byMe ? 'Me' : message.username" :text="[message.content]" :sent="message.byMe"
          :bg-color="message.byMe || message.taggedMe ? 'primary' : 'grey'"
          :text-color="message.byMe || message.taggedMe ? 'white' : ''" /><!--default color if not by me-->
        <q-chat-message v-for="typingUser in currentlyTyping" :key="typingUser" :name="typingUser" bg-color="grey">
          <q-spinner-dots size="2rem" @mouseover="inspectUser(typingUser, $event)" @mouseleave="stopInspecting" />
        </q-chat-message>
      </q-list>
      <div v-if="inspectedMessage" class="floating-message" :style="{ top: `${cursorY}px`, left: `${cursorX}px` }">
        {{ inspectedMessage }}
      </div>
      <template #loading>
        <q-spinner class="row justify-center" />
      </template>
    </q-infinite-scroll>



  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from 'stores/userStore';
import { useChannelStore } from 'stores/channelStore';
import { useMessageStore } from 'stores/messageStore';

interface Message {
  id: number;
  username: string;
  content: string;
  byMe: boolean;
  taggedMe: boolean;
}

export default defineComponent({
  setup() {
    const userStore = useUserStore();
    const channelStore = useChannelStore();
    const messageStore = useMessageStore();
    return { messageStore, userStore, channelStore };
  },
  data() {
    return {
      currentlyTyping: ['bob', 'alice'] as string[],
      limit: 10,
      cursor: null as (number | null), // cursor for pagination
      inspectedMessage: null as string | null,
      cursorX: 0, // cursor as in mouse cursor
      cursorY: 0,
    };
  },
  computed: {
    messages(): Message[] {
      return this.messageStore.activeChannelMessages;
    },
    activeChannel() {
      return this.channelStore.activeChannel;
    }
  },
  watch: {
    messages() {
      console.log('messages updated');

    }
  },
  methods: {
    paginateMessages(index: number, done: () => void) {
      this.messageStore.fetchActiveChannelMessages(this.limit, this.cursor);

      // Force refresh of the list
      setTimeout(done, 50);
    },

    async inspectUser(username: string, event: MouseEvent) {
      try { //TODO actually get the message dude is writing from websocket on every update
        this.cursorX = event.clientX + 10;
        this.cursorY = event.clientY + 10;
        this.inspectedMessage = 'Currently typing...';
      }
      catch (e) {
        console.error(e);
      }
    },
    stopInspecting() {
      // Clear the message when the mouse leaves the element
      this.inspectedMessage = null;
    },
  }
});
</script>

<style scoped lang="sass">
.floating-message
  position: fixed
  background-color: #f1f1f1
  padding: 10px
  border-radius: 5px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
  z-index: 1000 /* Ensure it appears above other elements */
  pointer-events: none /* Prevent interaction with the message */


@media (max-width: 600px)
  .msgText
    max-width: 90%

</style>
