import React, { useState } from 'react';
import { X, Download, Upload, ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { exportBackupData, importBackupData } from '../utils/storage';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface DataMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  soundEnabled: boolean;
}

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  soundEnabled,
}) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microspends_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (soundEnabled) soundFx.goldChime();
    triggerHaptic('success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupData(content);
      if (success) {
        setImportStatus('success');
        if (soundEnabled) soundFx.goldChime();
        triggerHaptic('success');
        setTimeout(() => {
          onDataRestored();
          onClose();
        }, 1200);
      } else {
        setImportStatus('error');
        if (soundEnabled) soundFx.deleteDrop();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#030a05] border border-amber-500/30 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-amber-500/15">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider">
              Data Migration Manager
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300">
          Export your encrypted Obsidian ledger or restore from a JSON backup with zero data loss.
        </p>

        <div className="space-y-3">
          {/* Export JSON */}
          <div className="p-3.5 rounded-xl bg-black/50 border border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-zinc-100">Export Backup</span>
            <p className="text-[11px] text-zinc-400">
              Download all transactions, subscriptions, and AI insights as a clean JSON file.
            </p>
            <button
              onClick={handleExport}
              className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-3.5 rounded-xl bg-black/50 border border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-zinc-100">Restore / Import</span>
            <p className="text-[11px] text-zinc-400">
              Restore previously saved transactions from a valid backup file.
            </p>

            <label className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Select Backup File (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {importStatus === 'success' && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Restored ledger successfully! Reloading...</span>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-mono flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Invalid backup format. Please verify file.</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
