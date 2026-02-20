export default function BunnyLabPage() {
  const options = [
    { id: 'S', src: '/gangster-bunny-v13b.svg', label: 'S · Sprinter (human knee drive)' },
    { id: 'T', src: '/gangster-bunny-v14b.svg', label: 'T · Upright jog (soft contact)' },
    { id: 'U', src: '/gangster-bunny-v15b.svg', label: 'U · Naruto lean (long stride)' },
    { id: 'V', src: '/gangster-bunny-v16b.svg', label: 'V · Low tactical run' },
    { id: 'W', src: '/gangster-bunny-v17b.svg', label: 'W · Power stride (broader stance)' },
    { id: 'X', src: '/gangster-bunny-v18b.svg', label: 'X · Cinematic slow runner' },
  ];

  return (
    <main className="min-h-screen bg-[#1a1a20] text-white p-8 font-mono">
      <h1 className="text-2xl mb-2">Fresh 6 Variants (New Leg Mechanics)</h1>
      <p className="text-sm text-zinc-400 mb-8">These are rebuilt from scratch with 4-frame cycles and more human leg motion.</p>
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
