import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Shield, Activity, ExternalLink, Clock } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const severityConfig = {
  critical: { color: "bg-red-500/20 text-red-300 border-red-500/50", icon: AlertTriangle, label: "CRITICAL" },
  high: { color: "bg-orange-500/20 text-orange-300 border-orange-500/50", icon: AlertTriangle, label: "HIGH" },
  medium: { color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/50", icon: Shield, label: "MEDIUM" },
  low: { color: "bg-blue-500/20 text-blue-300 border-blue-500/50", icon: Activity, label: "LOW" },
  info: { color: "bg-gray-500/20 text-gray-300 border-gray-500/50", icon: Activity, label: "INFO" }
};

export default function ThreatFeed({ threats, isLoading }) {
  return (
    <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Live Threat Feed
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-400">Real-time</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Loading threat intelligence...</p>
            </div>
          ) : threats.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No active threats detected</p>
              <p className="text-gray-600 text-sm mt-2">All systems operational</p>
            </div>
          ) : (
            <AnimatePresence>
              {threats.map((threat, index) => {
                const config = severityConfig[threat.severity] || severityConfig.info;
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={threat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}/10 border ${config.color.split('border-')[1]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-white font-semibold text-sm">{threat.title}</h4>
                            <Badge variant="outline" className={`${config.color} text-xs shrink-0`}>
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{threat.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {threat.created_date ? format(new Date(threat.created_date), 'MMM d, HH:mm') : 'Recent'}
                              </span>
                              <span className="px-2 py-1 rounded bg-gray-800 text-gray-400">
                                {threat.category?.replace(/_/g, ' ')}
                              </span>
                              {threat.confidence_score && (
                                <span className="text-blue-400 font-medium">
                                  {threat.confidence_score}% confidence
                                </span>
                              )}
                            </div>
                            <Link to={createPageUrl('ThreatIntelligence')}>
                              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Analyze
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}