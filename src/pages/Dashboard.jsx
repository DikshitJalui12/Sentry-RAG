import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Shield, AlertTriangle, Activity, Database, 
  Brain, RefreshCw, Plus, TrendingUp 
} from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import ThreatFeed from "../components/dashboard/ThreatFeed";
import SourcesOverview from "../components/dashboard/SourcesOverview";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: threats = [], isLoading: threatsLoading, refetch: refetchThreats } = useQuery({
    queryKey: ['threats'],
    queryFn: () => base44.entities.Threat.list('-created_date', 20),
  });

  const { data: sources = [], isLoading: sourcesLoading, refetch: refetchSources } = useQuery({
    queryKey: ['sources'],
    queryFn: () => base44.entities.DataSource.list(),
  });

  const { data: alerts = [], refetch: refetchAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 50),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchThreats(),
      refetchSources(),
      refetchAlerts()
    ]);
    setIsRefreshing(false);
  };

  const criticalThreats = threats.filter(t => t.severity === 'critical' && t.status === 'active').length;
  const activeThreats = threats.filter(t => ['active', 'investigating'].includes(t.status)).length;
  const newAlerts = alerts.filter(a => a.status === 'new').length;
  const activeSources = sources.filter(s => s.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-blue-400" />
              Sentry-RAG Command Center
            </h1>
            <p className="text-gray-400">Real-time threat detection & AI-powered analysis</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Link to={createPageUrl('AIAssistant')}>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Brain className="w-4 h-4 mr-2" />
                AI Analyst
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Critical Threats"
            value={criticalThreats}
            icon={AlertTriangle}
            color="red"
            trend={criticalThreats > 0 ? "up" : "down"}
            trendValue={criticalThreats > 0 ? `${criticalThreats} active` : "None"}
          />
          <StatsCard
            title="Active Threats"
            value={activeThreats}
            icon={Activity}
            color="orange"
            trend="up"
            trendValue={`${activeThreats} monitored`}
          />
          <StatsCard
            title="New Alerts"
            value={newAlerts}
            icon={AlertTriangle}
            color="purple"
            trend={newAlerts > 0 ? "up" : "down"}
            trendValue={`${newAlerts} pending`}
          />
          <StatsCard
            title="Active Sources"
            value={activeSources}
            icon={Database}
            color="green"
            trend="up"
            trendValue={`${activeSources}/${sources.length} online`}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={createPageUrl('ThreatIntelligence')} className="block">
            <Button variant="outline" className="w-full h-20 border-gray-800 bg-gradient-to-br from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border-red-500/30">
              <div className="text-left w-full">
                <AlertTriangle className="w-5 h-5 text-red-400 mb-1" />
                <p className="font-semibold text-white">Threat Intel</p>
                <p className="text-xs text-gray-400">Analyze threats</p>
              </div>
            </Button>
          </Link>

          <Link to={createPageUrl('Sources')} className="block">
            <Button variant="outline" className="w-full h-20 border-gray-800 bg-gradient-to-br from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 border-purple-500/30">
              <div className="text-left w-full">
                <Database className="w-5 h-5 text-purple-400 mb-1" />
                <p className="font-semibold text-white">Data Sources</p>
                <p className="text-xs text-gray-400">Manage sources</p>
              </div>
            </Button>
          </Link>

          <Link to={createPageUrl('Alerts')} className="block">
            <Button variant="outline" className="w-full h-20 border-gray-800 bg-gradient-to-br from-orange-500/10 to-orange-600/10 hover:from-orange-500/20 hover:to-orange-600/20 border-orange-500/30">
              <div className="text-left w-full">
                <Activity className="w-5 h-5 text-orange-400 mb-1" />
                <p className="font-semibold text-white">Alerts</p>
                <p className="text-xs text-gray-400">View alerts</p>
              </div>
            </Button>
          </Link>

          <Link to={createPageUrl('Analytics')} className="block">
            <Button variant="outline" className="w-full h-20 border-gray-800 bg-gradient-to-br from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 border-blue-500/30">
              <div className="text-left w-full">
                <TrendingUp className="w-5 h-5 text-blue-400 mb-1" />
                <p className="font-semibold text-white">Analytics</p>
                <p className="text-xs text-gray-400">View reports</p>
              </div>
            </Button>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ThreatFeed threats={threats} isLoading={threatsLoading} />
          </div>
          <div>
            <SourcesOverview sources={sources} isLoading={sourcesLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}