import Toast, { PluginOptions, POSITION } from "vue-toastification";

import "vue-toastification/dist/index.css";

const options: PluginOptions = {
  position: POSITION.TOP_RIGHT, // Use POSITION enum
  timeout: 4000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  hideProgressBar: true,
  showCloseButtonOnHover: false,
};

export default {
  install(app: any) {
    app.use(Toast, options);
  },
};
