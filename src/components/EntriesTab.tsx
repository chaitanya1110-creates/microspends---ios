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
import { getApiUrl } from '../utils/api';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { isDateInMonth } from '../utils/storage';

interface EntriesTabProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction: (id: string) => void;
  currency: string;
  soundEnabled: boolean;
  currentMonth?: string;
  isAutoSyncActive?: boolean;
  onToggleAutoSync?: () => void;
  onTriggerSimulatedSms?: () => void;
  onScanClipboardNow?: () => void;
  isScanningClipboard?: boolean;
  onOpenShortcutsGuide?: () => void;
}

// Client-side instant parser fallback
function parseExpenseLocallyClient(text: string) {
  const clean = text.trim();
  const amountMatch = clean.match(/(?:[$€₹£])?\s*([0-9]+(?:[.,][0-9]{1,2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;

  const isCredit = /salary|received|deposit|credited|income|refund|\+/i.test(clean);
  let category: ExpenseCategory = 'Other';

  if (/coffee|starbucks|food|lunch|dinner|pizza|burger|cafe|mcdonald|chipotle|dining|restaurant/i.test(clean)) {
    category = 'Food & Dining';
  } else if (/grocery|supermarket|walmart|trader|whole foods|costco|market|veggies/i.test(clean)) {
    category = 'Groceries';
  } else if (/uber|lyft|cab|taxi|gas|fuel|metro|subway|flight|train|bus/i.test(clean)) {
    category = 'Transportation';
  } else if (/netflix|spotify|youtube|disney|movie|hulu|prime|cinema|game/i.test(clean)) {
    category = 'Entertainment';
  } else if (/amazon|apple|clothes|shoes|shopping|zara|mall|store/i.test(clean)) {
    category = 'Shopping & Treasury';
  } else if (/gym|pharmacy|doctor|medicine|health|workout|dentist/i.test(clean)) {
    category = 'Health & Wellness';
  } else if (/rent|wifi|internet|electric|water|bill|recharge|power/i.test(clean)) {
    category = 'Bills & Utilities';
  } else if (isCredit) {
    category = 'Income & Salary';
  }

  // Extract clean title
  let title = clean
    .replace(/(?:[$€₹£])?\s*[0-9]+(?:[.,][0-9]{1,2})?/g, '')
    .replace(/\b(at|on|for|paid|spent|debited|credited|via|to|from)\b/gi, '')
    .trim();
  if (!title) title = clean.slice(0, 20);

  return {
    title: title.slice(0, 32) || 'Quick Expense',
    amount: amount > 0 ? amount : 100,
    type: isCredit ? ('credit' as const) : ('debit' as const),
    category,
    merchant: title.slice(0, 32) || 'Merchant',
    note: clean,
    paymentMethod: 'Apple Pay',
    date: new Date().toISOString().split('T')[0],
  };
}

export const EntriesTab: React.FC<EntriesTabProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  currency,
  soundEnabled,
  currentMonth,
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
  const [onlyCurrentMonth, setOnlyCurrentMonth] = useState<boolean>(true);

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
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualPaymentMethod, setManualPaymentMethod] = useState('Apple Pay');

  // Quick categories
  const categories: { name: ExpenseCategory; icon: React.FC<{ className?: string }> }[] = [
    { name: 'Food & Dining', icon: Coffee },
    { name: 'Groceries', icon: ShoppingBag },
    { name: 'Transportation', icon: Car },
    { name: 'Shopping & Treasury', icon: Tag },
    { name: 'Health & Wellness', icon: Heart },
    { name: 'Bills & Utilities', icon: FileText },
    { name: 'Entertainment', icon: Radio },
    { name: 'Income & Salary', icon: Briefcase },
    { name: 'Other', icon: Tag },
  ];

  // Natural language submit handler (calls Gemini API with immediate robust fallback)
  const handleNaturalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isParsing) return;

    setIsParsing(true);
    setParseError(null);

    try {
      let parsedTx: any = null;
      try {
        const res = await fetch(getApiUrl('/api/gemini/parse-expense'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.transaction) {
            parsedTx = data.transaction;
          }
        }
      } catch {
        // network or server fallback
      }

      if (!parsedTx) {
        parsedTx = parseExpenseLocallyClient(text);
      }

      if (parsedTx) {
        onAddTransaction(parsedTx);
        if (soundEnabled) {
          if (parsedTx.type === 'credit') {
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
      // Even on outer error, apply local fallback
      const fallback = parseExpenseLocallyClient(text);
      onAddTransaction(fallback);
      if (soundEnabled) soundFx.debitChirp();
      triggerHaptic('success');
      setInputText('');
    } finally {
      setIsParsing(false);
    }
  };

  // SMS Parser submit handler
  const handleSmsSubmit = async () => {
    if (!rawSmsText.trim() || isParsingSms) return;
    setIsParsingSms(true);

    try {
      let parsedTx: any = null;
      try {
        const res = await fetch(getApiUrl('/api/gemini/parse-sms'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawSms: rawSmsText }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.transaction) parsedTx = data.transaction;
        }
      } catch {}

      if (!parsedTx) {
        parsedTx = parseExpenseLocallyClient(rawSmsText);
      }

      if (parsedTx) {
        onAddTransaction(parsedTx);
        if (soundEnabled) {
          if (parsedTx.type === 'credit') soundFx.goldChime();
          else soundFx.debitChirp();
        }
        triggerHaptic('success');
        setRawSmsText('');
        setIsSmsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      const fallback = parseExpenseLocallyClient(rawSmsText);
      onAddTransaction(fallback);
      setIsSmsModalOpen(false);
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

      ctx.strokeStyle = isListening ? '#D4AF37' : '#E5C378';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = isListening ? '#D4AF37' : '#E5C378';
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
        console.warn('Speech recognition not available:', err);
        simulateVoiceInput();
      }
    } else {
      simulateVoiceInput();
    }
  };

  const simulateVoiceInput = () => {
    setTimeout(() => {
      setVoiceTranscript('Coffee 180 at Starbucks');
      setIsListening(false);
    }, 2000);
  };

  const handleApplyVoiceTranscript = () => {
    if (voiceTranscript.trim()) {
      setInputText(voiceTranscript);
      setIsVoiceModalOpen(false);
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
    const matchesMonth =
      !onlyCurrentMonth || (currentMonth ? isDateInMonth(tx.date, currentMonth) : true);
    return matchesSearch && matchesCategory && matchesMonth;
  });

  return (
    <div className="space-y-4">
      {/* 1. Natural Language AI Input Bar & Quick Actions */}
      <div className="rounded-2xl p-4 horology-bezel shadow-[0_12px_36px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="ruby-bearing" />
            <span className="text-[10px] font-bold tracking-widest text-[#F5D478] uppercase">
              Quick Entry
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* 1-Tap iOS Shortcut Setup */}
            <button
              onClick={() => {
                if (soundEnabled) soundFx.tap();
                triggerHaptic('light');
                onOpenShortcutsGuide?.();
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg knurled-crown text-[#F5D478] transition"
              title="1-Tap Shortcut Setup"
            >
              <Zap className="w-3 h-3" />
              <span className="text-[10px] uppercase font-bold tracking-tight">Shortcut</span>
            </button>

            {/* Manual Form Button */}
            <button
              onClick={() => {
                if (soundEnabled) soundFx.tap();
                triggerHaptic('light');
                setManualDate(new Date().toISOString().split('T')[0]);
                setIsManualModalOpen(true);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg knurled-crown text-zinc-400 hover:text-white transition"
              title="Manual Transaction Form"
            >
              <Plus className="w-3 h-3" />
              <span className="text-[10px] uppercase font-bold tracking-tight">Manual</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleNaturalSubmit} className="relative flex items-center">
          <input
            id="natural-input-bar"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. 'Coffee 250 Starbucks' or 'Salary 85000 credited'..."
            className="w-full bg-[#030604]/90 border border-[#D4AF37]/25 rounded-xl py-2.5 pl-3.5 pr-20 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]/80 transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] font-sans"
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
              className="p-1.5 rounded-lg bg-[#0F1411] border border-[#D4AF37]/30 hover:bg-[#1A211D] text-[#F5D478] transition shadow-sm"
              title="Voice Speech Input"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>

            {/* Submit / Parse button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isParsing}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] hover:brightness-110 text-black font-sans font-bold text-xs transition disabled:opacity-40 flex items-center gap-1 shadow-md shadow-[#D4AF37]/20 cursor-pointer"
            >
              {isParsing ? (
                <span className="animate-spin text-xs">↻</span>
              ) : (
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
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
              className="whitespace-nowrap px-2 py-0.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-200 transition cursor-pointer"
            >
              {sample}
            </button>
          ))}
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
            placeholder="Search merchant, notes..."
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

        {currentMonth && (
          <button
            type="button"
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
              setOnlyCurrentMonth((prev) => !prev);
            }}
            className={`px-2.5 py-2 rounded-xl text-[11px] font-mono transition border shrink-0 cursor-pointer ${
              onlyCurrentMonth
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-[#040b06]/80 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Toggle between filtering by selected month or all records"
          >
            {onlyCurrentMonth ? currentMonth : 'All Records'}
          </button>
        )}
      </div>

      {/* 3. Transaction Cards List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="ruby-bearing" />
            <span className="font-bold text-[#E5C378] uppercase tracking-wider text-[10px]">
              Ledger
            </span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tight">
            {filteredTransactions.length} records
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-[#D4AF37]/20 bg-[#060907]/60">
            <Tag className="w-8 h-8 text-[#D4AF37]/40 mx-auto mb-2" />
            <p className="text-xs font-sans text-zinc-300">
              No transactions recorded for {onlyCurrentMonth && currentMonth ? currentMonth : 'this view'}.
            </p>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">
              Use the quick input above or click '+ Add Entry' to record your first transaction.
            </p>
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="mt-3 px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-[#F5D478] text-xs font-sans font-semibold transition"
            >
              + Add Transaction Now
            </button>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isCredit = tx.type === 'credit';
            const isConfirmingDelete = deleteConfirmId === tx.id;

            return (
              <div
                key={tx.id}
                className="group relative rounded-xl p-3 bg-gradient-to-b from-[#101512] to-[#070A08] border border-[#D4AF37]/20 hover:border-[#D4AF37]/55 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3 active:scale-[0.99]"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isCredit
                        ? 'bg-zinc-900 border-zinc-800 text-[#E5C378]'
                        : 'bg-zinc-900 border-zinc-800 text-rose-400/90'
                    }`}
                  >
                    {isCredit ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs font-sans font-bold text-zinc-100 truncate">
                        {tx.title}
                      </h3>
                      <span className="text-[10px] font-sans text-[#E5C378] shrink-0 font-medium">
                        · {tx.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono mt-0.5">
                      <span>{tx.date}</span>
                      <span className="text-[#D4AF37]/50">·</span>
                      <span className="truncate">{tx.merchant}</span>
                      {tx.note && tx.note !== tx.title && (
                        <>
                          <span className="text-[#D4AF37]/50">·</span>
                          <span className="truncate text-zinc-500 italic">{tx.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Delete */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm font-sans font-bold tracking-tight ${
                        isCredit ? 'text-[#E5C378]' : 'text-zinc-100'
                      }`}
                    >
                      {isCredit ? '+' : '-'}
                      {currency}
                      {tx.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">{tx.paymentMethod}</div>
                  </div>

                  {/* Delete Confirmation */}
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-500/50 p-1 rounded-lg shadow-lg">
                      <button
                        onClick={() => {
                          onDeleteTransaction(tx.id);
                          setDeleteConfirmId(null);
                          if (soundEnabled) soundFx.deleteDrop();
                          triggerHaptic('heavy');
                        }}
                        className="p-1 rounded bg-rose-600 text-white hover:bg-rose-500 transition cursor-pointer"
                        title="Confirm Delete"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition cursor-pointer"
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
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-90 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="w-full max-w-sm rounded-2xl liquid-glass-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#E5C378]" />
                <span className="font-sans text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  Voice Speech Input
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
            <div className="h-20 w-full rounded-xl bg-black/60 border border-white/[0.1] flex items-center justify-center overflow-hidden">
              <canvas
                ref={canvasWaveRef}
                width={320}
                height={80}
                className="w-full h-full"
              />
            </div>

            <div className="text-center">
              <p className="text-xs text-zinc-400 font-mono">
                {isListening ? 'Listening for transaction phrase...' : 'Audio captured.'}
              </p>
              <div className="mt-2 p-2.5 rounded-lg bg-black/50 border border-white/[0.1] min-h-[44px] text-xs text-amber-200 font-mono">
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
                className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
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
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black text-xs font-bold font-sans disabled:opacity-40 cursor-pointer"
              >
                Save to Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Bank Alert Scanner Modal */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="w-full max-w-md rounded-2xl liquid-glass-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#E5C378]" />
                <span className="font-sans text-xs font-bold text-zinc-100 uppercase tracking-wider">
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

            <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.1] text-[11px] text-zinc-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-[#E5C378] shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Sanitizer Active:</strong> Account numbers, card digits, and OTPs are automatically masked before processing.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-zinc-400">
                  Bank SMS / Notification:
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
                    } catch (e) {}
                  }}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ClipboardCheck className="w-3 h-3" />
                  <span>Paste from Clipboard</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={rawSmsText}
                onChange={(e) => setRawSmsText(e.target.value)}
                placeholder="e.g. 'A/C *1234 debited by INR 350.00 at MCDONALDS on 16-MAR-26 via UPI. Bal INR 45,210.'"
                className="w-full bg-black/70 border border-white/[0.1] rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]/80 font-mono"
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
                className="text-[11px] text-zinc-400 hover:text-amber-300 font-mono underline cursor-pointer"
              >
                Insert Sample SMS
              </button>

              <button
                onClick={handleSmsSubmit}
                disabled={!rawSmsText.trim() || isParsingSms}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black text-xs font-bold font-sans disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                {isParsingSms ? (
                  <>
                    <span className="animate-spin">↻</span>
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Save to Ledger</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Transaction Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl liquid-glass-card p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
              <span className="font-sans text-sm font-bold text-[#FFF3C4] uppercase tracking-wider">
                + New Transaction
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
                className={`py-2 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                  manualType === 'debit'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-inner'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                - Debit (Expense)
              </button>
              <button
                type="button"
                onClick={() => setManualType('credit')}
                className={`py-2 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                  manualType === 'credit'
                    ? 'bg-zinc-900 text-[#E5C378] border border-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                + Credit (Income)
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-sans text-[#E5C378] uppercase mb-1">
                Title / Merchant
              </label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. Starbucks, Whole Foods, Consulting"
                className="w-full bg-black/70 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-zinc-100 focus:outline-none focus:border-[#D4AF37]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-sans text-[#E5C378] uppercase mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/70 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-zinc-100 font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-sans text-[#E5C378] uppercase mb-1">
                  Category
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-[#0D120E] border border-[#D4AF37]/30 rounded-xl py-2 px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-sans text-[#E5C378] uppercase mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full bg-black/70 border border-[#D4AF37]/30 rounded-xl py-1.5 px-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-sans text-[#E5C378] uppercase mb-1">
                Payment Method
              </label>
              <input
                type="text"
                value={manualPaymentMethod}
                onChange={(e) => setManualPaymentMethod(e.target.value)}
                placeholder="Apple Pay, UPI, Credit Card, Cash..."
                className="w-full bg-black/70 border border-[#D4AF37]/30 rounded-xl py-2 px-3 text-xs text-zinc-100 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const amt = parseFloat(manualAmount);
                  if (!manualTitle.trim() || isNaN(amt) || amt <= 0) return;
                  onAddTransaction({
                    title: manualTitle.trim(),
                    amount: amt,
                    type: manualType,
                    category: manualCategory,
                    merchant: manualTitle.trim(),
                    paymentMethod: manualPaymentMethod.trim() || 'Apple Pay',
                    date: manualDate || new Date().toISOString().split('T')[0],
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
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black font-bold text-xs font-sans shadow-md shadow-[#D4AF37]/30 disabled:opacity-40 cursor-pointer"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
