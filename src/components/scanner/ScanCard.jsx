import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Play, Shield, Network, Database, Cloud, 
  Globe, Brain, Loader2, CheckCircle, AlertTriangle 
} from "lucide-react";

const scanTypeConfig = {
  full_system: { 
    icon: Shield, 
    color: "from-blue-600 to-cyan-600",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    description: "Comprehensive scan across all systems and networks"
  },
  network: { 
    icon: Network, 
    color: "from-purple-600 to-pink-600",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/50",
    description: "Network traffic analysis and intrusion detection"
  },
  endpoint: { 
    icon: Globe, 
    color: "from-green-600 to-emerald-600",
    badge: "bg-green-500/20 text-green-300 border-green-500/50",
    description: "Endpoint protection and malware detection"
  },
  cloud: { 
    icon: Cloud, 
    color: "from-orange-600 to-red-600",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/50",
    description: "Cloud infrastructure security assessment"
  },
  database: { 
    icon: Database, 
    color: "from-indigo-600 to-blue-600",
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/50",
    description: "Database vulnerability and access pattern analysis"
  },
  application: { 
    icon: Shield, 
    color: "from-pink-600 to-rose-600",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/50",
    description: "Application security and code vulnerability scan"
  },
  predictive: { 
    icon: Brain, 
    color: "from-violet-600 to-purple-600",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/50",
    description: "ML-powered predictive threat intelligence"
  }
};

export default function ScanCard({ scanType, onStart, isScanning }) {
  const config = scanTypeConfig[scanType] || scanTypeConfig.full_system;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm hover:shadow-xl transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${config.color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <Badge variant="outline" className={config.badge}>
              {scanType.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-white text-lg mb-3">
            {scanType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Scan
          </CardTitle>
          <p className="text-gray-400 text-sm mb-4 h-12">
            {config.description}
          </p>
          <Button
            onClick={() => onStart(scanType)}
            disabled={isScanning}
            className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90`}
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Scan
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}