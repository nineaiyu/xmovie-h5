import { http } from "@/utils/http";
import type { DetailResult, Result } from "./types";

export const getFilmDetailApi = (pk: string) => {
  return http.request<DetailResult>("get", `/api/movies/h5/detail/${pk}`);
};

export const getFilmPreviewApi = (pk: string) => {
  return http.request<Result>("get", `/api/movies/h5/preview/${pk}`);
};
