import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Terminal, 
  Smartphone, 
  Cloud, 
  ShieldCheck, 
  Copy, 
  Check, 
  HelpCircle, 
  FileCode, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Bug, 
  Sparkles, 
  Cpu, 
  HardDrive,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface IpaCompilationModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
}

export const IpaCompilationModal: React.FC<IpaCompilationModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
}) => {
  const [activeGuideTab, setActiveGuideTab] = useState<'sequence' | 'size_guide' | 'github_ci' | 'sideload'>('sequence');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDiagnosticExpanded, setIsDiagnosticExpanded] = useState<boolean>(true);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (soundEnabled) soundFx.tap();
    triggerHaptic('light');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const capacitorConfig = `{
  "appId": "com.microspends.app",
  "appName": "MicroSpends",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "ios": {
    "contentInset": "always",
    "backgroundColor": "#020403",
    "preferredContentMode": "mobile"
  }
}`;

  const allInOneCommand = `# Complete 1-Line Self-Healing Capacitor Build Pipeline:
npm run build && npx cap sync ios && cd ios/App && pod install && xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -sdk iphoneos -derivedDataPath build CODE_SIGNING_ALLOWED=NO CODE_SIGN_IDENTITY="" clean build`;

  const devIpaScript = `# Build a Full 20MB–30MB Development IPA with dSYM Debug Symbols & Frameworks:
# 1. Clean & Build Web Assets
npm run build

# 2. Sync into iOS
npx cap sync ios

# 3. Archive with Full Symbols & Embedded Frameworks
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -sdk iphoneos -archivePath build/App.xcarchive CODE_SIGNING_ALLOWED=NO archive

# 4. Package App.app + dSYMs into 20MB-30MB Package
mkdir -p ipa_out/Payload
cp -R build/App.xcarchive/Products/Applications/App.app ipa_out/Payload/
cp -R build/App.xcarchive/dSYMs ipa_out/ || true
cd ipa_out
zip -r -q ../MicroSpends-Full-Debug.ipa Payload dSYMs
cd ..
ls -lh MicroSpends-Full-Debug.ipa`;

  const githubActionsWorkflow = `name: Build iOS IPA (Free)

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    name: Compile Full Native iOS IPA
    runs-on: macos-14
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install Dependencies
        run: |
          rm -f package-lock.json
          npm install --legacy-peer-deps
          npm install --legacy-peer-deps @tailwindcss/oxide-darwin-arm64 @rolldown/binding-darwin-arm64 || true
          npm install --legacy-peer-deps @capacitor/core@latest @capacitor/cli@latest @capacitor/ios@latest

      - name: 1. Build Web App (Vite Dist)
        run: npx vite build

      - name: 2. Initialize & Sync Capacitor iOS
        run: |
          if [ ! -d "ios/App" ]; then
            rm -rf ios
            npx cap add ios
          fi
          npx cap sync ios
          if [ ! -d "ios/App/App.xcworkspace" ] && [ -f "ios/App/Podfile" ]; then
            cd ios/App && pod install || true && cd ../..
          fi

      - name: 3. Build & Archive Native iOS App
        run: |
          BUILD_TARGET="-workspace ios/App/App.xcworkspace"
          xcodebuild $BUILD_TARGET -scheme App -sdk iphoneos -configuration Release -destination 'generic/platform=iOS' -archivePath build/App.xcarchive CODE_SIGNING_ALLOWED=NO CODE_SIGN_IDENTITY="" clean archive

      - name: 4. Package into Native .IPA (with Symbols & Frameworks)
        run: |
          mkdir -p ipa_build/Payload
          cp -R build/App.xcarchive/Products/Applications/App.app ipa_build/Payload/
          cp -R build/App.xcarchive/dSYMs ipa_build/ || true
          cd ipa_build
          zip -r -q ../MicroSpends-Full.ipa Payload dSYMs
          cd ..
          ls -lh MicroSpends-Full.ipa

      - name: Upload .ipa Artifact
        uses: actions/upload-artifact@v4
        with:
          name: MicroSpends-Full-IPA
          path: MicroSpends-Full.ipa
          retention-days: 14`;

  const downloadSetupFiles = () => {
    const blob = new Blob([capacitorConfig], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'capacitor.config.json';
    a.click();
    URL.revokeObjectURL(url);
    if (soundEnabled) soundFx.goldChime();
    triggerHaptic('success');
  };

  const stepsData = [
    {
      step: 1,
      name: 'npm run build',
      tag: 'CRITICAL FIRST STEP',
      tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
      command: 'npm run build',
      desc: 'Builds the production Vite web bundle into the dist/ directory. If this step is skipped, the Capacitor webDir is empty, causing "App.app not found" errors because Xcode has no web assets to bundle.',
      outputExpect: 'dist/index.html and dist/assets/ generated (~627 KB minified).',
      why: 'Capacitor strictly reads from your "webDir": "dist". You must always compile the web bundle before adding or syncing iOS.'
    },
    {
      step: 2,
      name: 'npx cap add ios',
      tag: 'ONE-TIME INITIALIZATION',
      tagColor: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
      command: 'npx cap add ios',
      desc: 'Creates the native Xcode project in the ios/ folder, sets up Swift AppDelegate, CocoaPods Podfile, and configures the native WKWebView bridge.',
      outputExpect: 'ios/App/App.xcworkspace and ios/App/Podfile created.',
      why: 'This provisions the native iOS scaffold. If already run once, you only need Step 3 (sync) whenever code changes.'
    },
    {
      step: 3,
      name: 'npx cap sync ios',
      tag: 'THE APPARATUS SYNC',
      tagColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
      command: 'npx cap sync ios',
      desc: 'Copies your newly compiled dist/ assets into ios/App/App/public/ and links all native iOS plugins. This is what populates the Xcode build target.',
      outputExpect: '✔ Copying web assets from dist to ios/App/App/public\n✔ Updating iOS plugins and Podfile',
      why: 'Directly resolves "App.app not found" by ensuring all compiled JavaScript, CSS, and HTML are physically placed inside the Xcode project before xcodebuild runs.'
    },
    {
      step: 4,
      name: 'npx cap open ios',
      tag: 'COMPILE IN XCODE',
      tagColor: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
      command: 'npx cap open ios',
      desc: 'Launches Xcode with the full App.xcworkspace (containing CocoaPods & Capacitor frameworks). From here, select "Product → Archive" or run xcodebuild.',
      outputExpect: 'Xcode opens with App.xcworkspace active.',
      why: 'Always open the workspace (.xcworkspace), NOT .xcodeproj. Opening the project directly causes "No such module Capacitor" compile crashes.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#030905] border border-amber-500/30 p-4 sm:p-5 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-emerald-500/10 border border-amber-500/35 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-sm font-bold text-amber-200 uppercase tracking-wider">
                  Capacitor Build Flow &amp; .IPA Guide
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono">
                  v7 Native
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400">
                Correct compilation sequence, &apos;App.app not found&apos; fix, &amp; 20–30 MB IPA setup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Nav Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-black/60 rounded-xl border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setActiveGuideTab('sequence')}
            className={`py-1.5 px-2 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
              activeGuideTab === 'sequence'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>1. Build Sequence</span>
          </button>
          <button
            onClick={() => setActiveGuideTab('size_guide')}
            className={`py-1.5 px-2 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
              activeGuideTab === 'size_guide'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>2. 20–30 MB IPA</span>
          </button>
          <button
            onClick={() => setActiveGuideTab('github_ci')}
            className={`py-1.5 px-2 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
              activeGuideTab === 'github_ci'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>3. Cloud CI</span>
          </button>
          <button
            onClick={() => setActiveGuideTab('sideload')}
            className={`py-1.5 px-2 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
              activeGuideTab === 'sideload'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Sideloading</span>
          </button>
        </div>

        {/* TAB 1: CAPACITOR BUILD SEQUENCE & APP.APP FIX */}
        {activeGuideTab === 'sequence' && (
          <div className="space-y-3.5 text-xs text-zinc-300">
            {/* The 4-Step Interactive Stepper Bar */}
            <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-black/50 border border-zinc-800/80 rounded-xl">
              {stepsData.map((s) => (
                <button
                  key={s.step}
                  onClick={() => {
                    setActiveStep(s.step);
                    if (soundEnabled) soundFx.tap();
                  }}
                  className={`p-2 rounded-lg text-left transition flex flex-col gap-1 border ${
                    activeStep === s.step
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'border-transparent text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold">Step {s.step}</span>
                    {activeStep === s.step && <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />}
                  </div>
                  <span className="text-[11px] font-mono font-semibold truncate">{s.name}</span>
                </button>
              ))}
            </div>

            {/* Active Step Detailed Card */}
            {(() => {
              const current = stepsData[activeStep - 1];
              return (
                <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/25 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-300 font-mono">
                        Step {current.step}: {current.name}
                      </span>
                      <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-md border font-semibold ${current.tagColor}`}>
                        {current.tag}
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(current.command, `step_${current.step}`)}
                      className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono py-1 px-2 rounded-md bg-amber-500/10 border border-amber-500/25 transition active:scale-95"
                    >
                      {copiedKey === `step_${current.step}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === `step_${current.step}` ? 'Copied!' : 'Copy Command'}</span>
                    </button>
                  </div>

                  <pre className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-300 font-mono text-[11px] select-all">
                    $ {current.command}
                  </pre>

                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {current.desc}
                  </p>

                  <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                      <Cpu className="w-3 h-3" />
                      <span>Why this order matters:</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-sans">
                      {current.why}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-400">
                    <span>Expected output:</span>
                    <span className="text-emerald-400">{current.outputExpect}</span>
                  </div>
                </div>
              );
            })()}

            {/* Diagnostic Box: Resolving 'App.app not found' */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 overflow-hidden">
              <button
                onClick={() => setIsDiagnosticExpanded(!isDiagnosticExpanded)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-rose-950/30 transition"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold text-rose-300 text-xs font-mono uppercase tracking-wide">
                      Diagnostic: Why &apos;App.app not found&apos; Happens &amp; How to Fix It
                    </span>
                    <p className="text-[10px] text-rose-300/80 font-mono">
                      Root cause analysis of the local compilation error
                    </p>
                  </div>
                </div>
                {isDiagnosticExpanded ? <ChevronUp className="w-4 h-4 text-rose-400" /> : <ChevronDown className="w-4 h-4 text-rose-400" />}
              </button>

              {isDiagnosticExpanded && (
                <div className="p-3 border-t border-rose-500/20 space-y-2 text-[11px] text-zinc-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-rose-500/20 space-y-1">
                      <span className="font-bold text-rose-300 text-[10px] font-mono uppercase">
                        Cause 1: Running Sync Before Build
                      </span>
                      <p className="text-zinc-400 text-[10.5px]">
                        Running <code>npx cap sync</code> when <code>dist/</code> is missing or outdated copies nothing into the Xcode bundle. Xcode finishes with zero artifacts.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-rose-500/20 space-y-1">
                      <span className="font-bold text-rose-300 text-[10px] font-mono uppercase">
                        Cause 2: Opening .xcodeproj Instead of .xcworkspace
                      </span>
                      <p className="text-zinc-400 text-[10.5px]">
                        Capacitor uses CocoaPods/SPM. If you open <code>App.xcodeproj</code>, CocoaPods frameworks fail to link, halting compilation before <code>App.app</code> is emitted.
                      </p>
                    </div>
                  </div>

                  {/* 1-Line Self-Healing Fix */}
                  <div className="mt-2 p-2.5 rounded-lg bg-black/70 border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>The 1-Line Self-Healing Command</span>
                      </span>
                      <button
                        onClick={() => copyToClipboard(allInOneCommand, 'all_in_one')}
                        className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-mono py-0.5 px-2 rounded bg-amber-500/10 border border-amber-500/20"
                      >
                        {copiedKey === 'all_in_one' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'all_in_one' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-2 rounded bg-zinc-950 text-amber-300/90 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                      {allInOneCommand}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 20-30 MB IPA SIZE DEEP DIVE & HOW TO COMPILE */}
        {activeGuideTab === 'size_guide' && (
          <div className="space-y-3 text-xs text-zinc-300">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-amber-200 text-xs font-mono uppercase tracking-wider">
                  Understanding IPA Size: 1MB vs. 20–30 MB
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Why does a standard web build compress to ~700 KB – 1.5 MB, and how do you configure Xcode to produce the full <strong>20 MB – 30 MB</strong> development package with debug symbols and dynamic frameworks?
              </p>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200 font-mono">1. Ultra-Lean Release (~1 MB)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">Production</span>
                </div>
                <ul className="space-y-1 text-[10.5px] text-zinc-400 list-disc list-inside">
                  <li>Modern Vite strips unused code &amp; minifies JavaScript.</li>
                  <li>Capacitor relies on iOS&apos;s built-in <strong>WebKit</strong> (WKWebView). It does NOT embed a 30MB Chromium engine.</li>
                  <li>Swift standard libraries are built into iOS 13+ (no bundled runtime dylibs).</li>
                  <li>Stripped ARM64 binary + minified bundle compresses to <strong>~700 KB</strong>.</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 font-mono">2. Full Debug IPA (20–30 MB)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">Development</span>
                </div>
                <ul className="space-y-1 text-[10.5px] text-zinc-300 list-disc list-inside">
                  <li><strong>Debug Symbols (`dSYMs`):</strong> Adds 15MB – 25MB of symbolication maps for crash reporting &amp; stack traces.</li>
                  <li><strong>Dynamic Frameworks:</strong> Packages <code>Capacitor.framework</code> and <code>CapacitorCordova.framework</code>.</li>
                  <li><strong>Asset Catalogs:</strong> Includes full-resolution @3x retina launch images &amp; icons.</li>
                  <li>Produces the complete <strong>20 MB – 30 MB</strong> enterprise package.</li>
                </ul>
              </div>
            </div>

            {/* Command to compile the 20-30MB Package */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-zinc-300 text-[11px] font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Terminal script to compile 20–30 MB IPA with dSYMs</span>
                </span>
                <button
                  onClick={() => copyToClipboard(devIpaScript, 'dev_ipa_script')}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
                >
                  {copiedKey === 'dev_ipa_script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'dev_ipa_script' ? 'Copied Script!' : 'Copy Script'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/80 border border-zinc-800 text-amber-300 font-mono text-[10px] max-h-48 overflow-y-auto whitespace-pre-wrap">
                {devIpaScript}
              </pre>
            </div>

            {/* Xcode GUI instructions for 20-30MB */}
            <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 space-y-1 text-[11px]">
              <div className="font-bold text-zinc-200">How to Export 20–30 MB IPA in Xcode:</div>
              <ol className="list-decimal list-inside space-y-0.5 text-zinc-400 font-sans">
                <li>In Xcode, go to <strong>Product → Archive</strong>.</li>
                <li>In Organizer, click <strong>Distribute App → Custom → Development</strong>.</li>
                <li>Check <strong>&quot;Include symbols for crash reports (dSYMs)&quot;</strong> and <strong>&quot;Include bitcode &amp; embedded frameworks&quot;</strong>.</li>
                <li>Export the folder. The resulting <code>.ipa</code> will measure <strong>20 MB – 30 MB</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 3: GITHUB ACTIONS CLOUD CI */}
        {activeGuideTab === 'github_ci' && (
          <div className="space-y-3 text-xs text-zinc-300">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-xs">
              <strong>Automated Cloud Build (No Mac Required):</strong> GitHub Actions compiles the complete native iOS project on a clean Apple Silicon macOS runner. We&apos;ve updated the workflow to bundle both the native <code>App.app</code> and <code>dSYMs</code> symbols.
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-zinc-400 text-[11px] font-semibold">
                  .github/workflows/build-ipa.yml
                </span>
                <button
                  onClick={() => copyToClipboard(githubActionsWorkflow, 'gha')}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
                >
                  {copiedKey === 'gha' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'gha' ? 'Copied Workflow!' : 'Copy Workflow'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/80 border border-zinc-800 text-zinc-300 font-mono text-[10px] max-h-56 overflow-y-auto">
                {githubActionsWorkflow}
              </pre>
            </div>

            <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <span className="font-bold text-zinc-200">How to download from GitHub:</span>
              <p>
                1. Push this workflow to your repository or click <strong>Actions → Build iOS IPA (Free) → Run workflow</strong>.
                <br />
                2. When the job finishes in ~3 minutes, scroll to the bottom <strong>Artifacts</strong> section and click <strong>MicroSpends-Full-IPA</strong>.
                <br />
                3. Double-click the downloaded <code>.zip</code> file to extract your <code>MicroSpends-Full.ipa</code>.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: SIDELOADING & INSTALLATION FIXES */}
        {activeGuideTab === 'sideload' && (
          <div className="space-y-2.5 text-xs text-zinc-300">
            {/* Developer Mode Warning */}
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Mandatory iOS 16, 17, &amp; 18 Requirement: Developer Mode</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                If the app fails to install or says &quot;Not available for use&quot;, Developer Mode is disabled on your iPhone.
                <br />
                <strong>Fix:</strong> Open iPhone <strong>Settings → Privacy &amp; Security → Developer Mode (at the very bottom) → Toggle ON → Restart phone</strong>.
              </p>
            </div>

            {/* Sideloadly steps */}
            <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-100 text-xs font-mono">Sideloadly (Recommended for PC &amp; Mac)</span>
                <span className="text-[10px] text-emerald-400 font-mono">Free USB Sideload</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400 font-sans">
                <li>Download free Sideloadly from <span className="text-amber-300 font-mono">sideloadly.io</span>.</li>
                <li>Connect your iPhone to your computer via USB and unlock your phone screen.</li>
                <li>Extract <code>MicroSpends-Full-IPA.zip</code> to get <code>MicroSpends-Full.ipa</code> (do not drag the zip!).</li>
                <li>Drag <code>MicroSpends-Full.ipa</code> into Sideloadly.</li>
                <li>Enter your regular Apple ID and click <strong>Start</strong>.</li>
                <li>On iPhone: Go to <strong>Settings → General → VPN &amp; Device Management</strong>, tap your Apple ID, and tap <strong>Trust</strong>.</li>
              </ol>
            </div>

            {/* AltStore */}
            <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-100 text-xs font-mono">AltStore / SideStore (Wireless Wi-Fi Install)</span>
              <p className="text-[11px] text-zinc-400">
                Install AltStore once. Then download the <code>.ipa</code> in Safari on your iPhone, tap &quot;Share → Open in AltStore&quot;, and it will sign and install natively over Wi-Fi without needing a computer again.
              </p>
            </div>

            {/* Instant PWA Fallback */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
              <span className="font-bold text-amber-200 text-xs font-mono">Instant No-Computer Install (PWA):</span>
              <p className="text-[11px] text-zinc-300">
                You can also open this exact app URL in iPhone <strong>Safari</strong>, tap <strong>Share (square with arrow) → Add to Home Screen</strong>. It runs standalone full-screen with offline caching, zero computer, and zero 7-day certificate revokes!
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={downloadSetupFiles}
            className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono py-1 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download capacitor.config.json</span>
          </button>

          <button
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono transition active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
