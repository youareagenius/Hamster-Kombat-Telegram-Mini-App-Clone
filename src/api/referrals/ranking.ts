import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // リファラルランキングを取得
    const ranking = await db.collection('users')
      .aggregate([
        {
          $project: {
            _id: 1,
            username: 1,
            referralCount: 1,
            referralPoints: 1
          }
        },
        {
          $sort: {
            referralPoints: -1,
            referralCount: -1
          }
        },
        {
          $limit: 50
        }
      ])
      .toArray();

    // ランキングデータを整形
    const formattedRanking = ranking.map((user, index) => ({
      userId: user._id.toString(),
      userName: user.username,
      rank: index + 1,
      referralCount: user.referralCount || 0,
      referralPoints: user.referralPoints || 0
    }));

    return res.status(200).json(formattedRanking);
  } catch (error) {
    console.error('Error fetching referral ranking:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 