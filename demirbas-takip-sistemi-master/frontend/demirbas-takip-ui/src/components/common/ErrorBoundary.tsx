import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; pageName?: string; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  resetColumnPrefs = () => {
    if (this.props.pageName) {
      localStorage.removeItem(`columnPrefs_${this.props.pageName}`);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <div className="alert alert-danger">
            <h5 className="alert-heading">Sayfa Yüklenemedi</h5>
            <p><strong>Hata:</strong> {this.state.error?.message}</p>
            <pre style={{ fontSize: 11, maxHeight: 150, overflow: 'auto', background: '#fff', padding: 8, borderRadius: 4 }}>
              {this.state.error?.stack}
            </pre>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-outline-danger btn-sm" onClick={this.resetColumnPrefs}>
                Sütun Ayarlarını Sıfırla ve Yenile
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>
                Sayfayı Yenile
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
