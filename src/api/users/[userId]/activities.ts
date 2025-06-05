import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();

    // ユーザーの存在確認
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId as string) });
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    // アクティビティ履歴の取得
    const activities = await db
      .collection('activities')
      .find({ userId: new ObjectId(userId as string) })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // 総件数の取得
    const totalItems = await db
      .collection('activities')
      .countDocuments({ userId: new ObjectId(userId as string) });

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      activities: activities.map(activity => ({
        id: activity._id.toString(),
        type: activity.type,
        title: activity.title,
        description: activity.description,
        points: activity.points,
        timestamp: activity.timestamp,
        icon: activity.icon
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('アクティビティ履歴の取得に失敗しました:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 