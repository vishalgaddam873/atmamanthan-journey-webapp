import { useState } from 'react';

const AgeSelection = ({ socket, onAgeSelected }) => {
  const [selected, setSelected] = useState(null);

  const ageGroups = [
    { id: 'KIDS', label: 'KIDS', range: '2-9' },
    { id: 'PRE-TEEN', label: 'PRE-TEEN', range: '10-14' },
    { id: 'TEEN+', label: 'TEEN+', range: '15+' },
  ];

  const handleSelect = (ageGroup) => {
    if (selected) return; // Prevent multiple selections
    
    setSelected(ageGroup);
    socket?.emit('age_selected', { ageGroup });
    onAgeSelected?.(ageGroup);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h2 className="text-white text-3xl mb-12 font-bold">Select Your Age Group</h2>
      <div className="grid grid-cols-1 gap-8 w-full max-w-md">
        {ageGroups.map((age) => (
          <button
            key={age.id}
            onClick={() => handleSelect(age.id)}
            disabled={selected !== null}
            className={`
              px-8 py-6 rounded-lg text-2xl font-semibold transition-all duration-300
              ${selected === age.id
                ? 'bg-green-600 text-white scale-105'
                : selected !== null
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95'
              }
            `}
          >
            <div className="text-3xl mb-2">{age.label}</div>
            <div className="text-lg opacity-90">{age.range}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgeSelection;

