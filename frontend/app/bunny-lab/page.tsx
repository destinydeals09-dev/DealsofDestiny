export default function BunnyLabPage() {
  const options = [
    { id: 'A', src: '/gangster-bunny-v1.svg', label: 'Option A · Balanced sprint' },
    { id: 'B', src: '/gangster-bunny-v2.svg', label: 'Option B · Upright fast run' },
    { id: 'C', src: '/gangster-bunny-v3.svg', label: 'Option C · Aggressive Naruto lean' },
  ];

  return (
    <main className="min-h-screen bg-[#111114] text-white p-8 font-mono">
      <h1 className="text-2xl mb-2">Bunny Body Variants (same head)</h1>
      <p className="text-sm text-zinc-400 mb-8">Pick A, B, or C and I’ll lock it into the header.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((o) => (
          <div key={o.id} className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/60">
            <p className="mb-3 text-terminal-green">{o.label}</p>
            <div className="h-40 flex items-center justify-center bg-zinc-800/60 rounded">
              <img src={o.src} alt={o.label} className="h-32 w-32 object-contain" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
