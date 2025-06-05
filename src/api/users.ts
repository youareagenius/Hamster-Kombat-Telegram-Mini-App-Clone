// ユーザー情報の型定義
export interface UserType {
  _id: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  isPublic: boolean;
  createdAt: Date;
}

// ユーザー情報を取得する関数
export async function getUser(userId: string): Promise<UserType> {
  try {
    const response = await fetch(`https://tagapp-psi.vercel.app/api/users/${userId}`);
    if (!response.ok) {
      throw new Error('ユーザー情報の取得に失敗しました');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
} 