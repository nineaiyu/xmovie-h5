import { http } from "@/utils/http";
import type { Result } from "./types";

/** 获取电影播放记录 */
export const getWatchHistoryListApi = (data?: object) => {
  return http.request<Result>("get", "/api/movies/h5/history", {
    params: data
  });
};

export const createWatchHistoryApi = (data?: object) => {
  return http.request<Result>("post", "/api/movies/h5/history", {
    data: data
  });
};

export const updateWatchHistoryApi = (pk?: string, data?: object) => {
  return http.request<Result>("put", `/api/movies/h5/history/${pk}`, {
    data: data
  });
};

export const deleteWatchHistoryApi = (pk?: string) => {
  return http.request<Result>("delete", `/api/movies/h5/history/${pk}`);
};

export const manyDeleteWatchHistoryApi = (data?: object) => {
  return http.request<Result>("delete", `/api/movies/h5/history/many-delete`, {
    params: data
  });
};

export const updateWatchHistoryTimesApi = (data?: object) => {
  return http.request<Result>("post", "/api/movies/h5/history/times", {
    data: data
  });
};
