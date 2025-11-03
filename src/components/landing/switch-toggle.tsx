// SwitchToggle.tsx

import React from 'react';

interface SwitchToggleProps {
  isAnnual: boolean;
  setIsAnnual: React.Dispatch<React.SetStateAction<boolean>>;
}

const SwitchToggle: React.FC<SwitchToggleProps> = ({ isAnnual, setIsAnnual }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isAnnual}
      onClick={() => setIsAnnual(!isAnnual)}
      className={`peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
        isAnnual ? 'bg-[#6127FF]' : 'bg-gray-100'
      }`}
    >
      <span
        className={`pointer-events-none block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform ${
          isAnnual ? 'translate-x-4 bg-white' : 'translate-x-0 bg-gray-400'
        }`}
      />
    </button>
  );
};

export default SwitchToggle;
