import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, Bot, User, Sparkles, RefreshCw,
  HelpCircle, ArrowRight, ShieldAlert, CheckCircle, Database
} from 'lucide-react';

const suggestedPrompts = [
  'Why does Wyoming have the highest predicted outflow risk?',
  'What are the strongest demographic drivers in the Logistic Regression model?',
  'How do California and New York migration rates compare?',
  'Explain the model ROC-AUC score of 0.7248 and confusion matrix.',
];

const cannedResponses = {
  wyoming: `### 🏔️ Wyoming Migration Risk Analysis
Wyoming leads the nation in modeled out-migration flight risk with an average probability of **52.41%**.

**Key contributing factors:**
1. **Economic Transition:** Contraction in traditional extractive energy sectors over the 2010–2019 decade spurred workforce relocation.
2. **Age Demographic Skew:** Young adult cohort (ages 18–34) shows an out-migration propensity 2.4× higher than the state baseline.
3. **Census Historical Outflow:** Census state-to-state tables confirm steady net negative migration towards Colorado, Texas, and Utah.`,

  demographic: `### 📊 Primary Demographic Drivers
In the trained **Logistic Regression model**, feature weights indicate:

- **Age Group (Weight: -0.042/yr):** Strongest inverse predictor. Individuals aged 20–29 have a 4.1× higher flight probability than individuals aged 60+.
- **Household Income (Non-linear):** Low-to-moderate income households ($25k–$50k) exhibit elevated mobility when coupled with escalating regional housing indices.
- **Historical State Flow Index:** Baseline geographic out-migration rate acts as a high-confidence anchor prior.`,

  california: `### ☀️ California vs. New York Migration Outflows
Comparing historical Census & IPUMS microdata:

- **California:** Net domestic outflow accelerated between 2015–2019, primarily directed towards Texas, Arizona, Washington, and Nevada. Modeled average risk score: **41.2%**.
- **New York:** Consistently one of the highest gross domestic loss states, with primary relocation corridors to Florida, New Jersey, and North Carolina. Modeled average risk score: **44.8%**.`,

  model: `### 🤖 Model Diagnostics & Evaluation
- **Algorithm:** Logistic Regression with L2 Regularization & Standardized Demographics.
- **Test ROC-AUC:** **0.7248** (strong discrimination for macro-demographic classification).
- **Test Accuracy:** **72.5%** on 2,000 holdout observations.
- **Dataset Scale:** Merged microdata from **1,400,000+** IPUMS CPS records with 10 years of U.S. Census Bureau state-to-state matrices.`
};

export default function AiChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello Analyst! I'm your **Migration Risk Intelligence Copilot**.\n\nI have indexed all 10 years of U.S. Census State-to-State matrices (2010–2019), 1.4M IPUMS CPS records, and the trained Logistic Regression model.\n\nHow can I assist your demographic research today?`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let reply = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('wyoming') || qLower.includes('highest')) {
        reply = cannedResponses.wyoming;
      } else if (qLower.includes('driver') || qLower.includes('demographic') || qLower.includes('age') || qLower.includes('income')) {
        reply = cannedResponses.demographic;
      } else if (qLower.includes('california') || qLower.includes('new york')) {
        reply = cannedResponses.california;
      } else if (qLower.includes('auc') || qLower.includes('accuracy') || qLower.includes('model') || qLower.includes('confusion')) {
        reply = cannedResponses.model;
      } else {
        reply = `### 🧠 Risk Intelligence Assessment for: "${query}"\n\nBased on the merged IPUMS CPS and Census datasets, population mobility is heavily correlated with regional employment shifts and relative cost of living.\n\n- **Predicted Outflow Risk:** Corresponds with state-level migration indices.\n- **Data Confidence:** High (trained on 1.4M records across 51 jurisdictions).\n\nFeel free to ask about specific states or model metrics!`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="space-y-4 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b"
           style={{ borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            AI Migration Risk Copilot
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Query population dynamics, validate model rationales, and simulate policy scenarios with intelligence reasoning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
            <Sparkles size={13} />
            Demographic GPT Model v2
          </span>
        </div>
      </div>

      {/* Main Chat Window */}
      <div
        className="admin-card flex flex-col h-[68vh] overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-md ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                    : 'bg-gradient-to-tr from-purple-600 to-pink-600'
                }`}
              >
                {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'border rounded-tl-none'
                }`}
                style={
                  m.sender === 'bot'
                    ? {
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }
                    : {}
                }
              >
                <div className="whitespace-pre-wrap font-sans space-y-1.5">
                  {m.text}
                </div>
                <span
                  className={`block text-[10px] mt-2 font-mono ${
                    m.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Bot size={16} />
              </div>
              <div
                className="px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 border"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-gray-400 text-[11px] ml-1">Analyzing demographic microdata...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div
          className="px-4 py-2.5 border-t flex items-center gap-2 overflow-x-auto"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1 flex-shrink-0">
            <Sparkles size={12} className="text-purple-400" /> Prompts:
          </span>
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg border whitespace-nowrap hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-300 transition-all flex-shrink-0 text-gray-300"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          className="p-3 border-t flex items-center gap-2"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
        >
          <input
            type="text"
            placeholder="Ask the AI Risk Copilot anything about migration patterns, states, or the model..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="form-input text-xs sm:text-sm py-2.5"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="btn btn-primary px-4 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={16} />
            <span className="hidden sm:inline text-xs font-bold">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
