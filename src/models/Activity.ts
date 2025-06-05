import { ObjectId } from 'mongodb';

export interface Activity {
  _id?: ObjectId;
  userId: ObjectId;
  type: 'tap' | 'level_up' | 'achievement' | 'referral' | 'login';
  title: string;
  description: string;
  points?: number;
  timestamp: Date;
  icon?: string;
}

export interface ActivityResponse {
  activities: {
    id: string;
    type: Activity['type'];
    title: string;
    description: string;
    points?: number;
    timestamp: string;
    icon?: string;
  }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
} 