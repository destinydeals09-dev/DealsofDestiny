export default function BunnyLabPage() {
  const options = [
    { id: 'Y', src: '/gangster-bunny-v19.svg', label: 'Y · Sprinter lean (4-frame)' },
    { id: 'Z', src: '/gangster-bunny-v20.svg', label: 'Z · Athletic run (4-frame)' },
    { id: 'AA', src: '/gangster-bunny-v21.svg', label: 'AA · Heavy stride (4-frame)' },
    { id: 'AB', src: '/gangster-bunny-v22.svg', label: 'AB · Fast runner (4-frame)' },
    { id: 'AC', src: '/gangster-bunny-v23.svg', label: 'AC · Long coat sprint (4-frame)' },
    { id: 'AD', src: '/gangster-bunny-v24.svg', label: 'AD · Slow cinematic jog (4-frame)' },
  ];

  return (
    <main className="min-h-screen bg-[#1a1a20] text-white p-8 font-mono">
      <h1 className="text-2xl mb-2">New 6 Variants (Rebuilt Human Leg Motion)</h1>
      <p className="text-sm text-zinc-400 mb-8">Ground-up rebuild with 4 key poses: contact, recoil, passing, extension.</p>
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
