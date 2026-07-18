import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { Send, Mic, Sparkles, User, ShieldAlert } from 'lucide-react';

const ChatWindow = ({ 
  apiEndpoint, 
  extraParams = {}, 
  placeholderText = "Ask StadiumPulse Concierge...", 
  title = "AI Concierge Chat",
  roleContext = "Fan",
  onReceivePath = () => {}
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: roleContext === 'Fan' 
        ? "Hello! I am StadiumPulse AI. Tell me where you want to go (e.g. nearest restroom, Food Court, Seat Block 102) and I will compute the safest step-free path and guide you in your language!"
        : "Volunteer Copilot active. Ask me any protocol queries (e.g. 'what do I do for a medical emergency?' or 'lost child procedures').",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef(null);
  const liveRegionRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessageToHistory = (sender, text) => {
    const newMsg = {
      id: Date.now(),
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);

    // Announce to screen reader
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `${sender === 'ai' ? 'Assistant says' : 'You said'}: ${text}`;
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    addMessageToHistory('user', userText);
    setIsTyping(true);

    try {
      // Build request body merging extra parameters
      const reqBody = {
        query: userText,
        ...extraParams
      };

      const res = await api.post(apiEndpoint, reqBody);
      
      if (res.data.success) {
        const text = res.data.data.responseText || res.data.data.answer;
        addMessageToHistory('ai', text);

        // If path data is returned, callback to render the list
        if (res.data.data.pathData) {
          onReceivePath(res.data.data.pathData);
        }
      } else {
        addMessageToHistory('ai', 'Error generating response. Please check server logs.');
      }
    } catch (err) {
      console.error(err);
      addMessageToHistory('ai', 'Connection error. Make sure the backend server is running.');
    } finally {
      setIsTyping(false);
    }
  };

  // Voice Input Simulation
  const simulateVoiceInput = () => {
    if (isRecording) return;
    setIsRecording(true);
    setInput("Recording voice...");
    
    // Simulate speaking delay
    setTimeout(() => {
      setIsRecording(false);
      const randomQuestions = roleContext === 'Fan' 
        ? [
            "Where is my seat Block 102 from Gate 1?",
            "Show me the nearest restroom from Gate 1",
            "Where is First Aid from Gate 2?",
            "How do I walk to the Food Court West from Gate 4?"
          ]
        : [
            "What is the protocol for a medical emergency?",
            "What should I do if a child is lost?",
            "How do I resolve ticket scanner errors?"
          ];
      
      const selectQuestion = randomQuestions[Math.floor(Math.random() * randomQuestions.length)];
      setInput(selectQuestion);
    }, 2000);
  };

  return (
    <div 
      className="bg-stadium-slate rounded-2xl border border-stadium-border shadow-xl flex flex-col h-[520px] overflow-hidden"
      role="region"
      aria-label={title}
    >
      {/* Header */}
      <div className="bg-stadium-card px-4 py-3 border-b border-stadium-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-fifa-green/10 text-fifa-green p-1.5 rounded-full">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">{title}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-fifa-green animate-pulse"></span>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Gemini 2.5 Flash Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Reader Live Region */}
      <div 
        ref={liveRegionRef} 
        className="sr-only" 
        aria-live="polite" 
        role="log"
      ></div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stadium-dark/40">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* Avatar icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
              msg.sender === 'user' 
                ? 'bg-fifa-gold text-stadium-dark' 
                : 'bg-fifa-green text-stadium-dark'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="flex flex-col gap-1">
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans whitespace-pre-line ${
                msg.sender === 'user'
                  ? 'bg-fifa-green/20 text-slate-100 rounded-tr-none border border-fifa-green/30'
                  : 'bg-stadium-card text-slate-100 rounded-tl-none border border-stadium-border'
              }`}>
                {msg.text}
              </div>
              <span className={`text-[9px] text-slate-500 font-mono ${msg.sender === 'user' ? 'text-right' : ''}`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-fifa-green text-stadium-dark flex items-center justify-center shrink-0 text-xs font-bold animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="bg-stadium-card p-3 rounded-2xl rounded-tl-none border border-stadium-border flex items-center gap-1.5 h-10 w-16">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input controls */}
      <form onSubmit={handleSend} className="bg-stadium-card p-3 border-t border-stadium-border flex items-center gap-2">
        <button
          type="button"
          onClick={simulateVoiceInput}
          className={`p-2.5 rounded-xl border transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-fifa-gold ${
            isRecording 
              ? 'bg-fifa-red border-fifa-red text-white animate-pulse' 
              : 'bg-stadium-dark border-stadium-border hover:border-slate-500 text-slate-400 hover:text-white'
          }`}
          title="Simulate Voice Input"
          aria-label={isRecording ? "Recording voice. Click to cancel." : "Simulate speech input"}
        >
          <Mic className="w-4 h-4" />
        </button>

        <label htmlFor="chat-input" className="sr-only">Type message</label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRecording ? "Listening..." : placeholderText}
          disabled={isRecording}
          className="flex-1 bg-stadium-dark border border-stadium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-slate-500 transition-colors placeholder:text-slate-500"
          autoComplete="off"
        />

        <button
          type="submit"
          disabled={!input.trim() || isRecording}
          className={`p-2.5 rounded-xl bg-fifa-green hover:bg-fifa-greenDark text-stadium-dark font-medium transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-fifa-gold ${
            (!input.trim() || isRecording) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
          aria-label="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
