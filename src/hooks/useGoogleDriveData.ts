
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchGoogleDriveData, calculateFileStats } from '@/services/googleDriveService';

export const useGoogleDriveData = (folderId: string = 'root') => {
  const { session, refreshGoogleAuth } = useAuth();

  // Check if user needs reauth (logged in but no provider token)
  const needsReauth = !!session?.user && !session?.provider_token;
  const hasValidToken = !!session?.provider_token;

  // Use React Query for caching and data fetching
  const {
    data: driveData,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['googleDriveData', folderId, session?.provider_token],
    queryFn: async () => {
      console.log('Fetching Google Drive data with token for folder...', folderId);
      console.log('Token details:', {
        tokenLength: session?.provider_token?.length,
        tokenStart: session?.provider_token?.substring(0, 10) + '...',
        expiresAt: session?.expires_at
      });
      
      const data = await fetchGoogleDriveData(session!.provider_token!, folderId);
      
      console.log('Successfully fetched Drive data:', {
        filesCount: data.files.length,
        quota: data.quota,
        user: data.user.displayName,
        folderId
      });
      
      return data;
    },
    enabled: hasValidToken && !needsReauth, // Only run query if we have a valid token
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.message?.includes('401') || error?.message?.includes('unauthorized')) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Calculate file stats from cached data
  const fileStats = driveData ? calculateFileStats(driveData.files) : null;

  console.log('useGoogleDriveData: Current state', {
    sessionExists: !!session,
    userEmail: session?.user?.email,
    providerToken: session?.provider_token ? 'present' : 'missing',
    needsReauth,
    hasValidToken,
    loading,
    dataExists: !!driveData,
    folderId
  });

  return {
    driveData,
    fileStats,
    loading,
    error: error?.message || null,
    needsReauth,
    hasValidToken,
    refreshAuth: refreshGoogleAuth,
    refetch
  };
};
