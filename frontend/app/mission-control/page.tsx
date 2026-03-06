'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type ScraperLog = {
  id: number;
  source: string;
  status: string;
  deals_scraped: number;
  deals_inserted: number;
  deals_updated: number;
  run_time_seconds: number | null;
  started_at: string;
};

type DealLite = {
  id: number;
  category: string | null;
  active: boolean;
  is_verified: boolean | null;
  product_url: string | null;
};

const TARGET_CATEGORIES = ['fashion', 'beauty', 'tech', 'home', 'kitchen', 'fitness', 'toys', 'books'];

function isLikelyBadUrl(url: string | null | undefined) {
  if (!url) return true;
  const lower = url.toLowerCase();
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) return true;
  if (lower.includes('slickdeals.net') || lower.includes('reddit.com') || lower.includes('redd.it')) return true;
  return false;
}

export default function MissionControlPage() {
  const [loading, setLoading] = useState(true);
  const [latestRuns, setLatestRuns] = useState<ScraperLog[]>([]);
  const [activeDeals, setActiveDeals] = useState<DealLite[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [logsRes, dealsRes] = await Promise.all([
          supabase
            .from('scraper_logs')
            .select('id,source,status,deals_scraped,deals_inserted,deals_updated,run_time_seconds,started_at')
            .order('started_at', { ascending: false })
            .limit(12),
          supabase
            .from('deals')
            .select('id,category,active,is_verified,product_url')
            .eq('active', true)
            .limit(5000)
        ]);

        if (logsRes.error) throw logsRes.error;
        if (dealsRes.error) throw dealsRes.error;

        setLatestRuns((logsRes.data || []) as ScraperLog[]);
        setActiveDeals((dealsRes.data || []) as DealLite[]);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load mission control data');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const summary = useMemo(() => {
    const byCategory: Record<string, number> = Object.fromEntries(TARGET_CATEGORIES.map(c => [c, 0]));

    let verified = 0;
    let unverified = 0;
    let badUrls = 0;

    for (const d of activeDeals) {
      const c = (d.category || '').toLowerCase();
      if (byCategory[c] !== undefined) byCategory[c] += 1;

      if (d.is_verified === true) verified += 1;
      else unverified += 1;

      if (isLikelyBadUrl(d.product_url)) badUrls += 1;
    }

    return {
      total: activeDeals.length,
      byCategory,
      verified,
      unverified,
      badUrls
    };
  }, [activeDeals]);

  const runHealth = useMemo(() => {
    if (!latestRuns.length) return { status: 'unknown', text: 'No run data yet' };

    const recent = latestRuns.slice(0, 8);
    const failed = recent.filter(r => r.status !== 'success').length;
    if (failed >= 3) return { status: 'bad', text: `${failed}/${recent.length} recent runs failed` };
    if (failed > 0) return { status: 'warn', text: `${failed}/${recent.length} recent runs failed` };
    return { status: 'good', text: 'Recent runs look healthy' };
  }, [latestRuns]);

  const latestRun = latestRuns[0];

  return (
    <main className="min-h-screen bg-background text-foreground font-mono p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border border-[#252529] bg-surface/60 p-4 rounded">
          <div>
            <h1 className="text-2xl text-terminal-green font-bold">MISSION CONTROL</h1>
            <p className="text-sm text-muted">Realtime ops snapshot for Deals of Destiny</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="px-3 py-2 text-xs border border-terminal-green text-terminal-green rounded hover:bg-terminal-green hover:text-black transition-colors">
              OPEN LIVE SITE
            </Link>
            <button onClick={() => location.reload()} className="px-3 py-2 text-xs border border-[#3a3a3f] text-muted rounded hover:border-terminal-green hover:text-terminal-green transition-colors">
              REFRESH SNAPSHOT
            </button>
          </div>
        </header>

        {loading ? (
          <div className="border border-[#252529] bg-surface/40 p-4 rounded text-muted">Loading mission data...</div>
        ) : error ? (
          <div className="border border-red-500/40 bg-red-900/20 p-4 rounded text-red-300">{error}</div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card title="Active Deals" value={summary.total.toString()} hint="Current active inventory" />
              <Card title="Verified Prices" value={summary.verified.toString()} hint="is_verified = true" />
              <Card title="Unverified Prices" value={summary.unverified.toString()} hint="Needs verification pipeline" />
              <Card title="Bad URL Heuristic" value={summary.badUrls.toString()} hint="Missing/aggregator/non-http URLs" />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[#252529] bg-surface/40 p-4 rounded">
                <h2 className="text-terminal-green font-bold mb-3">Scraper Status</h2>
                <p className="text-sm mb-1">Latest run: {latestRun ? new Date(latestRun.started_at).toLocaleString() : '—'}</p>
                <p className="text-sm mb-2">Latest source: {latestRun?.source || '—'} ({latestRun?.status || '—'})</p>
                <p className={`text-sm ${runHealth.status === 'good' ? 'text-green-400' : runHealth.status === 'warn' ? 'text-yellow-300' : 'text-red-300'}`}>
                  {runHealth.text}
                </p>
              </div>

              <div className="border border-[#252529] bg-surface/40 p-4 rounded">
                <h2 className="text-terminal-green font-bold mb-3">Category Coverage</h2>
                <div className="space-y-1 text-sm">
                  {TARGET_CATEGORIES.map(c => (
                    <div key={c} className="flex justify-between border-b border-[#252529] py-1">
                      <span className="uppercase text-muted">{c}</span>
                      <span>{summary.byCategory[c] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="border border-[#252529] bg-surface/40 p-4 rounded">
              <h2 className="text-terminal-green font-bold mb-3">Recent Scraper Runs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted border-b border-[#252529]">
                      <th className="py-2 pr-2">Time</th>
                      <th className="py-2 pr-2">Source</th>
                      <th className="py-2 pr-2">Status</th>
                      <th className="py-2 pr-2">Scraped</th>
                      <th className="py-2 pr-2">New</th>
                      <th className="py-2 pr-2">Updated</th>
                      <th className="py-2 pr-2">Run Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestRuns.map(run => (
                      <tr key={run.id} className="border-b border-[#252529]">
                        <td className="py-2 pr-2">{new Date(run.started_at).toLocaleString()}</td>
                        <td className="py-2 pr-2">{run.source}</td>
                        <td className={`py-2 pr-2 ${run.status === 'success' ? 'text-green-400' : 'text-red-300'}`}>{run.status}</td>
                        <td className="py-2 pr-2">{run.deals_scraped ?? 0}</td>
                        <td className="py-2 pr-2">{run.deals_inserted ?? 0}</td>
                        <td className="py-2 pr-2">{run.deals_updated ?? 0}</td>
                        <td className="py-2 pr-2">{run.run_time_seconds ?? 0}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="border border-[#252529] bg-surface/40 p-4 rounded">
      <p className="text-xs uppercase text-muted tracking-wide">{title}</p>
      <p className="text-2xl text-terminal-green font-bold mt-1">{value}</p>
      <p className="text-xs text-muted mt-1">{hint}</p>
    </div>
  );
}
