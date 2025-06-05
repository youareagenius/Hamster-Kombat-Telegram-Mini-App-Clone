import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  updateProfile,
  uploadAvatar,
  UserProfile
} from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import debounce from 'lodash/debounce';
import spbgearth from '../images/sys/spbgearth.png';
import logoClear from '../images/sys/logo_clear.png';

interface UserStats {
  totalTaps: number;
  totalPoints: number;
  currentLevel: string;
  rank: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
  icon: string;
}

interface ValidationErrors {
  username?: string;
  bio?: string;
}

const Profile: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalTaps: 0,
    totalPoints: 0,
    currentLevel: 'Bronze',
    rank: 0,
    achievements: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [previewImage, setPreviewImage] = useState<string | File | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 0,
    username: 'ユーザー名',
    email: 'user@example.com',
    bio: '自己紹介文',
    avatar: logoClear,
    createdAt: new Date().toISOString(),
    isPublic: true
  });
  const navigate = useNavigate();

  // 自動保存の実装
  const debouncedSave = useCallback(
    debounce(async (profile: UserProfile) => {
      try {
        // TODO: 実際のユーザーIDを設定
        const userId = 'chana042';
        await updateProfile(userId, profile);
        toast.success('プロフィールを自動保存しました');
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }, 1000),
    []
  );

  useEffect(() => {
    if (isEditing) {
      debouncedSave(userProfile);
    }
  }, [userProfile, isEditing, debouncedSave]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // TODO: 実際のユーザーIDを設定
        const userId = 'chana042';
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('プロフィールの取得に失敗しました');
        }
        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        toast.error('プロフィールの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!userProfile.username.trim()) {
      newErrors.username = 'ユーザー名を入力してください';
    } else if (userProfile.username.length > 20) {
      newErrors.username = 'ユーザー名は20文字以内で入力してください';
    }
    
    if (userProfile.bio.length > 200) {
      newErrors.bio = '自己紹介は200文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let avatarUrl = userProfile.avatar;

      if (previewImage && typeof previewImage !== 'string') {
        const uploadResult = await uploadAvatar(previewImage);
        avatarUrl = uploadResult.data.avatarUrl;
      }

      const updatedProfile = await updateProfile(userProfile.id.toString(), {
        ...userProfile,
        avatar: avatarUrl
      });

      setUserProfile({
        ...updatedProfile.data,
        id: updatedProfile.data.id ?? userProfile.id,
        createdAt: typeof updatedProfile.data.createdAt === 'string' ? updatedProfile.data.createdAt : updatedProfile.data.createdAt.toString(),
      });
      setIsEditing(false);
      toast.success('プロフィールを更新しました');
    } catch (error) {
      toast.error('プロフィールの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(file as File);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVisibilityToggle = async () => {
    try {
      const newVisibility = !userProfile.isPublic;
      setUserProfile(prev => ({ ...prev, isPublic: newVisibility }));
      // TODO: 実際のユーザーIDを設定
      const userId = 'chana042';
      await updateProfile(userId, { isPublic: newVisibility });
      toast.success(`プロフィールを${newVisibility ? '公開' : '非公開'}にしました`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl justify-start">
      <Toaster position="top-right" />
      <div className="flex-grow mt-0 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0 flex flex-col justify-start">
        <div
          className="absolute top-[2px] left-0 right-0 bottom-0 rounded-t-[46px] overflow-y-auto"
          style={{
            backgroundImage: `url(${spbgearth})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex flex-col items-center pt-8">
            <div className="relative w-full max-w-md mx-auto">
              <div className="relative flex flex-col items-center bg-[#272a2f] rounded-2xl shadow-lg p-6 mb-6">
                <img
                  src={typeof previewImage === 'string' ? previewImage : (previewImage ? URL.createObjectURL(previewImage as File) : userProfile.avatar)}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mb-2"
                />
                {isEditing && (
                  <label className="absolute bottom-8 right-8 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isLoading}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                )}
                {isEditing ? (
                  <form onSubmit={handleProfileUpdate} className="w-full space-y-4 mt-4">
                    <div>
                      <input
                        type="text"
                        value={userProfile.username}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, username: e.target.value }))}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black ${errors.username ? 'border-red-300' : 'border-gray-300'}`}
                        disabled={isLoading}
                        placeholder="ユーザー名"
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-400">{errors.username}</p>
                      )}
                    </div>
                    <div>
                      <textarea
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black ${errors.bio ? 'border-red-300' : 'border-gray-300'}`}
                        disabled={isLoading}
                        placeholder="自己紹介"
                      />
                      {errors.bio && (
                        <p className="mt-1 text-sm text-red-400">{errors.bio}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={userProfile.isPublic}
                          onChange={handleVisibilityToggle}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                          disabled={isLoading}
                        />
                        <span className="text-sm text-gray-300">プロフィールを公開する</span>
                      </label>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? '保存中...' : '保存'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        キャンセル
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="w-full text-center mt-2">
                    <h2 className="text-2xl font-bold mb-1">{userProfile.username}</h2>
                    <p className="text-gray-400 mb-2">{userProfile.email}</p>
                    <p className="text-gray-300 mb-4">{userProfile.bio}</p>
                    <span className={`text-sm ${userProfile.isPublic ? 'text-green-400' : 'text-gray-500'}`}>{userProfile.isPublic ? '公開中' : '非公開'}</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="block mx-auto mt-4 bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      プロフィールを編集
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-[#272a2f] rounded-2xl shadow-lg p-6 mt-6 w-full max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4 text-white">統計情報</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1c1f24] rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-400">総タップ数</p>
                  <p className="text-xl font-bold">{userStats.totalTaps.toLocaleString()}</p>
                </div>
                <div className="bg-[#1c1f24] rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-400">総ポイント</p>
                  <p className="text-xl font-bold">{userStats.totalPoints.toLocaleString()}</p>
                </div>
                <div className="bg-[#1c1f24] rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-400">ランク</p>
                  <p className="text-xl font-bold">#{userStats.rank}</p>
                </div>
                <div className="bg-[#1c1f24] rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-400">レベル</p>
                  <p className="text-xl font-bold">{userStats.currentLevel}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#272a2f] rounded-2xl shadow-lg p-6 mt-6 w-full max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4 text-white">アチーブメント</h3>
              <div className="space-y-4">
                {userStats.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-4">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-white">{achievement.title}</h4>
                        <span className="text-sm text-gray-400">{achievement.progress}%</span>
                      </div>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${achievement.completed ? 'bg-green-400' : 'bg-blue-400'}`}
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#272a2f] rounded-2xl shadow-lg p-6 mt-6 w-full max-w-md mx-auto mb-24">
              <h3 className="text-lg font-semibold mb-4 text-white">設定</h3>
              <div className="space-y-2">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-[#1c1f24] rounded-lg transition-colors text-white"
                  onClick={() => navigate('/settings/notifications')}
                >
                  通知設定
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-[#1c1f24] rounded-lg transition-colors text-white"
                  onClick={() => navigate('/settings/privacy')}
                >
                  プライバシー設定
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-[#1c1f24] rounded-lg transition-colors text-red-400"
                  onClick={() => {/* TODO: ログアウト処理 */}}
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 