import React, { createContext, useContext, ReactNode } from 'react';
import { useVoting } from './useVoting';

// Create a context for the voting functionality
const VotingContext = createContext<ReturnType<typeof useVoting> | undefined>(undefined);

// Provider component that wraps the app and makes the voting context available
export const VotingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const voting = useVoting();
  
  return (
    <VotingContext.Provider value={voting}>
      {children}
    </VotingContext.Provider>
  );
};

// Custom hook to use the voting context
export const useVotingContext = () => {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVotingContext must be used within a VotingProvider');
  }
  return context;
}; 