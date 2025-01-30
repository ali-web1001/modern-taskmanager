import Toast, { PluginOptions, POSITION } from "vue-toastification";

import "vue-toastification/dist/index.css";

const options: PluginOptions = {
  position: POSITION.BOTTOM_CENTER, // Use POSITION enum
  timeout: 2000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  hideProgressBar: true,
  showCloseButtonOnHover: false,
  // Add transition configuration
  transition: {
    enter: "Vue-Toastification__fade-enter",
    move: "Vue-Toastification__fade-move",
    leave: "Vue-Toastification__fade-leave",
  },
};

export default {
  install(app: any) {
    app.use(Toast, options);
  },
};
