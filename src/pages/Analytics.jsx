import React, { useMemo } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, BarChart3, PieChart, Activity, 
  AlertTriangle, Shield, Loader2 
} from "lucide-react";
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

export default function Analytics() {
  const { data: threats = [], isLoading: threatsLoading } = useQuery({
    queryKey: ['threats'],
    queryFn: () => base44.entities.Threat.list('-created_date', 200),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 200),
  });

  const analytics = useMemo(() => {
    // Severity distribution
    const severityData = [
      { name: 'Critical', value: threats.filter(t => t.severity === 'critical').length, color: '#ef4444' },
      { name: 'High', value: threats.filter(t => t.severity === 'high').length, color: '#f97316' },
      { name: 'Medium', value: threats.filter(t => t.severity === 'medium').length, color: '#eab308' },
      { name: 'Low', value: threats.filter(t => t.severity === 'low').length, color: '#3b82f6' }
    ];

    // Category distribution
    const categoryCount = {};
    threats.forEach(t => {
      const cat = t.category || 'other';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value
    }));

    // Status distribution
    const statusData = [
      { name: 'Active', value: threats.filter(t => t.status === 'active').length },
      { name: 'Investigating', value: threats.filter(t => t.status === 'investigating').length },
      { name: 'Contained', value: threats.filter(t => t.status === 'contained').length },
      { name: 'Resolved', value: threats.filter(t => t.status === 'resolved').length }
    ];

    // Trend data (mock time-based data)
    const trendData = Array.from({ length: 7 }, (_, i) => ({
      day: `Day ${i + 1}`,
      threats: Math.floor(Math.random() * 15) + 5,
      alerts: Math.floor(Math.random() * 20) + 10
    }));

    return {
      severityData,
      categoryData,
      statusData,
      trendData,
      totalThreats: threats.length,
      totalAlerts: alerts.length,
      criticalThreats: threats.filter(t => t.severity === 'critical').length,
      activeThreats: threats.filter(t => t.status === 'active').length
    };
  }, [threats, alerts]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899'];

  if (threatsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-blue-400" />
            Threat Analytics
          </h1>
          <p className="text-gray-400">Comprehensive security metrics and insights</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-gray-800 bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Critical Threats</p>
                    <p className="text-3xl font-bold text-white">{analytics.criticalThreats}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-gray-800 bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Active Threats</p>
                    <p className="text-3xl font-bold text-white">{analytics.activeThreats}</p>
                  </div>
                  <Activity className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-gray-800 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Threats</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalThreats}</p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-gray-800 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Alerts</p>
                    <p className="text-3xl font-bold text-white">{analytics.totalAlerts}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Severity Distribution */}
          <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={analytics.severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Distribution */}
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white">Threat Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">7-Day Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="alerts" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}