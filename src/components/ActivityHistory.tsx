import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, fetchActivities } from '../utils/api';
import { toast } from 'react-hot-toast';

interface ActivityHistoryProps {
  userId: string;
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ userId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [selectedType, setSelectedType] = useState<Activity['type'] | 'all'>('all');

  const activityTypes: { value: Activity['type'] | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'すべて', icon: '📝' },
    { value: 'tap', label: 'タップ', icon: '👆' },
    { value: 'level_up', label: 'レベルアップ', icon: '⭐' },
    { value: 'achievement', label: '実績', icon: '🏆' },
    { value: 'referral', label: '紹介', icon: '👥' },
    { value: 'login', label: 'ログイン', icon: '🔑' },
  ];

  const loadActivities = async (page: number, type: Activity['type'] | 'all') => {
    try {
      const response = await fetchActivities(userId, page, 10, type);
      if (page === 1) {
        setActivities(response.activities);
      } else {
        setActivities(prev => [...prev, ...response.activities]);
      }
      setHasMore(page < response.pagination.totalPages);
    } catch (error) {
      toast.error('アクティビティ履歴の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(1, selectedType);
  }, [userId, selectedType]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadActivities(activities.length / 10 + 1, selectedType);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'tap':
        return '👆';
      case 'level_up':
        return '⭐';
      case 'achievement':
        return '🏆';
      case 'referral':
        return '👥';
      case 'login':
        return '🔑';
      default:
        return '📝';
    }
  };

  if (isLoading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {activityTypes.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => setSelectedType(value)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              selectedType === value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-4"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                {activity.icon || getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
                {activity.points && (
                  <p className="text-sm text-green-500 mt-1">
                    +{activity.points.toLocaleString()} ポイント
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-blue-500 hover:text-blue-600 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                <span>読み込み中...</span>
              </div>
            ) : (
              'もっと見る'
            )}
          </button>
        </div>
      )}

      {!hasMore && activities.length > 0 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          これ以上のアクティビティはありません
        </p>
      )}

      {!isLoading && activities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">アクティビティ履歴がありません</p>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory; 