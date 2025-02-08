import { createApp } from "vue";
import { createPinia } from "pinia";
import VCalendar from "v-calendar";
import router from "./router";
import App from "./App.vue";
import "./style.css";
import "v-calendar/style.css";
import toastPlugin from "./plugins/toast";
import alertPlugin from "./plugins/alert";
import { useAuthStore } from "./stores/auth";
import { useThemeStore } from "./stores/theme";

// Create the app instance
const app = createApp(App);

// Create and use Pinia before accessing any stores
const pinia = createPinia();
app.use(pinia);

// After creating app
const themeStore = useThemeStore();
document.documentElement.classList.toggle("dark", themeStore.isDark);

// Initialize other plugins
app.use(alertPlugin);
app.use(toastPlugin);
app.use(VCalendar, {});

// Setup auth check and router guard
const initializeApp = async () => {
  try {
    // Get auth store instance after Pinia is installed
    const authStore = useAuthStore();

    // Perform initial auth check
    await authStore.checkAuth();

    // Use router after auth is initialized
    app.use(router);

    // Mount the app
    app.mount("#app");
  } catch (error) {
    console.error("Failed to initialize app:", error);
    // Mount the app anyway to show error state/login screen
    app.mount("#app");
  }
};

// Start the initialization process
initializeApp();

// For TypeScript type augmentation if needed
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    // Add any global properties here
  }
}
