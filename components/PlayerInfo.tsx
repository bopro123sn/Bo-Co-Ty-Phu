

import React from 'react';
import type { Player, Space } from '../types';

const formatCurrency = (amount: number): string => {
  const Billions = Math.floor(amount / 1_000_000_000);
  const Millions = Math.floor((amount % 1_000_000_000) / 1_000_000);
  const Thousands = Math.floor((amount % 1_000_000) / 1_000);

  if (Billions > 0) return `${(amount / 1_000_000_000).toFixed(2)} Tỷ`;
  if (Millions > 0) return `${(amount / 1_000_000).toFixed(1)} Tr`;
  if (Thousands > 0) return `${(amount / 1_000)} K`;
  return `${amount}`;
};

// Fix: Add PlayerInfoProps interface to define the props for the PlayerInfo component.
interface PlayerInfoProps {
  player: Player;
  boardData: Space[];
  isCurrent: boolean;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, boardData, isCurrent }) => {
  const colorMap: { [key: string]: string } = {
    purple: 'bg-purple-700',
    lightblue: 'bg-sky-400',
    pink: 'bg-pink-500',
    orange: 'bg-orange-500',
    red: 'bg-red-600',
    yellow: 'bg-yellow-400',
    green: 'bg-green-600',
    darkblue: 'bg-blue-800',
  };

  const ownedProperties = player.properties.map(propId => boardData.find(space => space.id === propId)!);

  return (
    <div className={`p-3 rounded-lg shadow-lg transition-all duration-300 border-2 ${isCurrent ? 'ring-4 ring-yellow-300 animate-pulse shadow-yellow-300/50' : 'border-gray-700'} ${player.isBankrupt ? 'bg-gray-900 opacity-50' : 'bg-gray-800 bg-opacity-80 backdrop-blur-sm'}`} style={{borderColor: player.color}}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
            <i className={`fas ${player.icon} text-xl`} style={{ color: player.color }}></i>
            <h3 className="text-lg font-bold">{player.name}</h3>
            {player.inJail && <i className="fas fa-gavel text-red-500 ml-1" title="Ở trong tù"></i>}
        </div>
        <div 
          className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg"
          title={`${player.money.toLocaleString('vi-VN')} VND`}
        >
          <i className="fas fa-money-bill-wave text-green-400 text-lg"></i>
          <span className="font-bold text-base text-white">
            {formatCurrency(player.money)}
          </span>
        </div>
      </div>
      {player.isBankrupt && <div className="text-center font-bold text-red-500 text-2xl my-4">PHÁ SẢN</div>}
      <div className="mt-2">
        <h4 className="font-semibold mb-1 text-sm">Tài sản:</h4>
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-2">
          {ownedProperties.length > 0 ? (
            ownedProperties.map(prop => (
              <div key={prop.id} title={prop.name} className={`h-4 w-6 rounded-sm ${prop.colorGroup ? colorMap[prop.colorGroup] : 'bg-gray-500'}`}></div>
            ))
          ) : (
            <p className="text-xs text-gray-400">Không có</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerInfo;