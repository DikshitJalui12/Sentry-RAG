import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Sparkles, Plus, MessageSquare, Clock, Search, Trash2 } from "lucide-react";
import ChatInterface from "../components/ai/ChatInterface";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AIAssistant() {
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: sessions = [], refetch: refetchSessions } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => base44.entities.ChatSession.list('-last_message_at', 50),
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id) => base44.entities.ChatSession.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      setSelectedSessionId(null);
      toast.success('Chat session deleted');
    },
  });

  const filteredSessions = sessions.filter(session => 
    session.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto h-[calc(100vh-3rem)]">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-400" />
            Sentry AI Analyst
          </h1>
          <p className="text-gray-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Dual-source RAG powered threat intelligence assistant
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100%-120px)]">
          {/* Sidebar */}
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-800 space-y-3">
              <Button 
                onClick={() => setSelectedSessionId(null)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {filteredSessions.length === 0 && (
                <div className="text-center py-10 text-gray-500 text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  {searchQuery ? 'No matching chats' : 'No history yet'}
                </div>
              )}
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.conversation_id)}
                  className={cn(
                    "w-full rounded-lg transition-colors text-sm group border relative cursor-pointer p-3",
                    selectedSessionId === session.conversation_id 
                      ? "bg-purple-500/20 border-purple-500/30" 
                      : "hover:bg-gray-800/50 border-transparent"
                  )}
                >
                  <div className="font-medium truncate mb-1 text-white pr-8">{session.title}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {session.last_message_at ? format(new Date(session.last_message_at), 'dd/MM/yyyy HH:mm') : 'Just now'}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this chat?')) {
                        deleteSessionMutation.mutate(session.id);
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Main Chat Area */}
          <Card className="lg:col-span-3 border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm overflow-hidden">
            <ChatInterface 
              conversationId={selectedSessionId} 
              onSessionCreated={refetchSessions}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}