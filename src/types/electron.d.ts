export {}

declare global {
  interface Window {
    electronAPI?: {
      showNag: (title: string, body: string) => void
      bringToFront: () => void
      isElectron: boolean
    }
  }
}
