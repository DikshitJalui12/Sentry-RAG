import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, CheckCircle, XCircle, Clock, AlertTriangle, 
  Shield, Activity, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Alerts() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [mitreFilter, setMitreFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 100),
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Alert.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert updated');
    },
  });

  const handleAcknowledge = (alert) => {
    updateAlertMutation.mutate({
      id: alert.id,
      data: {
        ...alert,
        status: 'acknowledged',
        acknowledged_by: user?.email,
        acknowledged_at: new Date().toISOString()
      }
    });
  };

  const handleResolve = (alert) => {
    updateAlertMutation.mutate({
      id: alert.id,
      data: {
        ...alert,
        status: 'resolved',
        resolved_at: new Date().toISOString()
      }
    });
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || alert.priority === priorityFilter;
    const matchesMitre = !mitreFilter || (alert.mitre_attack_techniques && alert.mitre_attack_techniques.some(t => t.toLowerCase().includes(mitreFilter.toLowerCase())));
    return matchesStatus && matchesPriority && matchesMitre;
  });

  const priorityConfig = {
    critical: { color: 'bg-red-500/20 text-red-300 border-red-500/50', icon: AlertTriangle },
    high: { color: 'bg-orange-500/20 text-orange-300 border-orange-500/50', icon: AlertTriangle },
    medium: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', icon: Shield },
    low: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/50', icon: Activity }
  };

  const statusConfig = {
    new: { color: 'bg-red-500/20 text-red-300 border-red-500/50', label: 'NEW' },
    acknowledged: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', label: 'ACKNOWLEDGED' },
    resolved: { color: 'bg-green-500/20 text-green-300 border-green-500/50', label: 'RESOLVED' },
    dismissed: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/50', label: 'DISMISSED' }
  };

  const newAlerts = alerts.filter(a => a.status === 'new').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Bell className="w-10 h-10 text-orange-400" />
                Security Alerts
                {newAlerts > 0 && (
                  <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/50">
                    {newAlerts} New
                  </Badge>
                )}
              </h1>
              <p className="text-gray-400">Monitor and manage security alerts</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No alerts found</h3>
            <p className="text-gray-400">All clear!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredAlerts.map((alert, index) => {
                const priorityCfg = priorityConfig[alert.priority] || priorityConfig.medium;
                const statusCfg = statusConfig[alert.status] || statusConfig.new;
                const Icon = priorityCfg.icon;

                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${priorityCfg.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1">
                                <h3 className="text-white font-bold text-lg mb-1">{alert.title}</h3>
                                <p className="text-gray-400 text-sm mb-3">{alert.message}</p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <Badge variant="outline" className={priorityCfg.color}>
                                  {alert.priority?.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className={statusCfg.color}>
                                {statusCfg.label}
                                </Badge>
                                {alert.mitre_attack_techniques && alert.mitre_attack_techniques.length > 0 && (
                                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                                  {alert.mitre_attack_techniques.join(', ')}
                                </Badge>
                                )}
                                </div>
                                </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {alert.created_date && format(new Date(alert.created_date), 'dd/MM/yyyy HH:mm')}
                                </span>
                                <span className="px-2 py-1 rounded bg-gray-800 text-gray-400">
                                  {alert.type?.replace(/_/g, ' ')}
                                </span>
                                {alert.acknowledged_by && (
                                  <span className="text-blue-400">
                                    Ack by {alert.acknowledged_by}
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-2">
                                {alert.status === 'new' && (
                                  <Button
                                    onClick={() => handleAcknowledge(alert)}
                                    size="sm"
                                    variant="outline"
                                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-500/10"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Acknowledge
                                  </Button>
                                )}
                                {['new', 'acknowledged'].includes(alert.status) && (
                                  <Button
                                    onClick={() => handleResolve(alert)}
                                    size="sm"
                                    variant="outline"
                                    className="border-green-600 text-green-400 hover:bg-green-500/10"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Resolve
                                  </Button>
                                )}
                              </div>
                            </div>

                            {alert.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-800">
                                <p className="text-sm text-gray-500">Notes: {alert.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}