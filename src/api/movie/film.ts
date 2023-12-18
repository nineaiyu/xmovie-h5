import { http } from "@/utils/http";
import type { DetailResult, Result, VideoPreviewResult } from "./types";

export const getFilmDataApi = (params: object) => {
  return http.request<Result>("get", "/api/movies/h5/film", {
    params
  });
};

export const getFilmRecommendDataApi = (pk: string) => {
  return http.request<Result>("get", `/api/movies/h5/film/${pk}/recommend`);
};

export const getFilmPlayingDataApi = (pk: string) => {
  return http.request<DetailResult>("get", `/api/movies/h5/film/${pk}/current`);
};

export const getFilterApi = (params: object) => {
  return http.request<Result>("get", "/api/movies/h5/filter", {
    params
  });
};

export const getFilmDetailApi = (pk: string) => {
  return http.request<DetailResult>("get", `/api/movies/h5/detail/${pk}`);
};

export const getFilmPreviewApi = (pk: string) => {
  return http.request<Result>("get", `/api/movies/h5/preview/${pk}`);
};

export const getFilmPreviewJsonApi = (url: string) => {
  return http.request<VideoPreviewResult>("get", `${url}&act=json`);
};

export const getFilmDownloadApi = (pk: string) => {
  return http.request<VideoPreviewResult>(
    "post",
    `/api/movies/h5/preview/${pk}`
  );
};
