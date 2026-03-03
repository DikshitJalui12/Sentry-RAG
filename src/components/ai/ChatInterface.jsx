import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  if (isSystem) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
        isUser ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-purple-500/20 border border-purple-500/50'
      }`}>
        {isUser ? <User className="w-4 h-4 text-blue-300" /> : <Bot className="w-4 h-4 text-purple-300" />}
      </div>
      <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-blue-600/30 border border-blue-500/50 text-white' 
            : 'bg-gray-800/80 border border-gray-700/50 text-gray-100'
        }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown 
              className="text-sm prose prose-sm prose-invert max-w-none"
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ inline, children }) => 
                  inline ? (
                    <code className="bg-gray-900/50 px-1 py-0.5 rounded text-xs text-blue-300">{children}</code>
                  ) : (
                    <code className="block bg-gray-900/50 p-2 rounded text-xs my-2">{children}</code>
                  )
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        {message.tool_calls && message.tool_calls.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.tool_calls.map((tool, idx) => (
              <Badge key={idx} variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                {tool.name?.split('.').pop() || 'Function'}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function ChatInterface({ conversationId: initialConversationId, onSessionCreated }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle conversation ID changes
  useEffect(() => {
    setConversationId(initialConversationId);
    setMessages([]);
    setIsLoading(false);
  }, [initialConversationId]);

  // Load and subscribe to conversation
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    const loadAndSubscribe = async () => {
      try {
        // Load existing messages
        const conv = await base44.agents.getConversation(conversationId);
        setMessages(conv.messages || []);

        // Subscribe to updates
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
        
        unsubscribeRef.current = base44.agents.subscribeToConversation(conversationId, (data) => {
          setMessages(data.messages || []);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Failed to load conversation:', error);
        setIsLoading(false);
      }
    };

    loadAndSubscribe();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [conversationId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      let currentConvId = conversationId;

      if (!currentConvId) {
        // Create new conversation
        const conv = await base44.agents.createConversation({
          agent_name: "sentry_analyst",
          metadata: {
            name: userMessage.slice(0, 50),
          }
        });
        currentConvId = conv.id;
        setConversationId(currentConvId);

        // Save to history
        await base44.entities.ChatSession.create({
          title: userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : ''),
          conversation_id: currentConvId,
          last_message_at: new Date().toISOString()
        });

        if (onSessionCreated) onSessionCreated();
      } else {
        // Update last message time
        const sessions = await base44.entities.ChatSession.filter({ conversation_id: currentConvId }, '-created_date', 1);
        if (sessions.length > 0) {
          await base44.entities.ChatSession.update(sessions[0].id, {
            last_message_at: new Date().toISOString()
          });
          if (onSessionCreated) onSessionCreated();
        }
      }

      // Send user message
      const conv = await base44.agents.getConversation(currentConvId);
      await base44.agents.addMessage(conv, {
        role: 'user',
        content: userMessage
      });

      // Loading state will be cleared by subscription when agent responds
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.length === 0 && !isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sentry AI Analyst</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Advanced threat intelligence assistant. Ask me anything about your security posture.
              </p>
            </motion.div>
          ) : (
            messages.map((msg, idx) => <MessageBubble key={`${msg.role}-${idx}`} message={msg} />)
          )}
        </AnimatePresence>
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20 border border-purple-500/50">
              <Bot className="w-4 h-4 text-purple-300" />
            </div>
            <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700/50 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span className="text-sm text-gray-400">Analyzing...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800 p-4 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about threats, analyze security events, investigate incidents..."
            className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}