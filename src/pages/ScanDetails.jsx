import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, Shield, AlertTriangle, Brain, CheckCircle, 
  XCircle, Clock, Activity, Terminal 
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ScanDetails() {
  const searchParams = new URLSearchParams(window.location.search);
  const scanId = searchParams.get('id');

  const { data: scan, isLoading } = useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => base44.entities.ScanResult.get(scanId),
    enabled: !!scanId,
    refetchInterval: (data) => (data?.status === 'running' || data?.status === 'analyzing') ? 1000 : false
  });

  if (isLoading) return <div className="p-10 text-white text-center">Loading scan details...</div>;
  if (!scan) return <div className="p-10 text-white text-center">Scan not found</div>;

  const statusConfig = {
    running: { icon: Activity, color: "text-blue-400", badge: "bg-blue-500/20 text-blue-300 border-blue-500/50" },
    analyzing: { icon: Brain, color: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-500/50" },
    completed: { icon: CheckCircle, color: "text-green-400", badge: "bg-green-500/20 text-green-300 border-green-500/50" },
    failed: { icon: XCircle, color: "text-red-400", badge: "bg-red-500/20 text-red-300 border-red-500/50" }
  };

  const config = statusConfig[scan.status] || statusConfig.running;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl('ThreatScanner')}>
          <Button variant="ghost" className="text-gray-400 hover:text-white mb-6 pl-0">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scanner
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Status Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-8 h-8 ${config.color} ${['running', 'analyzing'].includes(scan.status) ? 'animate-pulse' : ''}`} />
                      <h1 className="text-2xl font-bold text-white">{scan.scan_name}</h1>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={config.badge}>
                        {scan.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700">
                        {scan.scan_type?.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <p>Started: {format(new Date(scan.started_at), 'dd/MM/yyyy HH:mm:ss')}</p>
                    {scan.completed_at && (
                      <p>Completed: {format(new Date(scan.completed_at), 'dd/MM/yyyy HH:mm:ss')}</p>
                    )}
                    {scan.duration && (
                      <p className="mt-1 font-mono text-white">Duration: {scan.duration}s</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Scan Progress</span>
                    <span className="text-white font-mono">{scan.progress}%</span>
                  </div>
                  <Progress value={scan.progress} className="h-3" />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2 text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-semibold">Threats</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{scan.threats_found || 0}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2 text-orange-400">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">Vulns</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{scan.vulnerabilities_found || 0}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2 text-purple-400">
                      <Brain className="w-5 h-5" />
                      <span className="font-semibold">ML Insights</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{scan.ml_predictions?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ML Predictions */}
            {scan.ml_predictions && scan.ml_predictions.length > 0 && (
              <Card className="border-gray-800 bg-gradient-to-br from-purple-900/10 to-purple-900/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="w-6 h-6 text-purple-400" />
                    ML Predictive Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {scan.ml_predictions.map((pred, idx) => (
                      <div key={idx} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white">{pred.threat_type}</h3>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                            {pred.probability}% Probability
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm">{pred.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

             {/* Raw Results */}
             {scan.scan_results && (
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Terminal className="w-6 h-6 text-gray-400" />
                    Raw Scan Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto text-xs text-green-400 font-mono">
                    {JSON.stringify(scan.scan_results, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar: Threats List */}
          <div className="space-y-6">
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Detected Threats
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!scan.scan_results?.threats?.length ? (
                  <div className="text-center py-10 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No threats detected</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scan.scan_results.threats.map((threat, idx) => (
                      <div key={idx} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 hover:border-red-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-white text-sm">{threat.title}</span>
                          <Badge variant="outline" className={`text-xs ${
                            threat.severity === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                            threat.severity === 'high' ? 'bg-orange-500/20 text-orange-300 border-orange-500/50' :
                            'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                          }`}>
                            {threat.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{threat.description}</p>
                        {threat.confidence_score && (
                          <div className="mt-2 flex items-center gap-1">
                             <div className="h-1 bg-gray-700 rounded-full flex-1">
                               <div className="h-full bg-blue-500 rounded-full" style={{width: `${threat.confidence_score}%`}}></div>
                             </div>
                             <span className="text-[10px] text-blue-400">{threat.confidence_score}% Conf.</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}