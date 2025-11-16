
import { apiClient } from './client';

export interface Moderator {
  id: number;
  name: string;
  avatarUrl?: string;
}

export const moderatorsApi = {
  getMe(signal?: AbortSignal) {
    return apiClient.get<Moderator>('/moderators/me', { signal });
  },
};
