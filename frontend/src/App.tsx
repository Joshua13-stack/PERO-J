import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import EventTable from './components/EventTable';
import DisputePage from './pages/DisputePage';
import { getDataSource, subscribeDataSource, type DataSource } from './lib/api-client';

type WalletId = 'freighter' | 'xbull' | 'albedo' | 'lobstr' | 'walletconnect';

interface WalletOption {
  id: WalletId;
  name: string;
  icon: string;
  guide: string;
  installUrl: string;
}

const WALLET_STORAGE_KEY = 'stellar.wallet.provider';

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'freighter',
    name: 'Freighter',
    icon: '\u{1F680}',
    guide: 'Install the Freighter browser extension, then unlock it and approve the connection.',
    installUrl: 'https://www.freighter.app/',
  },
  {
    id: 'xbull',
    name: 'xBull',
    icon: '\u{1F402}',
    guide: 'Install the xBull extension or mobile app, then approve the connection request.',
    installUrl: 'https://xbull.app/',
  },
  {
    id: 'albedo',
    name: 'Albedo',
    icon: '\u{1F311}',
    guide: 'Albedo works in the browser. Sign in on the Albedo popup to connect.',
    installUrl: 'https://albedo.link/',
  },
  {
    id: 'lobstr',
    name: 'Lobstr',
    icon: '\u{1F99E}',
    guide: 'Open the Lobstr mobile app and scan the WalletConnect QR code to connect.',
    installUrl: 'https://lobstr.co/',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '\u{1F517}',
    guide: 'Scan the WalletConnect QR code with any compatible Stellar wallet.',
    installUrl: 'https://walletconnect.com/',
  },
];

function getWalletOption(id: WalletId | null): WalletOption | undefined {
  return WALLET_OPTIONS.find((wallet) => wallet.id === id);
}

function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>(getDataSource());
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [activeWallet, setActiveWallet] = useState<WalletId | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => subscribeDataSource(setDataSource), []);

  const connectWallet = useCallback((id: WalletId) => {
    const option = getWalletOption(id);
    if (!option) {
      return;
    }
    try {
      window.localStorage.setItem(WALLET_STORAGE_KEY, id);
    } catch {
      // localStorage may be unavailable (private mode); connection still works.
    }
    setActiveWallet(id);
    setWalletError(null);
    setWalletModalOpen(false);
  }, []);

  const disconnectWallet = useCallback(() => {
    try {
      window.localStorage.removeItem(WALLET_STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
    setActiveWallet(null);
    setWalletError(null);
  }, []);

  // Auto-reconnect the previously chosen wallet provider on load.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(WALLET_STORAGE_KEY);
    } catch {
      stored = null;
    }
    const option = getWalletOption(stored as WalletId | null);
    if (option) {
      setActiveWallet(option.id);
    }
  }, []);

  const activeWalletOption = getWalletOption(activeWallet);

  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <div className="app-brand">Soroban Smart Block Explorer</div>
          <button
            type="button"
            className="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((open) => !open)}
          >
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
            <span className="nav-toggle-bar" />
          </button>
          <nav className={`app-nav${navOpen ? ' app-nav--open' : ''}`}>
            <a href="#events">Events</a>
            <a href="#contracts">Contracts</a>
            <a href="#ledgers">Ledgers</a>
          </nav>
          <div className="wallet-connect">
            {activeWalletOption ? (
              <>
                <span className="wallet-badge" title={activeWalletOption.name}>
                  <span aria-hidden="true">{activeWalletOption.icon}</span>{' '}
                  {activeWalletOption.name}
                </span>
                <button type="button" className="wallet-disconnect" onClick={disconnectWallet}>
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                className="wallet-connect-button"
                onClick={() => {
                  setWalletError(null);
                  setWalletModalOpen(true);
                }}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </header>
        {dataSource === 'on-chain' && (
          <div className="app-warning" role="status">
            Operating in direct on-chain mode
          </div>
        )}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<EventTable />} />
            <Route path="/disputes/:marketId" element={<DisputePage />} />
          </Routes>
        </main>
        {walletModalOpen && (
          <div
            className="wallet-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Select a Stellar wallet"
            onClick={() => setWalletModalOpen(false)}
          >
            <div className="wallet-modal" onClick={(event) => event.stopPropagation()}>
              <div className="wallet-modal-header">
                <h2>Connect a Stellar wallet</h2>
                <button
                  type="button"
                  className="wallet-modal-close"
                  aria-label="Close wallet selector"
                  onClick={() => setWalletModalOpen(false)}
                >
                  \u00d7
                </button>
              </div>
              {walletError && (
                <div className="wallet-error" role="alert">
                  {walletError}
                </div>
              )}
              <ul className="wallet-list">
                {WALLET_OPTIONS.map((wallet) => (
                  <li key={wallet.id} className="wallet-option">
                    <button
                      type="button"
                      className="wallet-option-button"
                      onClick={() => connectWallet(wallet.id)}
                    >
                      <span className="wallet-option-icon" aria-hidden="true">
                        {wallet.icon}
                      </span>
                      <span className="wallet-option-text">
                        <span className="wallet-option-name">{wallet.name}</span>
                        <span className="wallet-option-guide">{wallet.guide}</span>
                      </span>
                    </button>
                    <a
                      className="wallet-option-install"
                      href={wallet.installUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Not installed?
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
