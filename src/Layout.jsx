import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Shield, LayoutDashboard, AlertTriangle, Database, 
  Brain, Bell, TrendingUp, LogOut, Scan, Book, Terminal 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
  const navigation = [
    { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
    { name: 'Threat Intel', page: 'ThreatIntelligence', icon: AlertTriangle },
    { name: 'ML Scanner', page: 'ThreatScanner', icon: Scan },
    { name: 'AI Assistant', page: 'AIAssistant', icon: Brain },
    { name: 'Data Sources', page: 'Sources', icon: Database },
    { name: 'Alerts', page: 'Alerts', icon: Bell },
    { name: 'Event Logs', page: 'Events', icon: Terminal }, // Added Event Logs
    { name: 'Analytics', page: 'Analytics', icon: TrendingUp },
    { name: 'Documentation', page: 'Documentation', icon: Book },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 z-50">
        <div className="p-6">
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sentry-RAG</h1>
              <p className="text-xs text-gray-400">Threat Detection</p>
            </div>
          </Link>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <Button
            onClick={() => base44.auth.logout()}
            variant="outline"
            className="w-full border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {children}
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl" />
      </div>
    </div>
  );
}