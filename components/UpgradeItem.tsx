
import React from 'react';
import { Upgrade, UpgradeType } from '../types';

interface UpgradeItemProps {
  upgrade: Upgrade;
  onBuy: (upgradeId: string) => void;
  balance: number;
}

export const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade, onBuy, balance }) => {
  const canAfford = balance >= upgrade.cost;

  const formatValue = (value: number, type: UpgradeType) => {
    const options: Intl.NumberFormatOptions = {};
    if (type === UpgradeType.AUTO_CLICK_BOOST && value % 1 !== 0) {
      options.minimumFractionDigits = 1;
      options.maximumFractionDigits = 1;
    } else {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 0;
    }
    return value.toLocaleString('ru-RU', options);
  };

  const effectUnit = upgrade.type === UpgradeType.CLICK_BOOST ? 'к клику' : 'DDICE/сек';

  return (
    <div className="bg-white border border-gray-200/80 p-3.5 sm:p-4 rounded-xl shadow-lg flex flex-col space-y-2 transition-all hover:shadow-xl hover:border-gray-300">
      <div className="flex justify-between items-start">
        <div>
            <h3 className="text-base sm:text-md font-semibold text-gray-900">{upgrade.name}</h3>
            <p className="text-xs text-gray-500">Уровень: {upgrade.level.toLocaleString('ru-RU')}</p>
        </div>
        <button
          onClick={() => onBuy(upgrade.id)}
          disabled={!canAfford}
          className="bg-black text-white px-4 py-2 sm:px-5 rounded-lg text-sm font-medium hover:bg-gray-800 active:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-w-[90px] text-center"
          aria-label={`Купить ${upgrade.name} за ${upgrade.cost.toLocaleString('ru-RU')} DDICE`}
        >
          {upgrade.cost.toLocaleString('ru-RU')} <span className="font-light">DDICE</span>
        </button>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{upgrade.description}</p>
      <div className="flex justify-start items-baseline pt-1">
        <p className="text-xs sm:text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md">
          Эффект: +{formatValue(upgrade.value, upgrade.type)} {effectUnit}
        </p>
      </div>
    </div>
  );
};