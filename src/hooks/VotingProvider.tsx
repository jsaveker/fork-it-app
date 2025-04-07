import React, { createContext, useContext, ReactNode } from 'react';
import { useVoting } from './useVoting';

// Create a context for the voting functionality
const VotingContext = createContext<ReturnType<typeof useVoting> | null>(null);

// Provider component
export const VotingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const votingState = useVoting();
  
  return (
    <VotingContext.Provider value={votingState}>
      {children}
    </VotingContext.Provider>
  );
};

// Custom hook to use the voting context
export const useVotingContext = () => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVotingContext must be used within a VotingProvider');
  }
  return context;
}; 