import { defineStore } from "pinia";
import { store } from "@/store";
import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  registerApi,
  type TokenResult,
  type UserInfoResult
} from "@/api/system/auth";
import {
  getRefreshToken,
  getUserInfo,
  removeToken,
  setToken,
  setUserInfo
} from "@/utils/auth";
import { getUserInfoApi } from "@/api/system/userinfo";
import { showNotify } from "vant";
import router from "@/router";

type userType = {
  username?: string;
  avatar?: string;
  roles?: Array<number>;
  verifyCodeLength?: number;
  currentPage?: number;
  isRemembered?: boolean;
  loginDay?: number;
};

export const useUserStore = defineStore({
  id: "xmovie-user",
  state: (): userType => ({
    // 用户名
    username: getUserInfo()?.username ?? "",
    // 头像
    avatar: getUserInfo()?.avatar ?? "",
    // 前端生成的验证码（按实际需求替换）
    verifyCodeLength: 0,
    // 判断登录页面显示哪个组件（0：登录（默认）、1：手机登录、2：二维码登录、3：注册、4：忘记密码）
    currentPage: 0,
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7
  }),
  actions: {
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储用户名 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储前端生成的验证码 */
    SET_VERIFY_CODE_LENGTH(length: number) {
      this.verifyCodeLength = length;
    },
    /** 存储登录页面显示哪个组件 */
    SET_CURRENT_PAGE(value: number) {
      this.currentPage = value;
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<TokenResult>((resolve, reject) => {
        loginApi(data)
          .then(res => {
            if (res.code === 1000) {
              setToken(res.data);
              resolve(res);
            } else {
              reject(res);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    async getUserInfo() {
      return new Promise<UserInfoResult>((resolve, reject) => {
        getUserInfoApi()
          .then(res => {
            if (res.code === 1000) {
              setUserInfo(res.data);
              resolve(res);
            } else {
              reject(res);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 注册 */
    async registerByUsername(data) {
      return new Promise<TokenResult>((resolve, reject) => {
        registerApi(data)
          .then(res => {
            if (res.code === 1000) {
              setToken(res.data);
              resolve(res);
            } else {
              reject(res);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 前端登出 **/
    logOut() {
      this.username = "";
      this.roles = [];
      logoutApi({ refresh: getRefreshToken() })
        .then(res => {
          if (res.code === 1000) {
            showNotify({ type: "success", message: "登出成功" });
          }
        })
        .finally(() => {
          removeToken();
          router.push("/home");
        });
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<TokenResult>((resolve, reject) => {
        refreshTokenApi(data)
          .then(res => {
            if (res.code === 1000) {
              setToken(res.data);
              resolve(res);
            } else {
              reject(res);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
