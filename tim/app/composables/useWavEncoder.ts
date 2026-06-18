export function useWavEncoder() {
  const isEncoding = ref(false)

  async function encodeToWavFile(blob: Blob, fileName = `recording-${Date.now()}.wav`) {
    isEncoding.value = true
    try {
      const audioContext = new AudioContext()
      try {
        const arrayBuffer = await blob.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        const wavBlob = encodeWav(audioBuffer)
        return new File([wavBlob], fileName, { type: 'audio/wav' })
      } finally {
        await audioContext.close()
      }
    } finally {
      isEncoding.value = false
    }
  }

  return {
    isEncoding,
    encodeToWavFile
  }
}

function encodeWav(audioBuffer: AudioBuffer) {
  const channelCount = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const samples = interleaveChannels(audioBuffer)
  const bytesPerSample = 2
  const blockAlign = channelCount * bytesPerSample
  const dataSize = samples.length * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channelCount, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)
  writePcm16(view, 44, samples)

  return new Blob([view], { type: 'audio/wav' })
}

function interleaveChannels(audioBuffer: AudioBuffer) {
  const channelCount = audioBuffer.numberOfChannels
  const frameCount = audioBuffer.length
  const result = new Float32Array(frameCount * channelCount)

  for (let frame = 0; frame < frameCount; frame++) {
    for (let channel = 0; channel < channelCount; channel++) {
      result[frame * channelCount + channel] = audioBuffer.getChannelData(channel)[frame]
    }
  }

  return result
}

function writePcm16(view: DataView, offset: number, samples: Float32Array) {
  for (let index = 0; index < samples.length; index++) {
    const sample = Math.max(-1, Math.min(1, samples[index]))
    view.setInt16(offset + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
  }
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index++) {
    view.setUint8(offset + index, value.charCodeAt(index))
  }
}
