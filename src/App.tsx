import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Hamster from './icons/Hamster';
import { binanceLogo, dollarCoin, mainCharacter, logoClear, spbgearth, rocket2, numberImages, tapgameIcon, friendsIcon, earnIcon, profileIcon } from './images';
import slashImage from './images/number/slash.png';
import Info from './icons/Info';
import Settings from './icons/Settings';
import FriendsPage from './pages/Friends';
import Profile from './pages/Profile';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';
import FooterNav from './components/FooterNav';
import { getUser } from './api/users';

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

const endpoint = 'https://api.mainnet-beta.solana.com';

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
  const pointsToAdd = 1;
  const profitPerHour = 126420;

  const [dailyComboTimeLeft, setDailyComboTimeLeft] = useState("");
  const [todayTapsTimeLeft, setTodayTapsTimeLeft] = useState("");
  const [todayTaps, setTodayTaps] = useState(() => {
    const savedTaps = localStorage.getItem('todayTaps');
    const savedDate = localStorage.getItem('todayTapsDate');
    const today = new Date().toDateString();
    
    if (savedDate === today && savedTaps) {
      return parseInt(savedTaps);
    }
    return 0;
  });
  const [maxCombo, setMaxCombo] = useState(() => {
    const savedMaxCombo = localStorage.getItem('maxCombo');
    const savedMaxComboDate = localStorage.getItem('maxComboDate');
    const today = new Date().toDateString();
    
    if (savedMaxComboDate === today && savedMaxCombo) {
      return parseInt(savedMaxCombo);
    }
    return 0;
  });

  const calculateMaxComboTimeLeft = () => {
    const now = new Date();
    const lastComboTime = localStorage.getItem('lastComboTime');
    const target = new Date(lastComboTime ? parseInt(lastComboTime) : now.getTime());
    target.setHours(target.getHours() + 24);

    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return "00:00";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}`;
  };

  const calculateTodayTapsTimeLeft = () => {
    const now = new Date();
    const target = new Date(now);
    target.setHours(24, 0, 0, 0);

    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `Reset in ${hours}h:${minutes.toString().padStart(2, '0')}m`;
  };

  useEffect(() => {
    const updateCountdowns = () => {
      setDailyComboTimeLeft(calculateMaxComboTimeLeft());
      setTodayTapsTimeLeft(calculateTodayTapsTimeLeft());
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);

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
    handleTap();
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
  const [showCombo, setShowCombo] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const TAP_LIMIT = 300;
  const COMBO_THRESHOLD = 5; // 5コンボ以上で表示
  const SPECIAL_COMBO_INTERVAL = 13;
  const COMBO_TIMEOUT = 500; // 0.5秒

  // コンボリセット用のタイマー
  const [comboTimer, setComboTimer] = useState<number | null>(null);

  // タップ時の進捗バーアニメーション
  const handleTap = () => {
    // 既存のタイマーをクリア
    if (comboTimer) {
      clearTimeout(comboTimer);
    }

    // コンボの処理
    setComboCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= COMBO_THRESHOLD) {
        setShowCombo(true);
        // 13コンボおきに特別演出
        if (newCount % SPECIAL_COMBO_INTERVAL === 0) {
          showSpecialEffect();
        }
        // コンボ時間を更新
        localStorage.setItem('lastComboTime', Date.now().toString());
      }
      // 最高コンボ記録の更新
      if (newCount > maxCombo) {
        setMaxCombo(newCount);
        localStorage.setItem('maxCombo', newCount.toString());
        localStorage.setItem('maxComboDate', new Date().toDateString());
      }
      return newCount;
    });

    // 進捗バーの処理
    setTapCount((prev) => {
      const newCount = prev < TAP_LIMIT ? prev + 1 : prev;
      return newCount;
    });

    // 今日のタップ数を更新
    const today = new Date().toDateString();
    const newTodayTaps = todayTaps + 1;
    setTodayTaps(newTodayTaps);
    localStorage.setItem('todayTaps', newTodayTaps.toString());
    localStorage.setItem('todayTapsDate', today);

    // 新しいタイマーを設定
    const timer = setTimeout(() => {
      setShowCombo(false);
      setComboCount(0);
    }, COMBO_TIMEOUT);
    setComboTimer(timer as unknown as number);

    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  // 特別演出の関数
  const showSpecialEffect = () => {
    // コンボレベルを計算（13コンボごとに1レベル上がる）
    const comboLevel = Math.floor(comboCount / 13);
    const level = Math.min(comboLevel, 4); // 最大4レベルまで

    // 雷の演出を実装
    const lightning = document.createElement('div');
    lightning.className = 'lightning-effect';
    lightning.setAttribute('data-level', level.toString());
    document.body.appendChild(lightning);
    setTimeout(() => {
      document.body.removeChild(lightning);
    }, 1200);
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (comboTimer) {
        clearTimeout(comboTimer);
      }
    };
  }, [comboTimer]);

  // ラウンドリセット（1時間ごと）
  useEffect(() => {
    const now = new Date();
    const msToNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
    const timeout = setTimeout(() => {
      setShowCombo(false);
      setComboCount(0);
      if (comboTimer) {
        clearTimeout(comboTimer);
      }
    }, msToNextHour);
    return () => clearTimeout(timeout);
  }, [tapCount, comboTimer]);

  // ユーザー情報取得
  const [userAvatar, setUserAvatar] = useState<string>(logoClear);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUser('chana042');
        setUserAvatar(user.avatar || logoClear);
      } catch (e) {
        setUserAvatar(logoClear);
      }
    };
    fetchUser();
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <div
              className="flex justify-center"
              style={{
                backgroundColor: '#eee',
                minHeight: '100vh',
                width: '100vw',
              }}
            >
              <Routes>
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/" element={
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
                          <img src={userAvatar} alt="User Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                          <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
                          <div className="flex-1 text-center flex flex-col items-center justify-center">
                            <span className="text-xs text-[#85827d] font-medium mb-1">Wallet</span>
                            <WalletMultiButton />
                          </div>
                          <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
                          <Settings className="text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow mt-0 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0 flex flex-col justify-start">
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
                              {String(todayTaps).padStart(4, '0').split('').map((digit, idx) => (
                                <img key={idx} src={numberImages[Number(digit)]} alt={digit} className="w-10 h-10 mx-1" />
                              ))}
                            </div>
                            <p className="text-[10px] text-center text-white mt-1">Today Taps</p>
                            <p className="text-[10px] font-medium text-center text-gray-400 mt-2">{todayTapsTimeLeft}</p>
                          </div>
                          <div className="bg-[#272a2f] rounded-lg px-4 py-2 w-1/2 relative">
                            <div className="dot"></div>
                            <div className="flex justify-center items-end mt-1 mb-1">
                              {String(maxCombo).padStart(4, '0').split('').map((digit, idx) => (
                                <img key={idx} src={numberImages[Number(digit)]} alt={digit} className="w-10 h-10 mx-1" />
                              ))}
                            </div>
                            <p className="text-[10px] text-center text-white mt-1">Max Combo!</p>
                            <p className="text-[10px] font-medium text-center text-gray-400 mt-2">{dailyComboTimeLeft}</p>
                          </div>
                        </div>

                        <div className="px-4 mt-0 flex justify-center">
                          <div className="w-full flex flex-col items-center">
                            <div className={`relative w-full max-w-md h-24 flex items-center justify-center mb-4 ${shake ? 'animate-shake' : ''}`} style={{cursor:'pointer'}} onClick={handleTap}>
                              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-10 rounded-full bg-gradient-to-r from-indigo-900 via-blue-700 to-yellow-400 border-2 border-blue-300 shadow-2xl overflow-hidden progress-bar-pro">
                                <div className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-600 progress-bar-inner" style={{ width: `calc(${tapCount} / ${TAP_LIMIT} * 100%)`, transition: 'width 0.3s cubic-bezier(.68,-0.55,.27,1.55)' }}></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="flex items-center justify-center space-x-0.5">
                                    {String(tapCount).padStart(3, '0').split('').map((digit, idx) => (
                                      <img key={`current-${idx}`} src={numberImages[Number(digit)]} alt={digit} className="w-4 h-4" />
                                    ))}
                                    <img src={slashImage} alt="/" className="w-3 h-3 mx-0.5" />
                                    {String(TAP_LIMIT).split('').map((digit, idx) => (
                                      <img key={`limit-${idx}`} src={numberImages[Number(digit)]} alt={digit} className="w-4 h-4" />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <img src={rocket2} alt="Rocket" className="absolute z-10 w-14 h-14 rocket-float" style={{ left: `calc((100% - 56px) * ${(tapCount/TAP_LIMIT)})`, top: 'calc(50% - 28px)', transition: 'left 0.3s cubic-bezier(.68,-0.55,.27,1.55)' }} />
                            </div>
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
                } />
              </Routes>
              <FooterNav />
            </div>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
