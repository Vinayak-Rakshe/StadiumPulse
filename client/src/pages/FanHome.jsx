import React, { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import api from '../utils/api';
import { Calendar, Compass, ArrowRight, Eye, AlertCircle, Info } from 'lucide-react';

const FanHome = () => {
  const [zones, setZones] = useState([]);
  const [matches, setMatches] = useState([]);
  const [startLoc, setStartLoc] = useState('');
  const [endLoc, setEndLoc] = useState('');
  const [accMode, setAccMode] = useState(false);
  const [computedPath, setComputedPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zonesRes, matchesRes] = await Promise.all([
          api.get('/crowd/zones'),
          api.get('/crowd/matches')
        ]);
        
        if (zonesRes.data.success) setZones(zonesRes.data.data);
        if (matchesRes.data.success) setMatches(matchesRes.data.data);
      } catch (err) {
        console.error('Error fetching fan home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePathSelect = (pathData) => {
    setComputedPath(pathData);
  };

  const gates = zones.filter(z => z.type === 'Gate');
  const destinations = zones.filter(z => z.type !== 'Gate');

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex-1 focus:outline-none">
      
      {/* Welcome Banner */}
      <section className="mb-8 text-center sm:text-left relative overflow-hidden bg-gradient-to-r from-stadium-slate to-stadium-dark p-6 rounded-2xl border border-stadium-border bg-pulse-glow" aria-label="Welcome">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
          Welcome to the <span className="text-fifa-green">FIFA World Cup 2026</span> Operations
        </h1>
        <p className="text-sm text-slate-300 max-w-xl">
          StadiumPulse GenAI is your smart assistant. Compute safe routes, read crowd warnings, and ask our concierge for directions in your native language.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Match Schedule & Navigation Setup */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Match Widget */}
          <section className="bg-stadium-slate p-5 rounded-2xl border border-stadium-border" aria-labelledby="matchday-heading">
            <div className="flex items-center gap-2 text-fifa-green mb-4">
              <Calendar className="w-5 h-5" aria-hidden="true" />
              <h2 id="matchday-heading" className="text-sm font-semibold uppercase tracking-wider text-white">Live Matches & Schedule</h2>
            </div>
            
            {loading ? (
              <div className="space-y-3" aria-label="Loading matches">
                <div className="h-12 bg-stadium-card/60 animate-pulse rounded-xl"></div>
                <div className="h-12 bg-stadium-card/60 animate-pulse rounded-xl"></div>
              </div>
            ) : matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((m) => (
                  <div key={m._id} className="bg-stadium-card p-3 rounded-xl border border-stadium-border/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-100">{m.teams}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(m.date).toLocaleDateString()} @ {m.time}</div>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
                      m.status === 'Live' ? 'bg-fifa-red/20 text-fifa-red border border-fifa-red/30 animate-pulse' :
                      m.status === 'Completed' ? 'bg-slate-700/30 text-slate-400 border border-slate-700/40' :
                      'bg-fifa-gold/15 text-fifa-gold border border-fifa-gold/30'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No matches scheduled.</p>
            )}
          </section>

          {/* Quick Route Calculator */}
          <section className="bg-stadium-slate p-5 rounded-2xl border border-stadium-border" aria-labelledby="route-heading">
            <div className="flex items-center gap-2 text-fifa-gold mb-4">
              <Compass className="w-5 h-5" aria-hidden="true" />
              <h2 id="route-heading" className="text-sm font-semibold uppercase tracking-wider text-white">Stadium Router</h2>
            </div>
            <div className="space-y-4">
              
              <div>
                <label htmlFor="start-select" className="block text-xs font-medium text-slate-300 mb-1.5">Where are you? (Start)</label>
                <select
                  id="start-select"
                  value={startLoc}
                  onChange={(e) => {
                    setStartLoc(e.target.value);
                    setComputedPath(null);
                  }}
                  className="w-full bg-stadium-dark border border-stadium-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-fifa-gold transition-colors"
                >
                  <option value="">Select Entrance Gate</option>
                  {gates.map(g => (
                    <option key={g._id} value={g.name}>{g.name} - {g.accessibleFeatures.join(', ') || 'Standard'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="end-select" className="block text-xs font-medium text-slate-300 mb-1.5">Where is your ticket? (Destination)</label>
                <select
                  id="end-select"
                  value={endLoc}
                  onChange={(e) => {
                    setEndLoc(e.target.value);
                    setComputedPath(null);
                  }}
                  className="w-full bg-stadium-dark border border-stadium-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-fifa-gold transition-colors"
                >
                  <option value="">Select Facility / Seat Block</option>
                  {destinations.map(d => (
                    <option key={d._id} value={d.name}>{d.name} ({d.type})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  id="acc-checkbox"
                  type="checkbox"
                  checked={accMode}
                  onChange={(e) => {
                    setAccMode(e.target.checked);
                    setComputedPath(null);
                  }}
                  className="w-4 h-4 rounded text-fifa-gold bg-stadium-dark border-stadium-border focus:ring-fifa-gold"
                />
                <label htmlFor="acc-checkbox" className="text-xs text-slate-200 cursor-pointer">
                  Request step-free access route (ramps & elevators only)
                </label>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal flex gap-1.5 items-start">
                <Info className="w-4 h-4 text-fifa-gold shrink-0 mt-0.5" />
                <span>Selecting parameters feeds node paths to the AI model. To navigate, select routes then click the Send button in the chatbot.</span>
              </p>

            </div>
          </section>

          {/* Visual Route Path Map (Hidden if no path computed) */}
          {computedPath && (
            <section className="bg-stadium-slate p-5 rounded-2xl border border-stadium-border" aria-labelledby="map-heading">
              <h2 id="map-heading" className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Live Path Visualizer</h2>
              
              <div className="flex flex-col gap-2 bg-stadium-dark/50 p-4 rounded-xl border border-stadium-border/60">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 border-b border-stadium-border/40 pb-2">
                  <span>Start: <strong className="text-white">{startLoc}</strong></span>
                  <span>End: <strong className="text-white">{endLoc}</strong></span>
                </div>

                {/* Draw graphical steps */}
                <div className="flex flex-wrap items-center gap-2">
                  {computedPath.path.map((node, i) => (
                    <React.Fragment key={i}>
                      <span className="bg-stadium-card px-2.5 py-1.5 rounded-lg border border-stadium-border/80 text-[10px] font-mono text-fifa-green">
                        {node}
                      </span>
                      {i < computedPath.path.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 animate-pulse shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="text-[10px] text-slate-400 mt-3 flex items-center justify-between">
                  <span>Duration: <strong>{~~(computedPath.totalDistance / 60)} min walk</strong></span>
                  <span className="capitalize text-fifa-gold font-mono">
                    Mode: {computedPath.accessibleOnly ? "♿ Step-Free Only" : "🚶 Standard"}
                  </span>
                </div>
              </div>
            </section>
          )}

        </div>

        {/* Right Side: Chat Concierge */}
        <div className="lg:col-span-7">
          <ChatWindow
            apiEndpoint="/ai/nav-chat"
            extraParams={{
              startLocation: startLoc,
              endLocation: endLoc,
              accessibleMode: accMode
            }}
            placeholderText={
              startLoc && endLoc 
                ? `Ask directions from ${startLoc} to ${endLoc}...` 
                : "Ask for stadium directions, nearest restrooms or gate info..."
            }
            title="StadiumPulse AI Fan Concierge"
            roleContext="Fan"
            onReceivePath={handlePathSelect}
          />
        </div>

      </div>
    </main>
  );
};

export default FanHome;
