import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Database, Plus, CheckCircle, XCircle, AlertCircle, 
  Activity, RefreshCw, Trash2, Edit, Loader2, Play 
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Sources() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const queryClient = useQueryClient();

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ['sources'],
    queryFn: () => base44.entities.DataSource.list('-created_date'),
  });

  const createSourceMutation = useMutation({
    mutationFn: (data) => base44.entities.DataSource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      setIsAddDialogOpen(false);
      toast.success('Data source added');
    },
  });

  const updateSourceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DataSource.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      setEditingSource(null);
      toast.success('Source updated');
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: (id) => base44.entities.DataSource.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      toast.success('Source deleted');
    },
  });

  const scanSourceMutation = useMutation({
    mutationFn: async ({ id, data }) => {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        return base44.entities.DataSource.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      toast.success('Source scan completed');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      type: formData.get('type'),
      description: formData.get('description'),
      endpoint: formData.get('endpoint'),
      status: 'active',
      last_scan: new Date().toISOString(),
      threats_detected: 0
    };

    if (editingSource) {
      updateSourceMutation.mutate({ id: editingSource.id, data });
    } else {
      createSourceMutation.mutate(data);
    }
  };

  const statusConfig = {
    active: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/50' },
    inactive: { icon: XCircle, color: 'text-gray-400', bgColor: 'bg-gray-500/20 border-gray-500/50' },
    error: { icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/50' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Database className="w-10 h-10 text-purple-400" />
                Data Sources
              </h1>
              <p className="text-gray-400">Manage threat detection data sources</p>
            </div>
            <Dialog open={isAddDialogOpen || !!editingSource} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) setEditingSource(null);
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                  <DialogTitle>{editingSource ? 'Edit Source' : 'Add New Data Source'}</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Configure a new data source for threat monitoring
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Source Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        required 
                        defaultValue={editingSource?.name}
                        className="bg-gray-800 border-gray-700" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select name="type" defaultValue={editingSource?.type || 'other'}>
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="network_traffic">Network Traffic</SelectItem>
                          <SelectItem value="system_logs">System Logs</SelectItem>
                          <SelectItem value="email_gateway">Email Gateway</SelectItem>
                          <SelectItem value="web_traffic">Web Traffic</SelectItem>
                          <SelectItem value="database_activity">Database Activity</SelectItem>
                          <SelectItem value="api_endpoint">API Endpoint</SelectItem>
                          <SelectItem value="threat_feed">Threat Feed</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="endpoint">Endpoint/URL</Label>
                      <Input 
                        id="endpoint" 
                        name="endpoint" 
                        defaultValue={editingSource?.endpoint}
                        placeholder="https://..." 
                        className="bg-gray-800 border-gray-700" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        defaultValue={editingSource?.description}
                        className="bg-gray-800 border-gray-700" 
                        rows={3} 
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit" disabled={createSourceMutation.isPending || updateSourceMutation.isPending}>
                      {(createSourceMutation.isPending || updateSourceMutation.isPending) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        editingSource ? 'Update' : 'Add Source'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : sources.length === 0 ? (
          <div className="text-center py-20">
            <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No data sources configured</h3>
            <p className="text-gray-400 mb-6">Add your first data source to start monitoring</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sources.map((source, index) => {
              const config = statusConfig[source.status] || statusConfig.inactive;
              const Icon = config.icon;

              return (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm hover:shadow-xl transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/50">
                            <Database className="w-5 h-5 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg mb-2">{source.name}</CardTitle>
                            <Badge variant="outline" className={config.bgColor}>
                              <Icon className={`w-3 h-3 mr-1 ${config.color}`} />
                              {source.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingSource(source)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Delete this source?')) {
                                deleteSourceMutation.mutate(source.id);
                              }
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Button 
                            size="sm" 
                            className="w-full bg-gray-800 hover:bg-gray-700 text-xs h-7"
                            disabled={scanSourceMutation.isPending}
                            onClick={() => {
                                const newThreats = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;
                                const status = Math.random() > 0.9 ? 'error' : 'active';
                                
                                if (newThreats > 0) {
                                    toast.warning(`${newThreats} threats detected in ${source.name}`);
                                }

                                scanSourceMutation.mutate({
                                    id: source.id,
                                    data: { 
                                        ...source, 
                                        last_scan: new Date().toISOString(), 
                                        status: status,
                                        threats_detected: (source.threats_detected || 0) + newThreats
                                    }
                                });
                            }}
                        >
                            {scanSourceMutation.isPending ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                                <Play className="w-3 h-3 mr-1" />
                            )}
                            {scanSourceMutation.isPending ? 'Scanning...' : 'Scan Now'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-4">{source.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Type</span>
                          <span className="text-gray-300">{source.type?.replace(/_/g, ' ')}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Threats Detected</span>
                          <span className="font-semibold text-white">{source.threats_detected || 0}</span>
                        </div>
                        
                        {source.last_scan && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Last Scan</span>
                            <span className="text-gray-300">
                              {format(new Date(source.last_scan), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                        )}

                        {source.endpoint && (
                          <div className="pt-3 border-t border-gray-800">
                            <p className="text-xs text-gray-600 truncate">{source.endpoint}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}