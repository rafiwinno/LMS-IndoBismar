interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function Spinner({ size = 'md', text }: SpinnerProps) {
  const sizeClass = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClass} rounded-full border-slate-200 border-t-blue-600 animate-spin`} />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
}

// Full page loader
export function PageLoader({ text = 'Memuat...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" text={text} />
    </div>
  );
}