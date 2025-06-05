import { getUser } from '../api/users';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

export interface ReferralData {
  referralCount: number;
  referralPoints: number;
  referralCode?: string;
}

export interface ReferralHistory {
  id: string;
  referredUserName: string;
  points: number;
  timestamp: string;
  details: {
    description: string;
  };
}

export interface ReferralRanking {
  userId: string;
  userName: string;
  rank: number;
  referralCount: number;
  referralPoints: number;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ReferralHistoryResponse {
  history: ReferralHistory[];
  pagination: PaginationData;
}

export interface UserProfile {
  id: string | number;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  createdAt: string;
  isPublic: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  error?: string;
}

export interface Activity {
  id: string;
  type: 'tap' | 'level_up' | 'achievement' | 'referral' | 'login';
  title: string;
  description: string;
  points?: number;
  timestamp: string;
  icon: string;
}

export interface ActivityResponse {
  activities: Activity[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const fetchReferralData = async (userId: string): Promise<ReferralData> => {
  const response = await fetch(`/api/referrals/${userId}`);
  if (!response.ok) {
    throw new Error('リファラルデータの取得に失敗しました');
  }
  return response.json();
};

export const generateReferralCode = async (userId: string): Promise<string> => {
  const response = await fetch(`/api/referrals/${userId}/code`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('リファラルコードの生成に失敗しました');
  }
  const data = await response.json();
  return data.code;
};

export const fetchReferralHistory = async (userId: string): Promise<{ history: ReferralHistory[] }> => {
  const response = await fetch(`/api/referrals/${userId}/history`);
  if (!response.ok) {
    throw new Error('リファラル履歴の取得に失敗しました');
  }
  return response.json();
};

export const fetchReferralRanking = async (): Promise<ReferralRanking[]> => {
  const response = await fetch('/api/referrals/ranking');
  if (!response.ok) {
    throw new Error('リファラルランキングの取得に失敗しました');
  }
  return response.json();
};

export async function updateProfile(userId: string, profile: Partial<UserProfile>) {
  try {
    const userData = await getUser(userId);
    return {
      data: {
        ...userData,
        ...profile
      }
    };
  } catch (error) {
    throw new Error('プロフィールの更新に失敗しました');
  }
}

export async function uploadAvatar(file: File) {
  // TODO: 実際のアップロード処理を実装
  return {
    data: {
      avatarUrl: URL.createObjectURL(file)
    }
  };
}

export const fetchActivities = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  type?: Activity['type'] | 'all'
): Promise<ActivityResponse> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(type && type !== 'all' && { type })
  });

  const response = await fetch(`/api/users/${userId}/activities?${queryParams}`);
  if (!response.ok) {
    throw new Error('アクティビティ履歴の取得に失敗しました');
  }
  return response.json();
}; 