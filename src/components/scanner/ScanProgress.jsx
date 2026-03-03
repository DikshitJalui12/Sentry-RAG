import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function ScanProgress({ scan }) {
  const statusConfig = {
    running: { icon: Loader2, color: "text-blue-400", badge: "bg-blue-500/20 text-blue-300 border-blue-500/50", spin: true },
    analyzing: { icon: Loader2, color: "text-purple-400", badge: "bg-purple-500/20 text-purple-300 border-purple-500/50", spin: true },
    completed: { icon: CheckCircle, color: "text-green-400", badge: "bg-green-500/20 text-green-300 border-green-500/50", spin: false },
    failed: { icon: XCircle, color: "text-red-400", badge: "bg-red-500/20 text-red-300 border-red-500/50", spin: false }
  };

  const config = statusConfig[scan.status] || statusConfig.running;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Icon className={`w-5 h-5 ${config.color} ${config.spin ? 'animate-spin' : ''}`} />
              {scan.scan_name}
            </CardTitle>
            <Badge variant="outline" className={config.badge}>
              {scan.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                {scan.status === 'analyzing' ? 'ML Analysis in progress...' : (scan.current_action || 'Initializing scan...')}
              </span>
              <span className="text-sm font-semibold text-white">{scan.progress}%</span>
            </div>
            <Progress value={scan.progress} className="h-2" />
            <p className="text-xs text-gray-500 mt-2 text-right font-mono">
                {scan.status === 'running' && `Scanning: ${scan.target_network || 'Local Environment'}`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-500">Threats Found</span>
              </div>
              <p className="text-2xl font-bold text-white">{scan.threats_found || 0}</p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-500">Vulnerabilities</span>
              </div>
              <p className="text-2xl font-bold text-white">{scan.vulnerabilities_found || 0}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Started: {scan.started_at && format(new Date(scan.started_at), 'dd/MM/yyyy HH:mm:ss')}
            </span>
            {scan.duration && (
              <span>Duration: {scan.duration}s</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}