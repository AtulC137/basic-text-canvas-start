import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { syncUserToSupabase } from '@/utils/supabaseSync';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  authInitialized: boolean;
  providerReady: boolean;
  needsReauth: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshGoogleAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Derived provider state
  const providerReady = !!session?.provider_token;
  // Needs reauth if we're signed in with no provider token
  const needsReauth = !!user && !providerReady;

  useEffect(() => {
    console.log('Setting up auth state listener');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        setAuthInitialized(true);
        setLoading(false);

        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            syncUserToSupabase(session.user).catch(err => {
              console.error('Error syncing user:', err);
            });
          }, 0);
        }

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        }
      }
    );

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(prev => prev || session);
        setUser(prev => prev || (session?.user ?? null));
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setAuthInitialized(true);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Updated scope for Drive upload
          scopes: 'openid email profile https://www.googleapis.com/auth/drive.file',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            include_granted_scopes: 'true'
          },
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  const refreshGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Updated scope for Drive upload
          scopes: 'openid email profile https://www.googleapis.com/auth/drive.file',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            include_granted_scopes: 'true'
          },
          redirectTo: window.location.href
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setSession(null);
        setUser(null);
        throw error;
      }
    } catch (error) {
      setSession(null);
      setUser(null);
      throw error;
    }
  };

  // Memoize context value to avoid unnecessary renders
  const value = useMemo(() => ({
    user,
    session,
    authInitialized,
    providerReady,
    needsReauth,
    loading,
    signInWithGoogle,
    logout,
    refreshGoogleAuth
  }), [user, session, authInitialized, providerReady, needsReauth, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
