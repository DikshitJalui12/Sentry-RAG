import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  AlertTriangle, Shield, Activity, ChevronRight, 
  Target, Clock, TrendingUp, CheckCircle 
} from "lucide-react";
import { format } from "date-fns";

const severityConfig = {
  critical: { 
    color: "from-red-500/20 to-red-600/20 border-red-500/50", 
    badge: "bg-red-500/20 text-red-300 border-red-500/50",
    icon: AlertTriangle 
  },
  high: { 
    color: "from-orange-500/20 to-orange-600/20 border-orange-500/50", 
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/50",
    icon: AlertTriangle 
  },
  medium: { 
    color: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/50", 
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50",
    icon: Shield 
  },
  low: { 
    color: "from-blue-500/20 to-blue-600/20 border-blue-500/50", 
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    icon: Activity 
  }
};

const statusConfig = {
  active: { color: "bg-red-500/20 text-red-300 border-red-500/50", label: "ACTIVE" },
  investigating: { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50", label: "INVESTIGATING" },
  contained: { color: "bg-blue-500/20 text-blue-300 border-blue-500/50", label: "CONTAINED" },
  resolved: { color: "bg-green-500/20 text-green-300 border-green-500/50", label: "RESOLVED" },
  false_positive: { color: "bg-gray-500/20 text-gray-400 border-gray-500/50", label: "FALSE POSITIVE" }
};

export default function ThreatCard({ threat, onClick }) {
  const config = severityConfig[threat.severity] || severityConfig.medium;
  const statusCfg = statusConfig[threat.status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`border bg-gradient-to-br backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all ${config.color}`}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg mb-1">{threat.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={config.badge}>
                    {threat.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={statusCfg.color}>
                    {statusCfg.label}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-700/30 text-gray-300 border-gray-600">
                    {threat.category?.replace(/_/g, ' ')}
                  </Badge>
                  {threat.mitre_attack_techniques && threat.mitre_attack_techniques.length > 0 && (
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                      {threat.mitre_attack_techniques[0]}
                      {threat.mitre_attack_techniques.length > 1 && ` +${threat.mitre_attack_techniques.length - 1}`}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{threat.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-gray-500 text-xs">Confidence</p>
                <p className="text-white font-semibold">{threat.confidence_score || 85}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-gray-500 text-xs">Detected</p>
                <p className="text-white font-semibold">
                  {threat.detected_at ? format(new Date(threat.detected_at), 'dd/MM/yyyy HH:mm') : 
                   threat.created_date ? format(new Date(threat.created_date), 'dd/MM/yyyy HH:mm') : 'Recent'}
                </p>
              </div>
            </div>
          </div>

          {threat.affected_systems && threat.affected_systems.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Affected Systems</p>
              <div className="flex flex-wrap gap-1">
                {threat.affected_systems.slice(0, 3).map((system, idx) => (
                  <Badge key={idx} variant="outline" className="bg-gray-800/50 text-gray-400 border-gray-700 text-xs">
                    {system}
                  </Badge>
                ))}
                {threat.affected_systems.length > 3 && (
                  <Badge variant="outline" className="bg-gray-800/50 text-gray-400 border-gray-700 text-xs">
                    +{threat.affected_systems.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <span className="text-xs text-gray-500">
              Source: {threat.source || 'Unknown'}
            </span>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}