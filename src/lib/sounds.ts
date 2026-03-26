let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

export function playNagSound(style: 'gentle' | 'firm' | 'aggressive') {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    if (style === 'gentle') {
      // Soft two-tone chime
      playTone(ctx, 523.25, now, 0.15, 0.3) // C5
      playTone(ctx, 659.25, now + 0.15, 0.15, 0.3) // E5
    } else if (style === 'firm') {
      // Three ascending tones
      playTone(ctx, 440, now, 0.12, 0.5) // A4
      playTone(ctx, 554.37, now + 0.15, 0.12, 0.5) // C#5
      playTone(ctx, 659.25, now + 0.3, 0.2, 0.5) // E5
    } else {
      // Urgent alarm pattern
      for (let i = 0; i < 4; i++) {
        playTone(ctx, 880, now + i * 0.2, 0.08, 0.7) // A5
        playTone(ctx, 698.46, now + i * 0.2 + 0.1, 0.08, 0.7) // F5
      }
    }
  } catch {
    // Audio not available
  }
}

export function playSuccessSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    playTone(ctx, 523.25, now, 0.1, 0.4) // C5
    playTone(ctx, 659.25, now + 0.1, 0.1, 0.4) // E5
    playTone(ctx, 783.99, now + 0.2, 0.2, 0.4) // G5
    playTone(ctx, 1046.5, now + 0.35, 0.3, 0.3) // C6
  } catch {
    // Audio not available
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume: number
) {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.frequency.value = frequency
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}
