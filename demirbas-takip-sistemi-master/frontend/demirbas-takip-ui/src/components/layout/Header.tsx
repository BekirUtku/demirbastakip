interface Props {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: Props) {
  return (
    <div className="main-header">
      <div>
        <h1 className="page-title">{title.toUpperCase()}</h1>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {subtitle.toUpperCase()}
          </div>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
      </div>
    </div>
  );
}
