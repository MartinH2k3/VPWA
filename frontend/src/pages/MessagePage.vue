<template>
  <q-page padding>
    <q-infinite-scroll :offset="40" @load="paginateMessages" :initial-index="0" reverse>
      <q-list>
        <q-chat-message v-for="(message, index) in messages" :key="message.id"
          :name="(index > 0 && messages[index - 1].username === message.username) ? '' : message.byMe ? 'Me' : message.username"
          :text="[message.content]" :sent="message.byMe"
          :bg-color="message.byMe || message.taggedMe ? 'primary' : 'grey'"
          :text-color="message.byMe || message.taggedMe ? 'white' : ''" /><!--default color if not by me-->
        <div v-for="typingUser in currentlyTyping" :key="typingUser.username + '-typing'">
          <q-chat-message bg-color="grey" :name="typingUser.username">
            <span @mouseover="inspectUser(typingUser.username, $event)" @mouseleave="stopInspecting">
              <q-spinner-dots size="1rem" />
            </span>
          </q-chat-message>
          <div v-if="inspecting" class="floating-message" :style="{ top: `${cursorY}px`, left: `${cursorX}px` }">
            {{ typingUser.content }}
          </div>
        </div>

      </q-list>

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
    const messageStore = useMessageStore();
    const channelStore = useChannelStore();
    return { messageStore, userStore, channelStore };
  },
  data() {
    return {
      limit: 10,
      cursor: null as (number | null), // cursor for pagination
      inspecting: false,
      cursorX: 0, // cursor as in mouse cursor
      cursorY: 0,
    };
  },
  computed: {
    messages(): Message[] {
      return this.messageStore.activeChannelMessages.toReversed()
    },
    currentlyTyping() {
      return this.channelStore.activeChannel.currentlyTyping;

    },
    activeChannel() {
      return this.channelStore.activeChannel;
    }
  },
  watch: {
    messages() {
      console.log('messages updated')
    },
    currentlyTyping() {
      console.log('currentlyTyping updated')
    },
    activeChannel() {
      this.cursor = null;
      this.messageStore.fetchActiveChannelMessages(this.limit, this.cursor)
      console.log('activeChannel updated')
    }

  },
  methods: {
    async paginateMessages(index: number, done: () => void) {
      if (this.messageStore.activeChannelMessagesInfo?.reachedTop) {
        done()
      }
      if (this.messageStore.fetchingMessages) {
        setTimeout(() => done(), 1000)
        return;
      }
      await this.messageStore.fetchActiveChannelMessages(this.limit, this.cursor)
      done()
      // setTimeout(() => done(), 1000);
    },

    async inspectUser(username: string, event: MouseEvent) {
      try { //TODO actually get the message dude is writing from websocket on every update
        this.cursorX = event.clientX + 10
        this.cursorY = event.clientY + 10
        this.inspecting = true
      }
      catch (e) {
        console.error(e)
      }
    },
    stopInspecting() {
      // Clear the message when the mouse leaves the element
      this.inspecting = false;
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
