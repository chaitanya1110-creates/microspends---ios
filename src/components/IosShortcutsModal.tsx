import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Smartphone, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#030a05] border border-zinc-800 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Automatic iOS SMS Reading
              </h3>
              <p className="text-[11px] text-zinc-400">
                Auto-read incoming bank alerts with 0 manual pasting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* How it works banner */}
        <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Native Apple Shortcuts Automation</span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            iOS restricts web apps from reading private SMS directly for security. By setting a 1-time Apple Shortcut automation, iOS pushes every banking SMS directly to micro-spends ~ icarus edition in real time.
          </p>
        </div>

        {/* Webhook URL bar */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-400">
            Your Incoming Auto-Sync Webhook:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 bg-black/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopyWebhook}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
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

        {/* 3 Steps */}
        <div className="space-y-2.5 pt-1">
          <h4 className="text-xs font-semibold text-zinc-300">
            3-Step iOS Setup (Takes 60 Seconds):
          </h4>

          <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/80 space-y-1 text-[11px]">
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">1</span>
              <span>Open iPhone Shortcuts & Create Automation</span>
            </div>
            <p className="text-zinc-400 pl-5">
              Open the built-in <strong>Shortcuts</strong> app on iOS → Tap <strong>Automation</strong> tab → Tap <strong>+</strong> (New Automation).
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/80 space-y-1 text-[11px]">
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">2</span>
              <span>Choose "Message" Trigger</span>
            </div>
            <p className="text-zinc-400 pl-5">
              Select <strong>Message</strong>. In "Message Contains", enter keywords like <code className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-300">debited, credited, spent, paid, INR, Rs</code>. Choose <strong>"Run Immediately"</strong> so it runs silently in the background!
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/80 space-y-1 text-[11px]">
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-300">3</span>
              <span>Add "Get Contents of URL"</span>
            </div>
            <p className="text-zinc-400 pl-5">
              Action: <strong>Get Contents of URL</strong>.
              <br />• URL: Paste the copied Webhook URL above
              <br />• Method: <strong>POST</strong>
              <br />• Request Body: JSON → key <code className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-300">message</code>: value <strong>Shortcut Input</strong>
            </p>
          </div>
        </div>

        {/* Test simulation button */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
          <p className="text-[11px] text-zinc-400">
            Want to test automatic ingestion now?
          </p>
          <button
            onClick={() => {
              onTestSimulation();
              onClose();
            }}
            className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Bank SMS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
