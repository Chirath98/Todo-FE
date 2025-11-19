import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        title: "todo"}

    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/',
      // component: NotFoundView,
      // meta: {
      //   title: '404 - Not Found'
      // }
    }


  ],
    scrollBehavior() {
    return { top: 0 };
  },
});




export default router;
