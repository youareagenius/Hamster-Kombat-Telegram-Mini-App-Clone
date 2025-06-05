import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  fetchReferralData,
  fetchReferralHistory,
  fetchReferralRanking,
  generateReferralCode,
  ReferralData,
  ReferralHistory,
  ReferralRanking
} from '../utils/api';

const Referral: React.FC = () => {
  const [referralData, setReferralData] = useState<ReferralData>({
    referralCount: 0,
    referralPoints: 0
  });
  const [referralHistory, setReferralHistory] = useState<ReferralHistory[]>([]);
  const [referralRanking, setReferralRanking] = useState<ReferralRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'ranking'>('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        // TODO: 実際のユーザーIDを設定
        const userId = 'chana042';
        const [data, history, ranking] = await Promise.all([
          fetchReferralData(userId),
          fetchReferralHistory(userId),
          fetchReferralRanking()
        ]);
        setReferralData(data);
        setReferralHistory(history.history);
        setReferralRanking(ranking);
      } catch (error) {
        toast.error('データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleGenerateCode = async () => {
    try {
      // TODO: 実際のユーザーIDを設定
      const userId = 'chana042';
      const code = await generateReferralCode(userId);
      setReferralData(prev => ({ ...prev, referralCode: code }));
      toast.success('リファラルコードを生成しました');
    } catch (error) {
      toast.error('リファラルコードの生成に失敗しました');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('クリップボードにコピーしました');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              概要
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'history'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('history')}
            >
              履歴
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'ranking'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('ranking')}
            >
              ランキング
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">紹介数</p>
                  <p className="text-2xl font-bold">{referralData.referralCount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">獲得ポイント</p>
                  <p className="text-2xl font-bold">{referralData.referralPoints}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">リファラルコード</h3>
                {referralData.referralCode ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={referralData.referralCode}
                      readOnly
                      className="flex-1 p-2 border rounded-md bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(referralData.referralCode!)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      コピー
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateCode}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    コードを生成
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {referralHistory.map((item) => (
                <div
                  key={item.id}
                  className="border-b last:border-b-0 pb-4 last:pb-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.referredUserName}</p>
                      <p className="text-sm text-gray-500">{item.details.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-medium">+{item.points}pt</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'ranking' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {referralRanking.map((rank) => (
                <div
                  key={rank.userId}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full">
                    {rank.rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{rank.userName}</p>
                    <p className="text-sm text-gray-500">
                      紹介数: {rank.referralCount} | ポイント: {rank.referralPoints}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Referral; 