import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import tapgameIcon from '../images/icon/yagtap.png';
import friendsIcon from '../images/icon/friends.png';
import earnIcon from '../images/icon/earn.png';
import profileIcon from '../images/icon/profile.png';

const FooterNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'タップ', icon: tapgameIcon },
    { path: '/friends', label: 'フレンド', icon: friendsIcon },
    { path: '/earn', label: '獲得', icon: earnIcon },
    { path: '/profile', label: 'プロフィール', icon: profileIcon },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
    >
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                location.pathname === path
                  ? 'text-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <img src={icon} alt={label} className="w-6 h-6 mb-1" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default FooterNav; 