import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  LogOut, 
  Cloud, 
  CloudOff, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Database,
  User as UserIcon,
  Smartphone
} from 'lucide-react';
import { type User as FirebaseUser } from 'firebase/auth';
import { signInWithGoogle, signOutUser } from '../firebase';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
  onSyncToCloud: () => Promise<void>;
  onRestoreFromCloud: () => Promise<void>;
  isSyncing: boolean;
  soundEnabled: boolean;
  transactionCount: number;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSyncToCloud,
  onRestoreFromCloud,
  isSyncing,
  soundEnabled,
  transactionCount,
}) => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      if (soundEnabled) soundFx.tap();
      await signInWithGoogle();
      if (soundEnabled) soundFx.goldChime();
      triggerHaptic('success');
      setSyncStatusMsg('Google account linked! Cloud Firestore ready.');
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setAuthError(err.message || 'Failed to sign in with Google. Check popup permissions.');
      if (soundEnabled) soundFx.deleteDrop();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (soundEnabled) soundFx.tap();
      await signOutUser();
      triggerHaptic('light');
      setSyncStatusMsg('Signed out of cloud account.');
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const handleManualSync = async () => {
    setSyncStatusMsg(null);
    try {
      if (soundEnabled) soundFx.tap();
      await onSyncToCloud();
      if (soundEnabled) soundFx.goldChime();
      triggerHaptic('success');
      setSyncStatusMsg('All records securely saved to Google Cloud Firestore!');
    } catch (err: any) {
      setSyncStatusMsg('Sync error: ' + (err.message || 'Check network connection.'));
    }
  };

  const handleManualRestore = async () => {
    setSyncStatusMsg(null);
    try {
      if (soundEnabled) soundFx.tap();
      await onRestoreFromCloud();
      if (soundEnabled) soundFx.goldChime();
      triggerHaptic('success');
      setSyncStatusMsg('Ledger successfully restored from Google Cloud Firestore!');
    } catch (err: any) {
      setSyncStatusMsg('Restore error: ' + (err.message || 'Failed to retrieve data.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl liquid-glass-card rgb-border-subtle p-6 shadow-2xl border border-white/10 text-zinc-100 max-h-[90vh] overflow-y-auto ios-momentum-scroll">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-cinzel font-bold text-white tracking-wide">
                Firebase Cloud Sync
              </h2>
              <p className="text-[11px] text-zinc-400">
                Google Auth & Firestore Database
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition flex items-center justify-center text-zinc-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-4 text-xs">
          
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/30 flex items-center gap-3.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-12 h-12 rounded-full border-2 border-emerald-400/60 object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-lg">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-white truncate">
                      {currentUser.displayName || 'Google Account'}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      SYNC ACTIVE
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] truncate mt-0.5">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Cloud Stats */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                    Local Records
                  </span>
                  <span className="text-base font-mono font-bold text-white mt-1 block">
                    {transactionCount} Entries
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                    Cloud Database
                  </span>
                  <span className="text-base font-mono font-bold text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Firestore
                  </span>
                </div>
              </div>

              {/* Sync Actions */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing with Firestore...' : 'Push All Data to Cloud Firestore'}
                </button>

                <button
                  onClick={handleManualRestore}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/10 font-medium text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition"
                >
                  <Database className="w-4 h-4 text-cyan-400" />
                  Restore / Pull Data from Cloud
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full py-2 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs flex items-center justify-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out from Google
                </button>
              </div>
            </div>
          ) : (
            /* Logged out state */
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-amber-400 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">
                  Connect Google & Firestore
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                  Sign in with your Google account to automatically synchronize your micro-expenses, subscriptions, and AI financial audits securely across all devices.
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full py-3.5 px-4 rounded-2xl bg-white text-zinc-900 font-semibold text-xs flex items-center justify-center gap-3 hover:bg-zinc-100 active:scale-[0.98] transition shadow-xl shadow-white/10 disabled:opacity-50"
              >
                {/* Google SVG Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                {isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {syncStatusMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
          )}

          {authError && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[11px]">
              {authError}
            </div>
          )}

          {/* Privacy Note */}
          <div className="pt-2 text-[10px] text-zinc-500 text-center leading-normal border-t border-white/[0.04]">
            Data is strictly authenticated via Google OAuth and encrypted in your personal Firestore database partition.
          </div>
        </div>
      </div>
    </div>
  );
};
