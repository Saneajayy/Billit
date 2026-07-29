import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchApi } from '../lib/api';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Assistant() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi there! I am your AI Billing Assistant. You can ask me questions about your recent invoices, revenue, or top customers. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (query: string) =>
      fetchApi('/assistant/query', {
        method: 'POST',
        body: JSON.stringify({ query }),
      }, getToken),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    },
    onError: (error: any) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${error.message}` }]);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, mutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || mutation.isPending) return;

    const query = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    mutation.mutate(query);
  };

  // Helper to format basic markdown (bold)
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
        <br />
      </span>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold text-white">AI Billing Assistant</h1>
      </div>

      <div className="flex-1 bg-[#131316] shadow-sm border border-white/5 rounded-xl overflow-hidden flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#0B0B0C]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border ${
                  msg.role === 'user' ? 'bg-white/5 text-slate-300 border-white/10 ml-3' : 'bg-purple-500/10 text-purple-400 border-purple-500/20 mr-3'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-sm shadow-[0_0_15px_rgba(147,51,234,0.15)]' 
                    : 'bg-[#131316] border border-white/5 text-slate-300 rounded-tl-sm'
                }`}>
                  <div className="text-sm">
                    {msg.role === 'assistant' ? formatText(msg.content) : msg.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {mutation.isPending && (
            <div className="flex justify-start">
              <div className="flex flex-row">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 mr-3 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-[#131316] border border-white/5 text-slate-300 rounded-tl-sm flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span className="text-sm text-slate-400">Analyzing your data...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#131316] border-t border-white/5">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., What was my total revenue last month?"
              className="flex-1 px-4 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-shadow bg-[#0B0B0C] text-white"
              disabled={mutation.isPending}
            />
            <button
              type="submit"
              disabled={!input.trim() || mutation.isPending}
              className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.15)] hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-xs text-center text-slate-400 mt-3">
            The AI uses your recent invoice data to answer questions. It does not have access to your full historical database.
          </p>
        </div>
      </div>
    </div>
  );
}
