// frontend/services/user.service.ts
import { apiRequest } from "@/lib/api";
import type { ServiceResult, UserProfile } from "./types";

const EMPTY: UserProfile = {
  nickname: "",
  pcl: 0,
  patent: "",
  lastestHistoric: [],
};

export async function getMe(): Promise<ServiceResult<UserProfile>> {
  try {
    const data = await apiRequest<UserProfile>("/me");
    return { data };
  } catch (err) {
    return {
      data: EMPTY,
      error: err instanceof Error ? err.message : "Erro ao carregar perfil.",
    };
  }
}
