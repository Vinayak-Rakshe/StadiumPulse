import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Accessibility, Eye, HelpCircle, Volume2, ShieldAlert, ArrowRight, CheckCircle } from 'lucide-react';

const AccessibilityConcierge = () => {
  const [zones, setZones] = useState([]);
  const [startLoc, setStartLoc] = useState('');
  const [endLoc, setEndLoc] = useState('');
  
  // Accessibility Needs Profiles
  const [profiles, setProfiles] = useState({
    mobility: true, // step-free
    visual: false,  // braille, tactile
    auditory: false, // hearing loops
    sensory: false   // quiet zones
  });

  const [routeResult, setRouteResult] = useState(null);
  const [aiText, setAiText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('Idle. Please select start and end locations.');

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await api.get('/crowd/zones');
        if (res.data.success) {
          setZones(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching zones:', err);
      }
    };
    fetchZones();
  }, []);

  const handleToggleProfile = (profile) => {
    setProfiles(prev => {
      const updated = { ...prev, [profile]: !prev[profile] };
      
      // Update screen reader status announcement
      const labels = {
        mobility: 'Step-free mobility path',
        visual: 'Visual support and tactile markers',
        auditory: 'Auditory support and hearing loops',
        sensory: 'Sensory-friendly quiet routes'
      };
      setStatusMessage(`${labels[profile]} turned ${updated[profile] ? 'on' : 'off'}`);
      return updated;
    });
  };

  const handleCalculateRoute = async (e) => {
    e.preventDefault();
    if (!startLoc || !endLoc) {
      setError('Please select both a start entrance and a destination.');
      return;
    }

    setLoading(true);
    setError('');
    setRouteResult(null);
    setAiText('');
    setStatusMessage('Calculating accessible path...');

    try {
      // Accessibility mode matches the state of mobility requirements
      const response = await api.post('/ai/nav-chat', {
        query: `Compute an accessible route optimized for: ${
          profiles.mobility ? 'Step-free (Ramps/Elevators). ' : ''
        }${profiles.visual ? 'Tactile and Braille markers. ' : ''}${
          profiles.auditory ? 'Hearing loops and text directions. ' : ''
        }${profiles.sensory ? 'Low-noise sensory paths. ' : ''}`,
        startLocation: startLoc,
        endLocation: endLoc,
        accessibleMode: true // strictly enforce step-free pathways
      });

      if (response.data.success) {
        const data = response.data.data;
        if (data.pathData) {
          setRouteResult(data.pathData);
          setAiText(data.responseText);
          setStatusMessage(`Path computed successfully. Route includes ${data.pathData.path.length} steps, with total walking time about ${Math.round(data.pathData.totalDistance / 60)} minutes.`);
        } else {
          setError('No step-free route could be calculated between these two locations. Please notify staff for assistance.');
          setStatusMessage('Path calculation failed.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Server connection error. Please contact administrative staff.');
      setStatusMessage('Path calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Only display accessible zones
  const gates = zones.filter(z => z.type === 'Gate' && z.isAccessible);
  const destinations = zones.filter(z => z.type !== 'Gate' && z.isAccessible);

  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 py-8 flex-1 focus:outline-none" tabIndex="-1">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-stadium-slate to-stadium-card p-6 rounded-2xl border border-stadium-border mb-8 flex items-center gap-4">
        <div className="bg-fifa-gold text-stadium-dark p-3 rounded-full flex items-center justify-center shrink-0">
          <Accessibility className="w-8 h-8" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Accessibility Concierge</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Request custom step-free paths, sensory-friendly zones, and translation support. Fully keyboard-friendly and optimized for assistive devices.
          </p>
        </div>
      </section>

      {/* Screen Reader Live Status Region */}
      <div className="sr-only" aria-live="assertive" role="status">
        {statusMessage}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Form: Parameters & Profile configs */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          <form onSubmit={handleCalculateRoute} className="bg-stadium-slate p-6 rounded-2xl border border-stadium-border flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white border-b border-stadium-border pb-2 mb-2">
              Route Preferences
            </h2>

            {/* Profile selectors */}
            <fieldset className="border border-stadium-border/40 p-4 rounded-xl">
              <legend className="text-xs font-medium text-slate-300 px-2">Select Assistance Features</legend>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => handleToggleProfile('mobility')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-fifa-gold ${
                    profiles.mobility 
                      ? 'bg-fifa-green/10 border-fifa-green text-fifa-green shadow-sm' 
                      : 'bg-stadium-dark border-stadium-border text-slate-400 hover:text-white'
                  }`}
                  aria-pressed={profiles.mobility}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Step-Free Path</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleProfile('visual')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-fifa-gold ${
                    profiles.visual 
                      ? 'bg-fifa-green/10 border-fifa-green text-fifa-green shadow-sm' 
                      : 'bg-stadium-dark border-stadium-border text-slate-400 hover:text-white'
                  }`}
                  aria-pressed={profiles.visual}
                >
                  <Eye className="w-4 h-4" />
                  <span>Braille & Tactile</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleProfile('auditory')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-fifa-gold ${
                    profiles.auditory 
                      ? 'bg-fifa-green/10 border-fifa-green text-fifa-green shadow-sm' 
                      : 'bg-stadium-dark border-stadium-border text-slate-400 hover:text-white'
                  }`}
                  aria-pressed={profiles.auditory}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Hearing Loops</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleProfile('sensory')}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-fifa-gold ${
                    profiles.sensory 
                      ? 'bg-fifa-green/10 border-fifa-green text-fifa-green shadow-sm' 
                      : 'bg-stadium-dark border-stadium-border text-slate-400 hover:text-white'
                  }`}
                  aria-pressed={profiles.sensory}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Sensory Friendly</span>
                </button>
              </div>
            </fieldset>

            {/* Select locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="acc-start-select" className="block text-xs font-medium text-slate-300 mb-1">Start Entrance</label>
                <select
                  id="acc-start-select"
                  value={startLoc}
                  onChange={(e) => setStartLoc(e.target.value)}
                  className="w-full bg-stadium-dark border border-stadium-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-fifa-gold"
                >
                  <option value="">Choose Accessible Gate</option>
                  {gates.map(g => (
                    <option key={g._id} value={g.name}>{g.name} - {g.accessibleFeatures.join(', ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="acc-end-select" className="block text-xs font-medium text-slate-300 mb-1">Destination Facility</label>
                <select
                  id="acc-end-select"
                  value={endLoc}
                  onChange={(e) => setEndLoc(e.target.value)}
                  className="w-full bg-stadium-dark border border-stadium-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-fifa-gold"
                >
                  <option value="">Choose Facility</option>
                  {destinations.map(d => (
                    <option key={d._id} value={d.name}>{d.name} ({d.type})</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !startLoc || !endLoc}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-amber-500 ${
                loading || !startLoc || !endLoc
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-fifa-green hover:bg-fifa-greenDark text-stadium-dark shadow-lg hover:scale-[1.01]'
              }`}
            >
              {loading ? "Calculating..." : "Find Accessible Route"}
            </button>
          </form>

          {/* Results Panel */}
          {(routeResult || error) && (
            <section className="bg-stadium-slate p-6 rounded-2xl border border-stadium-border flex flex-col gap-4 animate-fadeIn">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white border-b border-stadium-border pb-2">
                Your Accessible Directions
              </h2>

              {error && (
                <div className="bg-fifa-red/10 border border-fifa-red/30 p-4 rounded-xl flex gap-3 text-xs text-fifa-red">
                  <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              {routeResult && (
                <div className="space-y-4">
                  {/* Visually draw path */}
                  <div className="bg-stadium-dark/40 p-4 rounded-xl border border-stadium-border/60">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Step-Free Node Chain</div>
                    <div className="flex flex-wrap items-center gap-2">
                      {routeResult.path.map((node, index) => (
                        <React.Fragment key={index}>
                          <span className="bg-fifa-green/10 text-fifa-green px-2 py-1 rounded text-xs border border-fifa-green/20">
                            {node}
                          </span>
                          {index < routeResult.path.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* AI Natural language tips */}
                  <div className="bg-stadium-dark/20 p-4 rounded-xl border border-stadium-border/40 text-xs leading-relaxed text-slate-200 whitespace-pre-line font-mono">
                    {aiText}
                  </div>
                </div>
              )}
            </section>
          )}

        </div>

        {/* Right Info: Static Helpful Resources */}
        <div className="flex flex-col gap-6">
          <section className="bg-stadium-slate p-5 rounded-2xl border border-stadium-border" aria-labelledby="amenities-heading">
            <h2 id="amenities-heading" className="text-sm font-semibold uppercase tracking-wider text-white border-b border-stadium-border pb-2 mb-3">
              Accessible Amenities
            </h2>
            <ul className="space-y-4 text-xs">
              <li className="bg-stadium-card p-3 rounded-xl border border-stadium-border/60">
                <strong className="text-fifa-gold block mb-1">Sensory-Friendly Space</strong>
                <p className="text-slate-400">Located near Section 102. Open to families needing a low-noise, tactile environment.</p>
              </li>
              <li className="bg-stadium-card p-3 rounded-xl border border-stadium-border/60">
                <strong className="text-fifa-gold block mb-1">Wheelchair Rentals & Ramps</strong>
                <p className="text-slate-400">Available at Guest Services booths located adjacent to Gate 1 and Gate 2 main entry hubs.</p>
              </li>
              <li className="bg-stadium-card p-3 rounded-xl border border-stadium-border/60">
                <strong className="text-fifa-gold block mb-1">Assistive Hearing Devices</strong>
                <p className="text-slate-400">Hearing loop loops broadcast on frequency 88.5 FM across the seating bowl and concourses.</p>
              </li>
            </ul>
          </section>
        </div>

      </div>
    </main>
  );
};

export default AccessibilityConcierge;
