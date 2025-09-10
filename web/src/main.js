import { createApp } from 'vue'
import App from './App.vue'
import './assets/base.css'

import PrimeVue from 'primevue/config'
import Lara from '@primevue/themes/lara'
import { definePreset } from '@primevue/themes'
import 'primeicons/primeicons.css'

const GreenLara = definePreset(Lara, {
  semantic: {
    primary: {
      50: '{green.50}',
      100: '{green.100}',
      200: '{green.200}',
      300: '{green.300}',
      400: '{green.400}',
      500: '{green.500}',
      600: '{green.600}',
      700: '{green.700}',
      800: '{green.800}',
      900: '{green.900}',
      950: '{green.950}'
    }
  }
})

const app = createApp(App)
app.use(PrimeVue, {
  theme: {
    preset: GreenLara
  }
})

app.mount('#app')

