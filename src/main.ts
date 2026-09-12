import '@fontsource-variable/archivo'
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './assets/tokens.css'
import './assets/theme.css'
import './assets/base.css'
import './assets/ui.css'
import './assets/syntax.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
