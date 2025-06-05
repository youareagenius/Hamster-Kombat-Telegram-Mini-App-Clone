import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const client = await clientPromise;
    const db = client.db();

    // リファラル履歴を取得
    const history = await db.collection('referralHistory')
      .find({ referrerId: new ObjectId(userId as string) })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    // 紹介されたユーザーの情報を取得
    const referredUserIds = history.map(item => item.referredUserId);
    const referredUsers = await db.collection('users')
      .find({ _id: { $in: referredUserIds } })
      .project({ _id: 1, username: 1 })
      .toArray();

    // ユーザー情報をマッピング
    const historyWithUserInfo = history.map(item => ({
      id: item._id.toString(),
      referredUserName: referredUsers.find(u => u._id.toString() === item.referredUserId.toString())?.username || 'Unknown User',
      points: item.points,
      timestamp: item.timestamp.toISOString(),
      details: {
        description: item.description
      }
    }));

    return res.status(200).json({ history: historyWithUserInfo });
  } catch (error) {
    console.error('Error fetching referral history:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 