"use client"
import { createContext, useContext, useState } from 'react';

export const DAppContext = createContext();

export const DAppContextProvider = ({ children }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [vested, setVested] = useState(false);
  const [account, setAccount] = useState('');

  return (
    <DAppContext.Provider value={{ vested, setVested, walletConnected, setWalletConnected, account, setAccount }}>
      {children}
    </DAppContext.Provider>
  );
};


