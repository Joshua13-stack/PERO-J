import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import EventTable from './components/EventTable';
import DisputePage from './pages/DisputePage';

function App() {
  const [navOpen, setNavOpen] = useState(false);

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
