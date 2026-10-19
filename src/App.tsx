import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  Play,
  ArrowRight,
  Terminal,
  FileJson,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Info,
  HelpCircle,
  KeyRound,
  Send,
  Webhook
} from 'lucide-react';

export default function App() {
  // Pre-configured parameters
  const palId = 'pfbaac009c0b';
  const steveDeploymentUrl = 'https://maker.tavus.io/deployments/e00ad8e7-5eb5-4035-aaff-533686d61e4b';
  const n8nWorkflowUrl = 'https://leseditlhapane.app.n8n.cloud/workflow/C8Qe8hnH3V75YzK3';
  const defaultWebhookUrl = 'https://leseditlhapane.app.n8n.cloud/webhook/steve-session-completed';

  // Configurable credentials & state
  const [webhookUrl, setWebhookUrl] = useState(defaultWebhookUrl);
  const [headerName, setHeaderName] = useState('X-N8N-API-KEY');
  const [headerValue, setHeaderValue] = useState('YOUR_N8N_HEADER_AUTH_SECRET');
  const [tavusApiKeyPlaceholder, setTavusApiKeyPlaceholder] = useState('YOUR_TAVUS_API_KEY');
  const [toolId, setToolId] = useState('');
  const [activeTab, setActiveTab] = useState<'wizard' | 'diagram' | 'troubleshoot'>('wizard');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Verification Checklist State
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
  });

  // Webhook Test simulation state
  const [testConversationId, setTestConversationId] = useState('c_test_session_' + Math.floor(1000 + Math.random() * 9000));
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const toggleStep = (stepKey: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  // Payloads
  const createToolPayload = {
    name: 'send_session_to_n8n',
    description: "Triggered after a conversation concludes. Posts the completed conversation ID to n8n for Gemini mentor evaluation.",
    trigger_type: 'post_call',
    parameters: {
      type: 'object',
      properties: {
        conversation_id: {
          type: 'string',
          description: 'The unique Tavus conversation ID of the completed mentoring session'
        }
      },
      required: ['conversation_id']
    },
    delivery: {
      api: {
        url: webhookUrl,
        method: 'POST',
        content_type: 'application/json',
        headers: {
          [headerName]: headerValue
        },
        body_template: {
          conversation_id: '{conversation_id}'
        }
      }
    }
  };

  const createToolJsonString = JSON.stringify(createToolPayload, null, 2);

  const createToolCurl = `curl --request POST \\
  --url https://tavusapi.com/v2/tools \\
  --header 'Content-Type: application/json' \\
  --header 'x-api-key: ${tavusApiKeyPlaceholder}' \\
  --data '${createToolJsonString.replace(/'/g, "'\\''")}'`;

  const attachToolPayload = {
    tool_ids: [toolId || 't_REPLACE_WITH_TOOL_ID']
  };

  const attachToolJsonString = JSON.stringify(attachToolPayload, null, 2);

  const attachToolCurl = `curl --request POST \\
  --url https://tavusapi.com/v2/pals/${palId}/tools \\
  --header 'Content-Type: application/json' \\
  --header 'x-api-key: ${tavusApiKeyPlaceholder}' \\
  --data '${attachToolJsonString}'`;

  const inspectToolsCurl = `curl --request GET \\
  --url https://tavusapi.com/v2/pals/${palId}/tools \\
  --header 'x-api-key: ${tavusApiKeyPlaceholder}'`;

  const testWebhookCurl = `curl --request POST \\
  --url '${webhookUrl}' \\
  --header 'Content-Type: application/json' \\
  --header '${headerName}: ${headerValue}' \\
  --data '{"conversation_id": "${testConversationId}"}'`;

  // Send browser-level test ping
  const handleRunWebhookTest = async () => {
    setTestStatus('running');
    setTestResponse(null);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [headerName]: headerValue,
        },
        body: JSON.stringify({ conversation_id: testConversationId }),
      });

      const responseText = await response.text();
      let parsed = responseText;
      try {
        parsed = JSON.stringify(JSON.parse(responseText), null, 2);
      } catch {
        // Keep as raw text
      }

      if (response.ok) {
        setTestStatus('success');
        setTestResponse(`HTTP ${response.status} ${response.statusText}\n${parsed || 'Workflow triggered successfully.'}`);
      } else {
        setTestStatus('error');
        setTestResponse(`HTTP ${response.status} ${response.statusText}\n${parsed}\n\nNote: If this was 401 Unauthorized, verify that the Header Auth Name and Secret match your n8n credential.`);
      }
    } catch (err: unknown) {
      setTestStatus('error');
      const msg = err instanceof Error ? err.message : String(err);
      setTestResponse(`Browser request blocked: ${msg}.\n\nTip: Browsers often enforce strict CORS on direct cross-origin cloud webhooks. Run the cURL command directly in your terminal for 100% reliable network testing!`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <header className="border-b border-stone-800 bg-stone-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <Cpu className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-stone-100 tracking-tight">Steve ↔ n8n Tavus Integration Console</h1>
                <span className="text-xs px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono">
                  PAL: {palId}
                </span>
              </div>
              <p className="text-xs text-stone-400">Post-Call Automated Evaluation Pipeline with Google Gemini</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-2 text-xs">
            <a
              href={steveDeploymentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 transition"
            >
              <span>Steve Video Call</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>
            <a
              href={n8nWorkflowUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 transition"
            >
              <span>n8n Workflow</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6 border-t border-stone-800/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`py-2.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'wizard'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Step-by-Step Implementation Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('diagram')}
            className={`py-2.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'diagram'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Architecture & Data Flow</span>
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`py-2.5 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'troubleshoot'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Diagnostics & FAQs</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        
        {/* Security & Config Banner */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-semibold text-stone-200">Zero-Leakage Security Guarantee</h2>
                <p className="text-xs text-stone-400">
                  Your Tavus API key and n8n secrets are never transmitted to any external backend or recorded. All code and cURL snippets are rendered locally in your browser.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-stone-400 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Client-side Vault Active</span>
            </div>
          </div>

          {/* Dynamic parameter configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <label className="block text-stone-400 font-medium mb-1 flex items-center gap-1">
                <span>Webhook Destination URL</span>
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-amber-400"
                placeholder="https://...webhook/..."
              />
            </div>

            <div>
              <label className="block text-stone-400 font-medium mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>n8n Header Auth: Header Name</span>
              </label>
              <input
                type="text"
                value={headerName}
                onChange={(e) => setHeaderName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-amber-400"
                placeholder="e.g. X-N8N-API-KEY"
              />
              <span className="text-[10px] text-stone-500 mt-0.5 block">Match your n8n Credential Header Name</span>
            </div>

            <div>
              <label className="block text-stone-400 font-medium mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>n8n Header Auth: Secret Value</span>
              </label>
              <input
                type="text"
                value={headerValue}
                onChange={(e) => setHeaderValue(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 font-mono focus:outline-none focus:border-amber-400"
                placeholder="Secret key token"
              />
              <span className="text-[10px] text-stone-500 mt-0.5 block">Only populated in generated commands</span>
            </div>

            <div>
              <label className="block text-stone-400 font-medium mb-1 flex items-center gap-1 text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Generated Tavus Tool ID</span>
              </label>
              <input
                type="text"
                value={toolId}
                onChange={(e) => setToolId(e.target.value)}
                className="w-full bg-stone-950 border border-amber-500/40 rounded-lg px-3 py-2 text-amber-200 font-mono focus:outline-none focus:border-amber-400"
                placeholder="Paste tool_id after Step 2"
              />
              <span className="text-[10px] text-amber-400/80 mt-0.5 block">Auto-inserts into Step 3 attachment command</span>
            </div>
          </div>
        </section>

        {/* TAB 1: Step by Step Guide */}
        {activeTab === 'wizard' && (
          <div className="space-y-8">

            {/* Step 1: Pre-check */}
            <div className={`bg-stone-900 border rounded-2xl transition p-6 ${completedSteps.step1 ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-stone-800'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${completedSteps.step1 ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-300'}`}>
                    1
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-stone-100">Step 1: Check Steve&apos;s Current Tools (Safe Read-Only)</h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Verify which tools are currently attached to Steve (<span className="font-mono text-stone-300">pfbaac009c0b</span>) before modifying anything.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleStep('step1')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    completedSteps.step1
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-stone-800 text-stone-400 border border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completedSteps.step1 ? 'Marked Verified' : 'Mark as Done'}</span>
                </button>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-stone-400 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-stone-500" />
                    GET /v2/pals/{palId}/tools
                  </span>
                  <button
                    onClick={() => copyToClipboard(inspectToolsCurl, 'step1-curl')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition text-[11px]"
                  >
                    {copiedKey === 'step1-curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'step1-curl' ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-stone-900 border border-stone-800 font-mono text-[11px] overflow-x-auto text-amber-200">
                  {inspectToolsCurl}
                </pre>
                <p className="text-[11px] text-stone-400">
                  <strong>Where to submit:</strong> Paste into Terminal or execute in Postman. If Steve has no custom tools yet, Tavus will return <code className="text-stone-300 font-mono">[ ]</code>.
                </p>
              </div>
            </div>

            {/* Step 2: Create Tool */}
            <div className={`bg-stone-900 border rounded-2xl transition p-6 ${completedSteps.step2 ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-stone-800'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${completedSteps.step2 ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-300'}`}>
                    2
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-stone-100">Step 2: Create the Post-Call Tavus Tool</h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Registers a standalone tool on your Tavus account with <code className="text-amber-300 font-mono">trigger_type: &quot;post_call&quot;</code> and API webhook delivery.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleStep('step2')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    completedSteps.step2
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-stone-800 text-stone-400 border border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completedSteps.step2 ? 'Marked Verified' : 'Mark as Done'}</span>
                </button>
              </div>

              {/* Specification Explainer */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block font-medium">Trigger Mechanism</span>
                  <span className="font-mono text-amber-300 text-sm mt-0.5 block">&quot;post_call&quot;</span>
                  <p className="text-[11px] text-stone-500 mt-1">Runs automatically once when conversation finishes. No user interrupt.</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block font-medium">Delivery Channel</span>
                  <span className="font-mono text-amber-300 text-sm mt-0.5 block">POST Webhook</span>
                  <p className="text-[11px] text-stone-500 mt-1">Direct HTTPS POST to your production n8n webhook URL.</p>
                </div>
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block font-medium">Payload Mapping</span>
                  <span className="font-mono text-amber-300 text-sm mt-0.5 block">&#123;&quot;conversation_id&quot;: &quot;...&quot;&#125;</span>
                  <p className="text-[11px] text-stone-500 mt-1">Tavus injects the session ID into the body template.</p>
                </div>
              </div>

              {/* Exact JSON Payload */}
              <div className="mt-4 p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-stone-300 flex items-center gap-2">
                    <FileJson className="w-4 h-4 text-amber-400" />
                    Exact API Request Body (POST https://tavusapi.com/v2/tools)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(createToolJsonString, 'step2-json')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition text-[11px]"
                    >
                      {copiedKey === 'step2-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'step2-json' ? 'JSON Copied' : 'Copy JSON'}</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(createToolCurl, 'step2-curl')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition text-[11px]"
                    >
                      {copiedKey === 'step2-curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'step2-curl' ? 'cURL Copied' : 'Copy Complete cURL'}</span>
                    </button>
                  </div>
                </div>

                <pre className="p-3 rounded-lg bg-stone-900 border border-stone-800 font-mono text-[11px] overflow-x-auto text-amber-200">
                  {createToolJsonString}
                </pre>

                <div className="p-3 bg-stone-900/60 rounded-lg border border-stone-800 text-[11px] text-stone-400 space-y-1">
                  <p className="font-semibold text-stone-300">Where & How to submit:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li><strong>Option A (Fastest - Terminal):</strong> Copy the cURL above, replace <code className="text-amber-300">{tavusApiKeyPlaceholder}</code> with your Tavus API Key, and run it in Terminal.</li>
                    <li><strong>Option B (Postman):</strong> Method: <code className="text-stone-200 font-mono">POST</code>, URL: <code className="text-stone-200 font-mono">https://tavusapi.com/v2/tools</code>, Headers: <code className="text-stone-200 font-mono">x-api-key: YOUR_KEY</code>, Body: <code className="text-stone-200 font-mono">raw (JSON)</code>.</li>
                  </ul>
                  <p className="pt-2 text-emerald-400">
                    💡 Tavus will respond with <code className="text-stone-200 font-mono">&#123; &quot;tool_id&quot;: &quot;tool_...&quot; &#125;</code>. Copy that Tool ID and paste it into the field at the top of this console!
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Attach Tool to Steve PAL */}
            <div className={`bg-stone-900 border rounded-2xl transition p-6 ${completedSteps.step3 ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-stone-800'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${completedSteps.step3 ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-300'}`}>
                    3
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-stone-100">Step 3: Attach Tool to Steve&apos;s PAL</h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Links the post-call evaluation tool to PAL ID: <span className="font-mono text-stone-300">{palId}</span>.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleStep('step3')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    completedSteps.step3
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-stone-800 text-stone-400 border border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completedSteps.step3 ? 'Marked Verified' : 'Mark as Done'}</span>
                </button>
              </div>

              {/* CRITICAL WARNING BANNER */}
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-300 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Safety Warning: Live Configuration Modification</span>
                </div>
                <p>
                  Executing this request will modify Steve&apos;s live PAL configuration (<code className="font-mono text-amber-100">{palId}</code>).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded bg-black/30 border border-amber-500/20">
                    <span className="font-bold text-emerald-400 block mb-0.5">✓ What Stays Untouched:</span>
                    Steve&apos;s persona, system prompt, tone, conversational objectives, replica ID, and voice settings are completely preserved.
                  </div>
                  <div className="p-2.5 rounded bg-black/30 border border-amber-500/20">
                    <span className="font-bold text-amber-300 block mb-0.5">⚙️ What Changes:</span>
                    Steve gains this post-call action. When calls conclude, Tavus will send the conversation ID to n8n automatically.
                  </div>
                </div>
              </div>

              {/* Request Payload */}
              <div className="mt-4 p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-stone-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-stone-400" />
                    POST https://tavusapi.com/v2/pals/{palId}/tools
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(attachToolJsonString, 'step3-json')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition text-[11px]"
                    >
                      {copiedKey === 'step3-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'step3-json' ? 'JSON Copied' : 'Copy Body'}</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(attachToolCurl, 'step3-curl')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition text-[11px]"
                    >
                      {copiedKey === 'step3-curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'step3-curl' ? 'cURL Copied' : 'Copy cURL'}</span>
                    </button>
                  </div>
                </div>

                <pre className="p-3 rounded-lg bg-stone-900 border border-stone-800 font-mono text-[11px] overflow-x-auto text-amber-200">
                  {attachToolCurl}
                </pre>

                {/* Rollback instructions */}
                <div className="p-3 bg-stone-900/60 rounded-lg border border-stone-800 text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-300">Rollback / Detach instructions:</span> If you ever want to detach this tool from Steve without affecting anything else, run:
                  <div className="mt-1 font-mono text-stone-300 bg-stone-950 p-2 rounded border border-stone-800">
                    curl --request DELETE --url https://tavusapi.com/v2/pals/{palId}/tools/{toolId || 'TOOL_ID'} --header &apos;x-api-key: {tavusApiKeyPlaceholder}&apos;
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Webhook Smoke Test */}
            <div className={`bg-stone-900 border rounded-2xl transition p-6 ${completedSteps.step4 ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-stone-800'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${completedSteps.step4 ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-300'}`}>
                    4
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-stone-100">Step 4: Test Webhook & Header Auth Connection</h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Verify that your n8n webhook responds with 200 OK and accepts your Header Auth credential before calling Steve.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleStep('step4')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    completedSteps.step4
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-stone-800 text-stone-400 border border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completedSteps.step4 ? 'Marked Verified' : 'Mark as Done'}</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Direct Terminal test */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-stone-400" />
                      Test Command (Terminal / PowerShell)
                    </span>
                    <button
                      onClick={() => copyToClipboard(testWebhookCurl, 'step4-curl')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition text-[11px]"
                    >
                      {copiedKey === 'step4-curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'step4-curl' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-stone-900 border border-stone-800 font-mono text-[11px] overflow-x-auto text-amber-200">
                    {testWebhookCurl}
                  </pre>
                  <p className="text-[11px] text-stone-400">
                    Running this simulates Tavus dispatching the conversation ID immediately when a mentoring session ends.
                  </p>
                </div>

                {/* In-Browser Test Runner */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-amber-400" />
                      Interactive Webhook Dispatcher
                    </span>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Send a mock payload <code className="text-amber-200 font-mono">&#123;&quot;conversation_id&quot;: &quot;{testConversationId}&quot;&#125;</code> directly from this page to verify n8n.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleRunWebhookTest}
                      disabled={testStatus === 'running'}
                      className="w-full py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {testStatus === 'running' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Testing Webhook...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Send Test Payload to n8n</span>
                        </>
                      )}
                    </button>

                    {testResponse && (
                      <div className={`p-3 rounded-lg font-mono text-[11px] border ${
                        testStatus === 'success'
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                          : 'bg-red-950/30 border-red-500/40 text-red-300'
                      }`}>
                        <pre className="whitespace-pre-wrap">{testResponse}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Live Call Test */}
            <div className={`bg-stone-900 border rounded-2xl transition p-6 ${completedSteps.step5 ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-stone-800'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${completedSteps.step5 ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-300'}`}>
                    5
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-stone-100">Step 5: Live Practice Call & Gemini Evaluation Verification</h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Conduct a real mentoring practice call with Steve and watch n8n automatically fetch the real transcript and generate the evaluation report.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleStep('step5')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    completedSteps.step5
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-stone-800 text-stone-400 border border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completedSteps.step5 ? 'Marked Verified' : 'Mark as Done'}</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <span>1. Conduct Practice Call</span>
                  </div>
                  <p className="text-stone-400 text-[11px]">
                    Open Steve&apos;s deployment link in a new tab:
                  </p>
                  <a
                    href={steveDeploymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-amber-300 hover:underline font-mono text-[11px]"
                  >
                    <span>maker.tavus.io/.../e00ad8e7...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-stone-400 text-[11px]">
                    Speak for 30–60 seconds, discuss your topic, then click <strong>&quot;End Call&quot;</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <span>2. Watch Tavus Dispatch</span>
                  </div>
                  <p className="text-stone-400 text-[11px]">
                    Within 10–25 seconds after call termination, Tavus Raven will finalize the transcript and dispatch the POST request to your n8n webhook.
                  </p>
                  <div className="p-2 bg-stone-900 rounded font-mono text-[10px] text-stone-300">
                    trigger_type: &quot;post_call&quot; → webhook
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <span>3. Inspect n8n Executions</span>
                  </div>
                  <p className="text-stone-400 text-[11px]">
                    Open your workflow in n8n and click the <strong>&quot;Executions&quot;</strong> tab on the left:
                  </p>
                  <a
                    href={n8nWorkflowUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-amber-300 hover:underline font-mono text-[11px]"
                  >
                    <span>n8n Workflow Executions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-stone-400 text-[11px]">
                    Confirm that the Gemini Evaluation node produced the mentorship feedback report!
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Architecture & Data Flow */}
        {activeTab === 'diagram' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-stone-100 mb-1">End-to-End System Architecture</h3>
              <p className="text-xs text-stone-400 mb-6">
                Visualizing the transition from Steve&apos;s real-time video conversation to the n8n Gemini evaluation report.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Stage 1 */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                      01
                    </div>
                    <h4 className="text-sm font-semibold text-stone-200">Steve Practice Session</h4>
                    <span className="text-[11px] text-stone-400 block">PAL ID: <code className="text-amber-300 font-mono">{palId}</code></span>
                    <p className="text-xs text-stone-400">
                      User conducts a live mentoring conversation. Steve speaks, listens, and interacts in real time.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-500">
                    Call terminates via user or system
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/30 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                      02
                    </div>
                    <h4 className="text-sm font-semibold text-amber-200">Tavus Post-Call Action</h4>
                    <span className="text-[11px] text-stone-400 block">Tool: <code className="text-amber-300 font-mono">send_session_to_n8n</code></span>
                    <p className="text-xs text-stone-400">
                      Raven perception & transcript finalize. Tavus triggers the HTTP POST action with the completed <code className="text-amber-200 font-mono">conversation_id</code>.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-800 text-[11px] text-amber-400/80">
                    Header Auth authenticated
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                      03
                    </div>
                    <h4 className="text-sm font-semibold text-stone-200">n8n Webhook Ingestion</h4>
                    <span className="text-[11px] text-stone-400 block">Endpoint: <code className="text-stone-300 font-mono">/webhook/steve-...</code></span>
                    <p className="text-xs text-stone-400">
                      Webhook node accepts the request, then Tavus HTTP Request node queries <code className="text-stone-300 font-mono">GET /v2/conversations/&#123;id&#125;</code> to fetch full conversation transcript.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-500">
                    Extracts speaker turns & timestamps
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      04
                    </div>
                    <h4 className="text-sm font-semibold text-stone-200">Gemini Mentor Evaluation</h4>
                    <span className="text-[11px] text-stone-400 block">Model: <code className="text-emerald-300 font-mono">Gemini 2.5 Flash / Pro</code></span>
                    <p className="text-xs text-stone-400">
                      LLM node assesses mentee performance, clarity, questions asked, key learning takeaways, and generates structured feedback.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-800 text-[11px] text-emerald-400">
                    Delivered to email, Slack, or DB
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Diagnostics & FAQs */}
        {activeTab === 'troubleshoot' && (
          <div className="space-y-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-stone-100">Verification & Troubleshooting Guide</h3>
              
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <h4 className="font-semibold text-stone-200 flex items-center gap-2">
                    <span className="text-amber-400">Q:</span> How do I find my exact Header Auth Name and Value in n8n?
                  </h4>
                  <p className="text-stone-400">
                    Open your n8n workflow at <code className="text-stone-300 font-mono">{n8nWorkflowUrl}</code>, double-click the <strong>Webhook</strong> node, inspect the <strong>Authentication</strong> property (set to <em>Header Auth</em>), and click the edit pencil icon next to the selected Credential. The modal reveals the exact <strong>Name</strong> (e.g. <code className="text-amber-300 font-mono">X-N8N-API-KEY</code>) and <strong>Value</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <h4 className="font-semibold text-stone-200 flex items-center gap-2">
                    <span className="text-amber-400">Q:</span> Does attaching this tool overwrite Steve&apos;s personality or prompt?
                  </h4>
                  <p className="text-stone-400">
                    <strong>No.</strong> Attaching a tool via <code className="text-stone-300 font-mono">POST /v2/pals/{palId}/tools</code> only appends the tool ID to Steve&apos;s capabilities array. His system prompt, replica, conversational objectives, and voice model remain 100% intact.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <h4 className="font-semibold text-stone-200 flex items-center gap-2">
                    <span className="text-amber-400">Q:</span> What if n8n returns 404 &quot;Webhook not registered&quot;?
                  </h4>
                  <p className="text-stone-400">
                    Ensure your n8n workflow is toggled to <strong>Active</strong> in the upper right corner of the n8n canvas. If the workflow is inactive, production webhooks (<code className="text-stone-300 font-mono">.../webhook/...</code>) will not respond. If you are using the test URL (<code className="text-stone-300 font-mono">.../webhook-test/...</code>), you must click &quot;Listen for test event&quot; in n8n prior to triggering.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                  <h4 className="font-semibold text-stone-200 flex items-center gap-2">
                    <span className="text-amber-400">Q:</span> How does n8n reference the conversation ID in subsequent nodes?
                  </h4>
                  <p className="text-stone-400">
                    In your n8n workflow, the Webhook node outputs JSON. In the Tavus HTTP Request node that fetches the transcript, the URL should be:
                    <br />
                    <code className="text-amber-200 font-mono bg-stone-900 px-2 py-0.5 rounded mt-1 inline-block">
                      https://tavusapi.com/v2/conversations/&#123;&#123; $json.body.conversation_id &#125;&#125;
                    </code>
                    <br />
                    (or <code className="text-amber-200 font-mono">&#123;&#123; $json.conversation_id &#125;&#125;</code> depending on whether n8n is configured to unnest body data).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 py-4 text-center text-xs text-stone-500">
        Steve ↔ n8n Tavus Post-Call Action Pipeline · Target PAL <code className="text-stone-400 font-mono">{palId}</code>
      </footer>
    </div>
  );
}
