export default function BunnyLabPage() {
  const options = [
    { id: 'AE', src: '/gangster-bunny-v25.svg', label: 'AE · Blade sprint' },
    { id: 'AF', src: '/gangster-bunny-v26.svg', label: 'AF · Parkour stride' },
    { id: 'AG', src: '/gangster-bunny-v27.svg', label: 'AG · Long-coat runner' },
    { id: 'AH', src: '/gangster-bunny-v28.svg', label: 'AH · Tactical dash' },
    { id: 'AI', src: '/gangster-bunny-v29.svg', label: 'AI · Power sprint' },
    { id: 'AJ', src: '/gangster-bunny-v30.svg', label: 'AJ · Smooth fast run' },
  ];

  return (
    <main className="min-h-screen bg-[#1a1a20] text-white p-8 font-mono">
      <h1 className="text-2xl mb-2">Fresh Reset Set (AE–AJ)</h1>
      <p className="text-sm text-zinc-400 mb-8">Totally new from-scratch pass: white bunny head + shades + black trench coat + fast run.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((o) => (
          <div key={o.id} className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/60">
            <p className="mb-3 text-terminal-green">{o.label}</p>
            <div className="h-44 flex items-center justify-center bg-zinc-800/60 rounded">
              <img src={o.src} alt={o.label} className="h-36 w-44 object-contain" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
