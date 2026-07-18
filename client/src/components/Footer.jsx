import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Leaf, Award, Recycle } from 'lucide-react';

const Footer = () => {
  const [susData, setSusData] = useState(null);
  const [susSummary, setSusSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSustainability = async () => {
      try {
        const res = await api.get('/crowd/sustainability');
        if (res.data.success && res.data.data) {
          setSusData(res.data.data);
          
          // Request GenAI suggestion summary
          const summaryRes = await api.post('/ai/sustainability-summary');
          if (summaryRes.data.success) {
            setSusSummary(summaryRes.data.data.summary);
          }
        }
      } catch (err) {
        console.error('Error fetching sustainability logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSustainability();
  }, []);

  return (
    <footer className="bg-stadium-dark border-t border-stadium-border py-8 px-4 mt-auto" role="contentinfo" aria-label="Footer Area">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Footprint Summary */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-fifa-green font-semibold">
            <Leaf className="w-5 h-5" aria-hidden="true" />
            <h2 className="text-sm uppercase tracking-wider font-bold">Green Operations</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            StadiumPulse is committed to reducing environmental footprints during the FIFA World Cup 2026. Water, energy, and waste outputs are tracked and audited live by GenAI.
          </p>
        </div>

        {/* Live Energy/Recycling stats */}
        <div className="bg-stadium-slate/40 p-4 rounded-xl border border-stadium-border/60 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-200 font-medium text-xs uppercase tracking-wider">
            <Recycle className="w-4 h-4 text-fifa-gold" aria-hidden="true" />
            <span>Today's Green Scoreboard</span>
          </div>
          {loading ? (
            <div className="h-10 bg-slate-800/40 animate-pulse rounded"></div>
          ) : susData ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-stadium-dark/40 p-2 rounded">
                <div className="text-sm font-bold text-fifa-green">{susData.recyclingRatePercent}%</div>
                <div className="text-[10px] text-slate-500 uppercase">Recycled</div>
              </div>
              <div className="bg-stadium-dark/40 p-2 rounded">
                <div className="text-sm font-bold text-white">{(susData.energyUsageKwh / 1000).toFixed(1)}k</div>
                <div className="text-[10px] text-slate-500 uppercase">MWh Used</div>
              </div>
              <div className="bg-stadium-dark/40 p-2 rounded">
                <div className="text-sm font-bold text-white">{(susData.waterUsageLitres / 1000).toFixed(1)}k</div>
                <div className="text-[10px] text-slate-500 uppercase">m³ Water</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">No active sustainability metrics.</div>
          )}
        </div>

        {/* GenAI Sustainability Tip */}
        <div className="bg-stadium-slate/40 p-4 rounded-xl border border-stadium-border/60 flex flex-col gap-1 text-xs">
          <div className="text-fifa-green font-semibold flex items-center gap-1.5 mb-1">
            <Award className="w-4 h-4" />
            <span>AI Sustainability Tips</span>
          </div>
          {loading ? (
            <div className="space-y-1">
              <div className="h-3 bg-slate-800 animate-pulse rounded w-3/4"></div>
              <div className="h-3 bg-slate-800 animate-pulse rounded w-1/2"></div>
            </div>
          ) : (
            <p className="text-slate-300 leading-relaxed font-mono whitespace-pre-line text-[11px]">
              {susSummary || "Promote refill cups at West Concourse kiosks to offset single-use plastic cups."}
            </p>
          )}
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-stadium-border/40 text-center text-[10px] text-slate-500">
        <p>&copy; {new Date().getFullYear()} StadiumPulse. Built for FIFA World Cup 2026 Tournament Operations. WCAG 2.1 AA Compliant.</p>
      </div>
    </footer>
  );
};

export default Footer;
