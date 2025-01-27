import { createApp } from 'vue';
import { createPinia } from 'pinia';
import VCalendar from 'v-calendar';
import router from './router';
import App from './App.vue';
import './style.css';
import 'v-calendar/style.css';
import toastPlugin from './plugins/toast';
import alertPlugin from './plugins/alert';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(alertPlugin);
app.use(toastPlugin);
app.use(VCalendar, {});

// Initialize auth check before mounting
const authStore = pinia.state.value.auth;
if (authStore?.loading) {
  authStore.checkAuth().finally(() => {
    app.mount('#app');
  });
} else {
  app.mount('#app');
}