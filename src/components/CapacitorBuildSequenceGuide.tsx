import React, { useState } from 'react';
import { 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Play, 
  FolderTree, 
  ArrowRight, 
  Cpu, 
  FileCode2, 
  ExternalLink 
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface CapacitorBuildSequenceGuideProps {
  soundEnabled: boolean;
}

export const CapacitorBuildSequenceGuide: React.FC<CapacitorBuildSequenceGuideProps> = ({
  soundEnabled,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (soundEnabled) soundFx.tap();
    triggerHaptic('light');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const steps = [
    {
      id: 1,
      name: 'Build Web Bundle',
      cmd: 'npm run build',
      desc: 'Compiles React, Tailwind CSS, and Vite assets into the production static directory (dist/).',
      whyCrucial: 'If skipped, the dist/ folder will be missing or empty. Capacitor will fail to copy web assets, causing blank screens or build errors.',
      outputExpectation: 'Creates dist/index.html and dist/assets/ (approx. 620 KB uncompressed).',
      fileCheck: 'Verify: ls -lh dist/index.html'
    },
    {
      id: 2,
      name: 'Scaffold iOS Project',
      cmd: 'npx cap add ios',
      desc: 'Creates the native Swift Xcode workspace and directories inside ios/App/.',
      whyCrucial: 'This is the ROOT CAUSE of the "App.app not found" error! If this step is omitted, ios/App.xcworkspace does not exist, so xcodebuild has nothing to compile.',
      outputExpectation: 'Creates ios/App/App.xcworkspace, ios/App/App.xcodeproj, and Podfile.',
      fileCheck: 'Verify: ls -la ios/App'
    },
    {
      id: 3,
      name: 'Sync Assets to Native',
      cmd: 'npx cap sync ios',
      desc: 'Copies your production web bundle (dist/) into ios/App/App/public and links all native Capacitor plugins.',
      whyCrucial: 'Pushes the latest UI updates and JavaScript code into the native iOS bundle so Xcode packages the real app.',
      outputExpectation: 'Copies web assets and runs CocoaPods/SPM dependency verification.',
      fileCheck: 'Verify: ls -lh ios/App/App/public'
    },
    {
      id: 4,
      name: 'Open & Compile in Xcode',
      cmd: 'npx cap open ios',
      desc: 'Opens the complete native workspace in Apple Xcode on macOS.',
      whyCrucial: 'This is where App.app is physically generated! In Xcode, select "Any iOS Device (arm64)" and choose Product → Archive to compile App.app.',
      outputExpectation: 'Xcode opens App.xcworkspace ready for local simulator testing or Archive distribution.',
      fileCheck: 'Compiled binary path: ~/Library/Developer/Xcode/DerivedData/.../App.app'
    }
  ];

  const fullSequenceCmd = 'npm run build && npx cap add ios && npx cap sync ios && npx cap open ios';
  const xcodebuildCliCmd = `# Local headless compilation (creates App.app in build/):
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -sdk iphoneos -configuration Release -destination 'generic/platform=iOS' -archivePath build/App.xcarchive CODE_SIGNING_ALLOWED=NO archive

# Package App.app into .ipa:
mkdir -p Payload
cp -R build/App.xcarchive/Products/Applications/App.app Payload/
zip -r -q MicroSpends.ipa Payload`;

  return (
    <div className="space-y-4 text-xs">
      {/* Root Cause Alert Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 via-amber-950/30 to-black border border-amber-500/30 space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Why &quot;Error: App.app was not found&quot; Happens</span>
        </div>
        <p className="text-[11px] text-zinc-300 leading-relaxed">
          <strong className="text-zinc-100">App.app</strong> does not exist in the source code repository. It is a compiled Mach-O binary created by Apple Xcode. If an automated script or command attempts to package or search for <code className="text-amber-300 bg-black/60 px-1 py-0.5 rounded">App.app</code> before running the 4-step sequence below, the file does not exist yet.
        </p>
      </div>

      {/* One-Click Full Command Runner */}
      <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-zinc-300 font-semibold font-mono text-[11px]">
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Complete Local Build Sequence (Run in Terminal)</span>
          </div>
          <button
            onClick={() => copyToClipboard(fullSequenceCmd, 'full_seq')}
            className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono transition"
          >
            {copiedKey === 'full_seq' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey === 'full_seq' ? 'Copied Sequence!' : 'Copy 1-Liner'}</span>
          </button>
        </div>
        <pre className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap select-all">
          {fullSequenceCmd}
        </pre>
      </div>

      {/* Step Tabs Navigation */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800 text-[11px] font-mono">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveStep(s.id);
              if (soundEnabled) soundFx.tap();
            }}
            className={`py-1.5 px-1 rounded-lg text-center transition flex flex-col items-center gap-0.5 ${
              activeStep === s.id
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-[9px] opacity-75">STEP {s.id}</span>
            <span className="truncate w-full text-[10px]">{s.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Detailed Active Step View */}
      {(() => {
        const current = steps.find((s) => s.id === activeStep)!;
        return (
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono flex items-center justify-center font-bold">
                  {current.id}
                </span>
                <h4 className="font-bold text-zinc-100 text-xs">{current.name}</h4>
              </div>

              <button
                onClick={() => copyToClipboard(current.cmd, `step_${current.id}`)}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
              >
                {copiedKey === `step_${current.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === `step_${current.id}` ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Terminal Command Box */}
            <div className="p-2.5 rounded-lg bg-black border border-zinc-800 text-amber-300 font-mono text-[11px] flex items-center justify-between">
              <code>$ {current.cmd}</code>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed">
              {current.desc}
            </p>

            {/* Why Crucial */}
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-300">
                <CheckCircle2 className="w-3 h-3" />
                <span>Why this resolves &apos;App.app not found&apos;:</span>
              </div>
              <p>{current.whyCrucial}</p>
            </div>

            {/* Output & Verification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded bg-black/40 border border-zinc-800 text-zinc-400">
                <span className="text-zinc-500 block">EXPECTED RESULT:</span>
                <span className="text-zinc-300">{current.outputExpectation}</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-zinc-800 text-zinc-400">
                <span className="text-zinc-500 block">HOW TO VERIFY:</span>
                <code className="text-emerald-400">{current.fileCheck}</code>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Local CLI xcodebuild Snippet for Mac Users */}
      <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-zinc-300 font-semibold font-mono text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Automated Headless xcodebuild (No Xcode UI needed)</span>
          </div>
          <button
            onClick={() => copyToClipboard(xcodebuildCliCmd, 'xcode_cli')}
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono transition"
          >
            {copiedKey === 'xcode_cli' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey === 'xcode_cli' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-cyan-300 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
          {xcodebuildCliCmd}
        </pre>
      </div>
    </div>
  );
};
