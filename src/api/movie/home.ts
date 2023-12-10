import { http } from "@/utils/http";
import type { Result } from "./types";

export const getHomeDataApi = (params: object) => {
  return http.request<Result>("get", "/api/movies/h5/home", {
    params
  });
};
