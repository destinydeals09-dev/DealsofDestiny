export default function BunnyLabPage() {
  const options = [
    { id: 'AK', src: '/gangster-bunny-v31.svg', label: 'AK · Ultra-lean ninja' },
    { id: 'AL', src: '/gangster-bunny-v32.svg', label: 'AL · Bulky trench brute' },
    { id: 'AM', src: '/gangster-bunny-v33.svg', label: 'AM · Upright sprinter' },
    { id: 'AN', src: '/gangster-bunny-v34.svg', label: 'AN · Low crouch dash' },
    { id: 'AO', src: '/gangster-bunny-v35.svg', label: 'AO · Long-coat streamer' },
    { id: 'AP', src: '/gangster-bunny-v36.svg', label: 'AP · Compact tactical run' },
  ];

  return (
    <main className="min-h-screen bg-[#1a1a20] text-white p-8 font-mono">
      <h1 className="text-2xl mb-2">Very Different Silhouette Set (AK–AP)</h1>
      <p className="text-sm text-zinc-400 mb-8">Deliberately varied body types and run styles. Pick one base and I’ll polish final.</p>
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
