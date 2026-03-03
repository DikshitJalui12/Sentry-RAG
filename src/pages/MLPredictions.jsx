import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowLeft, ShieldAlert, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function MLPredictions() {
  const { data: scans = [], isLoading } = useQuery({
    queryKey: ['scans-with-predictions'],
    queryFn: () => base44.entities.ScanResult.list('-created_date', 50),
  });

  // Flatten all predictions from all scans
  const allPredictions = scans.flatMap(scan => 
    (scan.ml_predictions || []).map(pred => ({
      ...pred,
      scanId: scan.id,
      scanName: scan.scan_name,
      scanDate: scan.created_date,
      scanType: scan.scan_type
    }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
            <div>
                <Link to={createPageUrl('ThreatScanner')}>
                    <Button variant="ghost" className="text-gray-400 hover:text-white mb-2 pl-0">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Scanner
                    </Button>
                </Link>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <Brain className="w-10 h-10 text-purple-400" />
                    ML Threat Predictions
                </h1>
                <p className="text-gray-400">
                    Aggregated predictive insights from all security scans.
                </p>
            </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Loading predictions...</div>
        ) : allPredictions.length === 0 ? (
          <div className="text-center py-20">
            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Predictions Yet</h3>
            <p className="text-gray-400">Run predictive scans to generate insights.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allPredictions.map((pred, idx) => (
              <Card key={idx} className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm hover:shadow-lg transition-all hover:border-purple-500/30">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                      {pred.probability}% Probability
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        {format(new Date(pred.scanDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <CardTitle className="text-white text-lg mt-2 flex items-center gap-2">
                    {pred.threat_type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {pred.description}
                  </p>
                  
                  <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        Source: {pred.scanName}
                    </div>
                    <Link to={createPageUrl('ScanDetails') + `?id=${pred.scanId}`}>
                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
                            View Scan <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}