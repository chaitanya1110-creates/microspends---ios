import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Smartphone, ShieldCheck, Zap, Play } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface IosShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestSimulation: () => void;
}

export const IosShortcutsModal: React.FC<IosShortcutsModalProps> = ({
  isOpen,
  onClose,
  onTestSimulation,
}) => {
  const [copied, setCopied] = useState(false);
  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/sms/incoming` : '/api/sms/incoming';

  if (!isOpen) return null;

  const handleCopyWebhook = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl liquid-glass-card p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#E5C378]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-serif font-bold text-zinc-100 uppercase tracking-wider">
                Apple Shortcuts · Auto SMS Ingest
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Direct background sync on iPhone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg knurled-crown text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Direct Press-and-Play Quick Test */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.1] space-y-2.5 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#E5C378] font-bold text-xs font-mono uppercase">
              <Play className="w-3.5 h-3.5 fill-[#E5C378]" />
              <span>Direct Press & Play Sync</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-zinc-300 border border-white/[0.1]">
              INSTANT
            </span>
          </div>

          <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
            Tap below to trigger an instant bank transaction test payload directly into your live ledger.
          </p>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('success');
              onTestSimulation();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black font-serif font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition shadow-lg shadow-[#D4AF37]/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Test Live Bank Ingestion Now</span>
          </button>
        </div>

        {/* Webhook URL bar */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Your Incoming Auto-Sync Webhook:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 bg-black/60 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopyWebhook}
              className="px-3 py-2 rounded-xl knurled-crown text-xs font-serif text-zinc-200 flex items-center gap-1 transition active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#E5C378]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Native Shortcuts 1-Click Guide */}
        <div className="p-3 rounded-xl liquid-glass-pill space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-zinc-200 font-serif font-bold text-xs uppercase">
            <Smartphone className="w-3.5 h-3.5 text-[#E5C378]" />
            <span>2-Step iPhone Automation Setup</span>
          </div>

          <div className="space-y-1.5 text-[11px] text-zinc-300 font-sans">
            <div className="flex items-start gap-1.5">
              <span className="w-4 h-4 rounded-full bg-white/[0.08] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-mono">1</span>
              <span>Open iPhone <strong>Shortcuts</strong> app → <strong>Automation</strong> → <strong>+</strong> → <strong>Message</strong>. Choose "Run Immediately".</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="w-4 h-4 rounded-full bg-white/[0.08] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-mono">2</span>
              <span>Add Action: <strong>Get Contents of URL</strong> → Paste your webhook → Method <strong>POST</strong> → JSON body with key <code>message</code>: <strong>Shortcut Input</strong>.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
