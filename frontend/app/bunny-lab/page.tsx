export default function BunnyLabPage() {
  const options = [
    { id: 'A', src: '/gangster-bunny-v1.svg', label: 'A · Long stride (slow)' },
    { id: 'B', src: '/gangster-bunny-v2.svg', label: 'B · Upright sprint (faster)' },
    { id: 'C', src: '/gangster-bunny-v3.svg', label: 'C · Heavy coat billow (slowest)' },
    { id: 'D', src: '/gangster-bunny-v4.svg', label: 'D · Compact runner' },
    { id: 'E', src: '/gangster-bunny-v5.svg', label: 'E · Low tactical run' },
    { id: 'F', src: '/gangster-bunny-v6.svg', label: 'F · Clean silhouette glide' },
  ];

  return (
    <main className="min-h-screen bg-[#1a1a20] text-white p-8 font-mono">
      <h1 className="text-2xl mb-2">Bunny Body Variants (same head)</h1>
      <p className="text-sm text-zinc-400 mb-8">Six different silhouettes, slower animation. Pick A–F.</p>
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
