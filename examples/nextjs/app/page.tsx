'use client';

import { Web3Provider, ConnectWallet, WalletInfo, NetworkSwitcher } from '@arqon/web3-react';
import { ethereum, arbitrum, base, sepolia } from '@arqon/web3-chains';
import { useState } from 'react';

const chains = [ethereum, sepolia, arbitrum, base];

export default function Home() {
  return (
    <Web3Provider chains={chains} defaultChain={sepolia}>
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>LLM-Web3-Toolkit Demo</h1>
        <p>Production-grade Web3 integration for Large Language Models</p>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <section style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Wallet Connection</h2>
            <ConnectWallet 
              className="btn-primary"
              style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
            />
          </section>

          <section style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Wallet Information</h2>
            <WalletInfo showBalance={true} />
          </section>

          <section style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Network Switcher</h2>
            <NetworkSwitcher chains={chains} />
          </section>

          <section style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>LLM Integration</h2>
            <LLMDemo />
          </section>
        </div>
      </main>
    </Web3Provider>
  );
}

function LLMDemo() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/llm-web3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p>Ask about your wallet (e.g., "What is my wallet address?" or "Check my balance")</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: '100%', minHeight: '100px', padding: '0.5rem' }}
        placeholder="Enter your question..."
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !prompt}
        style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        {loading ? 'Processing...' : 'Ask LLM'}
      </button>
      {response && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
          <strong>Response:</strong>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{response}</pre>
        </div>
      )}
    </div>
  );
}
