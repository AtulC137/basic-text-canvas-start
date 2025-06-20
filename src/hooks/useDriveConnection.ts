
import { useState, useEffect } from 'react';

export const useDriveConnection = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connected = localStorage.getItem('driveConnected') === 'true';
    setIsConnected(connected);
  }, []);

  const connect = () => {
    localStorage.setItem('driveConnected', 'true');
    setIsConnected(true);
  };

  const disconnect = () => {
    localStorage.removeItem('driveConnected');
    setIsConnected(false);
  };

  return {
    isConnected,
    connect,
    disconnect
  };
};
