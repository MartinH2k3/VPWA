import { register } from 'register-service-worker';
import { useSocketStore } from '../src/stores/socketStore';
import { getActivePinia } from 'pinia';

register(process.env.SERVICE_WORKER_FILE, {
  ready(/* registration */) {
    console.log('Service worker is active.')
  },

  registered(/* registration */) {
    console.log('Service worker has been registered.')
  },

  cached(/* registration */) {
    console.log('Content has been cached for offline use.')
  },

  updatefound(/* registration */) {
    console.log('New content is downloading.')
  },

  updated(/* registration */) {
    console.log('New content is available; please refresh.')
  },

  offline() {
    console.log('No internet connection found. App is running in offline mode.')
    window.location.href = '/login';
  },

  error(err) {
    console.error('Error during service worker registration:', err)
  },
});

// Fallback for detecting offline status
window.addEventListener('offline', () => {
  console.log('No internet connection found. App is running in offline mode.');
  // Check if pinia is initialized
  window.location.href = '/#/login';
});

window.addEventListener('online', () => {
  // Reload
  window.location.reload();
});
