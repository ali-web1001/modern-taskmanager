import VueSweetalert2 from "vue-sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default {
  install(app: any) {
    app.use(VueSweetalert2);
  },
};
