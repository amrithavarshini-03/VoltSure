import React, { useState } from 'react';
import { useVoltSureStore } from '../../store/useVoltSureStore';
import { Sparkles, Send, X, Bot, Loader2, RotateCcw } from 'lucide-react';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICopilotModal: React.FC<AICopilotModalProps> = ({ isOpen, onClose }) => {
  const { scenarioInputs, getVehicle, getRoutePlan, customOriginText, customDestinationText } = useVoltSureStore();
  const vehicle = getVehicle();
  const { evaluatedRoutes, recommendedRouteId } = getRoutePlan();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Hello! I am your VoltSure AI route intelligence copilot. Ask me anything about your ${vehicle.name}, your ${scenarioInputs.startingSoC}% battery state of charge, trip feasibility from ${customOriginText.split(',')[0]} to ${customDestinationText.split(',')[0]}, or any EV & technical questions!`,
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user' as const, text: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const rec = evaluatedRoutes.find((r) => r.routeId === recommendedRouteId);
      const direct = evaluatedRoutes.find((r) => r.routeId.includes('direct'));

      const systemPrompt = `You are VoltSure AI Copilot, a versatile, expert mobility intelligence and AI assistant developed for HackFront India.
You can answer ANY question the user asks accurately, clearly, and helpfully.
Whether they ask about EV battery physics, regenerative braking, route feasibility, charger reliability, or any general science, technical, driving, or open-ended topic, provide a direct, comprehensive, and friendly answer.

Context about the current vehicle & trip:
- Vehicle: ${vehicle.name} (${vehicle.claimedCapacityKWh} kWh pack, ${vehicle.claimedRangeKm} km claimed range)
- Current Battery SoC: ${scenarioInputs.startingSoC}%
- Origin: ${customOriginText}
- Destination: ${customDestinationText}
- Ambient Temperature: ${scenarioInputs.ambientTempC}°C
- Sensed Traffic: ${scenarioInputs.trafficLevel}
- Direct Route Feasibility: ${direct ? (direct.pFeasibleArrival * 100).toFixed(0) : 38}% (${direct?.isFeasibleAtTarget ? 'Feasible' : 'Rejected due to 10% protected reserve breach'})
- Recommended Route Feasibility: ${rec ? (rec.pFeasibleArrival * 100).toFixed(0) : 94}% with reserve protected.

Respond thoughtfully and concisely. Use formatting like bullet points or short paragraphs when helpful.`;

      const API_KEY = import.meta.env.VITE_AI_API_KEY || '';

      // First try gpt-oss-20b (fastest, ~1s latency)
      let response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: systemPrompt },
            ...updatedMessages.map((m) => ({ role: m.role, content: m.text })),
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      // If 20b fails, try gpt-oss-120b
      if (!response.ok) {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: systemPrompt },
              ...updatedMessages.map((m) => ({ role: m.role, content: m.text })),
            ],
            temperature: 0.7,
            max_tokens: 600,
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`Inference HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'Feasibility analysis completed.';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      // Deterministic engineering fallback if offline
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Based on your ${vehicle.name} with ${scenarioInputs.startingSoC}% battery SoC, travelling to ${customDestinationText.split(',')[0]} requires careful energy management. Direct uphill stretches draw significant mechanical power (F_roll + F_aero + F_grade). VoltSure AI recommends routing via verified charger hubs with 10% reserve protection.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'Can I reach my destination with current battery?',
    'How does regenerative braking recover energy?',
    'Can I drive my EV safely in heavy rain?',
    'What speed gives the highest range?',
  ];

  return (
    <div className="fixed inset-0 z-[1250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[560px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-lime-100 border border-lime-300 text-lime-700">
              <Sparkles className="w-4 h-4 text-lime-700" />
            </div>
            <div>
              <span className="font-heading font-bold text-slate-900 text-sm block">
                VoltSure AI Copilot
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Neural Mobility & General Route Intelligence
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setMessages([
                  {
                    role: 'assistant',
                    text: `Hello! I am your VoltSure AI route intelligence copilot. Ask me anything!`,
                  },
                ])
              }
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
              title="Clear conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 font-sans text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-lime-100 border border-lime-300 flex items-center justify-center text-lime-700 flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono p-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-lime-600" />
              <span>Thinking & analyzing answer...</span>
            </div>
          )}
        </div>

        {/* Quick Sample Chips */}
        <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex gap-1.5 overflow-x-auto">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[10px] font-mono whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-lime-500 hover:text-slate-900 transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask any question about your EV, route, battery, or general topics..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-sans text-slate-900 focus:outline-none focus:border-lime-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
