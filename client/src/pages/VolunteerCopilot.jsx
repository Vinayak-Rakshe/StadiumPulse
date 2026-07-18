import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ChatWindow from '../components/ChatWindow';
import { HelpCircle, Shield, FileText, ArrowRight } from 'lucide-react';

const VolunteerCopilot = () => {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedQuery, setSuggestedQuery] = useState('');

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const res = await api.get('/protocols');
        if (res.data.success) {
          setProtocols(res.data.data);
        }
      } catch (err) {
        console.error('Error loading protocols:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProtocols();
  }, []);

  const handleQuickQuestionClick = (topic) => {
    let question = "";
    if (topic === 'Medical Emergency') question = "What do I do if someone collapses with a medical injury?";
    else if (topic === 'Lost Child') question = "What are the lost child guidelines?";
    else if (topic === 'Ticketing Issue') question = "How do I deal with a scanner barcode error?";
    else if (topic === 'Severe Weather Warning') question = "Severe weather procedures";
    else question = `What are the rules for ${topic}?`;

    // Target chat input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.value = question;
      // Set input event trigger for React
      const e = new Event('input', { bubbles: true });
      chatInput.dispatchEvent(e);
      chatInput.focus();
    }
  };

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex-1 focus:outline-none" tabIndex="-1">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-stadium-slate to-stadium-card p-6 rounded-2xl border border-stadium-border mb-8 flex items-center gap-4">
        <div className="bg-fifa-green text-stadium-dark p-3 rounded-full flex items-center justify-center shrink-0">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Volunteer Operational Copilot</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Ask security, medical, and assistance queries. Our AI retrieves matching protocol guidelines and answers with actionable step-by-step checklists.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: List of protocols & Quick buttons */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick Help Questions */}
          <section className="bg-stadium-slate p-5 rounded-2xl border border-stadium-border" aria-labelledby="quick-help-heading">
            <h2 id="quick-help-heading" className="text-sm font-semibold uppercase tracking-wider text-white border-b border-stadium-border pb-2 mb-4">
              Quick Query Triggers
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-normal">
              Click a topic to populate the chat. The GenAI copilot matches it against database protocols.
            </p>
            
            {loading ? (
              <div className="space-y-2">
                <div className="h-10 bg-slate-800 animate-pulse rounded"></div>
                <div className="h-10 bg-slate-800 animate-pulse rounded"></div>
              </div>
            ) : protocols.length > 0 ? (
              <div className="flex flex-col gap-2">
                {protocols.map(p => (
                  <button
                    key={p._id}
                    onClick={() => handleQuickQuestionClick(p.topic)}
                    className="p-3 rounded-xl bg-stadium-card border border-stadium-border/60 text-slate-200 text-xs font-semibold hover:border-fifa-green hover:text-white transition-all text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-fifa-gold hover:scale-[1.01]"
                  >
                    <span>{p.topic}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No official protocols registered.</p>
            )}
          </section>

          {/* Protocols Index Details */}
          <section className="bg-stadium-slate p-5 rounded-2xl border border-stadium-border" aria-labelledby="index-heading">
            <div className="flex items-center gap-1.5 text-fifa-gold mb-3">
              <FileText className="w-5 h-5" />
              <h2 id="index-heading" className="text-xs font-semibold uppercase tracking-wider text-white">RAG Protocol Index</h2>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal mb-3">
              StadiumPulse uses keyword matching (Retrieval-Augmented Generation) on these topics. Keywords:
            </p>
            <div className="space-y-2.5">
              {protocols.map(p => (
                <div key={p._id} className="text-[10px] bg-stadium-dark/40 p-2 rounded border border-stadium-border/40">
                  <div className="font-bold text-slate-200">{p.topic}</div>
                  <div className="text-slate-500 mt-1 flex flex-wrap gap-1">
                    {p.keywords.map((kw, i) => (
                      <span key={i} className="bg-stadium-card px-1 py-0.5 rounded text-slate-400 border border-stadium-border/20">{kw}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right column: RAG chatbot assistant */}
        <div className="lg:col-span-8">
          <ChatWindow
            apiEndpoint="/protocols/copilot-chat"
            placeholderText="Ask the Copilot: e.g. What do I do for a medical injury?"
            title="Volunteer Copilot Chat"
            roleContext="Volunteer"
          />
        </div>

      </div>
    </main>
  );
};

export default VolunteerCopilot;
