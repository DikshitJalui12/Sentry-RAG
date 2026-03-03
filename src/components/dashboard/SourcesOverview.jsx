import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, CheckCircle, XCircle, AlertCircle, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SourcesOverview({ sources, isLoading }) {
  const activeCount = sources.filter(s => s.status === 'active').length;
  const inactiveCount = sources.filter(s => s.status === 'inactive').length;
  const errorCount = sources.filter(s => s.status === 'error').length;

  return (
    <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            Data Sources
          </CardTitle>
          <Link to={createPageUrl('Sources')}>
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Manage
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-2xl font-bold text-white">{activeCount}</span>
            </div>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <span className="text-2xl font-bold text-white">{errorCount}</span>
            </div>
            <p className="text-xs text-gray-500">Errors</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-gray-400" />
              <span className="text-2xl font-bold text-white">{inactiveCount}</span>
            </div>
            <p className="text-xs text-gray-500">Inactive</p>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading sources...</p>
            </div>
          ) : sources.slice(0, 5).map((source) => (
            <div key={source.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-white">{source.name}</p>
                  <p className="text-xs text-gray-500">{source.type?.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={
                  source.status === 'active' 
                    ? 'bg-green-500/20 text-green-300 border-green-500/50' 
                    : source.status === 'error'
                    ? 'bg-red-500/20 text-red-300 border-red-500/50'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                }
              >
                {source.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}