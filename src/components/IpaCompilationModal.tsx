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
  Share2, 
  ExternalLink 
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
  const [activeGuideTab, setActiveGuideTab] = useState<'capacitor' | 'github_ci' | 'sideload' | 'ota'>('capacitor');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (soundEnabled) soundFx.tap();
    triggerHaptic('light');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const capacitorConfig = `{
  "appId": "com.icarus.microspends",
  "appName": "MIcroSpends",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "ios": {
    "contentInset": "always",
    "backgroundColor": "#020403"
  }
}`;

  const capacitorCommands = `# 1. Install Capacitor iOS bridge
npm install @capacitor/core @capacitor/cli @capacitor/ios

# 2. Build the production web bundle
npm run build

# 3. Add the native iOS Xcode workspace
npx cap add ios

# 4. Sync web assets into the Xcode project
npx cap sync ios

# 5. Open in Xcode (on macOS)
npx cap open ios`;

  const githubActionsWorkflow = `name: Build iOS .IPA
on:
  workflow_dispatch:

jobs:
  build-ios:
    runs-on: macos-14
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm ci

      - name: Build Web Dist
        run: npm run build

      - name: Install Capacitor & Sync
        run: |
          npm install @capacitor/core @capacitor/cli @capacitor/ios
          npx cap add ios
          npx cap sync ios

      - name: Build Xcode Archive
        run: |
          cd ios/App
          xcodebuild -workspace App.xcworkspace -scheme App -destination generic/platform=iOS archive -archivePath build/App.xcarchive CODE_SIGNING_ALLOWED=NO

      - name: Export Unsigned .IPA
        run: |
          mkdir -p Payload
          cp -r ios/App/build/App.xcarchive/Products/Applications/App.app Payload/
          zip -r MIcroSpends.ipa Payload

      - name: Upload .IPA Artifact
        uses: actions/upload-artifact@v4
        with:
          name: MIcroSpends-iOS
          path: MIcroSpends.ipa`;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#040d06] border border-amber-500/30 p-5 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/15">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-cinzel text-sm font-bold text-amber-200 uppercase tracking-wider">
                iOS .IPA Compilation & Sideloading Guide
              </h2>
              <p className="text-[11px] font-mono text-zinc-400">
                Package, compile, and distribute without Apple App Store review
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Nav Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-black/60 rounded-xl border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setActiveGuideTab('capacitor')}
            className={`py-1.5 px-2 rounded-lg transition text-center ${
              activeGuideTab === 'capacitor'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            1. Capacitor
          </button>
          <button
            onClick={() => setActiveGuideTab('github_ci')}
            className={`py-1.5 px-2 rounded-lg transition text-center ${
              activeGuideTab === 'github_ci'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            2. Cloud CI (No Mac)
          </button>
          <button
            onClick={() => setActiveGuideTab('sideload')}
            className={`py-1.5 px-2 rounded-lg transition text-center ${
              activeGuideTab === 'sideload'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            3. Sideload Tools
          </button>
          <button
            onClick={() => setActiveGuideTab('ota')}
            className={`py-1.5 px-2 rounded-lg transition text-center ${
              activeGuideTab === 'ota'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            4. Share Online
          </button>
        </div>

        {/* Tab 1: Capacitor & Xcode */}
        {activeGuideTab === 'capacitor' && (
          <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
              <strong>How it works:</strong> Capacitor wraps your Vite/React single-page application inside an official Apple WKWebView container with native iOS bridges.
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-zinc-400 text-[11px] font-semibold">
                  Step 1: Terminal commands to build & add iOS
                </span>
                <button
                  onClick={() => copyToClipboard(capacitorCommands, 'cap_cmd')}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
                >
                  {copiedKey === 'cap_cmd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'cap_cmd' ? 'Copied!' : 'Copy Commands'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/80 border border-zinc-800 text-amber-300 font-mono text-[11px] overflow-x-auto">
                {capacitorCommands}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-zinc-400 text-[11px] font-semibold">
                  capacitor.config.json
                </span>
                <button
                  onClick={downloadSetupFiles}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Config File</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/80 border border-zinc-800 text-zinc-300 font-mono text-[11px] overflow-x-auto">
                {capacitorConfig}
              </pre>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-zinc-800 space-y-1 text-[11px]">
              <div className="font-bold text-zinc-200">Step 2: Exporting .IPA in Xcode</div>
              <ol className="list-decimal list-inside space-y-0.5 text-zinc-400 font-sans">
                <li>In Xcode, select <strong>Any iOS Device (arm64)</strong> as the build target.</li>
                <li>Go to menu <strong>Product → Archive</strong>.</li>
                <li>When the Organizer opens, click <strong>Distribute App</strong>.</li>
                <li>Select <strong>Custom → Development</strong> or <strong>Ad-Hoc</strong> (or uncheck bitcode/symbols).</li>
                <li>Save the exported folder—inside you will find <strong>MIcroSpends.ipa</strong>!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: GitHub Actions Cloud CI */}
        {activeGuideTab === 'github_ci' && (
          <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-xs">
              <strong>No Mac? No problem:</strong> GitHub Actions provides free cloud macOS runners. Put this workflow file in your GitHub repo under <code>.github/workflows/build-ipa.yml</code>, click &quot;Run workflow&quot;, and download the compiled <code>MIcroSpends.ipa</code> artifact!
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
                  {copiedKey === 'gha' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'gha' ? 'Copied Workflow!' : 'Copy Workflow'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/80 border border-zinc-800 text-zinc-300 font-mono text-[10px] max-h-56 overflow-y-auto">
                {githubActionsWorkflow}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Sideloading Tools */}
        {activeGuideTab === 'sideload' && (
          <div className="space-y-2.5 text-xs text-zinc-300">
            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-zinc-100 text-xs">Sideloadly (Easiest for Mac & Windows)</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  1. Download free Sideloadly on PC or Mac. Connect your iPhone via USB.
                  <br />
                  2. Drag and drop your compiled <code>MIcroSpends.ipa</code> into Sideloadly.
                  <br />
                  3. Enter your regular free Apple ID and click <strong>Start</strong>.
                  <br />
                  4. On iPhone: Settings → General → VPN &amp; Device Management → Trust your Apple ID. Done!
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-zinc-100 text-xs">AltStore / SideStore (On-Device Wireless)</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Install AltStore on your phone once. Then download the <code>.ipa</code> from any cloud drive or Safari, tap &quot;Open in AltStore&quot;, and it installs and auto-refreshes over home Wi-Fi!
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-zinc-100 text-xs">TrollStore (Permanent - No Re-signing)</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  If your device is on iOS 14.0 - 16.6.1 or 17.0, TrollStore permanently installs any <code>.ipa</code> or <code>.tipa</code> with zero 7-day expiration and zero certificate revokes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Sharing Online & OTA */}
        {activeGuideTab === 'ota' && (
          <div className="space-y-3 text-xs text-zinc-300">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
              <strong>Sharing with friends or testing devices:</strong>
              <p className="mt-1 text-[11px]">
                You can host the <code>.ipa</code> online using services like <strong>Diawi</strong>, <strong>InstallOnAir</strong>, or via custom OTA manifest links.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800">
                <span className="font-bold text-zinc-200">Option A: Diawi / InstallOnAir (Instant Web Link)</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Upload your <code>MIcroSpends.ipa</code> to <span className="text-amber-300 font-mono">diawi.com</span> or <span className="text-amber-300 font-mono">installonair.com</span>. They give you a short link or QR code that users open in Safari to tap &quot;Install&quot; over the air. (Requires Ad-Hoc signing with tester UDIDs or Enterprise certificate).
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800">
                <span className="font-bold text-zinc-200">Option B: Instant PWA Install (No IPA Compilation Needed!)</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Because this app is built with mobile-first iOS viewport and standalone display tags, you or anyone can open this exact URL in iOS Safari, tap <strong>Share (square with arrow) → Add to Home Screen</strong>. It runs full screen with offline persistence, zero app store, and zero sideload certificate renewal!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Action */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-500">
            MIcroSpends ~ Icarus Native Packaging
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono transition active:scale-95"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
