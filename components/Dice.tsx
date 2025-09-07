import React from 'react';

interface DiceProps {
  values: [number, number];
  isRolling: boolean;
}

const Die: React.FC<{ value: number, isRolling: boolean, animationClass: string }> = ({ value, isRolling, animationClass }) => {
  const icon = value > 0 ? `fa-dice-${['one', 'two', 'three', 'four', 'five', 'six'][value - 1]}` : 'fa-square';
  return (
    <div className={`w-16 h-16 bg-white text-gray-900 rounded-lg flex items-center justify-center text-4xl shadow-lg transition-transform duration-100 transform ${isRolling ? animationClass : 'hover:scale-105'}`}>
      <i className={`fas ${icon}`}></i>
    </div>
  );
};

const Dice: React.FC<DiceProps> = ({ values, isRolling }) => {
  const [displayValues, setDisplayValues] = React.useState<[number, number]>(values);

  React.useEffect(() => {
    if (isRolling) {
      const rollAnimation = setInterval(() => {
        setDisplayValues([
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ] as [number, number]);
      }, 100);
      
      return () => clearInterval(rollAnimation);
    } else {
      setDisplayValues(values);
    }
  }, [isRolling, values]);

  // Don't show the dice initially if they haven't been rolled yet, unless rolling
  if (values[0] === 0 && values[1] === 0 && !isRolling) {
      return null;
  }

  return (
    <div className="flex gap-4 p-4 bg-black bg-opacity-40 rounded-2xl backdrop-blur-sm">
      <Die value={displayValues[0]} isRolling={isRolling} animationClass="animate-jiggle-1" />
      <Die value={displayValues[1]} isRolling={isRolling} animationClass="animate-jiggle-2" />
    </div>
  );
};

export default Dice;
