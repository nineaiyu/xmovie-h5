import Layout from "@/layout/index.vue";
import type { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "root",
    component: Layout,
    redirect: { name: "Home" },
    children: [
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/home/index.vue"),
        meta: {
          title: "主页"
        }
      },
      {
        path: "film",
        name: "Film",
        component: () => import("@/views/film/index.vue"),
        meta: {
          title: "影视"
        }
      },
      {
        path: "detail/:pk",
        name: "Detail",
        component: () => import("@/views/detail/index.vue"),
        meta: {
          title: "详情"
        }
      },
      {
        path: "history",
        name: "History",
        component: () => import("@/views/history/index.vue"),
        meta: {
          title: "历史"
        }
      },
      {
        path: "login",
        name: "Login",
        component: () => import("@/views/login/index.vue"),
        meta: {
          title: "登录"
        }
      },
      {
        path: "user",
        name: "User",
        component: () => import("@/views/user/index.vue"),
        meta: {
          title: "我的",
          noCache: true
        }
      },
      {
        path: "/:pathMatch(.*)",
        name: "Err404",
        component: () => import("@/views/error/404.vue"),
        meta: {
          title: "404",
          noCache: true
        }
      }
    ]
  }
];

export default routes;
