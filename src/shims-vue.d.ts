// 3. Create a shims-vue.d.ts file in your src directory
// src/shims-vue.d.ts
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
