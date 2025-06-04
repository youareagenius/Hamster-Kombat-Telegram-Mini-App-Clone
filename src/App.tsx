import React, { useState, useEffect } from 'react';
import './App.css';
import Hamster from './icons/Hamster';
import { binanceLogo, dollarCoin, hamsterCoin, mainCharacter, logoClear, spbgearth, rocket2, numberImages } from './images';
import Info from './icons/Info';
import Settings from './icons/Settings';
import Mine from './icons/Mine';
import Friends from './icons/Friends';
import Coins from './icons/Coins';

const App: React.FC = () => {
  const levelNames = [
    "Bronze",    // From 0 to 4999 coins
    "Silver",    // From 5000 coins to 24,999 coins
    "Gold",      // From 25,000 coins to 99,999 coins
    "Platinum",  // From 100,000 coins to 999,999 coins
    "Diamond",   // From 1,000,000 coins to 2,000,000 coins
    "Epic",      // From 2,000,000 coins to 10,000,000 coins
    "連続ログイン", // From 10,000,000 coins to 50,000,000 coins
    "Master",    // From 50,000,000 coins to 100,000,000 coins
    "GrandMaster", // From 100,000,000 coins to 1,000,000,000 coins
    "Lord"       // From 1,000,000,000 coins to ∞
  ];

  const levelMinPoints = [
    0,        // Bronze
    5000,     // Silver
    25000,    // Gold
    100000,   // Platinum
    1000000,  // Diamond
    2000000,  // Epic
    10000000, // Legendary
    50000000, // Master
    100000000,// GrandMaster
    1000000000// Lord
  ];

  const [levelIndex, setLevelIndex] = useState(6);
  const [points, setPoints] = useState(22749365);
  const [clicks, setClicks] = useState<{ id: number, x: number, y: number }[]>([]);
  const pointsToAdd = 11;
  const profitPerHour = 126420;

  const [dailyCipherTimeLeft, setDailyCipherTimeLeft] = useState("");
  const [dailyComboTimeLeft, setDailyComboTimeLeft] = useState("");

  const calculateTimeLeft = (targetHour: number) => {
    const now = new Date();
    const target = new Date(now);
    target.setUTCHours(targetHour, 0, 0, 0);

    if (now.getUTCHours() >= targetHour) {
      target.setUTCDate(target.getUTCDate() + 1);
    }

    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}`;
  };

  useEffect(() => {
    const updateCountdowns = () => {
      setDailyCipherTimeLeft(calculateTimeLeft(19));
      setDailyComboTimeLeft(calculateTimeLeft(12));
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`;
    setTimeout(() => {
      card.style.transform = '';
    }, 100);

    setPoints(points + pointsToAdd);
    setClicks([...clicks, { id: Date.now(), x: e.pageX, y: e.pageY }]);
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setTapCount((prev) => (prev < TAP_LIMIT ? prev + 1 : prev));
  };

  const handleAnimationEnd = (id: number) => {
    setClicks((prevClicks) => prevClicks.filter(click => click.id !== id));
  };

  const calculateProgress = () => {
    if (levelIndex >= levelNames.length - 1) {
      return 100;
    }
    const currentLevelMin = levelMinPoints[levelIndex];
    const nextLevelMin = levelMinPoints[levelIndex + 1];
    const progress = ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    return Math.min(progress, 100);
  };

  useEffect(() => {
    const currentLevelMin = levelMinPoints[levelIndex];
    const nextLevelMin = levelMinPoints[levelIndex + 1];
    if (points >= nextLevelMin && levelIndex < levelNames.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else if (points < currentLevelMin && levelIndex > 0) {
      setLevelIndex(levelIndex - 1);
    }
  }, [points, levelIndex, levelMinPoints, levelNames.length]);

  const formatProfitPerHour = (profit: number) => {
    if (profit >= 1000000000) return `+${(profit / 1000000000).toFixed(2)}B`;
    if (profit >= 1000000) return `+${(profit / 1000000).toFixed(2)}M`;
    if (profit >= 1000) return `+${(profit / 1000).toFixed(2)}K`;
    return `+${profit}`;
  };

  useEffect(() => {
    const pointsPerSecond = Math.floor(profitPerHour / 3600);
    const interval = setInterval(() => {
      setPoints(prevPoints => prevPoints + pointsPerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [profitPerHour]);

  // タップ進捗バー用の状態
  const [tapCount, setTapCount] = useState(0);
  const [shake, setShake] = useState(false);
  const TAP_LIMIT = 1000;

  // タップ時の進捗バーアニメーション
  const handleTap = () => {
    setTapCount((prev) => (prev < TAP_LIMIT ? prev + 1 : prev));
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  // ラウンドリセット（1時間ごと）
  useEffect(() => {
    const now = new Date();
    const msToNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
    const timeout = setTimeout(() => setTapCount(0), msToNextHour);
    return () => clearTimeout(timeout);
  }, [tapCount]);

  return (
    <div
      className="flex justify-center"
      style={{
        backgroundColor: '#eee',
        minHeight: '100vh',
        width: '100vw',
      }}
    >
      <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl justify-start">
        <div className="px-4 z-10">
          <div className="flex items-center space-x-2 pt-4">
            <div className="p-1 rounded-lg bg-[#1d2025]">
              <Hamster size={24} className="text-[#d4d4d4]" />
            </div>
            <div>
              <p className="text-sm">Nikandr (CEO)</p>
            </div>
          </div>
          <div className="flex items-center justify-between space-x-4 mt-1">
            <div className="flex items-center w-1/3">
              <div className="w-full">
                <div className="flex justify-between">
                  <p className="text-sm">{levelNames[levelIndex]}</p>
                  <p className="text-sm">{levelIndex + 1} <span className="text-[#95908a]">/ {levelNames.length}</span></p>
                </div>
                <div className="flex items-center mt-1 border-2 border-[#43433b] rounded-full">
                  <div className="w-full h-2 bg-[#43433b]/[0.6] rounded-full">
                    <div className="progress-gradient h-2 rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center w-2/3 border-2 border-[#43433b] rounded-full px-4 py-[2px] bg-[#43433b]/[0.6] max-w-64">
              <img src={binanceLogo} alt="Exchange" className="w-8 h-8" />
              <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
              <div className="flex-1 text-center">
                <p className="text-xs text-[#85827d] font-medium">Profit per hour</p>
                <div className="flex items-center justify-center space-x-1">
                  <img src={dollarCoin} alt="Dollar Coin" className="w-[18px] h-[18px]" />
                  <p className="text-sm">{formatProfitPerHour(profitPerHour)}</p>
                  <Info size={20} className="text-[#43433b]" />
                </div>
              </div>
              <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
              <Settings className="text-white" />
            </div>
          </div>
        </div>

        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div 
            className="absolute top-[2px] left-0 right-0 bottom-0 rounded-t-[46px]"
            style={{
              backgroundImage: `url(${spbgearth})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="px-4 mt-6 flex justify-between gap-2">
              <div className="bg-[#272a2f] rounded-lg px-4 py-2 w-1/2 relative">
                <div className="dot"></div>
                <div className="flex justify-center items-end mt-1 mb-1">
                  {['3','4','6','2'].map((digit, idx) => (
                    <img key={idx} src={numberImages[Number(digit)]} alt={digit} className="w-10 h-10 mx-1" />
                  ))}
                </div>
                <p className="text-[10px] text-center text-white mt-1">Today Taps</p>
                <p className="text-[10px] font-medium text-center text-gray-400 mt-2">{dailyCipherTimeLeft}</p>
              </div>
              <div className="bg-[#272a2f] rounded-lg px-4 py-2 w-1/2 relative">
                <div className="dot"></div>
                <img src={numberImages[5]} alt="5" className="mx-auto w-12 h-12" />
                <p className="text-[10px] text-center text-white mt-1">Max Combo!</p>
                <p className="text-[10px] font-medium text-center text-gray-400 mt-2">{dailyComboTimeLeft}</p>
              </div>
            </div>

            <div className="px-4 mt-0 flex justify-center">
              <div className="w-full flex flex-col items-center">
                <div className={`relative w-full max-w-md h-24 flex items-center justify-center mb-4 ${shake ? 'animate-shake' : ''}`} style={{cursor:'pointer'}} onClick={handleTap}>
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-10 rounded-full bg-gradient-to-r from-indigo-900 via-blue-700 to-yellow-400 border-4 border-blue-300 shadow-2xl overflow-hidden progress-bar-pro">
                    <div className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-600 progress-bar-inner" style={{ width: `calc(${tapCount} / ${TAP_LIMIT} * 100%)`, transition: 'width 0.3s cubic-bezier(.68,-0.55,.27,1.55)' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center justify-center space-x-1">
                        {String(tapCount).padStart(3, '0').split('').map((digit, idx) => (
                          <img key={`current-${idx}`} src={numberImages[Number(digit)]} alt={digit} className="w-6 h-6" />
                        ))}
                        <img src={numberImages[10]} alt="/" className="w-4 h-4 mx-1" />
                        {String(TAP_LIMIT).split('').map((digit, idx) => (
                          <img key={`limit-${idx}`} src={numberImages[Number(digit)]} alt={digit} className="w-6 h-6" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <img src={rocket2} alt="Rocket" className="absolute z-10 w-14 h-14 rocket-float" style={{ left: `calc((100% - 56px) * ${(tapCount/TAP_LIMIT)})`, top: 'calc(50% - 28px)', transition: 'left 0.3s cubic-bezier(.68,-0.55,.27,1.55)' }} />
                </div>
                {/* デバッグ用：tapCountの値を表示 */}
                <div className="text-xs text-white">tapCount: {tapCount}</div>
              </div>
            </div>
            <div className="px-4 mt-0 flex justify-center">
              <div
                className={`w-80 h-80 p-4 rounded-full circle-outer${shake ? ' animate-shake' : ''}`}
                onClick={handleCardClick}
              >
                <div className="w-full h-full rounded-full circle-inner relative">
                  <img 
                    src={logoClear} 
                    alt="Logo" 
                    className="absolute inset-0 w-full h-full rotate-animation opacity-20 scale-125" 
                  />
                  <img 
                    src={mainCharacter} 
                    alt="Main Character" 
                    className="w-full h-full floating-animation relative z-10" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fixed div */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-[#272a2f] flex justify-around items-center z-50 rounded-3xl text-xs">
        <div className="text-center text-[#85827d] w-1/5 bg-[#1c1f24] m-1 p-2 rounded-2xl">
          <img src={logoClear} alt="YAG TAP" className="w-6 h-6 mx-auto" />
          <p className="mt-1">YAG TAP</p>
        </div>
        <div className="text-center text-[#85827d] w-1/5">
          <Mine className="w-8 h-8 mx-auto" />
          <p className="mt-1">Mine</p>
        </div>
        <div className="text-center text-[#85827d] w-1/5">
          <Friends className="w-8 h-8 mx-auto" />
          <p className="mt-1">Friends</p>
        </div>
        <div className="text-center text-[#85827d] w-1/5">
          <Coins className="w-8 h-8 mx-auto" />
          <p className="mt-1">Earn</p>
        </div>
        <div className="text-center text-[#85827d] w-1/5">
          <img src={hamsterCoin} alt="Airdrop" className="w-8 h-8 mx-auto" />
          <p className="mt-1">Airdrop</p>
        </div>
      </div>

      {clicks.map((click) => (
        <div
          key={click.id}
          className="absolute text-5xl font-bold opacity-0 text-white pointer-events-none"
          style={{
            top: `${click.y - 42}px`,
            left: `${click.x - 28}px`,
            animation: `float 1s ease-out`
          }}
          onAnimationEnd={() => handleAnimationEnd(click.id)}
        >
          {pointsToAdd}
        </div>
      ))}
    </div>
  );
};

export default App;
