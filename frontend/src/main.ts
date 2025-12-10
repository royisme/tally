import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import router from "./router";
import App from "./App.vue";
import "./style.css";
// Naive UI recommended fonts
import "vfonts/Lato.css";
import "vfonts/FiraCode.css";

// I18n Setup
const i18n = createI18n({
  legacy: false, // Vue 3 Composition API
  locale: "zh-CN",
  fallbackLocale: "en-US",
  messages: {
    "en-US": { message: { hello: "Hello" } },
    "zh-CN": { message: { hello: "你好" } },
  },
});

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(i18n);

app.mount("#app");
