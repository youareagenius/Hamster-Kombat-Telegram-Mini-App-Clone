import { useState, useEffect } from 'react';
import { getUser } from '../api/users';

interface User {
  id?: number;
  _id?: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  createdAt: string | Date;
  isPublic: boolean;
}

export default function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser(userId);
        setUser({
          ...userData,
          id: parseInt(userData._id)
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      }
    };

    fetchUser();
  }, [userId]);

  if (error) {
    return <div className="text-red-500">エラー: {error}</div>;
  }

  if (!user) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">{user.username}</h2>
      <p className="text-gray-600">{user.email}</p>
      <p className="text-sm text-gray-500">
        登録日: {new Date(user.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
} 