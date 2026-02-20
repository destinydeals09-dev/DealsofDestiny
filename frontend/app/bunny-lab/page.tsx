export default function BunnyLabPage() {
  const options = [
    { id: 'M', src: '/gangster-bunny-v13.svg', label: 'M · Sprinter lean, high knee drive' },
    { id: 'N', src: '/gangster-bunny-v14.svg', label: 'N · Upright jog, relaxed gait' },
    { id: 'O', src: '/gangster-bunny-v15.svg', label: 'O · Tactical dash, compact steps' },
    { id: 'P', src: '/gangster-bunny-v16.svg', label: 'P · Fast crossover stride' },
    { id: 'Q', src: '/gangster-bunny-v17.svg', label: 'Q · Power run, broad torso' },
    { id: 'R', src: '/gangster-bunny-v18.svg', label: 'R · Slow cinematic runner' },
  ];

  return (
    <main className="min-h-screen bg-[#1a1a20] text-white p-8 font-mono">
      <h1 className="text-2xl mb-2">New 6 Bunny Variants (Human-Like Leg Motion)</h1>
      <p className="text-sm text-zinc-400 mb-8">Fresh set M–R with more human leg mechanics and smoother timing.</p>
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
