import React, { useState } from 'react';
import { numberImages } from '../images';
import { TwitterIcon, TelegramIcon, WhatsAppIcon, CopyIcon } from '../icons/SocialIcons';

const Friends: React.FC = () => {
  const inviteCode = 'YAGTAP123';
  const [copySuccess, setCopySuccess] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const friendsList = [
    { id: 1, name: 'User1', level: 'Gold', taps: 15000, invited: true },
    { id: 2, name: 'User2', level: 'Silver', taps: 8000, invited: true },
    { id: 3, name: 'User3', level: 'Bronze', taps: 3000, invited: false },
  ];

  const rewards = {
    totalInvites: 2,
    pendingRewards: 500,
    claimedRewards: 1000,
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const generateInviteLink = () => {
    return `https://yagtap.com/invite/${inviteCode}`;
  };

  const handleShare = async (platform: string) => {
    const inviteLink = generateInviteLink();
    const shareText = `Join me on YAG TAP! Use my invite code: ${inviteCode}\n${inviteLink}`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareText);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
    }
  };

  return (
    <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl justify-start">
      <div className="px-4 z-10">
        <div className="flex items-center space-x-2 pt-4">
          <div className="p-1 rounded-lg bg-[#1d2025]">
            <h1 className="text-lg">Friends</h1>
          </div>
        </div>
      </div>
      <div className="flex-grow mt-0 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0 flex flex-col justify-start">
        <div className="absolute top-[2px] left-0 right-0 bottom-0 rounded-t-[46px] bg-[#1c1f24] overflow-y-auto">
          {/* 招待コードセクション */}
          <div className="p-4">
            <div className="bg-[#272a2f] rounded-lg p-4">
              <h2 className="text-sm text-gray-400 mb-2">Your Invite Code</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {inviteCode.split('').map((char, idx) => (
                    <div key={idx} className="bg-[#1c1f24] px-3 py-2 rounded">
                      {char}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleCopyCode}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                    copySuccess 
                      ? 'bg-green-500 text-white' 
                      : 'bg-[#f3ba2f] text-black hover:bg-[#e5b02d]'
                  }`}
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* 報酬セクション */}
          <div className="px-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#272a2f] rounded-lg p-3 text-center">
                <p className="text-sm text-gray-400">Total Invites</p>
                <div className="flex items-center justify-center mt-1">
                  {String(rewards.totalInvites).split('').map((digit, idx) => (
                    <img key={idx} src={numberImages[Number(digit)]} alt={digit} className="w-4 h-4" />
                  ))}
                </div>
              </div>
              <div className="bg-[#272a2f] rounded-lg p-3 text-center">
                <p className="text-sm text-gray-400">Pending Rewards</p>
                <div className="flex items-center justify-center mt-1">
                  <img src={numberImages[5]} alt="5" className="w-4 h-4" />
                  <span className="text-lg ml-1">00</span>
                </div>
              </div>
              <div className="bg-[#272a2f] rounded-lg p-3 text-center">
                <p className="text-sm text-gray-400">Claimed Rewards</p>
                <div className="flex items-center justify-center mt-1">
                  <img src={numberImages[1]} alt="1" className="w-4 h-4" />
                  <span className="text-lg ml-1">000</span>
                </div>
              </div>
            </div>
          </div>

          {/* 友達リスト */}
          <div className="p-4">
            <h2 className="text-sm text-gray-400 mb-3">Friends List</h2>
            <div className="space-y-3">
              {friendsList.map((friend) => (
                <div key={friend.id} className="bg-[#272a2f] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">{friend.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{friend.level}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end">
                        {String(friend.taps).split('').map((digit, idx) => (
                          <img key={idx} src={numberImages[Number(digit)]} alt={digit} className="w-4 h-4" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Taps</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 招待ボタン */}
          <div className="p-4">
            <button 
              onClick={() => setShowShareModal(true)}
              className="w-full bg-[#f3ba2f] text-black py-3 rounded-lg font-bold hover:bg-[#e5b02d] transition-colors duration-200"
            >
              Invite Friends
            </button>
          </div>
        </div>
      </div>

      {/* 共有モーダル */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1c1f24] rounded-2xl p-6 w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Share with Friends</h2>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleShare('twitter')}
                  className="bg-[#1DA1F2] text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#1a8cd8] transition-colors duration-200"
                >
                  <TwitterIcon className="w-5 h-5" />
                  <span>Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('telegram')}
                  className="bg-[#0088cc] text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#0077b3] transition-colors duration-200"
                >
                  <TelegramIcon className="w-5 h-5" />
                  <span>Telegram</span>
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="bg-[#25D366] text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#22c35e] transition-colors duration-200"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="bg-[#272a2f] text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#1c1f24] transition-colors duration-200"
                >
                  <CopyIcon className="w-5 h-5" />
                  <span>Copy Link</span>
                </button>
              </div>
              <div className="bg-[#272a2f] rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-1">Invite Link</p>
                <p className="text-sm break-all">{generateInviteLink()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friends; 