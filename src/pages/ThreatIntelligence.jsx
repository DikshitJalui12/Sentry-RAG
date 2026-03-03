import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Search, Filter, Brain, Loader2, 
  AlertTriangle, Shield, CheckCircle, XCircle 
} from "lucide-react";
import ThreatCard from "../components/threats/ThreatCard";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ThreatIntelligence() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialSource = searchParams.get('source') || '';
  const [searchQuery, setSearchQuery] = useState(initialSource);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mitreFilter, setMitreFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState(null);

  const queryClient = useQueryClient();

  const { data: threats = [], isLoading } = useQuery({
    queryKey: ['threats'],
    queryFn: () => base44.entities.Threat.list('-created_date', 100),
  });

  const createThreatMutation = useMutation({
    mutationFn: (data) => base44.entities.Threat.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      setIsAddDialogOpen(false);
      toast.success('Threat added successfully');
    },
  });

  const updateThreatMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Threat.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      toast.success('Threat updated');
    },
  });

  const handleAnalyzeWithAI = async (threat) => {
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this security threat and provide detailed intelligence:

Title: ${threat.title}
Description: ${threat.description}
Category: ${threat.category}
Severity: ${threat.severity}
Affected Systems: ${threat.affected_systems?.join(', ') || 'Unknown'}

Provide:
1. Technical analysis of the threat
2. Potential attack vectors
3. Recommended remediation steps
4. Related threat indicators
5. Confidence assessment`,
        add_context_from_internet: true
      });

      await updateThreatMutation.mutateAsync({
        id: threat.id,
        data: {
          ...threat,
          ai_analysis: result,
          confidence_score: 90
        }
      });

      toast.success('AI analysis complete');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredThreats = threats.filter(threat => {
    const matchesSearch = !searchQuery || 
      threat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || threat.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || threat.status === statusFilter;
    const matchesMitre = !mitreFilter || (threat.mitre_attack_techniques && threat.mitre_attack_techniques.some(t => t.toLowerCase().includes(mitreFilter.toLowerCase())));

    return matchesSearch && matchesSeverity && matchesStatus && matchesMitre;
  });

  const handleAddThreat = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      severity: formData.get('severity'),
      category: formData.get('category'),
      status: 'active',
      source: formData.get('source'),
      affected_systems: formData.get('affected_systems')?.split(',').map(s => s.trim()).filter(Boolean) || [],
      mitre_attack_techniques: formData.get('mitre_attack_techniques')?.split(',').map(s => s.trim()).filter(Boolean) || [],
      detected_at: new Date().toISOString(),
      confidence_score: 75
    };
    createThreatMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <AlertTriangle className="w-10 h-10 text-red-400" />
                Threat Intelligence
              </h1>
              <p className="text-gray-400">Comprehensive threat analysis and management</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Threat
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Threat</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Manually add a detected threat to the system
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddThreat}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Threat Title</Label>
                      <Input id="title" name="title" required className="bg-gray-800 border-gray-700" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" required className="bg-gray-800 border-gray-700" rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="severity">Severity</Label>
                        <Select name="severity" defaultValue="medium">
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" defaultValue="other">
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="malware">Malware</SelectItem>
                            <SelectItem value="phishing">Phishing</SelectItem>
                            <SelectItem value="data_breach">Data Breach</SelectItem>
                            <SelectItem value="network_intrusion">Network Intrusion</SelectItem>
                            <SelectItem value="ransomware">Ransomware</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="source">Source</Label>
                      <Input id="source" name="source" placeholder="e.g., IDS, Firewall, User Report" className="bg-gray-800 border-gray-700" />
                    </div>
                    <div>
                      <Label htmlFor="affected_systems">Affected Systems (comma-separated)</Label>
                      <Input id="affected_systems" name="affected_systems" placeholder="e.g., server-01, workstation-05" className="bg-gray-800 border-gray-700" />
                    </div>
                    <div>
                      <Label htmlFor="mitre_attack_techniques">MITRE ATT&CK Techniques (comma-separated)</Label>
                      <Input id="mitre_attack_techniques" name="mitre_attack_techniques" placeholder="e.g., T1059.003, T1190" className="bg-gray-800 border-gray-700" />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit" disabled={createThreatMutation.isPending}>
                      {createThreatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Threat'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search threats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="contained">Contained</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-48">
              <Input
                placeholder="Filter by MITRE ID..."
                value={mitreFilter}
                onChange={(e) => setMitreFilter(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Threats Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : filteredThreats.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No threats found</h3>
            <p className="text-gray-400">All systems operational</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredThreats.map((threat) => (
                <ThreatCard
                  key={threat.id}
                  threat={threat}
                  onClick={() => setSelectedThreat(threat)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Threat Detail Dialog */}
        {selectedThreat && (
          <Dialog open={!!selectedThreat} onOpenChange={() => setSelectedThreat(null)}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedThreat.title}</DialogTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className={`${
                    selectedThreat.severity === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                    selectedThreat.severity === 'high' ? 'bg-orange-500/20 text-orange-300 border-orange-500/50' :
                    'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                  }`}>
                    {selectedThreat.severity?.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-700/30 text-gray-300 border-gray-600">
                    {selectedThreat.category?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                {selectedThreat.mitre_attack_techniques && selectedThreat.mitre_attack_techniques.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedThreat.mitre_attack_techniques.map(tech => (
                      <Badge key={tech} variant="secondary" className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold text-gray-400 mb-2">Description</h4>
                  <p className="text-gray-300">{selectedThreat.description}</p>
                </div>
                
                {selectedThreat.ai_analysis && (
                  <div>
                    <h4 className="font-semibold text-gray-400 mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      AI Analysis
                    </h4>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap">
                      {selectedThreat.ai_analysis}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAnalyzeWithAI(selectedThreat)}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Brain className="w-4 h-4 mr-2" /> AI Analysis</>
                    )}
                  </Button>
                  
                  <Select
                    value={selectedThreat.status}
                    onValueChange={(value) => {
                      updateThreatMutation.mutate({
                        id: selectedThreat.id,
                        data: { ...selectedThreat, status: value }
                      });
                      setSelectedThreat({ ...selectedThreat, status: value });
                    }}
                  >
                    <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="contained">Contained</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}