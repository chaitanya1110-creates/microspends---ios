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
      setSyncStatusMsg('Clé Maîtresse Google liée avec succès au Coffre-Fort Cloud.');
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setAuthError(err.message || 'Authentification Google interrompue.');
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
      setSyncStatusMsg('Verrouillage du Coffre Cloud effectué.');
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
      setSyncStatusMsg('Toutes les écritures sont consignées sur Google Cloud Firestore.');
    } catch (err: any) {
      setSyncStatusMsg('Erreur de synchronisation: ' + (err.message || 'Vérifiez la connexion réseau.'));
    }
  };

  const handleManualRestore = async () => {
    setSyncStatusMsg(null);
    try {
      if (soundEnabled) soundFx.tap();
      await onRestoreFromCloud();
      if (soundEnabled) soundFx.goldChime();
      triggerHaptic('success');
      setSyncStatusMsg('Livre des comptes restauré avec succès depuis Google Cloud Firestore.');
    } catch (err: any) {
      setSyncStatusMsg('Erreur de restauration: ' + (err.message || 'Impossible de récupérer les données.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl horology-bezel p-6 shadow-[0_24px_64px_rgba(0,0,0,0.95)] text-zinc-100 max-h-[90vh] overflow-y-auto ios-momentum-scroll">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#1C221D] to-[#0A0E0C] border border-[#D4AF37]/35 flex items-center justify-center text-[#F5D478] shadow-inner">
              <Key className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#FFF3C4] uppercase tracking-wider">
                Coffre Privé · Google Cloud
              </h2>
              <p className="text-[11px] font-mono text-[#D4AF37]/70">
                CHRONO-DATABASE & AUTHENTIFICATION
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              onClose();
            }}
            className="w-8 h-8 rounded-lg knurled-crown text-zinc-400 hover:text-white transition flex items-center justify-center"
            aria-label="Fermer"
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
                      {currentUser.displayName || 'Compte Google Maître'}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                      LIAISON ACTIVE
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
                    Actes en Mémoire
                  </span>
                  <span className="text-base font-serif font-bold text-white mt-1 block">
                    {transactionCount} Écritures
                  </span>
                </div>
                <div className="p-3 rounded-xl horology-subdial">
                  <span className="text-[10px] font-serif uppercase tracking-wider text-[#E5C378] block">
                    Coffre-Fort Cloud
                  </span>
                  <span className="text-base font-serif font-bold text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Firestore
                  </span>
                </div>
              </div>

              {/* Sync Actions */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black font-serif font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition shadow-lg shadow-[#D4AF37]/25 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Consignation en cours...' : 'Consigner Tout au Coffre Cloud'}
                </button>

                <button
                  onClick={handleManualRestore}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-4 rounded-xl knurled-crown text-[#F5D478] font-serif text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition"
                >
                  <Database className="w-4 h-4 text-[#D4AF37]" />
                  Restaurer les Écritures depuis le Cloud
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full py-2 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 border border-rose-500/30 text-xs flex items-center justify-center gap-2 transition font-serif"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Verrouiller la Clé Google
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
                  Accès Privé au Coffre-Fort
                </h3>
                <p className="text-zinc-400 text-xs mt-1 max-w-xs mx-auto font-sans leading-relaxed">
                  Liez votre compte Google pour sauvegarder en continu vos écritures sur Google Cloud Firestore avec chiffrement dédié.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-serif text-left">
                  {authError}
                </div>
              )}

              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black font-serif font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition shadow-lg shadow-[#D4AF37]/25 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                {isSigningIn ? 'Liaison en cours...' : 'Connexion Google Sécurisée'}
              </button>
            </div>
          )}

          {/* Sync Status Banner */}
          {syncStatusMsg && (
            <div className="p-3 rounded-xl bg-[#0B150F] border border-[#D4AF37]/30 text-[#F5D478] text-[11px] font-serif flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncStatusMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
