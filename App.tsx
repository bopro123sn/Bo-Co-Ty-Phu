import React, { useReducer, useCallback, useState } from 'react';
import { BOARD_DATA, CHANCE_CARDS, COMMUNITY_CHEST_CARDS, INITIAL_MONEY, PLAYER_COLORS, PLAYER_ICONS, JAIL_POSITION } from './constants';
import type { GameState, Player, Action } from './types';
import { GamePhase, SpaceType } from './types';
import Board from './components/Board';
import PlayerInfo from './components/PlayerInfo';
import EventLog from './components/EventLog';
import ActionModal from './components/ActionModal';

// --- UTILITY ---
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('vi-VN')} VND`;
};

const formatCurrencyShort = (amount: number): string => {
  const Billions = Math.floor(amount / 1_000_000_000);
  const Millions = Math.floor((amount % 1_000_000_000) / 1_000_000);
  
  if (Billions > 0) return `${(amount / 1_000_000_000).toFixed(2)} Tỷ`;
  if (Millions > 0) return `${(amount / 1_000_000).toFixed(1)} Tr`;
  return `${Math.floor(amount / 1000)} K`;
};


const initialPlayers: Player[] = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  name: `Player ${i + 1}`,
  money: INITIAL_MONEY,
  position: 0,
  properties: [],
  inJail: false,
  jailTurns: 0,
  color: PLAYER_COLORS[i],
  icon: PLAYER_ICONS[i],
  isBankrupt: false,
}));

const initialState: GameState = {
  players: initialPlayers,
  properties: BOARD_DATA.filter(s => s.type === SpaceType.PROPERTY || s.type === SpaceType.RAILROAD || s.type === SpaceType.UTILITY).map(s => ({
    id: s.id,
    ownerId: null
  })),
  currentPlayerIndex: 0,
  dice: [0, 0],
  gamePhase: GamePhase.START_TURN,
  eventLog: ['Chào mừng đến với Cờ Tỷ Phú!'],
  modal: {
    isOpen: false,
    title: '',
    content: null
  },
  isRolling: false,
  movementSteps: 0,
};

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'SET_IS_ROLLING':
      return { ...state, isRolling: action.payload };

    case 'ROLL_DICE': {
      const { dice1, dice2 } = action.payload;
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      const newLog = [
        ...state.eventLog, 
        `${currentPlayer.name} tung được ${dice1} và ${dice2}, di chuyển ${dice1 + dice2} ô.`,
      ].filter(Boolean);

      return {
        ...state,
        dice: [dice1, dice2],
        eventLog: newLog
      };
    }

    case 'START_MOVEMENT':
      return { ...state, movementSteps: action.payload, gamePhase: GamePhase.MOVING };

    case 'MOVE_ONE_STEP': {
      if (state.movementSteps <= 0) return state;

      const currentPlayer = state.players[state.currentPlayerIndex];
      const newPosition = (currentPlayer.position + 1) % BOARD_DATA.length;
      const passedGo = newPosition < currentPlayer.position;

      const updatedPlayers = state.players.map(p =>
        p.id === currentPlayer.id
          ? { ...p, position: newPosition, money: p.money + (passedGo ? 2000000 : 0) }
          : p
      );

      const newLog = passedGo ? [...state.eventLog, `${currentPlayer.name} đi qua ô Bắt Đầu và nhận ${formatCurrency(2000000)}.`] : state.eventLog;
      const newMovementSteps = state.movementSteps - 1;

      return {
        ...state,
        players: updatedPlayers,
        movementSteps: newMovementSteps,
        gamePhase: newMovementSteps === 0 ? GamePhase.ACTION : GamePhase.MOVING,
        eventLog: newLog,
      };
    }

    case 'BUY_PROPERTY': {
      const property = action.payload;
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      if (currentPlayer.money < property.price!) {
        return {
          ...state,
          eventLog: [...state.eventLog, `${currentPlayer.name} không đủ tiền mua ${property.name}.`],
          gamePhase: GamePhase.END_TURN
        };
      }

      const updatedPlayers = state.players.map(p => 
        p.id === currentPlayer.id 
          ? { ...p, money: p.money - property.price!, properties: [...p.properties, property.id] } 
          : p
      );
      
      const updatedProperties = state.properties.map(prop => 
        prop.id === property.id ? { ...prop, ownerId: currentPlayer.id } : prop
      );

      return {
        ...state,
        players: updatedPlayers,
        properties: updatedProperties,
        eventLog: [...state.eventLog, `${currentPlayer.name} đã mua ${property.name} với giá ${formatCurrency(property.price!)}.`]
      };
    }

    case 'PAY_RENT': {
      const { property, owner } = action.payload;
      const currentPlayer = state.players[state.currentPlayerIndex];
      const rent = property.rent!;

      if (currentPlayer.money < rent) {
        // Simple bankruptcy, no property selling
        return {
          ...state,
          players: state.players.map(p => p.id === currentPlayer.id ? { ...p, isBankrupt: true, money: 0 } : p),
          eventLog: [...state.eventLog, `${currentPlayer.name} không thể trả tiền thuê và đã phá sản!`],
        };
      }
      
      const updatedPlayers = state.players.map(p => {
        if (p.id === currentPlayer.id) return { ...p, money: p.money - rent };
        if (p.id === owner.id) return { ...p, money: p.money + rent };
        return p;
      });

      return {
        ...state,
        players: updatedPlayers,
        eventLog: [...state.eventLog, `${currentPlayer.name} đã trả ${formatCurrency(rent)} tiền thuê cho ${owner.name}.`],
      };
    }

    case 'DRAW_CARD': {
        const card = action.payload;
        const currentPlayer = state.players[state.currentPlayerIndex];
        let updatedPlayers = [...state.players];
        let newLog = [...state.eventLog, `${currentPlayer.name} rút thẻ: "${card.description}"`];
        let nextPhase = GamePhase.ACTION;

        switch(card.action.type) {
            case 'money':
                updatedPlayers = state.players.map(p => p.id === currentPlayer.id ? {...p, money: p.money + card.action.amount!} : p);
                nextPhase = GamePhase.END_TURN;
                break;
            case 'move': {
                const newPosition = card.action.position!;
                // This logic is complex because moving might pass Go.
                // For simplicity, we assume card moves don't automatically grant Go money unless specified.
                // The "Go to Start" card in constants already sets position to 0 and gives money.
                let moneyUpdate = 0;
                if(newPosition === 0) { // Specific "Advance to Go" card
                    moneyUpdate = 2000000;
                } else if (newPosition < currentPlayer.position) { // Passed go
                    moneyUpdate = 2000000;
                    newLog.push(`${currentPlayer.name} đi qua ô Bắt Đầu và nhận ${formatCurrency(2000000)}.`);
                }

                updatedPlayers = state.players.map(p => 
                    p.id === currentPlayer.id 
                        ? { ...p, position: newPosition, money: p.money + moneyUpdate } 
                        : p
                );
                
                nextPhase = GamePhase.ACTION; // Player needs to act on the new space
                break;
            }
        }

        return {
            ...state,
            players: updatedPlayers,
            eventLog: newLog,
            gamePhase: nextPhase
        };
    }


    case 'GO_TO_JAIL': {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const updatedPlayers = state.players.map(p =>
        p.id === currentPlayer.id ? { ...p, position: JAIL_POSITION, inJail: true, jailTurns: 0 } : p
      );
      return {
        ...state,
        players: updatedPlayers,
        eventLog: [...state.eventLog, `${currentPlayer.name} đã bị vào tù!`],
      };
    }
    
    case 'PAY_TAX': {
      const { amount, name } = action.payload;
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      if (currentPlayer.money < amount) {
          return {
            ...state,
            players: state.players.map(p => p.id === currentPlayer.id ? { ...p, isBankrupt: true, money: 0 } : p),
            eventLog: [...state.eventLog, `${currentPlayer.name} không thể trả ${name} và đã phá sản!`],
          };
      }

      const updatedPlayers = state.players.map(p =>
        p.id === currentPlayer.id ? { ...p, money: p.money - amount } : p
      );
      return {
        ...state,
        players: updatedPlayers,
        eventLog: [...state.eventLog, `${currentPlayer.name} đã trả ${formatCurrency(amount)} cho ${name}.`],
      };
    }
    
    case 'END_TURN': {
      const activePlayers = state.players.filter(p => !p.isBankrupt);
      if (activePlayers.length <= 1) {
        return {
          ...state,
          gamePhase: GamePhase.GAME_OVER,
          modal: {
            isOpen: true,
            title: 'Kết Thúc!',
            content: `${activePlayers[0]?.name || 'Không có ai'} chiến thắng!`
          }
        };
      }
      
      let nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
      while (state.players[nextPlayerIndex].isBankrupt) {
        nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
      }

      return {
        ...state,
        currentPlayerIndex: nextPlayerIndex,
        gamePhase: GamePhase.START_TURN,
        dice: [0, 0],
        modal: { isOpen: false, title: '', content: null }
      };
    }
    
    case 'SHOW_MODAL':
        return { ...state, modal: { ...action.payload, isOpen: true } };
        
    case 'CLOSE_MODAL':
      return { ...state, modal: { isOpen: false, title: '', content: null }, gamePhase: GamePhase.END_TURN };
      
    case 'NO_ACTION':
      return { ...state, gamePhase: GamePhase.END_TURN };

    default:
      return state;
  }
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [mobileView, setMobileView] = useState<'players' | 'log' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const { players, currentPlayerIndex, gamePhase, dice, eventLog, properties, modal, isRolling, movementSteps } = state;

  const currentPlayer = players[currentPlayerIndex];
  const currentSpace = BOARD_DATA[currentPlayer.position];

  const playSound = useCallback((soundId: string) => {
    if (!isMuted) {
      const sound = document.getElementById(soundId) as HTMLAudioElement;
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.error("Error playing sound:", e));
      }
    }
  }, [isMuted]);

  const handleRollDice = () => {
    if (gamePhase !== GamePhase.START_TURN) return;
    
    playSound('dice-roll-sound');
    dispatch({ type: 'SET_IS_ROLLING', payload: true });

    setTimeout(() => {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        
        dispatch({ type: 'ROLL_DICE', payload: { dice1, dice2 } });
        dispatch({ type: 'SET_IS_ROLLING', payload: false });
        dispatch({ type: 'START_MOVEMENT', payload: dice1 + dice2 });
    }, 1200);
  };
  
  const handleEndTurn = useCallback(() => {
    if (gamePhase !== GamePhase.END_TURN && !modal.isOpen) {
        const timer = setTimeout(() => {
          dispatch({ type: 'END_TURN' });
        }, 1000); // Automatic turn end after 1s
        return () => clearTimeout(timer);
    }
  }, [gamePhase, modal.isOpen, dispatch]);

  const handleSpaceAction = useCallback(() => {
    if (gamePhase !== GamePhase.ACTION) return;

    let nextPhase = GamePhase.END_TURN;

    switch (currentSpace.type) {
      case SpaceType.PROPERTY:
      case SpaceType.RAILROAD:
      case SpaceType.UTILITY: {
        const propertyState = properties.find(p => p.id === currentSpace.id)!;
        if (propertyState.ownerId === null) {
          nextPhase = GamePhase.ACTION; // Keep in action phase for modal
          dispatch({ type: 'SHOW_MODAL', payload: {
            title: `Mua ${currentSpace.name}?`,
            content: (
              <div>
                <p className="mb-4">Khu đất này chưa có chủ. Giá: {formatCurrency(currentSpace.price!)}</p>
                <div className="flex justify-around">
                  <button onClick={() => { playSound('buy-property-sound'); dispatch({ type: 'BUY_PROPERTY', payload: currentSpace }); dispatch({ type: 'CLOSE_MODAL' }); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Mua</button>
                  <button onClick={() => { dispatch({ type: 'NO_ACTION' }); dispatch({ type: 'CLOSE_MODAL' }); }} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">Từ chối</button>
                </div>
              </div>
            )
          }});
        } else if (propertyState.ownerId !== currentPlayer.id) {
          nextPhase = GamePhase.ACTION; // Keep in action phase for modal
          const owner = players.find(p => p.id === propertyState.ownerId)!;
          dispatch({ type: 'SHOW_MODAL', payload: {
            title: 'Trả Tiền Thuê',
            content: (
              <div>
                <p className="mb-4">{currentSpace.name} thuộc sở hữu của {owner.name}. Bạn phải trả {formatCurrency(currentSpace.rent!)} tiền thuê.</p>
                <div className="flex justify-center">
                  <button onClick={() => { dispatch({ type: 'PAY_RENT', payload: { property: currentSpace, owner }}); dispatch({ type: 'CLOSE_MODAL' }); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded">Trả tiền</button>
                </div>
              </div>
            )
          }});
        } else {
          dispatch({ type: 'NO_ACTION' });
        }
        break;
      }
      case SpaceType.CHANCE: {
        nextPhase = GamePhase.ACTION; // Keep in action phase for modal
        const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
        playSound('draw-card-sound');
        dispatch({ type: 'SHOW_MODAL', payload: {
          title: 'Cơ Hội',
          content: (
            <div>
              <p className="mb-4">{card.description}</p>
              <div className="flex justify-center">
                <button onClick={() => { dispatch({ type: 'DRAW_CARD', payload: card }); dispatch({ type: 'CLOSE_MODAL' }); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">OK</button>
              </div>
            </div>
          )
        }});
        break;
      }
      case SpaceType.COMMUNITY_CHEST: {
        nextPhase = GamePhase.ACTION; // Keep in action phase for modal
        const card = COMMUNITY_CHEST_CARDS[Math.floor(Math.random() * COMMUNITY_CHEST_CARDS.length)];
        playSound('draw-card-sound');
        dispatch({ type: 'SHOW_MODAL', payload: {
          title: 'Khí Vận',
          content: (
            <div>
              <p className="mb-4">{card.description}</p>
              <div className="flex justify-center">
                <button onClick={() => { dispatch({ type: 'DRAW_CARD', payload: card }); dispatch({ type: 'CLOSE_MODAL' }); }} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded">OK</button>
              </div>
            </div>
          )
        }});
        break;
      }
      case SpaceType.TAX:
        dispatch({ type: 'PAY_TAX', payload: { amount: currentSpace.price!, name: currentSpace.name } });
        break;
      case SpaceType.GO_TO_JAIL:
        dispatch({ type: 'GO_TO_JAIL' });
        break;
      default:
        dispatch({ type: 'NO_ACTION' });
    }
     if (nextPhase === GamePhase.END_TURN) {
        handleEndTurn();
    }
  }, [gamePhase, currentSpace, properties, currentPlayer, players, dispatch, handleEndTurn, playSound]);
  
  React.useEffect(() => {
    if (gamePhase === GamePhase.MOVING && movementSteps > 0) {
      const moveInterval = setInterval(() => {
        dispatch({ type: 'MOVE_ONE_STEP' });
      }, 300); // 300ms per step
      return () => clearInterval(moveInterval);
    }
  }, [gamePhase, movementSteps]);

  React.useEffect(() => {
    if (gamePhase === GamePhase.ACTION && !modal.isOpen) {
      const timer = setTimeout(() => handleSpaceAction(), 500);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, handleSpaceAction, modal.isOpen]);

  React.useEffect(() => {
    const isActionFinished = (
        gamePhase === GamePhase.ACTION || 
        gamePhase === GamePhase.END_TURN
    ) && !modal.isOpen && movementSteps === 0;

    if (isActionFinished) {
      const timer = setTimeout(() => {
        dispatch({ type: 'END_TURN' });
      }, 1500); // Automatic turn end after 1.5s
      return () => clearTimeout(timer);
    }
  }, [gamePhase, modal.isOpen, movementSteps, dispatch]);


  return (
    <div className="h-screen p-2 md:p-4 flex flex-col items-center justify-center gap-4 lg:flex-row lg:items-start lg:justify-center">
      <button 
        onClick={() => setIsMuted(!isMuted)} 
        className="mute-button"
        aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
        title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
      >
        <i className={`fas text-lg ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
      </button>

      {modal.isOpen && (
        <ActionModal title={modal.title} onClose={gamePhase === GamePhase.GAME_OVER ? undefined : () => dispatch({ type: 'CLOSE_MODAL' })}>
          {modal.content}
        </ActionModal>
      )}

      {/* Mobile Info Overlay */}
      {mobileView && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-end z-40 lg:hidden" onClick={() => setMobileView(null)}>
          <div className="bg-gray-800 rounded-t-lg shadow-xl p-4 h-2/3 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 text-white">
              <h2 className="text-xl font-bold">{mobileView === 'players' ? 'Thông Tin Người Chơi' : 'Nhật Ký'}</h2>
              <button onClick={() => setMobileView(null)}><i className="fas fa-times text-xl"></i></button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
              {mobileView === 'players' && players.map(player => (
                <PlayerInfo key={player.id} player={player} boardData={BOARD_DATA} isCurrent={player.id === currentPlayer.id} />
              ))}
              {mobileView === 'log' && <EventLog events={eventLog} />}
            </div>
          </div>
        </div>
      )}

      {/* Left Column (Desktop) - Player List */}
      <div className="hidden lg:flex w-full lg:w-[280px] xl:w-[320px] flex-col gap-4 order-2 lg:order-1 max-h-[95vh] overflow-y-auto pr-2">
        {players.map(player => (
          <PlayerInfo key={player.id} player={player} boardData={BOARD_DATA} isCurrent={player.id === currentPlayer.id} />
        ))}
      </div>

      {/* Center Column - Board & Mobile Header */}
      <div className="w-full flex-grow flex flex-col justify-center items-center order-1 lg:order-2 lg:max-h-full">
        <div className="lg:hidden w-full bg-gray-800 bg-opacity-80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-700 mb-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <i className={`fas ${currentPlayer.icon} text-2xl`} style={{color: currentPlayer.color}}></i>
                <span className="font-bold text-lg">{currentPlayer.name}</span>
            </div>
            <div className="font-bold text-lg text-green-400">{formatCurrencyShort(currentPlayer.money)}</div>
        </div>
        <Board 
          players={players} 
          properties={properties} 
          dice={dice} 
          isRolling={isRolling}
          gamePhase={gamePhase}
          isRollDisabled={gamePhase !== GamePhase.START_TURN || currentPlayer.isBankrupt || isRolling}
          onRollDice={handleRollDice}
        />
      </div>

      {/* Right Column (Desktop) - Log & Turn Info */}
      <div className="hidden lg:flex w-full lg:w-[280px] xl:w-[320px] flex-col gap-4 order-3">
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-2 text-center border-b pb-2">Thông Tin</h2>
          <p className="text-lg text-center">Lượt của: <span className="font-bold" style={{color: currentPlayer.color}}>{currentPlayer.name}</span></p>
        </div>
        <EventLog events={eventLog} />
      </div>
      
      {/* Mobile Bottom Nav */}
       <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 p-2 flex justify-around border-t border-gray-700 z-30">
        <button onClick={() => setMobileView('players')} className="flex flex-col items-center gap-1 text-gray-300 hover:text-white p-2 w-24">
          <i className="fas fa-users text-xl"></i>
          <span className="text-xs font-semibold">Người Chơi</span>
        </button>
        <button onClick={() => setMobileView('log')} className="flex flex-col items-center gap-1 text-gray-300 hover:text-white p-2 w-24">
          <i className="fas fa-book-open text-xl"></i>
          <span className="text-xs font-semibold">Nhật Ký</span>
        </button>
      </div>
    </div>
  );
};

export default App;