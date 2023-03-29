// This can be false if you're using a fallback (i.e. SPA mode)
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app') as HTMLElement
})

export default app
