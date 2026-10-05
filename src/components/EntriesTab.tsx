import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Plus, 
  Search, 
  Trash2, 
  ArrowDownRight, 
  ArrowUpRight, 
  MessageSquare, 
  AlertCircle,
  Check, 
  X, 
  Coffee, 
  ShoppingBag, 
  Car, 
  Heart, 
  FileText, 
  Briefcase, 
  Tag,
  ShieldAlert,
  Zap,
  Radio,
  Smartphone,
  ClipboardCheck
} from 'lucide-react';
import { Transaction, ExpenseCategory } from '../types';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface EntriesTabProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction: (id: string) => void;
  currency: string;
  soundEnabled: boolean;
  isAutoSyncActive?: boolean;
  onToggleAutoSync?: () => void;
  onTriggerSimulatedSms?: () => void;
  onScanClipboardNow?: () => void;
  isScanningClipboard?: boolean;
  onOpenShortcutsGuide?: () => void;
}

export const EntriesTab: React.FC<EntriesTabProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  currency,
  soundEnabled,
  isAutoSyncActive = true,
  onToggleAutoSync,
  onTriggerSimulatedSms,
  onScanClipboardNow,
  isScanningClipboard = false,
  onOpenShortcutsGuide,
}) => {
  // Input bar state
  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Confirmation modal for surgical deletion
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Voice recording modal state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const canvasWaveRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // SMS Scanner modal
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [rawSmsText, setRawSmsText] = useState('');
  const [isParsingSms, setIsParsingSms] = useState(false);

  // Manual Quick Add Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualType, setManualType] = useState<'debit' | 'credit'>('debit');
  const [manualCategory, setManualCategory] = useState<ExpenseCategory>('Food & Dining');

  // Quick categories
  const categories: { name: ExpenseCategory; icon: React.FC<{ className?: string }> }[] = [
    { name: 'Food & Dining', icon: Coffee },
    { name: 'Groceries', icon: ShoppingBag },
    { name: 'Transportation', icon: Car },
    { name: 'Shopping & Treasury', icon: Tag },
    { name: 'Health & Wellness', icon: Heart },
    { name: 'Bills & Utilities', icon: FileText },
    { name: 'Income & Salary', icon: Briefcase },
  ];

  // Natural language submit handler (calls Gemini API)
  const handleNaturalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isParsing) return;

    setIsParsing(true);
    setParseError(null);

    try {
      const res = await fetch('/api/gemini/parse-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();

      if (data.transaction) {
        onAddTransaction(data.transaction);
        if (soundEnabled) {
          if (data.transaction.type === 'credit') {
            soundFx.goldChime();
          } else {
            soundFx.debitChirp();
          }
        }
        triggerHaptic('success');
        setInputText('');
      } else {
        throw new Error('Could not parse entry');
      }
    } catch (err: any) {
      console.error(err);
      setParseError('Failed to parse financial entry. Try formatting like "Coffee 150 at Starbucks"');
      if (soundEnabled) soundFx.deleteDrop();
    } finally {
      setIsParsing(false);
    }
  };

  // SMS Parser submit handler
  const handleSmsSubmit = async () => {
    if (!rawSmsText.trim() || isParsingSms) return;
    setIsParsingSms(true);

    try {
      const res = await fetch('/api/gemini/parse-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawSms: rawSmsText }),
      });
      const data = await res.json();

      if (data.transaction) {
        onAddTransaction(data.transaction);
        if (soundEnabled) {
          if (data.transaction.type === 'credit') soundFx.goldChime();
          else soundFx.debitChirp();
        }
        triggerHaptic('success');
        setRawSmsText('');
        setIsSmsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingSms(false);
    }
  };

  // Voice speech synthesis / wave animation
  useEffect(() => {
    if (!isVoiceModalOpen) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const canvas = canvasWaveRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      ctx.beginPath();
      ctx.moveTo(0, midY);

      for (let x = 0; x < width; x++) {
        const amplitude = isListening ? 24 * Math.sin((x / width) * Math.PI) : 4;
        const y = midY + Math.sin(x * 0.04 + phase) * amplitude;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = isListening ? '#10B981' : '#D4AF37';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = isListening ? '#10B981' : '#D4AF37';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      phase += 0.08;
      animationFrameId.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isVoiceModalOpen, isListening]);

  // Voice Input trigger
  const handleStartVoice = () => {
    setIsVoiceModalOpen(true);
    setIsListening(true);
    setVoiceTranscript('');

    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setVoiceTranscript(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        console.warn('Speech recognition not available or denied:', err);
        simulateVoiceInput();
      }
    } else {
      simulateVoiceInput();
    }
  };

  const simulateVoiceInput = () => {
    // Simulated voice transcription if speech recognition is unavailable
    setTimeout(() => {
      setVoiceTranscript('Coffee 180 at Blue Bottle');
      setIsListening(false);
    }, 2200);
  };

  const handleApplyVoiceTranscript = () => {
    if (voiceTranscript.trim()) {
      setInputText(voiceTranscript);
      setIsVoiceModalOpen(false);
      // Auto-trigger parse
      setTimeout(() => {
        handleNaturalSubmit();
      }, 200);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === 'All' || tx.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* 1. Natural Language AI Input Bar */}
      <div className="rounded-2xl p-3.5 liquid-glass-card rgb-border-subtle shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-cinzel font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Natural Gemini Ledger</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Bank SMS Scanner Button */}
            <button
              onClick={() => {
                if (soundEnabled) soundFx.tap();
                triggerHaptic('light');
                setIsSmsModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg liquid-glass-pill hover:border-emerald-400/40 text-xs text-zinc-300 transition"
              title="Parse Bank SMS Alert"
            >
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span>SMS</span>
            </button>

            {/* Manual Form Button */}
            <button
              onClick={() => {
                if (soundEnabled) soundFx.tap();
                triggerHaptic('light');
                setIsManualModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg liquid-glass-pill hover:border-amber-400/40 text-xs text-amber-300 transition"
              title="Manual Form"
            >
              <Plus className="w-3 h-3 text-amber-400" />
              <span>Manual</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleNaturalSubmit} className="relative flex items-center">
          <input
            id="natural-input-bar"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., 'Chipotle lunch 18.50' or 'Salary 45000 credited'"
            className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-3 pr-20 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 transition backdrop-blur-md shadow-inner"
            disabled={isParsing}
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            {/* Mic button */}
            <button
              type="button"
              onClick={() => {
                if (soundEnabled) soundFx.tap();
                triggerHaptic('light');
                handleStartVoice();
              }}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 transition"
              title="Voice Input"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>

            {/* Submit / Parse button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isParsing}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition disabled:opacity-40 flex items-center gap-1"
            >
              {isParsing ? (
                <span className="animate-spin text-xs">↻</span>
              ) : (
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              )}
            </button>
          </div>
        </form>

        {parseError && (
          <div className="mt-2 text-[11px] text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[10px]">
          <span className="text-zinc-500 font-mono">Quick:</span>
          {[
            'Coffee 150',
            'Grocery 1200',
            'Uber ride 350',
            'Dinner 850',
            'Freelance +12000',
          ].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setInputText(sample);
                if (soundEnabled) soundFx.tap();
                triggerHaptic('light');
              }}
              className="whitespace-nowrap px-2 py-0.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-200 transition"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Automatic Bank Messages Auto-Reader Card */}
      <div className="rounded-2xl p-3.5 liquid-glass-card border border-white/[0.08] shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isAutoSyncActive
                  ? 'bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse'
                  : 'bg-zinc-600'
              }`}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-100">
                  {isAutoSyncActive ? 'Message Auto-Reader Active' : 'Message Auto-Reader Paused'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Goes through banking SMS automatically without manual copy-pasting
              </p>
            </div>
          </div>

          {onToggleAutoSync && (
            <button
              onClick={() => {
                triggerHaptic('light');
                onToggleAutoSync();
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition active:scale-95 ${
                isAutoSyncActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isAutoSyncActive ? 'Enabled' : 'Enable'}
            </button>
          )}
        </div>

        {/* 3 Quick Auto-Actions */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/[0.06]">
          {/* 1. Simulate SMS button */}
          <button
            type="button"
            onClick={onTriggerSimulatedSms}
            className="flex flex-col items-center justify-center p-2 rounded-xl liquid-glass-pill hover:border-amber-400/30 text-center group transition active:scale-95"
            title="Inject a real incoming bank alert to test automatic ingestion"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-medium text-zinc-200">Simulate SMS</span>
            <span className="text-[9px] text-zinc-500">Test auto-read</span>
          </button>

          {/* 2. Scan Clipboard */}
          <button
            type="button"
            onClick={onScanClipboardNow}
            disabled={isScanningClipboard}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-center group transition disabled:opacity-50"
            title="Auto-read copied bank SMS from clipboard"
          >
            {isScanningClipboard ? (
              <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-1" />
            ) : (
              <ClipboardCheck className="w-3.5 h-3.5 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-[11px] font-medium text-zinc-200">Scan Clipboard</span>
            <span className="text-[9px] text-zinc-500">1-tap auto-read</span>
          </button>

          {/* 3. iOS Shortcuts Setup */}
          <button
            type="button"
            onClick={onOpenShortcutsGuide}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-center group transition"
            title="Configure iPhone Shortcuts to automatically push SMS"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-medium text-zinc-200">iOS Setup</span>
            <span className="text-[9px] text-zinc-500">Shortcuts guide</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchant, tag..."
            className="w-full bg-[#040b06]/80 border border-zinc-800 rounded-xl py-2 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/40"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="bg-[#040b06]/80 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-500/40 font-mono"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Transaction Cards List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-cinzel font-bold text-zinc-400 px-1">
          <span>Obsidian Ledger</span>
          <span className="text-[11px] font-mono text-zinc-500">
            {filteredTransactions.length} entries
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-zinc-800 bg-[#030805]/50">
            <Tag className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">No transactions recorded for this filter.</p>
            <p className="text-[11px] text-zinc-600 mt-1">Type in the top bar to record an entry.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isCredit = tx.type === 'credit';
            const isConfirmingDelete = deleteConfirmId === tx.id;

            return (
              <div
                key={tx.id}
                className="group relative rounded-2xl p-3 liquid-glass hover:border-white/20 transition-all shadow-sm flex items-center justify-between gap-3 active:scale-[0.99]"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isCredit
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}
                  >
                    {isCredit ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-zinc-100 truncate">
                        {tx.title}
                      </h3>
                      <span className="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-amber-300/80 shrink-0">
                        {tx.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="truncate">{tx.merchant}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Surgical Delete */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right font-mono">
                    <div
                      className={`text-sm font-bold tracking-tight ${
                        isCredit ? 'text-emerald-400' : 'text-amber-200'
                      }`}
                    >
                      {isCredit ? '+' : '-'}
                      {currency}
                      {tx.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[9px] text-zinc-500">{tx.paymentMethod}</div>
                  </div>

                  {/* Surgical Delete Button (20dp footprint) */}
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-500/50 p-1 rounded-lg">
                      <button
                        onClick={() => {
                          onDeleteTransaction(tx.id);
                          setDeleteConfirmId(null);
                          if (soundEnabled) soundFx.deleteDrop();
                          triggerHaptic('heavy');
                        }}
                        className="p-1 rounded bg-rose-600 text-white hover:bg-rose-500 transition"
                        title="Confirm Delete"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (soundEnabled) soundFx.tap();
                        triggerHaptic('light');
                        setDeleteConfirmId(tx.id);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-90"
                      title="Delete Transaction"
                      aria-label="Delete Transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Voice Input Modal */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#040d06] border border-cyan-500/30 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                <span className="font-cinzel text-xs font-bold text-cyan-300 uppercase">
                  Voice Speech-To-Text
                </span>
              </div>
              <button
                onClick={() => setIsVoiceModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Audio Waveform Canvas */}
            <div className="h-20 w-full rounded-xl bg-black/60 border border-zinc-800 flex items-center justify-center overflow-hidden">
              <canvas
                ref={canvasWaveRef}
                width={320}
                height={80}
                className="w-full h-full"
              />
            </div>

            <div className="text-center">
              <p className="text-xs text-zinc-400 font-mono">
                {isListening ? 'Listening for financial phrase...' : 'Audio recorded.'}
              </p>
              <div className="mt-2 p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 min-h-[44px] text-xs text-amber-200 font-mono">
                {voiceTranscript || 'Say: "Starbucks coffee 220" or "Salary 80000"'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isListening) {
                    setIsListening(false);
                  } else {
                    handleStartVoice();
                  }
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono transition ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {isListening ? 'Stop Mic' : 'Retry Mic'}
              </button>

              <button
                onClick={handleApplyVoiceTranscript}
                disabled={!voiceTranscript.trim()}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold font-mono disabled:opacity-40"
              >
                Apply to Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Bank Alert Scanner Modal */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#030a05] border border-amber-500/30 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="font-cinzel text-xs font-bold text-amber-300 uppercase">
                  Bank SMS Alert Scanner
                </span>
              </div>
              <button
                onClick={() => setIsSmsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Sanitizer Active:</strong> Account numbers, card digits, and OTPs are automatically masked before processing.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-zinc-400">
                  Bank SMS / Alert:
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (navigator.clipboard?.readText) {
                        const text = await navigator.clipboard.readText();
                        if (text) {
                          setRawSmsText(text);
                          triggerHaptic('light');
                        }
                      }
                    } catch (e) {
                      // ignore
                    }
                  }}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <ClipboardCheck className="w-3 h-3" />
                  <span>Paste from Clipboard</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={rawSmsText}
                onChange={(e) => setRawSmsText(e.target.value)}
                placeholder="e.g. 'A/C *1234 debited by INR 350.00 at MCDONALDS on 16-MAR-26 via UPI. Bal INR 45,210. OTP 4920.'"
                className="w-full bg-black/70 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-400/80 font-mono"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setRawSmsText(
                    'Acct XX9812 debited with INR 750.00 on 16-Mar-26 at ZOMATO UPI Ref 4910291. Avl Bal 54,200.'
                  );
                }}
                className="text-[11px] text-zinc-400 hover:text-amber-300 font-mono underline"
              >
                Insert Sample SMS
              </button>

              <button
                onClick={handleSmsSubmit}
                disabled={!rawSmsText.trim() || isParsingSms}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold font-mono disabled:opacity-40 flex items-center gap-1.5"
              >
                {isParsingSms ? (
                  <>
                    <span className="animate-spin">↻</span>
                    <span>Sanitizing & Parsing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Parse into Ledger</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Quick Add Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#030a05] border border-amber-500/30 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-xs font-bold text-amber-300 uppercase">
                Add Transaction
              </span>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setManualType('debit')}
                className={`py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                  manualType === 'debit'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-zinc-500'
                }`}
              >
                - Debit (Expense)
              </button>
              <button
                type="button"
                onClick={() => setManualType('credit')}
                className={`py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                  manualType === 'credit'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-zinc-500'
                }`}
              >
                + Credit (Income)
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. Starbucks, Salary, Metro"
                className="w-full bg-black/70 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/70 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Category</label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-black/70 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                const amt = parseFloat(manualAmount);
                if (!manualTitle.trim() || isNaN(amt) || amt <= 0) return;
                onAddTransaction({
                  title: manualTitle.trim(),
                  amount: amt,
                  type: manualType,
                  category: manualCategory,
                  merchant: manualTitle.trim(),
                  paymentMethod: 'Apple Pay',
                  date: new Date().toISOString().split('T')[0],
                });
                if (soundEnabled) {
                  if (manualType === 'credit') soundFx.goldChime();
                  else soundFx.debitChirp();
                }
                triggerHaptic('success');
                setIsManualModalOpen(false);
                setManualTitle('');
                setManualAmount('');
              }}
              disabled={!manualTitle.trim() || !manualAmount}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs font-mono disabled:opacity-40 transition"
            >
              Save to Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
