export type MicrophonePermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported'

export function useMicrophonePermission() {
  const permissionState = ref<MicrophonePermissionState>('prompt')
  const isSupported = computed(() => import.meta.client && !!navigator.mediaDevices?.getUserMedia)

  async function refreshPermission() {
    if (!import.meta.client) {
      permissionState.value = 'unsupported'
      return permissionState.value
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      permissionState.value = 'unsupported'
      return permissionState.value
    }

    if (!navigator.permissions?.query) {
      permissionState.value = 'prompt'
      return permissionState.value
    }

    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      permissionState.value = result.state
      return permissionState.value
    } catch {
      permissionState.value = 'prompt'
      return permissionState.value
    }
  }

  async function requestPermission() {
    if (!import.meta.client) {
      permissionState.value = 'unsupported'
      return permissionState.value
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      permissionState.value = 'unsupported'
      return permissionState.value
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      permissionState.value = 'granted'
    } catch (error) {
      permissionState.value = error instanceof DOMException && error.name === 'NotAllowedError' ? 'denied' : 'prompt'
      throw error
    }

    return permissionState.value
  }

  return {
    permissionState,
    isSupported,
    refreshPermission,
    requestPermission
  }
}
