import React, { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logoutFirebase, onAuthStateChanged, User } from '../../services/auth';
import { setGoogleAccessToken } from '../../utils/googleDrive';
import { LogOut, CheckCircle2, Shield, Cloud, AlertCircle } from 'lucide-react';

interface LoginProps {
  onAuthSuccess?: (user: User) => void;
  compact?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onAuthSuccess, compact = false }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && onAuthSuccess) {
        onAuthSuccess(currentUser);
      }
    });
    return () => unsubscribe();
  }, [onAuthSuccess]);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { user: signedInUser, accessToken } = await signInWithGoogle();
      if (accessToken) {
        setGoogleAccessToken(accessToken);
      }
      setUser(signedInUser);
      if (onAuthSuccess && signedInUser) {
        onAuthSuccess(signedInUser);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err?.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logoutFirebase();
      setGoogleAccessToken(null);
      setUser(null);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    if (user) {
      return (
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full border border-blue-400" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {user.displayName?.[0] || 'G'}
            </div>
          )}
          <div className="text-left">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-100">{user.displayName || 'Google User'}</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-[10px] text-slate-400 block leading-tight">{user.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <svg className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
          <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
        </svg>
        <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
      </button>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6 mx-auto">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Shield className="w-7 h-7" />
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            Neneh Funkuba Enterprise
          </span>
          <h2 className="text-xl font-extrabold text-slate-100 mt-2">Enterprise Security Portal</h2>
          <p className="text-xs text-slate-400 mt-1">
            Authenticate using your official Google Account to access system controls and cloud synchronization.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/80 text-rose-300 border border-rose-500/50 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {user ? (
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-md">
          <div className="flex items-center gap-3.5">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Authenticated User'} className="w-12 h-12 rounded-full border-2 border-amber-500/50 shadow" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow">
                {user.displayName?.[0] || 'G'}
              </div>
            )}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-100 text-sm">{user.displayName || 'Google User'}</h3>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <p className="text-xs text-slate-400">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected with Google Drive
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-amber-400" />
              <span className="font-medium text-slate-300">Ready for Cloud Sync</span>
            </span>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"/>
            </svg>
            <span>{loading ? 'Authenticating with Google...' : 'Sign in with Google'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
