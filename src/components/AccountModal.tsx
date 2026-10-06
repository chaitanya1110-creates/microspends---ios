import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  LogOut, 
  Cloud, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Database,
  Key
} from 'lucide-react';
import { type User as FirebaseUser } from 'firebase/auth';
import { signInWithGoogle, signOutUser, signInWithEmail, signUpWithEmail } from '../firebase';
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

  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [showEmailAuthForm, setShowEmailAuthForm] = useState<boolean>(false);

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;
    setIsSigningIn(true);
    setAuthError(null);
    try {
      if (soundEnabled) soundFx.tap();
      if (isSignUpMode) {
        await signUpWithEmail(emailInput, passwordInput);
        setSyncStatusMsg('Account created successfully. Real-time Firestore sync active.');
      } else {
        await signInWithEmail(emailInput, passwordInput);
        setSyncStatusMsg('Signed in successfully. Real-time Firestore sync active.');
      }
      if (soundEnabled) soundFx.goldChime();
      triggerHaptic('success');
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/weak-password') {
        setAuthError('Password must be at least 6 characters.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('Email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setAuthError('Invalid email or password. Please try again.');
      } else {
        setAuthError(err.message || 'Authentication failed. Please try again.');
      }
      if (soundEnabled) soundFx.deleteDrop();
    } finally {
      setIsSigningIn(false);
    }
  };

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      if (soundEnabled) soundFx.tap();
      await signInWithGoogle();
      if (soundEnabled) soundFx.goldChime();
      triggerHaptic('success');
      setSyncStatusMsg('Google Account connected successfully. Real-time Firestore sync active.');
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-blocked') {
        setAuthError('Pop-up was blocked by browser. Please allow popups for this site to sign in.');
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled by user.');
      } else {
        setAuthError(err.message || 'Google Authentication failed. Please try again.');
      }
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
      setSyncStatusMsg('Signed out of Google account.');
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
      setSyncStatusMsg('All transactions and subscriptions saved to Google Cloud Firestore.');
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
      setSyncStatusMsg('Ledger successfully restored from Google Cloud Firestore.');
    } catch (err: any) {
      setSyncStatusMsg('Restore error: ' + (err.message || 'Could not fetch cloud data.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl liquid-glass-card p-6 shadow-[0_24px_64px_rgba(0,0,0,0.95)] text-zinc-100 max-h-[90vh] overflow-y-auto ios-momentum-scroll">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#1C221D] to-[#0A0E0C] border border-[#D4AF37]/35 flex items-center justify-center text-[#F5D478] shadow-inner">
              <Key className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#FFF3C4] uppercase tracking-wider">
                Cloud Vault & Authentication
              </h2>
              <p className="text-[11px] font-mono text-[#D4AF37]/70">
                GOOGLE FIRESTORE PERSISTENCE
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              onClose();
            }}
            className="w-8 h-8 rounded-lg knurled-crown text-zinc-400 hover:text-white transition flex items-center justify-center cursor-pointer"
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
              <div className="p-4 rounded-xl bg-gradient-to-b from-[#101512] to-[#070A08] border border-[#D4AF37]/30 flex items-center gap-3.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/60 object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#F5D478] font-serif font-bold text-lg">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif font-bold text-sm text-white truncate">
                      {currentUser.displayName || 'Google Account Owner'}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono bg-zinc-900 text-[#E5C378] border border-zinc-800">
                      SYNC ACTIVE
                    </span>
                  </div>
                  <p className="text-zinc-400 font-mono text-[11px] truncate mt-0.5">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Cloud Stats */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl horology-subdial">
                  <span className="text-[10px] font-serif uppercase tracking-wider text-[#E5C378] block">
                    Local Memory
                  </span>
                  <span className="text-base font-serif font-bold text-white mt-1 block">
                    {transactionCount} Entries
                  </span>
                </div>
                <div className="p-3 rounded-xl horology-subdial">
                  <span className="text-[10px] font-serif uppercase tracking-wider text-[#E5C378] block">
                    Cloud Database
                  </span>
                  <span className="text-base font-serif font-bold text-zinc-300 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E5C378]" /> Firestore
                  </span>
                </div>
              </div>

              {/* Sync Actions */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black font-serif font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition shadow-lg shadow-[#D4AF37]/25 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing to Cloud...' : 'Push All Entries to Cloud'}
                </button>

                <button
                  onClick={handleManualRestore}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-4 rounded-xl knurled-crown text-[#F5D478] font-serif text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition cursor-pointer"
                >
                  <Database className="w-4 h-4 text-[#D4AF37]" />
                  Restore Entries from Cloud
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full py-2 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 border border-rose-500/30 text-xs flex items-center justify-center gap-2 transition font-serif cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Logged out state */
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#131915] border border-[#D4AF37]/30 flex items-center justify-center text-[#F5D478] shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-sm font-serif font-bold text-[#FFF3C4] uppercase tracking-wider">
                  Secure Cloud Storage
                </h3>
                <p className="text-zinc-400 text-xs mt-1 max-w-xs mx-auto font-sans leading-relaxed">
                  Automatically safeguard and synchronize your financial ledger across devices in real time with Google Cloud Firestore.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-serif text-left">
                  {authError}
                </div>
              )}

              {!showEmailAuthForm ? (
                <div className="space-y-2.5">
                  <button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black font-serif font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition shadow-lg shadow-[#D4AF37]/25 disabled:opacity-50 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
                  </button>

                  <button
                    onClick={() => {
                      if (soundEnabled) soundFx.tap();
                      setShowEmailAuthForm(true);
                      setAuthError(null);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-zinc-800 bg-black/40 text-zinc-300 font-mono text-[11px] tracking-wider uppercase flex items-center justify-center gap-1.5 hover:bg-zinc-900 active:scale-95 transition"
                  >
                    Or Use Email & Password (iPhone Native)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5 text-left border border-zinc-800/80 p-4 rounded-xl bg-black/50">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block text-center mb-1">
                    {isSignUpMode ? 'Create New Cloud Account' : 'Sign In with Email'}
                  </span>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. member@icarus.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-800 rounded-xl bg-black text-zinc-100 font-mono text-xs focus:outline-none focus:border-[#D4AF37]/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-800 rounded-xl bg-black text-zinc-100 font-mono text-xs focus:outline-none focus:border-[#D4AF37]/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black font-serif font-bold text-xs hover:brightness-110 transition active:scale-95"
                  >
                    {isSigningIn ? 'Authenticating...' : isSignUpMode ? 'Register & Connect' : 'Sign In & Connect'}
                  </button>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-900 mt-2 font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        if (soundEnabled) soundFx.tap();
                        setIsSignUpMode(!isSignUpMode);
                        setAuthError(null);
                      }}
                      className="text-amber-400 hover:text-amber-200 transition"
                    >
                      {isSignUpMode ? '← Switch to Sign In' : 'Need an Account? Register →'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (soundEnabled) soundFx.tap();
                        setShowEmailAuthForm(false);
                        setAuthError(null);
                      }}
                      className="text-zinc-500 hover:text-zinc-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Sync Status Banner */}
          {syncStatusMsg && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-[#F5D478] text-[11px] font-serif flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-[#E5C378] shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
