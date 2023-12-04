import Cookies from "js-cookie";
import { useUserStoreHook } from "@/store/modules/user";
import type { TokenInfo, UserInfo } from "@/api/system/auth";

export const userKey = "xmovie-user-info";
const TokenKey = "xmovie-X-Token";
const RefreshTokenKey = "xmovie-X-Refresh-Token";

/** 获取`token` */
export function getToken(): string {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  return Cookies.get(TokenKey);
}

export function getRefreshToken() {
  return Cookies.get(RefreshTokenKey);
}

export function setAccessToken(token: string, expires = 864e3) {
  Cookies.remove(TokenKey);
  return Cookies.set(TokenKey, token, {
    expires: new Date(Date.now() + 1000 * expires)
  });
}

export function setRefreshToken(token: string, expires = 864e3) {
  return Cookies.set(RefreshTokenKey, token, {
    expires: new Date(Date.now() + 1000 * expires)
  });
}

/**
 * @description 设置`token`以及一些必要信息并采用无感刷新`token`方案
 * 无感刷新：后端返回`accessToken`（访问接口使用的`token`）、`refreshToken`（用于调用刷新`accessToken`的接口时所需的`token`，`refreshToken`的过期时间（比如30天）应大于`accessToken`的过期时间（比如2小时））、`expires`（`accessToken`的过期时间）
 * 将`accessToken`、`expires`这两条信息放在key值为authorized-token的cookie里（过期自动销毁）
 * 将`username`、`roles`、`refreshToken`、`expires`这四条信息放在key值为`user-info`的storageLocal里
 */
export function setToken(data: TokenInfo) {
  if (data.access && data.access_token_lifetime) {
    setAccessToken(data.access, data.access_token_lifetime - 10);
  }
  if (data.refresh && data.refresh_token_lifetime) {
    setRefreshToken(data.refresh, data.refresh_token_lifetime - 10);
  }
}

export function setUserInfo(data: UserInfo) {
  useUserStoreHook().SET_USERNAME(data.username);
  useUserStoreHook().SET_AVATAR(data.avatar);

  Cookies.set(userKey, JSON.stringify(data), {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  });
}

export function getUserInfo(): UserInfo {
  const info = Cookies.get(userKey);
  if (info) {
    return JSON.parse(info);
  } else {
    return {
      avatar: "",
      date_joined: "",
      email: "",
      is_active: false,
      last_login: "",
      mobile: "",
      nickname: "",
      pk: 0,
      roles: [],
      sex: 0,
      unread_message_count: 0,
      username: ""
    };
  }
}

/** 删除`token`以及key值为`user-info`的session信息 */
export function removeToken() {
  Cookies.remove(TokenKey);
  Cookies.remove(RefreshTokenKey);
  Cookies.remove(userKey);
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return "Bearer " + token;
};
