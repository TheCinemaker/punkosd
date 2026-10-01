import React from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

// Ha egy nézet hibára fut, nem fehéredik el az egész app: hibaüzenet + kiút
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Nézet hiba:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="error-box">
        <AlertTriangle size={28} color="#dc2626" />
        <h2>Hiba történt ennek a résznek a megjelenítésekor</h2>
        <p>Az adatok biztonságban vannak. Lépj vissza a kezdőlapra, vagy próbáld újra. Ha ismétlődik, küldd el ezt a szöveget:</p>
        <code>{String(this.state.error?.message || this.state.error)}</code>
        <div className="error-actions">
          <button className="btn-primary" onClick={() => { this.setState({ error: null }); this.props.onHome?.(); }}>
            <Home size={15} /> Vissza a kezdőlapra
          </button>
          <button className="btn-secondary" onClick={() => this.setState({ error: null })}>
            <RotateCcw size={15} /> Újrapróbálás
          </button>
        </div>
      </div>
    );
  }
}
