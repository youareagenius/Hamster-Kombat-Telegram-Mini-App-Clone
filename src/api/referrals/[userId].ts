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
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId as string) });
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    const referralData = await db.collection('referrals').findOne({ userId: new ObjectId(userId as string) });
    
    return res.status(200).json({
      referralCount: referralData?.referralCount || 0,
      referralPoints: referralData?.referralPoints || 0,
      referralCode: referralData?.referralCode
    });
  } catch (error) {
    console.error('リファラルデータの取得に失敗しました:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 