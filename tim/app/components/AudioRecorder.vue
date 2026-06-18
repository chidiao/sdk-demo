<template>
  <button
    class="record-button"
    :class="{ 'record-button--active': recording }"
    type="button"
    :disabled="disabled"
    @pointerdown.prevent="handlePressStart"
    @pointerup.prevent="handlePressEnd"
    @pointercancel.prevent="handlePressCancel"
    @pointerleave="handlePressLeave"
    @contextmenu.prevent
  >
    <span class="record-button__icon">{{ recording ? '■' : '●' }}</span>
    <span>{{ recording ? recordingText : idleText }}</span>
  </button>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    idleText?: string
    recordingText?: string
    recording?: boolean
    disabled?: boolean
  }>(),
  {
    idleText: '按住录音',
    recordingText: '松开结束',
    recording: false,
    disabled: false
  }
)

const emit = defineEmits<{
  'press-start': []
  'press-end': []
  'press-cancel': []
}>()

function handlePressStart(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement | null
  target?.setPointerCapture(event.pointerId)
  emit('press-start')
}

function handlePressEnd(event: PointerEvent) {
  releasePointer(event)
  emit('press-end')
}

function handlePressCancel(event: PointerEvent) {
  releasePointer(event)
  emit('press-cancel')
}

function handlePressLeave(event: PointerEvent) {
  releasePointer(event)
  emit('press-end')
}

function releasePointer(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement | null
  if (target?.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId)
  }
}
</script>

<style scoped>
.record-button {
  align-items: center;
  background: #1677ff;
  border: 0;
  border-radius: 8px;
  color: #fff;
  display: flex;
  font-size: 16px;
  font-weight: 600;
  gap: 8px;
  height: 52px;
  justify-content: center;
  touch-action: none;
  transition:
    background 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
  width: 100%;
}

.record-button:disabled {
  opacity: 0.6;
}

.record-button--active {
  background: #ee0a24;
  transform: scale(0.98);
}
</style>
