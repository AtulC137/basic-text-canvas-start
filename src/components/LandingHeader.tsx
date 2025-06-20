
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Logo } from './Logo';

export const LandingHeader = () => {
  const navigate = useNavigate();
  const { user, authInitialized, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/80 shadow-md backdrop-blur-sm' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-bold text-gray-900">SaveBits</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Privacy Policy Link for Google verification */}
          <Link 
            to="/privacy" 
            className="text-sm text-gray-600 hover:text-google-blue transition-colors hidden sm:inline"
          >
            Privacy Policy
          </Link>
          
          {authInitialized && (
            <>
              {user ? (
                <>
                  <Button onClick={() => navigate('/dashboard')} variant="ghost">
                    Go to Dashboard
                  </Button>
                  <Button onClick={handleLogout} variant="outline">
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate('/auth')} variant="outline">
                  Get Started
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
