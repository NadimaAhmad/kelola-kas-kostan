// Menggunakan Vue versi ES Module dari CDN
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import App from './components/App.js';

// Membuat dan me-mount aplikasi
createApp(App).mount('#app');