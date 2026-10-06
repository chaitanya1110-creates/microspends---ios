import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Smartphone, Download, ExternalLink, Play, Zap, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { soundFx } from '../utils/audio';

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
  const [installedToast, setInstalledToast] = useState(false);

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/sms/incoming` : '/api/sms/incoming';
  const downloadShortcutUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/shortcut/download` : '/api/shortcut/download';
  const icloudShortcutUrl = 'https://www.icloud.com/shortcuts/88035bd089a842f1a66ff5bc4ba2b4ef';

  if (!isOpen) return null;

  const handleCopyWebhook = () => {
    triggerHaptic('light');
    soundFx.tap();
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOneTapInstall = () => {
    triggerHaptic('success');
    soundFx.goldChime();
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setInstalledToast(true);

    // Open iCloud Shortcut directly which opens iOS Shortcuts App
    window.open(icloudShortcutUrl, '_blank');

    setTimeout(() => {
      setInstalledToast(false);
    }, 4000);
  };

  const handleDownloadFile = () => {
    triggerHaptic('light');
    soundFx.tap();
    window.location.href = downloadShortcutUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl liquid-glass-card p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-[#E5C378] shadow-[0_0_12px_rgba(212,175,55,0.2)]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-sans font-bold text-zinc-100 uppercase tracking-wider">
                1-Tap Apple Shortcut Setup
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                Auto-read incoming bank alerts on iPhone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg knurled-crown text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRIMARY 1-TAP ACTION CARD */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-[#181D1A] to-[#0A0E0C] border border-[#D4AF37]/35 shadow-lg space-y-3 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#E5C378] font-bold text-xs font-sans uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Tap Automated Install</span>
            </div>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#F5D478] border border-[#D4AF37]/30">
              ONE-TAP
            </span>
          </div>

          <p className="text-xs text-zinc-200 leading-relaxed font-sans">
            Tap below to open the Apple Shortcuts app. It automatically creates the <strong>"Ingest Bank SMS"</strong> action on your iPhone and copies your webhook.
          </p>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleOneTapInstall}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black font-sans font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition shadow-lg shadow-[#D4AF37]/25 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>⚡ Open &amp; Add in Apple Shortcuts App</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </button>

            <button
              type="button"
              onClick={handleDownloadFile}
              className="w-full py-2 px-3 rounded-xl knurled-crown text-zinc-200 font-sans text-xs flex items-center justify-center gap-1.5 hover:text-white active:scale-95 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Or Download Native .shortcut File</span>
            </button>
          </div>

          {installedToast && (
            <div className="p-2 rounded-lg bg-black/60 border border-[#D4AF37]/40 text-[#F5D478] text-[11px] font-mono flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Webhook copied! Paste when prompted in Shortcuts app.</span>
            </div>
          )}
        </div>

        {/* Webhook URL bar with 1-click copy */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Your Live Ingestion Webhook:
            </label>
            <span className="text-[9px] font-mono text-zinc-500">Auto-Generated</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 bg-black/60 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopyWebhook}
              className="px-3.5 py-2 rounded-xl knurled-crown text-xs font-sans text-zinc-200 flex items-center gap-1 transition active:scale-95 cursor-pointer"
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

        {/* 2-Step Background Automation Rule */}
        <div className="p-3.5 rounded-xl liquid-glass-pill space-y-2 text-left">
          <div className="flex items-center gap-1.5 text-zinc-200 font-sans font-bold text-xs uppercase">
            <Smartphone className="w-3.5 h-3.5 text-[#E5C378]" />
            <span>Enable 100% Background Execution</span>
          </div>

          <div className="space-y-2 text-[11px] text-zinc-300 font-sans">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-white/[0.08] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-mono">1</span>
              <span>In Shortcuts app, go to <strong>Automation</strong> tab → tap <strong>+</strong> → select <strong>Message</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-white/[0.08] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-mono">2</span>
              <span>Choose <strong>"Run Immediately"</strong> so iOS automatically parses banking SMS in the background with zero taps required.</span>
            </div>
          </div>
        </div>

        {/* Live Test Ingestion */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-[11px] text-zinc-400 font-sans">
            Verify live sync now:
          </span>
          <button
            onClick={() => {
              triggerHaptic('success');
              soundFx.goldChime();
              onTestSimulation();
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-[#D4AF37]/30 text-[#F5D478] text-xs font-sans font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-[#F5D478]" />
            <span>⚡ Test Live SMS Push</span>
          </button>
        </div>
      </div>
    </div>
  );
};
