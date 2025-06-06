
import React from 'react';
import { Boost } from '../types';

interface BoostItemProps {
  boost: Boost;
  onActivate: (boostId: string) => void;
  balance: number;
  isActive: boolean;
  remainingTime: number; // in seconds
}

export const BoostItem: React.FC<BoostItemProps> = ({ boost, onActivate, balance, isActive, remainingTime }) => {
  const canAfford = balance >= boost.cost;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} сек`;
    const minutes = Math.floor(seconds / 60);
    const remainingSec = seconds % 60;
    return `${minutes} мин ${ remainingSec > 0 ? `${remainingSec} сек` : ''}`.trim();
  };
  
  const formatEffect = (multiplier: number, type: 'click' | 'auto') => {
    const baseText = type === 'click' ? 'к клику' : 'к авто-клику';
    return `x${multiplier} ${baseText}`;
  };

  return (
    <div className={`bg-white border p-3.5 sm:p-4 rounded-xl shadow-lg transition-all hover:shadow-xl 
                     ${isActive ? 'border-blue-400 ring-2 ring-blue-300' : 'border-gray-200/80 hover:border-gray-300'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base sm:text-md font-semibold text-gray-900 flex items-center">
            <i className={`${boost.icon} mr-2 text-blue-600`}></i>
            {boost.name}
          </h3>
          <p className="text-xs text-gray-500">
            Длительность: {formatDuration(boost.durationSeconds)}
          </p>
        </div>
        <button
          onClick={() => onActivate(boost.id)}
          disabled={!canAfford || isActive}
          className="bg-blue-600 text-white px-4 py-2 sm:px-5 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[110px] text-center"
          aria-label={`Активировать ${boost.name} за ${boost.cost.toLocaleString('ru-RU')} DDICE`}
        >
          {isActive 
            ? `${formatDuration(remainingTime)}` 
            : `${boost.cost.toLocaleString('ru-RU')} DDICE`}
        </button>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2">{boost.description}</p>
      <div className="flex justify-start items-baseline pt-2">
        <p className="text-xs sm:text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md">
          Эффект: {formatEffect(boost.effectMultiplier, boost.type)}
        </p>
      </div>
      {isActive && (
        <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-1000 linear" 
            style={{ width: `${(remainingTime / boost.durationSeconds) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};
