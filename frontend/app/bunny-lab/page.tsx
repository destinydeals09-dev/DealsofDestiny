export default function BunnyLabPage() {
  const options = [
    { id: 'G', src: '/gangster-bunny-v7.svg', label: 'G · Human runner, balanced' },
    { id: 'H', src: '/gangster-bunny-v8.svg', label: 'H · Upright athletic stride' },
    { id: 'I', src: '/gangster-bunny-v9.svg', label: 'I · Low tactical lean' },
    { id: 'J', src: '/gangster-bunny-v10.svg', label: 'J · Shoulder-forward sprint' },
    { id: 'K', src: '/gangster-bunny-v11.svg', label: 'K · Compact human silhouette' },
    { id: 'L', src: '/gangster-bunny-v12.svg', label: 'L · Slow cinematic run' },
  ];

  return (
    <main className="min-h-screen bg-[#1a1a20] text-white p-8 font-mono">
      <h1 className="text-2xl mb-2">Fresh 6 Bunny Variants (More Human Body)</h1>
      <p className="text-sm text-zinc-400 mb-8">These are the new six (G–L), with slower animation and cleaner human silhouettes.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((o) => (
          <div key={o.id} className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/60">
            <p className="mb-3 text-terminal-green">{o.label}</p>
            <div className="h-40 flex items-center justify-center bg-zinc-800/60 rounded">
              <img src={o.src} alt={o.label} className="h-32 w-40 object-contain" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
