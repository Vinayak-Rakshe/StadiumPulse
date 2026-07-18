import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import CustomChart from '../components/CustomChart';
import { ShieldAlert, RefreshCw, Plus, Users, LayoutGrid, Info } from 'lucide-react';

const OrganizerDashboard = () => {
  const [zones, setZones] = useState([]);
  const [aiBulletin, setAiBulletin] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const fetchDashboardData = async (shouldLoadAlerts = true) => {
    try {
      const res = await api.get('/crowd/zones');
      if (res.data.success) {
        setZones(res.data.data);
      }
      
      if (shouldLoadAlerts) {
        setLoadingAlerts(true);
        const aiRes = await api.post('/ai/crowd-summary');
        if (aiRes.data.success) {
          setAiBulletin(aiRes.data.data.summary);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    } finally {
      setLoading(false);
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
  }, []);

  // Simulator: Mutate current occupancy in MongoDB
  const handleSimulateArrivals = async (zoneId, currentOccupancy, increment) => {
    setUpdating(true);
    try {
      const newCount = currentOccupancy + increment;
      const res = await api.put(`/crowd/zones/${zoneId}`, { currentOccupancy: newCount });
      if (res.data.success) {
        // Re-fetch zones and recalculate AI alert summary
        await fetchDashboardData(true);
      }
    } catch (err) {
      console.error('Error updating occupancy:', err);
      alert('Failed to simulate crowd arrival. Make sure you are logged in as Organizer/Staff.');
    } finally {
      setUpdating(false);
    }
  };

  const handleManualRefresh = () => {
    fetchDashboardData(true);
  };

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex-1 focus:outline-none" tabIndex="-1">
      
      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8" aria-label="Dashboard controls">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Operations Control Room</h1>
          <p className="text-xs text-slate-300">Live stadium crowd density monitoring, simulator controls, and GenAI advisory alerts.</p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={loading || updating}
          className="flex items-center gap-1.5 px-4 py-2 bg-stadium-card hover:bg-stadium-border text-xs font-semibold text-slate-200 border border-stadium-border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-fifa-gold disabled:opacity-50"
          aria-label="Refresh live crowd metrics"
        >
          <RefreshCw className={`w-4 h-4 ${loading || updating ? 'animate-spin' : ''}`} />
          <span>Sync Live Feeds</span>
        </button>
      </section>

      {/* AI Crowd Alert Banner */}
      <section className="mb-8" aria-labelledby="ai-bulletin-heading">
        <div className="bg-gradient-to-r from-stadium-slate to-stadium-card rounded-2xl border border-stadium-border overflow-hidden">
          <div className="bg-stadium-card px-5 py-3 border-b border-stadium-border flex items-center justify-between">
            <h2 id="ai-bulletin-heading" className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-fifa-gold animate-bounce" />
              <span>GenAI Command Advisory Bulletin</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Real-Time Synthesis</span>
          </div>
          
          <div className="p-5">
            {loadingAlerts ? (
              <div className="space-y-2" aria-label="Loading AI alerts">
                <div className="h-4 bg-slate-800 animate-pulse rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 animate-pulse rounded w-5/6"></div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-line">
                {aiBulletin || "All gates and zones operating within safe parameters. Select Simulation arrival targets below to congest sections."}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Recharts graph & simulator triggers */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Recharts card */}
          <section className="bg-stadium-slate p-6 rounded-2xl border border-stadium-border" aria-labelledby="chart-heading">
            <h3 id="chart-heading" className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Congestion Density Index</h3>
            {loading ? (
              <div className="h-64 bg-stadium-card/40 animate-pulse rounded-xl" aria-label="Loading chart data"></div>
            ) : (
              <CustomChart data={zones} />
            )}
          </section>

          {/* Simulation controls */}
          <section className="bg-stadium-slate p-6 rounded-2xl border border-stadium-border" aria-labelledby="simulator-heading">
            <div className="flex items-center gap-2 mb-2 text-fifa-green">
              <Users className="w-5 h-5" />
              <h3 id="simulator-heading" className="text-sm font-semibold uppercase tracking-wider text-white">Live Crowd Density Simulator</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Inject simulated attendee arrival blocks to mimic crowd surges during matchday operations. Increasing occupancies over 85% changes Recharts colors and updates AI advisories.
            </p>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-16 bg-stadium-card/40 animate-pulse rounded-xl"></div>
                <div className="h-16 bg-stadium-card/40 animate-pulse rounded-xl"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {zones
                  .filter(z => z.type === 'Gate' || z.name === 'Zone B')
                  .map(z => (
                    <div key={z._id} className="bg-stadium-card p-4 rounded-xl border border-stadium-border/60 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-white">{z.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Capacity: {z.currentOccupancy}/{z.capacity} (~{Math.round(z.density)}%)</div>
                      </div>
                      
                      <button
                        onClick={() => handleSimulateArrivals(z._id, z.currentOccupancy, 300)}
                        disabled={updating}
                        className="bg-fifa-green hover:bg-fifa-greenDark text-stadium-dark px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-fifa-gold disabled:opacity-50 transition-all hover:scale-105"
                        aria-label={`Simulate adding 300 fans to ${z.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Surge</span>
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </section>

        </div>

        {/* Right: Zone stats breakdown */}
        <div className="lg:col-span-4">
          <section className="bg-stadium-slate p-5 rounded-2xl border border-stadium-border h-full flex flex-col" aria-labelledby="breakdown-heading">
            <div className="flex items-center gap-2 text-slate-200 border-b border-stadium-border pb-3 mb-4">
              <LayoutGrid className="w-5 h-5 text-fifa-gold" />
              <h3 id="breakdown-heading" className="text-sm font-semibold uppercase tracking-wider text-white">Zone Breakdown</h3>
            </div>

            {loading ? (
              <div className="space-y-3 flex-1">
                <div className="h-10 bg-stadium-card/60 animate-pulse rounded-xl"></div>
                <div className="h-10 bg-stadium-card/60 animate-pulse rounded-xl"></div>
                <div className="h-10 bg-stadium-card/60 animate-pulse rounded-xl"></div>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[500px] flex-1 pr-1">
                {zones.map((z) => (
                  <div key={z._id} className="bg-stadium-card p-3 rounded-xl border border-stadium-border/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-100 block">{z.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{z.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-200">{z.currentOccupancy}</div>
                      <span className={`text-[9px] font-mono font-bold ${
                        z.density >= 85 ? 'text-fifa-red' :
                        z.density >= 65 ? 'text-fifa-gold' :
                        'text-fifa-green'
                      }`}>
                        {Math.round(z.density)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

      </div>
    </main>
  );
};

export default OrganizerDashboard;
