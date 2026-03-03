import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scan, Brain, Shield, TrendingUp, AlertTriangle,
  CheckCircle, Loader2, Zap, Activity, ChevronDown, ChevronUp, Target, FileCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ScanCard from "../components/scanner/ScanCard";
import ScanProgress from "../components/scanner/ScanProgress";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ThreatScanner() {
  const [activeScans, setActiveScans] = useState(new Set());
  const [expandedScanId, setExpandedScanId] = useState(null);
  const [activeTab, setActiveTab] = useState("start");
  const queryClient = useQueryClient();

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ['scans'],
    queryFn: () => base44.entities.ScanResult.list('-created_date', 50),
  });

  const createScanMutation = useMutation({
    mutationFn: (data) => base44.entities.ScanResult.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });

  const updateScanMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScanResult.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });

  const createThreatMutation = useMutation({
    mutationFn: (data) => base44.entities.Threat.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
    },
  });

  const handleStartScan = async (scanType) => {
    if (activeScans.has(scanType)) {
      toast.error('Scan already in progress');
      return;
    }

    activeScans.add(scanType);
    setActiveScans(new Set(activeScans));

    const scanName = `${scanType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Scan - ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`;
    
    toast.success('Scan initiated');

    // Create scan record
    const scan = await createScanMutation.mutateAsync({
    scan_name: scanName,
    scan_type: scanType,
    status: 'running',
    progress: 0,
    threats_found: 0,
    vulnerabilities_found: 0,
    assets_scanned_count: Math.floor(Math.random() * 50) + 10,
    risk_score: 0,
    target_network: '192.168.1.0/24',
    compliance_passed: true,
    started_at: new Date().toISOString()
    });

    // Simulate scan progress with realistic actions
    let progress = 0;
    const actions = [
        "Initializing scanning protocols...",
        "Resolving target hostnames...",
        "Scanning open ports (1-1024)...",
        "Analyzing packet headers...",
        "Checking for SSL/TLS vulnerabilities...",
        "Fingerprinting OS versions...",
        "Querying threat intelligence feeds...",
        "Correlating network logs...",
        "Finalizing scan report..."
    ];

    const progressInterval = setInterval(async () => {
      progress += Math.random() * 10 + 2; // Slower progress for realism
      if (progress > 100) progress = 100;

      // Select action based on progress
      const actionIndex = Math.min(Math.floor((progress / 100) * actions.length), actions.length - 1);
      const currentAction = actions[actionIndex];

      await updateScanMutation.mutateAsync({
        id: scan.id,
        data: { 
            ...scan, 
            progress: Math.floor(progress),
            current_action: currentAction
        }
      });

      if (progress >= 100) {
        clearInterval(progressInterval);
        await performMLAnalysis(scan, scanType);
      }
    }, 1000);
  };

  const performMLAnalysis = async (scan, scanType) => {
    // Update to analyzing status
    await updateScanMutation.mutateAsync({
      id: scan.id,
      data: { ...scan, status: 'analyzing', progress: 100 }
    });

    try {
      // Use AI to perform deep scan analysis
      const analysisPrompt = `Perform a comprehensive ${scanType} security scan analysis using machine learning algorithms. 

Scan Type: ${scanType.replace(/_/g, ' ')}
Analysis Requirements:
1. Identify current threats and vulnerabilities
2. Use predictive ML models to forecast potential future threats
3. Analyze attack patterns and behavioral anomalies
4. Provide threat intelligence with confidence scores
5. Include specific indicators of compromise (IOCs)

Generate realistic scan results with:
- 3-7 current threats detected
- 5-10 vulnerabilities found
- 3-5 ML predictions for future threats with probability scores
- Detailed descriptions and recommended actions

Return comprehensive security analysis.`;

      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            threats: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  category: { type: "string" },
                  confidence_score: { type: "number" }
                }
              }
            },
            vulnerabilities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  severity: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            ml_predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  threat_type: { type: "string" },
                  probability: { type: "number" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create threat records for detected threats
      if (analysisResult.threats && analysisResult.threats.length > 0) {
        for (const threat of analysisResult.threats) {
          await createThreatMutation.mutateAsync({
            ...threat,
            status: 'active',
            source: `ML Scanner - ${scanType}`,
            detected_at: new Date().toISOString(),
            affected_systems: [`SCAN-${scanType.toUpperCase()}-001`]
          });
        }
      }

      // Update scan with results
      const duration = Math.floor((new Date() - new Date(scan.started_at)) / 1000);
      await updateScanMutation.mutateAsync({
        id: scan.id,
        data: {
          ...scan,
          status: 'completed',
          progress: 100,
          threats_found: analysisResult.threats?.length || 0,
          vulnerabilities_found: analysisResult.vulnerabilities?.length || 0,
          assets_scanned_count: scan.assets_scanned_count,
          risk_score: (analysisResult.threats?.length || 0) * 1.5 + (analysisResult.vulnerabilities?.length || 0) * 0.5,
          target_network: scan.target_network,
          compliance_passed: (analysisResult.threats?.length || 0) < 2,
          ml_predictions: analysisResult.ml_predictions || [],
          scan_results: analysisResult,
          completed_at: new Date().toISOString(),
          duration
        }
      });

      activeScans.delete(scanType);
      setActiveScans(new Set(activeScans));

      toast.success(`Scan completed: ${analysisResult.threats?.length || 0} threats detected`);
    } catch (error) {
      console.error('Scan analysis failed:', error);
      await updateScanMutation.mutateAsync({
        id: scan.id,
        data: { ...scan, status: 'failed' }
      });
      
      activeScans.delete(scanType);
      setActiveScans(new Set(activeScans));
      
      toast.error('Scan analysis failed');
    }
  };

  const scanTypes = ['full_system', 'network', 'endpoint', 'cloud', 'database', 'application', 'predictive'];
  const runningScans = scans.filter(s => ['running', 'analyzing'].includes(s.status));
  const completedScans = scans.filter(s => s.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Scan className="w-10 h-10 text-blue-400" />
            ML-Powered Threat Scanner
          </h1>
          <p className="text-gray-400 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            Advanced machine learning algorithms for predictive threat detection
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            onClick={() => setActiveTab("active")}
            className="border-gray-800 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active Scans</p>
                  <p className="text-3xl font-bold text-white">{runningScans.length}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => setActiveTab("history")}
            className="border-gray-800 bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-white">{completedScans.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Link to={createPageUrl('ThreatIntelligence') + '?source=ML Scanner'}>
            <Card className="border-gray-800 bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Threats Found</p>
                    <p className="text-3xl font-bold text-white">
                      {completedScans.reduce((sum, s) => sum + (s.threats_found || 0), 0)}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('MLPredictions')}>
            <Card className="border-gray-800 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">ML Predictions</p>
                    <p className="text-3xl font-bold text-white">
                      {completedScans.reduce((sum, s) => sum + (s.ml_predictions?.length || 0), 0)}
                    </p>
                  </div>
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="start">Start Scan</TabsTrigger>
            <TabsTrigger value="active">Active Scans ({runningScans.length})</TabsTrigger>
            <TabsTrigger value="history">Scan History</TabsTrigger>
          </TabsList>

          <TabsContent value="start" className="space-y-6">
            <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Scan Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {scanTypes.map((scanType) => (
                    <ScanCard
                      key={scanType}
                      scanType={scanType}
                      onStart={handleStartScan}
                      isScanning={activeScans.has(scanType)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {runningScans.length === 0 ? (
              <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Active Scans</h3>
                  <p className="text-gray-400">Start a scan to monitor threats in real-time</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <AnimatePresence>
                  {runningScans.map((scan) => (
                    <div key={scan.id}>
                      <ScanProgress scan={scan} />
                      <div className="mt-4 flex gap-3">
                        <Link to={createPageUrl('ScanDetails') + `?id=${scan.id}`} className="flex-1">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            View Live Details
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={async () => {
                            if (confirm('Stop this scan?')) {
                              await updateScanMutation.mutateAsync({
                                id: scan.id,
                                data: { ...scan, status: 'failed', progress: scan.progress }
                              });
                              toast.success('Scan stopped');
                            }
                          }}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          Stop Scan
                        </Button>
                      </div>
                      
                      {/* Real-time scan activity feed */}
                      {scan.current_action && (
                        <Card className="mt-4 border-gray-800 bg-gray-900/50">
                          <CardContent className="p-4">
                            <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                              Live Activity Stream
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-gray-800/50 rounded p-2 border-l-2 border-blue-500"
                              >
                                <p className="text-xs text-blue-300 font-mono">{scan.current_action}</p>
                                <p className="text-xs text-gray-500 mt-1">Progress: {scan.progress}%</p>
                              </motion.div>
                              {scan.threats_found > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="bg-red-900/20 rounded p-2 border-l-2 border-red-500"
                                >
                                  <p className="text-xs text-red-300 font-mono flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" />
                                    {scan.threats_found} threat(s) detected
                                  </p>
                                </motion.div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {completedScans.length === 0 ? (
              <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Scan History</h3>
                  <p className="text-gray-400">Completed scans will appear here</p>
                </CardContent>
              </Card>
            ) : (
              completedScans.map((scan) => (
                <Card key={scan.id} className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
                  <CardContent className="p-6 relative">
                    <div className="absolute top-6 right-6">
                      <Link to={createPageUrl('ScanDetails') + `?id=${scan.id}`}>
                        <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                          View Full Report
                        </Button>
                      </Link>
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">{scan.scan_name}</h3>
                        <div className="flex gap-2 mb-3">
                          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                            COMPLETED
                          </Badge>
                          <Badge variant="outline" className="bg-gray-700/30 text-gray-300 border-gray-600">
                            {scan.scan_type?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="text-lg font-semibold text-white">{scan.duration}s</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Threats</p>
                        <p className="text-2xl font-bold text-red-400">{scan.threats_found || 0}</p>
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Vulnerabilities</p>
                        <p className="text-2xl font-bold text-orange-400">{scan.vulnerabilities_found || 0}</p>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">ML Predictions</p>
                        <p className="text-2xl font-bold text-purple-400">{scan.ml_predictions?.length || 0}</p>
                      </div>
                    </div>

                    {/* Toggle More Details */}
                    <div className="flex justify-center mb-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setExpandedScanId(expandedScanId === scan.id ? null : scan.id)}
                        className="text-gray-400 hover:text-white hover:bg-white/5"
                      >
                        {expandedScanId === scan.id ? (
                          <><ChevronUp className="w-4 h-4 mr-2" /> Less Details</>
                        ) : (
                          <><ChevronDown className="w-4 h-4 mr-2" /> More Details</>
                        )}
                      </Button>
                    </div>

                    <AnimatePresence>
                      {expandedScanId === scan.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-blue-400" />
                              <div>
                                <p className="text-xs text-gray-500">Assets Scanned</p>
                                <p className="text-sm font-semibold text-white">{scan.assets_scanned_count || 0}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-purple-400" />
                              <div>
                                <p className="text-xs text-gray-500">Risk Score</p>
                                <p className="text-sm font-semibold text-white">{scan.risk_score?.toFixed(1) || 'N/A'}/10</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-green-400" />
                              <div>
                                <p className="text-xs text-gray-500">Target Network</p>
                                <p className="text-sm font-semibold text-white">{scan.target_network || 'All'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileCheck className="w-4 h-4 text-yellow-400" />
                              <div>
                                <p className="text-xs text-gray-500">Compliance</p>
                                <Badge variant="outline" className={scan.compliance_passed ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}>
                                  {scan.compliance_passed ? 'PASSED' : 'FAILED'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {scan.ml_predictions && scan.ml_predictions.length > 0 && (
                      <div className="border-t border-gray-800 pt-4">
                        <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-400" />
                          ML Threat Predictions
                        </h4>
                        <div className="space-y-2">
                          {scan.ml_predictions.slice(0, 3).map((prediction, idx) => (
                            <div key={idx} className="bg-gray-800/30 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-1">
                                <p className="text-sm font-medium text-white">{prediction.threat_type}</p>
                                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-xs">
                                  {prediction.probability}% probable
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-400">{prediction.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}