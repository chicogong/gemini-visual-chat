import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Command, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { WidgetRenderer } from './WidgetRenderer';

interface ChatInterfaceProps {
  apiKey: string;
}

const QUICK_PROMPTS = [
  "Compare iPhone 16 vs S24",
  "Top 10 Sci-Fi Movies",
  "Suggested Weekly Meal Plan",
  "Paris Travel Itinerary"
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ apiKey }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm here to help. Whether you need a movie recommendation, a travel plan, or some data analysis, just ask.",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await sendMessageToGemini(history, userMessage.text, apiKey);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: new Date(),
        widget: response.widget
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat Error", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an issue connecting to the service.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([{
      id: '1',
      role: 'model',
      text: "Chat cleared. What's on your mind?",
      timestamp: new Date()
    }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
  }

  return (
    <div className="flex flex-col h-full bg-ag-bg relative">
      {/* Header - Clean & Simple */}
      <div className="h-16 border-b border-ag-border bg-white/80 backdrop-blur flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Bot size={20} />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Assistant</span>
        </div>
        <button 
            onClick={handleClear} 
            className="text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100 flex items-center gap-2 text-sm font-medium"
        >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} w-full max-w-4xl mx-auto`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm border
              ${msg.role === 'model' 
                ? 'bg-white border-gray-200 text-indigo-600' 
                : 'bg-indigo-600 border-indigo-600 text-white'
              }`}
            >
              {msg.role === 'model' ? <Sparkles size={16} /> : <User size={16} />}
            </div>

            {/* Content Bubble */}
            <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
               {/* Message Body */}
               <div className={`
                 text-[15px] leading-relaxed
                 ${msg.role === 'user' 
                   ? 'bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm' 
                   : 'text-gray-800'
                 }
               `}>
                 {msg.role === 'model' ? (
                   <div className="w-full">
                      {msg.text && (
                        <div className="prose prose-slate max-w-none mb-4">
                           <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      )}
                      {msg.widget && (
                        <div className="mt-2 w-full">
                          <WidgetRenderer widget={msg.widget} />
                        </div>
                      )}
                   </div>
                 ) : (
                   <div>{msg.text}</div>
                 )}
               </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 w-full max-w-4xl mx-auto">
             <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
               <Sparkles size={14} className="text-indigo-600 animate-pulse" />
             </div>
             <div className="flex items-center h-8">
               <span className="text-sm text-gray-500 font-medium">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-ag-border bg-white">
        <div className="max-w-3xl mx-auto space-y-4">
            {/* Quick Prompts */}
            {!isLoading && messages.length < 3 && (
                <div className="flex flex-wrap gap-2 justify-center animate-fade-in">
                    {QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSend(prompt)}
                            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-full transition-all border border-gray-200 hover:border-gray-300 shadow-sm"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}
            
            <div className="relative shadow-md rounded-2xl bg-white border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask for a movie list, a comparison table, or a chart..."
                    rows={1}
                    className="w-full bg-transparent border-none text-gray-900 rounded-2xl px-5 py-4 pr-14 
                            focus:ring-0 resize-none max-h-48 text-[15px] placeholder-gray-400"
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 bottom-2 p-2.5 bg-indigo-600 text-white rounded-xl 
                            hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};