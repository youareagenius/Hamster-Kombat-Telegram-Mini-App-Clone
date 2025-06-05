import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const client = await clientPromise;
    const db = client.db();

    // ユーザーが存在するか確認
    const user = await db.collection('users').findOne({
      _id: new ObjectId(userId as string)
    });

    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    // 既存のリファラルコードを確認
    if (user.referralCode) {
      return res.status(200).json({ code: user.referralCode });
    }

    // 新しいリファラルコードを生成
    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    // ユーザーにリファラルコードを保存
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId as string) },
      { $set: { referralCode } }
    );

    return res.status(200).json({ code: referralCode });
  } catch (error) {
    console.error('Error generating referral code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 