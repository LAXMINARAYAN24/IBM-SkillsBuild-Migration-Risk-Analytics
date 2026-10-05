import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import useEvaluation from '../utils/useEvaluation';

export default function AiChat() {
  const { report } = useEvaluation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const send = (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    const test = report?.test;
    const response = report
      ? `This dashboard is limited to verified evaluation facts. The selected ${report.selected_model} model has holdout ROC-AUC ${test.roc_auc.toFixed(4)}, average precision ${(test.average_precision * 100).toFixed(2)}%, and observed interstate-move rate ${(test.observed_rate * 100).toFixed(2)}%. It classifies past-year interstate moves, not future state outflow. See the Evaluation Report for split and calibration details.`
      : 'Evaluation evidence is still loading. Please try again in a moment.';
    setMessages([...messages, { question, response }]);
    setInput('');
  };
  return <div className="space-y-5 animate-in">
    <div className="pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
      <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5"><MessageSquare className="w-6 h-6 text-purple-400" /> Evaluation assistant</h1>
      <p className="text-xs text-gray-400 mt-1">Explains the saved model evidence without inventing causes, forecasts, or policy recommendations.</p>
    </div>
    <div className="admin-card p-5 space-y-4 min-h-[48vh]">
      <div className="text-sm text-gray-300">Ask about the holdout metrics, temporal split, target definition, or probability threshold.</div>
      {messages.map((message, index) => <div key={index} className="space-y-2"><p className="ml-auto max-w-xl rounded-xl bg-indigo-500/15 p-3 text-xs text-indigo-100">{message.question}</p><p className="max-w-xl rounded-xl bg-slate-800 p-3 text-xs leading-relaxed text-gray-200">{message.response}</p></div>)}
      <form onSubmit={send} className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <input value={input} onChange={event => setInput(event.target.value)} className="form-input flex-1 text-sm" placeholder="Ask about validation or metrics…" />
        <button className="btn btn-primary px-3" aria-label="Send"><Send size={16} /></button>
      </form>
    </div>
  </div>;
}
