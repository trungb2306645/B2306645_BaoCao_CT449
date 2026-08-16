//thêm chức năng tạo app
import { createApp } from "vue";
//khởi động app trang hiển thị ban đầu
import App from "../views/App.vue";
//thêm router
import router from "./router/index.js";
//import bootstrap dùng cho app.vue
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
//tạo app
createApp(App)
  .use(router)
  .mount("#app");