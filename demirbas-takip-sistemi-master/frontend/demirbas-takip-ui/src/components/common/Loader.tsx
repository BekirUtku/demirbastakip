export default function Loader({ text = 'YÜKLENİYOR...' }: { text?: string }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)', width: 36, height: 36 }} role="status">
        <span className="visually-hidden">Yükleniyor...</span>
      </div>
      <div className="mt-3 text-muted" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>
        {text}
      </div>
    </div>
  );
}
