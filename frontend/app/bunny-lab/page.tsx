export default function BunnyLabPage() {
  const options = [
    { id: 'BA', src: '/gangster-bunny-v37.svg', label: 'BA · Neutral bob · medium speed' },
    { id: 'BB', src: '/gangster-bunny-v38.svg', label: 'BB · Forward tilt · fast' },
    { id: 'BC', src: '/gangster-bunny-v39.svg', label: 'BC · Left lean · slow' },
    { id: 'BD', src: '/gangster-bunny-v40.svg', label: 'BD · Right lean · medium-fast' },
    { id: 'BE', src: '/gangster-bunny-v41.svg', label: 'BE · Deep bob · slow' },
    { id: 'BF', src: '/gangster-bunny-v42.svg', label: 'BF · Micro bob · very fast' },
  ];

  return (
    <main className="min-h-screen bg-[#1a1a20] text-white p-8 font-mono">
      <h1 className="text-2xl mb-2">Head-Only Bob Variants (No Body)</h1>
      <p className="text-sm text-zinc-400 mb-8">Six versions with different head angles + bob speeds.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((o) => (
          <div key={o.id} className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/60">
            <p className="mb-3 text-terminal-green">{o.label}</p>
            <div className="h-40 flex items-center justify-center bg-zinc-800/60 rounded">
              <img src={o.src} alt={o.label} className="h-28 w-28 object-contain" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
