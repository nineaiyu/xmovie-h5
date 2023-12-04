import { http } from "@/utils/http";
import type { Result } from "./types";

export const getActorDetailApi = (pk: string) => {
  return http.request<Result>("get", `/api/movies/h5/actor/${pk}`);
};
