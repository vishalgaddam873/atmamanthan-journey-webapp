const SessionTimeline = ({ currentPhase, session, selectedPran, showHeader = true }) => {
  const phases = [
    {
      id: 'INIT',
      label: 'Initialization',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      description: 'Session ready'
    },
    {
      id: 'AGE_SELECTION',
      label: 'Age Selection',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      description: session?.ageGroup || 'Select age group',
      value: session?.ageGroup
    },
    {
      id: 'COMMON_FLOW',
      label: 'Common Flow',
      icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
      description: 'Common audio flow'
    },
    {
      id: 'MOOD_SELECTION',
      label: 'Mood Selection',
      icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
      description: session?.mood || 'Select mood',
      value: session?.mood
    },
    {
      id: 'CATEGORY_FLOW',
      label: 'Category Flow',
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      description: session?.category || 'Category specific flow',
      value: session?.category
    },
    {
      id: 'PRAN_SELECTION',
      label: 'Pran Selection',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      description: session?.pran ? (selectedPran ? selectedPran.label : `Pran ${session.pran}`) : 'Select pran',
      value: session?.pran ? (selectedPran ? `${selectedPran.label} (Pran ${session.pran})` : `Pran ${session.pran}`) : null
    },
    {
      id: 'ENDING',
      label: 'Session Complete',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      description: 'Session completed'
    }
  ];

  const getPhaseIndex = (phaseId) => {
    return phases.findIndex(p => p.id === phaseId);
  };

  const currentIndex = getPhaseIndex(currentPhase || 'INIT');

  const getStatus = (index) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className={showHeader ? "bg-gray-800 rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-700 overflow-visible" : "overflow-visible"}>
      {showHeader && (
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Live Session Tracking</h2>
            <p className="text-sm text-gray-400">Real-time session progress</p>
          </div>
        </div>
      )}

      <div className="relative py-8 px-4 overflow-visible">
        {/* Timeline items - Horizontal */}
        <div className="relative flex justify-between items-start pb-4 overflow-visible">
          {/* Horizontal Timeline line - positioned behind icons */}
          <div className="absolute top-8 left-8 right-8 h-1.5 bg-gray-700 rounded-full z-0">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${(currentIndex / (phases.length - 1)) * 100}%` }}
            />
          </div>

          {phases.map((phase, index) => {
            const status = getStatus(index);
            const isCompleted = status === 'completed';
            const isActive = status === 'active';
            const isPending = status === 'pending';

            return (
              <div key={phase.id} className="relative flex-shrink-0 flex flex-col items-center z-10 overflow-visible" style={{ width: `${100 / phases.length}%`, minWidth: '100px' }}>
                {/* Icon circle */}
                <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300 mb-3 overflow-visible ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500 shadow-lg shadow-indigo-500/50' 
                    : isActive
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500 shadow-lg shadow-indigo-500/50 animate-pulse'
                    : 'bg-gray-700 border-gray-600'
                }`}>
                  {isCompleted ? (
                    // Show checkmark for completed phases
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    // Show icon for active/pending phases
                    <svg 
                      className={`w-7 h-7 ${isActive ? 'text-white' : 'text-gray-400'}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={phase.icon} />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="text-center w-full px-1">
                  <div className="mb-2">
                    <h3 className={`text-xs md:text-sm font-bold mb-1 leading-tight ${
                      isActive ? 'text-indigo-400' : isCompleted ? 'text-white' : 'text-gray-500'
                    }`}>
                      {phase.label}
                    </h3>
                    {isActive && (
                      <span className="inline-block px-2 py-0.5 bg-indigo-900/50 text-indigo-300 rounded-full text-xs font-semibold animate-pulse mb-1 border border-indigo-700/50">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mb-1 line-clamp-2 ${
                    isActive ? 'text-indigo-400 font-medium' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {phase.description}
                  </p>
                  {phase.value && (isCompleted || isActive) && (
                    <div className="inline-block px-2 py-0.5 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-700/50 rounded-lg mt-1">
                      <span className="text-xs font-semibold text-indigo-300">{phase.value}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SessionTimeline;

