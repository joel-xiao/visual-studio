<template>
  <div ref="messagesRef" class="messages" :style="{ paddingBottom: `${props.inputAreaHeight}px` }">
    <transition-group name="message-fade">
      <Message
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        :on-continue-workflow="onContinueWorkflow"
        :on-mark-action-handled="onMarkActionHandled"
      />
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue';
import type { IChatMessage } from '../types';
import Message from './Message.vue';

interface Props {
  messages: IChatMessage[];
  inputAreaHeight?: number;
  onContinueWorkflow?: (data: unknown) => void;
  onMarkActionHandled?: (messageId: string, key: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  inputAreaHeight: 130
});


const messagesRef = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesRef.value) {
    messagesRef.value.scrollTo({
      top: messagesRef.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

watch(() => props.messages, () => {
  scrollToBottom();
}, { deep: true });

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped lang="scss">
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
}

.message-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.message-fade-leave-active {
  transition: all 0.3s ease;
}
.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
