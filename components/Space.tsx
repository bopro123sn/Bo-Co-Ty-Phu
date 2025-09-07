import React from 'react';
import type { Space as SpaceData, Player } from '../types';
import { SpaceType } from '../types';
import { formatCurrency } from '../App';

interface SpaceProps {
  data: SpaceData;
  players: Player[];
  owner: Player | null;
}

const Space: React.FC<SpaceProps> = ({ data, players, owner }) => {
  const colorMap: { [key: string]: string } = {
    purple: 'bg-purple-700',
    lightblue: 'bg-sky-400',
    pink: 'bg-pink-500',
    orange: 'bg-orange-500',
    red: 'bg-red-600',
    yellow: 'bg-yellow-400 text-black',
    green: 'bg-green-600',
    darkblue: 'bg-blue-800',
  };

  const propertyColor = data.colorGroup ? colorMap[data.colorGroup] : '';

  const renderPlayerTokens = () => (
    <div className="absolute bottom-0 inset-x-0 h-5 flex items-end justify-center gap-1 pointer-events-none">
      {players.map((player) => (
        <div key={player.id} className="relative" title={player.name}>
          <i
            className={`fas ${player.icon} text-2xl md:text-3xl`}
            style={{ 
              color: player.color,
              filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.8))'
            }}
          ></i>
          {player.inJail && (
              <div className="absolute inset-0 flex flex-col justify-around items-center py-1.5 px-0.5" title="In Jail">
                  <div className="h-[2px] w-full bg-gray-700 opacity-80 rounded-full"></div>
                  <div className="h-[2px] w-full bg-gray-700 opacity-80 rounded-full"></div>
              </div>
          )}
        </div>
      ))}
    </div>
  );
  
  const OwnerIndicator = () => {
      if (!owner) return null;
      return (
        <div className="absolute top-1 right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: owner.color }}>
        </div>
      )
  };

  const renderContent = () => {
    const nameClass = 'text-[0.5rem] sm:text-[0.6rem] md:text-xs font-bold uppercase leading-tight text-center';
    const priceClass = 'text-[0.45rem] sm:text-[0.55rem] md:text-[10px]';
    const iconClass = 'text-2xl sm:text-3xl md:text-4xl my-1';
    const baseContainerClass = 'w-full h-full flex flex-col justify-center items-center text-center p-0.5';

    switch (data.type) {
      case SpaceType.GO:
        return (
          <div className="w-full h-full bg-red-600 text-white flex flex-col justify-between items-center p-1 transform -rotate-45">
            <span className="text-[0.5rem] sm:text-[10px]">Nhận {formatCurrency(2000000).replace('VND','')}</span>
            <span className="text-[0.6rem] sm:text-sm font-bold">XUẤT PHÁT</span>
            <i className={`fa-solid fa-arrow-right-long ${iconClass}`}></i>
          </div>
        );
      case SpaceType.JAIL:
         return (
          <div className="w-full h-full bg-orange-200 text-black flex flex-col justify-around items-center p-1 text-center border-2 border-gray-600">
            <span className={`${nameClass} text-gray-800`}>Thăm Tù</span>
            <i className={`fa-solid fa-gavel ${iconClass} text-gray-700`}></i>
            <span className={`${nameClass} text-gray-800`}>Ở Tù</span>
          </div>
        );
      case SpaceType.FREE_PARKING:
        return (
          <div className={`${baseContainerClass} bg-green-400 text-black`}>
            <i className={`fa-solid fa-bus ${iconClass}`}></i>
            <span className={nameClass}>Bến Xe</span>
          </div>
        );
      case SpaceType.GO_TO_JAIL:
        return (
          <div className={`${baseContainerClass} bg-blue-600 text-white`}>
            <i className={`fa-solid fa-hand-cuffs ${iconClass}`}></i>
            <span className={nameClass}>Vào Tù</span>
          </div>
        );
      case SpaceType.CHANCE:
        return (
          <div className={`${baseContainerClass} bg-sky-500 text-white`}>
            <i className={`fa-solid fa-clover ${iconClass}`}></i>
            <span className={nameClass}>Cơ Hội</span>
          </div>
        );
      case SpaceType.COMMUNITY_CHEST:
        return (
          <div className={`${baseContainerClass} bg-orange-500 text-white`}>
             <i className={`fa-solid fa-box-archive ${iconClass}`}></i>
            <span className={nameClass}>Khí Vận</span>
          </div>
        );
      case SpaceType.TAX:
        return (
          <div className={baseContainerClass}>
            <span className={nameClass}>{data.name}</span>
            <i className={`fa-solid fa-gem ${iconClass} text-sky-400`}></i>
            <span className={priceClass}>Trả {formatCurrency(data.price!)}</span>
          </div>
        );
      case SpaceType.RAILROAD:
      case SpaceType.UTILITY:
        const icon = data.type === SpaceType.RAILROAD ? 'fa-plane' : 'fa-lightbulb';
        return (
          <div className={baseContainerClass}>
            <span className={nameClass}>{data.name}</span>
            <i className={`fa-solid ${icon} ${iconClass}`}></i>
            <span className={priceClass}>{formatCurrency(data.price!)}</span>
          </div>
        );
      case SpaceType.PROPERTY:
      default:
        return (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className={`h-1/4 ${propertyColor}`}></div>
            <div className="flex-grow flex flex-col justify-center items-center text-center p-0.5">
              <p className={nameClass}>{data.name}</p>
              <p className={`${priceClass} mt-1`}>{formatCurrency(data.price!)}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`bg-[#FDF7E4] border border-black relative text-black`}>
      {renderContent()}
      <OwnerIndicator />
      {renderPlayerTokens()}
    </div>
  );
};

export default Space;