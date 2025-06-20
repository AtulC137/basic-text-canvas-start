
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseAuth = () => {
  const { user } = useAuth();
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  useEffect(() => {
    // Since we're using Supabase auth directly, we just need to check if user exists
    setIsSupabaseReady(!!user);
  }, [user]);

  return { isSupabaseReady, firebaseUser: user };
};
