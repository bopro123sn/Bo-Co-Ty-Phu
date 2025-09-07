
import React from 'react';
import Space from './Space';
import Dice from './Dice';
import { BOARD_DATA } from '../constants';
import type { Player, PropertyState } from '../types';
import { GamePhase } from '../types';

interface BoardProps {
  players: Player[];
  properties: PropertyState[];
  dice: [number, number];
  isRolling: boolean;
  gamePhase: GamePhase;
  isRollDisabled: boolean;
  onRollDice: () => void;
}

const VietnamMap: React.FC = () => (
    <svg viewBox="0 0 512 512" className="absolute w-2/3 h-2/3 opacity-25 pointer-events-none">
        <path fill="#DA251D" d="M399.7,212.3c-1-4.9-6.9-7.5-11.4-5.3l-55.9,27.3c-4.4,2.2-6.5,7.1-5,11.6l1,2.8c-2.4-0.8-5-1.4-7.5-1.9 l-42.2-9.1c-5.5-1.2-10.9,2.3-12.1,7.8l-12.3,56.5c-1.2,5.5,2.3,10.9,7.8,12.1l11.4,2.5c-3.1,3.7-6.3,7.4-9.3,11.2l-31,39.5 c-3.8,4.8-2.6,12,2.2,15.8l20,15.6c4.8,3.8,12,2.6,15.8-2.2l12.4-15.8c0.8-1,1.5-2,2.2-3.1l15.4,6.7c5.5,2.4,11.7-0.4,14-5.9 l21-48.2c2.4-5.5-0.4-11.7-5.9-14l-8-3.5c8.3-9.9,16.5-19.8,24.3-29.9l40.1-13.9c4.9-1.7,8.2-6.5,7.4-11.4L399.7,212.3z" />
    </svg>
);

const Board: React.FC<BoardProps> = ({ players, properties, dice, isRolling, gamePhase, isRollDisabled, onRollDice }) => {
  const getPlayersOnSpace = (spaceId: number) => {
    return players.filter(p => p.position === spaceId && !p.isBankrupt);
  };
  
  const getPropertyOwner = (spaceId: number) => {
      const property = properties.find(p => p.id === spaceId);
      if(!property || property.ownerId === null) return null;
      return players.find(p => p.id === property.ownerId);
  }

  const boardSpaces = [];
  // Top row (20 -> 30)
  for (let i = 20; i <= 30; i++) boardSpaces.push(<Space key={i} data={BOARD_DATA[i]} players={getPlayersOnSpace(i)} owner={getPropertyOwner(i)} />);
  
  // Middle rows
  for (let i = 1; i < 10; i++) {
    boardSpaces.push(<Space key={19 - (i - 1)} data={BOARD_DATA[19 - (i - 1)]} players={getPlayersOnSpace(19 - (i - 1))} owner={getPropertyOwner(19 - (i - 1))} />);
    if (i === 1) {
       boardSpaces.push(<div key="center-placeholder" className="col-span-9 row-span-9"></div>);
    }
    boardSpaces.push(<Space key={30 + i} data={BOARD_DATA[30 + i]} players={getPlayersOnSpace(30 + i)} owner={getPropertyOwner(30 + i)} />);
  }
  
  // Bottom row (10 -> 0)
  for (let i = 10; i >= 0; i--) boardSpaces.push(<Space key={i} data={BOARD_DATA[i]} players={getPlayersOnSpace(i)} owner={getPropertyOwner(i)} />);


  return (
    <div className="bg-[#FDF7E4] p-2 md:p-3 rounded-md shadow-2xl border-4 border-black w-full max-w-[90vw] lg:max-w-[800px]">
      <div className="grid grid-cols-11 grid-rows-11 gap-0 w-full aspect-square relative">
        {boardSpaces}
        {/* Center overlay */}
        <div className="absolute top-[9.09%] left-[9.09%] w-[81.82%] h-[81.82%] flex flex-col items-center justify-between p-4 col-start-2 col-end-11 row-start-2 row-end-11">
             <div 
                className="absolute inset-0 flex items-center justify-center"
            >
                <VietnamMap />
            </div>

            <div className="relative w-full text-center pointer-events-none">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-red-700" style={{fontFamily: "'serif'", textShadow: '2px 2px 2px white'}}>Cờ Tỷ Phú</h1>
            </div>
            
            <div className="z-10 h-20 sm:h-24 flex items-center justify-center">
                { isRolling || (dice[0] !== 0 && gamePhase !== GamePhase.START_TURN) ? (
                    <Dice values={dice} isRolling={isRolling} />
                ) : (
                    <button
                        onClick={onRollDice}
                        disabled={isRollDisabled}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold text-2xl disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Tung Xúc Xắc
                    </button>
                )}
            </div>

            <div className="w-full flex items-center justify-around pointer-events-none">
                <div className="w-28 h-16 sm:w-32 sm:h-20 md:w-40 md:h-24 bg-orange-400 border-2 border-white rounded-lg flex flex-col items-center justify-center transform -rotate-12 shadow-lg p-2">
                    <span className="text-sm sm:text-base md:text-lg font-bold text-white text-shadow-lg">KHÍ VẬN</span>
                </div>
                <div className="w-28 h-16 sm:w-32 sm:h-20 md:w-40 md:h-24 bg-green-500 border-2 border-white rounded-lg flex flex-col items-center justify-center transform rotate-12 shadow-lg p-2">
                    <span className="text-sm sm:text-base md:text-lg font-bold text-white text-shadow-lg">CƠ HỘI</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Board;
