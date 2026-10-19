import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import EventTable from './components/EventTable';
import DisputePage from './pages/DisputePage';
import { getDataSource, subscribeDataSource, type DataSource } from './lib/api-client';

function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>(getDataSource());

  useEffect(() => subscribeDataSource(setDataSource), []);

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
      </div>
    </BrowserRouter>
  );
}

export default App;
