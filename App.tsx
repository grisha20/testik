
import React, { useState, useEffect, useCallback } from 'react';
import { Upgrade, UpgradeType, Boost, ActiveView } from './types';
import { UpgradeItem } from './components/UpgradeItem';
import { BottomNavigation } from './components/BottomNavigation';
import { BoostItem } from './components/BoostItem'; // New component

const PRESTIGE_COST_BASE = 1_000_000_000; // 1 Billion
const PRESTIGE_BONUS_PER_FACE = 0.05; // +5% per lucky face

const initialUpgradesData: Omit<Upgrade, 'cost' | 'level'>[] = [
  {
    id: 'click_power_1',
    name: 'Стальной кубик',
    description: 'Каждый клик приносит больше DDICE.',
    baseCost: 10,
    type: UpgradeType.CLICK_BOOST,
    value: 1,
    costIncreaseFactor: 1.15,
  },
  {
    id: 'auto_miner_1',
    name: 'Авто-бросок',
    description: 'Начинает автоматически приносить DDICE каждую секунду.',
    baseCost: 50,
    type: UpgradeType.AUTO_CLICK_BOOST,
    value: 0.1,
    costIncreaseFactor: 1.2,
  },
  {
    id: 'click_power_2',
    name: 'Золотой кубик',
    description: 'Значительно увеличивает доход от кликов.',
    baseCost: 100,
    type: UpgradeType.CLICK_BOOST,
    value: 5,
    costIncreaseFactor: 1.18,
  },
  {
    id: 'auto_miner_2',
    name: 'Мастер бросков',
    description: 'Увеличивает автоматический доход DDICE.',
    baseCost: 500,
    type: UpgradeType.AUTO_CLICK_BOOST,
    value: 1,
    costIncreaseFactor: 1.22,
  },
  {
    id: 'click_power_3',
    name: 'Платиновый кубик',
    description: 'Максимально эффективные клики.',
    baseCost: 1000,
    type: UpgradeType.CLICK_BOOST,
    value: 25,
    costIncreaseFactor: 1.20,
  },
  {
    id: 'auto_miner_3',
    name: 'Легенда бросков',
    description: 'Огромный прирост к автоматическому доходу.',
    baseCost: 5000,
    type: UpgradeType.AUTO_CLICK_BOOST,
    value: 10,
    costIncreaseFactor: 1.25,
  },
];

const initialBoostsData: Boost[] = [
  {
    id: 'click_frenzy',
    name: 'Кликер Безумия',
    description: 'Увеличивает силу клика в 5 раз.',
    cost: 50000,
    durationSeconds: 30,
    effectMultiplier: 5,
    type: 'click',
    icon: 'fa-solid fa-hand-sparkles',
  },
  {
    id: 'auto_overdrive',
    name: 'Автоматический Форсаж',
    description: 'Увеличивает доход авто-кликов в 2 раза.',
    cost: 250000,
    durationSeconds: 300, // 5 minutes
    effectMultiplier: 2,
    type: 'auto',
    icon: 'fa-solid fa-gears',
  }
];

const App: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [activeView, setActiveView] = useState<ActiveView>('clicker');
  const [isClicking, setIsClicking] = useState(false);
  
  // Upgrades state
  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => 
    initialUpgradesData.map(u => ({
      ...u,
      cost: u.baseCost,
      level: 0,
    }))
  );

  // Prestige state
  const [luckyFaces, setLuckyFaces] = useState<number>(0);
  const [totalEarnedDDICE, setTotalEarnedDDICE] = useState<number>(0); // For tracking overall progress

  // Boosts state
  const [availableBoosts, setAvailableBoosts] = useState<Boost[]>(initialBoostsData);
  const [activeBoosts, setActiveBoosts] = useState<Record<string, { endTime: number; multiplier: number; type: 'click' | 'auto', name: string, icon: string }>>({});

  const prestigeBonus = luckyFaces * PRESTIGE_BONUS_PER_FACE;
  const prestigeCost = PRESTIGE_COST_BASE * Math.pow(1.5, luckyFaces); // Cost increases by 50% each time

  const calculateBaseClickValue = useCallback(() => {
    return upgrades
      .filter(u => u.type === UpgradeType.CLICK_BOOST)
      .reduce((sum, u) => sum + u.value * u.level, 1); // Base click value is 1
  }, [upgrades]);

  const calculateBaseAutoClickRate = useCallback(() => {
    return upgrades
      .filter(u => u.type === UpgradeType.AUTO_CLICK_BOOST)
      .reduce((sum, u) => sum + u.value * u.level, 0);
  }, [upgrades]);

  const currentClickValue = useCallback(() => {
    let finalClickValue = calculateBaseClickValue();
    finalClickValue *= (1 + prestigeBonus);
    const clickBoost = Object.values(activeBoosts).find(b => b.type === 'click');
    if (clickBoost) {
      finalClickValue *= clickBoost.multiplier;
    }
    return Math.round(finalClickValue * 100) / 100;
  }, [calculateBaseClickValue, prestigeBonus, activeBoosts]);

  const currentAutoClickRate = useCallback(() => {
    let finalAutoRate = calculateBaseAutoClickRate();
    finalAutoRate *= (1 + prestigeBonus);
    const autoBoost = Object.values(activeBoosts).find(b => b.type === 'auto');
    if (autoBoost) {
      finalAutoRate *= autoBoost.multiplier;
    }
    return Math.round(finalAutoRate * 100) / 100;
  }, [calculateBaseAutoClickRate, prestigeBonus, activeBoosts]);


  const handleCoinClick = useCallback(() => {
    const value = currentClickValue();
    setBalance(prevBalance => prevBalance + value);
    setTotalEarnedDDICE(prev => prev + value);
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 100);
  }, [currentClickValue]);

  const handleBuyUpgrade = useCallback((upgradeId: string) => {
    const upgradeToBuy = upgrades.find(u => u.id === upgradeId);
    if (!upgradeToBuy || balance < upgradeToBuy.cost) {
        return; 
    }

    setBalance(prevBalance => prevBalance - upgradeToBuy.cost);
    
    setUpgrades(prevUpgrades => 
      prevUpgrades.map(u => {
        if (u.id === upgradeId) {
          const newLevel = u.level + 1;
          const newCost = Math.floor(u.baseCost * Math.pow(u.costIncreaseFactor, newLevel));
          return { ...u, level: newLevel, cost: newCost };
        }
        return u;
      })
    );
  }, [balance, upgrades]);

  // Auto-click effect
  useEffect(() => {
    const rate = currentAutoClickRate();
    if (rate > 0) {
      const intervalId = setInterval(() => {
        setBalance(prevBalance => {
          const newBalance = prevBalance + rate;
          setTotalEarnedDDICE(prevTotal => prevTotal + rate);
          return Math.round(newBalance * 100) / 100;
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [currentAutoClickRate]);

  // Boosts timer effect
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      setActiveBoosts(prevBoosts => {
        const updatedBoosts = { ...prevBoosts };
        let changed = false;
        for (const id in updatedBoosts) {
          if (updatedBoosts[id].endTime <= now) {
            delete updatedBoosts[id];
            changed = true;
          }
        }
        return changed ? updatedBoosts : prevBoosts;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);
  
  const handlePrestige = useCallback(() => {
    if (balance >= prestigeCost) {
      setLuckyFaces(prev => prev + 1);
      setBalance(0);
      // Reset upgrades to initial state
      setUpgrades(initialUpgradesData.map(u => ({
        ...u,
        cost: u.baseCost,
        level: 0,
      })));
      // Keep totalEarnedDDICE, reset active boosts if desired, or let them run
      // setActiveBoosts({}); // Optional: reset boosts on prestige
    }
  }, [balance, prestigeCost]);

  const handleActivateBoost = useCallback((boostId: string) => {
    const boostToActivate = availableBoosts.find(b => b.id === boostId);
    if (!boostToActivate || balance < boostToActivate.cost || activeBoosts[boostId]) {
      return;
    }

    setBalance(prev => prev - boostToActivate.cost);
    setActiveBoosts(prev => ({
      ...prev,
      [boostId]: {
        endTime: Date.now() + boostToActivate.durationSeconds * 1000,
        multiplier: boostToActivate.effectMultiplier,
        type: boostToActivate.type,
        name: boostToActivate.name,
        icon: boostToActivate.icon,
      }
    }));
  }, [balance, availableBoosts, activeBoosts]);

  const formatDisplayNumber = (num: number, maxDecimals = 1, useCompact = true) => {
    if (num === undefined || num === null) return '0';
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals,
    };
     if (useCompact && Math.abs(num) >= 10000) {
        options.notation = "compact";
        options.compactDisplay = "short";
        options.maximumFractionDigits = num >= 1_000_000_000 ? 2 : 1; // More precision for billions
        options.minimumFractionDigits = num >= 1_000_000_000 ? 2 : 1;
    } else if (num % 1 !== 0 && Math.abs(num - Math.floor(num)) > 0.001 && maxDecimals > 0) {
      options.minimumFractionDigits = Math.min(maxDecimals, String(num).split('.')[1]?.length || 0);
    }
    return num.toLocaleString('ru-RU', options);
  };

  const navigationItems = [
    { id: 'clicker', label: 'Кликер', icon: <i className="fa-solid fa-dice-d6 text-xl sm:text-2xl"></i> },
    { id: 'upgrades', label: 'Улучшения', icon: <i className="fa-solid fa-list-check text-xl sm:text-2xl"></i> },
    { id: 'boosts', label: 'Ускорители', icon: <i className="fa-solid fa-bolt text-xl sm:text-2xl"></i> },
  ];

  return (
    <div className="h-screen bg-white text-black flex flex-col selection:bg-gray-300 overflow-hidden">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-10 py-3 px-4 sm:px-6 md:px-8 border-b border-gray-200 pt-safe">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
            <div className="flex items-center justify-center space-x-2">
                 <i className="fa-solid fa-dice text-xl sm:text-2xl text-black"></i>
                 <h1 className="text-xl sm:text-2xl font-bold text-black">DDICE</h1>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight mt-1">
              {formatDisplayNumber(balance, 2)}
              <span className="text-lg sm:text-xl font-semibold ml-1 align-baseline">DDICE</span>
            </p>
            {luckyFaces > 0 && (
              <p className="text-xs sm:text-sm text-yellow-600 font-medium mt-0.5">
                <i className="fa-solid fa-star mr-1"></i>
                Счастливых граней: {luckyFaces} (+{(prestigeBonus * 100).toFixed(0)}% к доходу)
              </p>
            )}
        </div>
      </header>

      <main className="flex-grow w-full max-w-3xl mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto fixed-bottom-nav-height">
        {activeView === 'clicker' && (
          <section className="flex flex-col items-center animate-fadeIn w-full">
            <div className="mt-2 sm:mt-4 mb-6 sm:mb-8 md:mb-10">
              <button
                onClick={handleCoinClick}
                className={`p-4 bg-black text-white rounded-full shadow-2xl active:bg-gray-800 transform transition-all duration-100 ease-in-out flex flex-col items-center justify-center w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50 ${isClicking ? 'scale-105' : 'scale-100 hover:scale-102'}`}
                aria-label="Кликнуть для получения DDICE"
              >
                <i className="fa-solid fa-dice-d6 text-7xl sm:text-8xl md:text-9xl"></i>
                <span className="mt-3 text-lg font-medium">Клик!</span>
              </button>
            </div>

            <div className="w-full max-w-md mb-4"> {/* Added mb-4 for spacing */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-xl shadow-sm text-center">
                  <div className="flex items-center justify-center text-gray-600 text-xs sm:text-sm mb-1">
                    <i className="fa-solid fa-hand-pointer w-4 h-4 sm:w-5 sm:h-5 mr-1.5"></i>
                    <span>За клик</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-black">
                    {formatDisplayNumber(currentClickValue(), 2)} DDICE
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-xl shadow-sm text-center">
                  <div className="flex items-center justify-center text-gray-600 text-xs sm:text-sm mb-1">
                    <i className="fa-solid fa-stopwatch-20 w-4 h-4 sm:w-5 sm:h-5 mr-1.5"></i>
                    <span>Авто-клик</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-black">
                    {formatDisplayNumber(currentAutoClickRate(), 2)} DDICE/сек
                  </p>
                </div>
              </div>
            </div>
            
            {Object.keys(activeBoosts).length > 0 && (
              <div className="w-full max-w-md mt-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                <h3 className="text-sm font-semibold text-blue-700 mb-2 text-center">Активные ускорители:</h3>
                <div className="space-y-1.5">
                  {Object.entries(activeBoosts).map(([id, boost]) => (
                    <div key={id} className="text-xs text-blue-600 flex items-center justify-between">
                      <span><i className={`${boost.icon} mr-1.5`}></i>{boost.name}</span>
                      <span>Осталось: {Math.max(0, Math.ceil((boost.endTime - Date.now()) / 1000))} сек.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </section>
        )}

        {activeView === 'upgrades' && (
          <section className="w-full animate-fadeIn">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-5 text-center text-black">Доступные улучшения</h2>
            <div className="space-y-3 sm:space-y-3.5">
              {upgrades.map(upgrade => (
                <UpgradeItem
                  key={upgrade.id}
                  upgrade={upgrade}
                  onBuy={handleBuyUpgrade}
                  balance={balance}
                />
              ))}
            </div>
            {upgrades.length === 0 && <p className="text-center text-gray-500 mt-8">Улучшения скоро появятся!</p>}
            
            <div className="mt-8 pt-6 border-t border-gray-200 text-center mb-24">
                 <h3 className="text-lg font-semibold text-gray-800 mb-2">Переброс кубиков (Престиж)</h3>
                 <p className="text-sm text-gray-600 mb-3">
                    Сбросьте текущий прогресс (баланс и улучшения), чтобы получить Счастливые Грани.
                    Каждая грань навсегда увеличивает ваш доход на {(PRESTIGE_BONUS_PER_FACE * 100).toFixed(0)}%.
                 </p>
                 <p className="text-sm text-gray-600 mb-1">Текущий бонус: +{(prestigeBonus * 100).toFixed(0)}%</p>
                 <p className="text-sm text-gray-600 mb-4">Стоимость переброса: {formatDisplayNumber(prestigeCost, 0)} DDICE</p>
                <button
                    onClick={handlePrestige}
                    disabled={balance < prestigeCost}
                    className="bg-yellow-500 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-yellow-600 active:bg-yellow-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                    aria-label={`Совершить Переброс за ${formatDisplayNumber(prestigeCost, 0)} DDICE`}
                >
                    <i className="fa-solid fa-arrows-rotate mr-2"></i>
                    Совершить Переброс ({luckyFaces + 1}-я грань)
                </button>
            </div>
          </section>
        )}

        {activeView === 'boosts' && (
          <section className="w-full animate-fadeIn">
             <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-5 text-center text-black">Ускорители</h2>
             <p className="text-sm text-gray-600 mb-5 text-center">Активируйте временные усиления, чтобы быстрее добывать DDICE!</p>
             <div className="space-y-3 sm:space-y-3.5">
                {availableBoosts.map(boost => (
                    <BoostItem
                        key={boost.id}
                        boost={boost}
                        onActivate={handleActivateBoost}
                        balance={balance}
                        isActive={!!activeBoosts[boost.id]}
                        remainingTime={activeBoosts[boost.id] ? Math.max(0, Math.ceil((activeBoosts[boost.id].endTime - Date.now()) / 1000)) : 0}
                    />
                ))}
             </div>
          </section>
        )}
      </main>
      
      <BottomNavigation 
        items={navigationItems}
        activeItem={activeView}
        onNavigate={(viewId) => setActiveView(viewId as ActiveView)}
      />
      
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}
      </style>
    </div>
  );
};

export default App;
