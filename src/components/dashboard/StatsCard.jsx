import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = "blue" }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    red: "from-red-500/20 to-red-600/20 border-red-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
    orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30"
  };

  const iconColorClasses = {
    blue: "text-blue-400",
    red: "text-red-400",
    green: "text-green-400",
    orange: "text-orange-400",
    purple: "text-purple-400"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`relative overflow-hidden border bg-gradient-to-br backdrop-blur-sm ${colorClasses[color]}`}>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
              <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
              {trend && (
                <div className="flex items-center gap-1 mt-2">
                  {trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {trendValue}
                  </span>
                  <span className="text-sm text-gray-500">vs last period</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50`}>
              <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </Card>
    </motion.div>
  );
}