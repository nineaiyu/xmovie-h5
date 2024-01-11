import {
  createRouter,
  createWebHashHistory,
  type RouteLocationNormalized
} from "vue-router";
import routes from "./routes";
import { useCachedViewStoreHook } from "@/store/modules/cachedView";
import NProgress from "@/utils/progress";
import setPageTitle from "@/utils/set-page-title";
import { getToken } from "@/utils/auth";

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export interface toRouteType extends RouteLocationNormalized {
  meta: {
    title?: string;
    noCache?: boolean;
  };
}

/** 路由白名单 */
const whiteList = ["/login", "/home", "/film", "/detail"];

router.beforeEach((to: toRouteType, _from, next) => {
  const token = getToken();
  NProgress.start();
  // 路由缓存
  useCachedViewStoreHook().addCachedView(to);

  // 页面 title
  setPageTitle(to.meta.title);

  if (whiteList.indexOf(<string>to.path) !== -1) {
    next();
    return;
  } else {
    if (token && to.path === "/login") {
      next({ path: "/" });
      return;
    }
  }
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
