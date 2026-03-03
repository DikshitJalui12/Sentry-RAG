import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Book, Search, Shield, AlertTriangle, Brain, Database, 
  Bell, TrendingUp, Scan, LayoutDashboard, Play, Plus,
  Filter, RefreshCw, CheckCircle, Eye, Edit, Trash2,
  Send, Upload, Download, Settings, Users, ChevronRight, Activity
} from "lucide-react";
import { motion } from "framer-motion";

const documentationSections = [
  {
    id: 'overview',
    title: 'Platform Overview',
    icon: Shield,
    color: 'text-blue-400',
    content: {
      description: 'Sentry-RAG is an advanced threat detection platform powered by dual-source Retrieval-Augmented Generation (RAG) technology. It combines internal threat intelligence with real-time web data to identify, analyze, and predict security threats.',
      keyFeatures: [
        'Real-time threat monitoring and detection',
        'AI-powered threat analysis using dual-source RAG',
        'Machine learning-based predictive scanning',
        'Comprehensive data source management',
        'Alert management and triage system',
        'Advanced analytics and reporting',
        'Interactive AI assistant for threat investigation'
      ]
    }
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    color: 'text-green-400',
    features: [
      {
        name: 'Stats Cards',
        icon: TrendingUp,
        description: 'View real-time metrics including critical threats, active threats, new alerts, and active data sources.',
        usage: 'Stats update automatically. Click on any metric to drill down into details.'
      },
      {
        name: 'Threat Feed',
        icon: AlertTriangle,
        description: 'Live feed of detected threats with severity indicators, categories, and confidence scores.',
        buttons: [
          { name: 'Analyze', icon: Eye, action: 'Click to view detailed threat analysis' },
          { name: 'Refresh', icon: RefreshCw, action: 'Manually refresh the threat feed' }
        ]
      },
      {
        name: 'Quick Actions',
        icon: Play,
        description: 'Fast access buttons to navigate to different platform sections.',
        actions: [
          'Threat Intel - Analyze and manage threats',
          'Data Sources - Configure monitoring sources',
          'Alerts - View and manage security alerts',
          'Analytics - Access security reports'
        ]
      },
      {
        name: 'Data Sources Overview',
        icon: Database,
        description: 'Summary of all configured data sources with status indicators.',
        buttons: [
          { name: 'Manage', icon: Settings, action: 'Navigate to full data sources management' }
        ]
      }
    ]
  },
  {
    id: 'threats',
    title: 'Threat Intelligence',
    icon: AlertTriangle,
    color: 'text-red-400',
    features: [
      {
        name: 'Threat Cards',
        icon: Shield,
        description: 'Visual cards displaying threat information including severity, status, category, and affected systems.',
        details: 'Each card shows confidence score, detection time, and quick actions.'
      },
      {
        name: 'Add Threat',
        icon: Plus,
        description: 'Manually add detected threats to the system.',
        usage: 'Click "Add Threat" button → Fill in threat details (title, description, severity, category, source, affected systems) → Submit',
        fields: [
          'Title - Brief threat identifier',
          'Description - Detailed threat information',
          'Severity - Critical, High, Medium, Low',
          'Category - Malware, Phishing, Data Breach, etc.',
          'Source - Origin of threat detection',
          'Affected Systems - Comma-separated system names'
        ]
      },
      {
        name: 'Search & Filter',
        icon: Filter,
        description: 'Search threats by keywords and filter by severity or status.',
        buttons: [
          { name: 'Search Bar', icon: Search, action: 'Type keywords to search threats' },
          { name: 'Severity Filter', icon: Filter, action: 'Filter by Critical, High, Medium, Low' },
          { name: 'Status Filter', icon: Filter, action: 'Filter by Active, Investigating, Contained, Resolved' }
        ]
      },
      {
        name: 'AI Analysis',
        icon: Brain,
        description: 'Use AI to perform deep threat analysis with real-time intelligence.',
        usage: 'Click on any threat card → Click "AI Analysis" button → Wait for AI-powered analysis → View detailed insights, attack vectors, and remediation steps',
        output: 'Technical analysis, Attack vectors, Remediation steps, Threat indicators, Confidence assessment'
      },
      {
        name: 'Status Management',
        icon: CheckCircle,
        description: 'Update threat status throughout investigation lifecycle.',
        statuses: [
          'Active - Threat is currently active',
          'Investigating - Under investigation',
          'Contained - Threat has been contained',
          'Resolved - Threat fully resolved',
          'False Positive - Not an actual threat'
        ]
      }
    ]
  },
  {
    id: 'scanner',
    title: 'ML Threat Scanner',
    icon: Scan,
    color: 'text-purple-400',
    features: [
      {
        name: 'Scan Types',
        icon: Shield,
        description: 'Multiple scan types powered by machine learning algorithms.',
        types: [
          'Full System - Comprehensive scan across all systems',
          'Network - Network traffic analysis and intrusion detection',
          'Endpoint - Endpoint protection and malware detection',
          'Cloud - Cloud infrastructure security assessment',
          'Database - Database vulnerability and access pattern analysis',
          'Application - Application security and code vulnerability scan',
          'Predictive - ML-powered predictive threat intelligence'
        ]
      },
      {
        name: 'Starting a Scan',
        icon: Play,
        description: 'Initiate security scans with machine learning analysis.',
        usage: 'Navigate to "Start Scan" tab → Choose scan type → Click "Start Scan" → Monitor progress in "Active Scans" tab',
        process: [
          '1. Scan initialization and system preparation',
          '2. Progressive scanning with real-time updates',
          '3. ML-powered analysis phase',
          '4. Threat detection and vulnerability identification',
          '5. Predictive modeling for future threats',
          '6. Results compilation and report generation'
        ]
      },
      {
        name: 'Active Scans',
        icon: Activity,
        description: 'Monitor running scans with real-time progress tracking.',
        information: 'View progress percentage, threats found, vulnerabilities detected, and scan duration'
      },
      {
        name: 'Scan History',
        icon: Database,
        description: 'Review completed scans with detailed results.',
        details: 'Access threat counts, vulnerability reports, ML predictions, and scan duration for all completed scans'
      },
      {
        name: 'ML Predictions',
        icon: Brain,
        description: 'Machine learning algorithms predict potential future threats.',
        output: 'Threat type, Probability score (0-100%), Detailed description, Recommended preventive measures'
      }
    ]
  },
  {
    id: 'ai-assistant',
    title: 'AI Assistant (Sentry)',
    icon: Brain,
    color: 'text-purple-400',
    features: [
      {
        name: 'Chat Interface',
        icon: Send,
        description: 'Conversational AI assistant for threat investigation and analysis.',
        usage: 'Type your question or request → Press Enter or click Send → Receive AI-powered insights',
        capabilities: [
          'Analyze specific threats in detail',
          'Investigate security incidents',
          'Query threat database',
          'Get remediation recommendations',
          'Understand attack patterns',
          'Search for related threats',
          'Access real-time threat intelligence from the web'
        ]
      },
      {
        name: 'Dual-Source RAG',
        icon: Database,
        description: 'Combines internal threat database with real-time web intelligence.',
        sources: [
          'Internal Database - Historical threat data and patterns',
          'Web Intelligence - Current CVEs, threat feeds, security news'
        ]
      },
      {
        name: 'Example Queries',
        icon: Book,
        description: 'Sample questions to ask the AI assistant.',
        examples: [
          '"Analyze the latest ransomware threat"',
          '"What are the indicators of compromise for phishing attacks?"',
          '"Investigate suspicious database access patterns"',
          '"Show me threats related to CVE-2025-XXXX"',
          '"What remediation steps should I take for critical threats?"',
          '"Predict potential future attack vectors"'
        ]
      }
    ]
  },
  {
    id: 'sources',
    title: 'Data Sources',
    icon: Database,
    color: 'text-indigo-400',
    features: [
      {
        name: 'Source Management',
        icon: Database,
        description: 'Configure and monitor security data sources.',
        actions: [
          'View all data sources with status indicators',
          'Add new data sources',
          'Edit existing source configurations',
          'Delete unused sources',
          'Monitor threat detection counts'
        ]
      },
      {
        name: 'Add Source',
        icon: Plus,
        description: 'Register new data sources for threat monitoring.',
        usage: 'Click "Add Source" → Fill in details → Submit',
        fields: [
          'Name - Source identifier',
          'Type - Network Traffic, System Logs, Email Gateway, etc.',
          'Endpoint - Connection URL or address',
          'Description - Source purpose and details'
        ]
      },
      {
        name: 'Edit/Delete',
        icon: Edit,
        description: 'Modify or remove data sources.',
        buttons: [
          { name: 'Edit', icon: Edit, action: 'Update source configuration' },
          { name: 'Delete', icon: Trash2, action: 'Remove source (requires confirmation)' }
        ]
      },
      {
        name: 'Status Indicators',
        icon: CheckCircle,
        description: 'Monitor source operational status.',
        statuses: [
          'Active - Source is online and monitoring',
          'Inactive - Source is disabled',
          'Error - Source experiencing issues'
        ]
      }
    ]
  },
  {
    id: 'alerts',
    title: 'Alerts Management',
    icon: Bell,
    color: 'text-orange-400',
    features: [
      {
        name: 'Alert Cards',
        icon: AlertTriangle,
        description: 'Visual cards for each security alert with priority and type indicators.',
        information: 'Priority level, Alert type, Timestamp, Status, Associated threat'
      },
      {
        name: 'Alert Actions',
        icon: CheckCircle,
        description: 'Manage alerts throughout their lifecycle.',
        buttons: [
          { name: 'Acknowledge', icon: CheckCircle, action: 'Mark alert as acknowledged (for new alerts)' },
          { name: 'Resolve', icon: CheckCircle, action: 'Mark alert as resolved' }
        ]
      },
      {
        name: 'Filtering',
        icon: Filter,
        description: 'Filter alerts by status and priority.',
        filters: [
          'Status - All, New, Acknowledged, Resolved, Dismissed',
          'Priority - All, Critical, High, Medium, Low'
        ]
      },
      {
        name: 'Alert Types',
        icon: Bell,
        description: 'Different categories of security alerts.',
        types: [
          'Threat Detected - New threat identified',
          'System Anomaly - Unusual system behavior',
          'Threshold Exceeded - Metric exceeded limits',
          'Source Offline - Data source unavailable',
          'Investigation Required - Manual review needed'
        ]
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    icon: TrendingUp,
    color: 'text-blue-400',
    features: [
      {
        name: 'Overview Stats',
        icon: TrendingUp,
        description: 'High-level security metrics at a glance.',
        metrics: [
          'Critical Threats - Count of critical severity threats',
          'Active Threats - Currently active threat count',
          'Total Threats - Cumulative threat count',
          'Total Alerts - All alerts generated'
        ]
      },
      {
        name: 'Severity Distribution',
        icon: AlertTriangle,
        description: 'Pie chart showing threat distribution by severity level.',
        usage: 'Visual breakdown of Critical, High, Medium, and Low severity threats'
      },
      {
        name: 'Status Distribution',
        icon: CheckCircle,
        description: 'Bar chart displaying threat status breakdown.',
        categories: 'Active, Investigating, Contained, Resolved'
      },
      {
        name: 'Category Analysis',
        icon: Database,
        description: 'Bar chart showing threats by category.',
        categories: 'Malware, Phishing, Data Breach, Network Intrusion, Ransomware, etc.'
      },
      {
        name: '7-Day Trend',
        icon: TrendingUp,
        description: 'Line chart showing threat and alert trends over time.',
        data: 'Daily threat count and alert count for the past 7 days'
      }
    ]
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    icon: Book,
    color: 'text-green-400',
    practices: [
      {
        category: 'Regular Monitoring',
        items: [
          'Check dashboard daily for new threats and alerts',
          'Review ML scanner predictions weekly',
          'Analyze trends in analytics section monthly'
        ]
      },
      {
        category: 'Threat Response',
        items: [
          'Prioritize critical and high severity threats',
          'Use AI Assistant for detailed threat analysis',
          'Update threat status as investigation progresses',
          'Document remediation actions taken'
        ]
      },
      {
        category: 'Scanning Strategy',
        items: [
          'Run Full System scans weekly',
          'Schedule Predictive scans for proactive defense',
          'Perform targeted scans after major changes',
          'Review ML predictions for preventive measures'
        ]
      },
      {
        category: 'Data Source Management',
        items: [
          'Ensure all sources show "Active" status',
          'Investigate sources in "Error" state immediately',
          'Add new sources as infrastructure expands',
          'Remove obsolete sources to reduce noise'
        ]
      },
      {
        category: 'Alert Handling',
        items: [
          'Acknowledge new alerts promptly',
          'Investigate high-priority alerts first',
          'Resolve alerts only after full remediation',
          'Use alert filters to focus on critical items'
        ]
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: Settings,
    color: 'text-yellow-400',
    issues: [
      {
        problem: 'Scan not starting',
        solutions: [
          'Check if another scan of the same type is already running',
          'Refresh the page and try again',
          'Ensure network connectivity is stable',
          'Check browser console for error messages'
        ]
      },
      {
        problem: 'AI Assistant not responding',
        solutions: [
          'Wait a few seconds for response generation',
          'Check internet connection (needed for web intelligence)',
          'Try rephrasing your question',
          'Start a new conversation if issue persists'
        ]
      },
      {
        problem: 'Data source showing error',
        solutions: [
          'Verify endpoint URL is correct',
          'Check source system is online',
          'Review source credentials/permissions',
          'Edit source configuration and re-save'
        ]
      },
      {
        problem: 'Charts not displaying',
        solutions: [
          'Ensure sufficient data exists (add sample threats if needed)',
          'Refresh the analytics page',
          'Clear browser cache',
          'Try different browser if issue persists'
        ]
      }
    ]
  }
];

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    JSON.stringify(section).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSection = documentationSections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Book className="w-10 h-10 text-blue-400" />
            Platform Documentation
          </h1>
          <p className="text-gray-400">Complete guide to Sentry-RAG features and functionality</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-gray-800/50 border-gray-700 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm sticky top-6">
              <CardHeader>
                <CardTitle className="text-white text-sm">Table of Contents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {filteredSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        isActive
                          ? 'bg-blue-600/20 border border-blue-500/50 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? section.color : ''}`} />
                      <span className="text-sm font-medium">{section.title}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {currentSection && (
              <motion.div
                key={currentSection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Section Header */}
                <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {React.createElement(currentSection.icon, { 
                        className: `w-8 h-8 ${currentSection.color}` 
                      })}
                      <CardTitle className="text-white text-2xl">{currentSection.title}</CardTitle>
                    </div>
                    {currentSection.content?.description && (
                      <p className="text-gray-400 mt-2">{currentSection.content.description}</p>
                    )}
                  </CardHeader>
                </Card>

                {/* Key Features */}
                {currentSection.content?.keyFeatures && (
                  <Card className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Key Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {currentSection.content.keyFeatures.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Features */}
                {currentSection.features?.map((feature, idx) => (
                  <Card key={idx} className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {React.createElement(feature.icon, { className: 'w-5 h-5 text-blue-400' })}
                        <CardTitle className="text-white text-lg">{feature.name}</CardTitle>
                      </div>
                      <p className="text-gray-400 mt-2">{feature.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {feature.usage && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">How to Use:</h4>
                          <p className="text-gray-300 bg-gray-800/30 rounded-lg p-3 text-sm">{feature.usage}</p>
                        </div>
                      )}

                      {feature.buttons && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">Available Actions:</h4>
                          <div className="space-y-2">
                            {feature.buttons.map((button, bidx) => (
                              <div key={bidx} className="flex items-start gap-3 bg-gray-800/30 rounded-lg p-3">
                                {React.createElement(button.icon, { className: 'w-4 h-4 text-blue-400 mt-0.5' })}
                                <div>
                                  <p className="text-white font-medium text-sm">{button.name}</p>
                                  <p className="text-gray-400 text-xs">{button.action}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {feature.fields && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">Form Fields:</h4>
                          <ul className="space-y-1">
                            {feature.fields.map((field, fidx) => (
                              <li key={fidx} className="text-gray-300 text-sm pl-4 border-l-2 border-gray-700 py-1">
                                {field}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {feature.types && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">Scan Types:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {feature.types.map((type, tidx) => (
                              <div key={tidx} className="bg-gray-800/30 rounded-lg p-2">
                                <p className="text-gray-300 text-sm">{type}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {feature.process && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">Process:</h4>
                          <ol className="space-y-2">
                            {feature.process.map((step, sidx) => (
                              <li key={sidx} className="text-gray-300 text-sm flex items-start gap-2">
                                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50 shrink-0">
                                  {sidx + 1}
                                </Badge>
                                <span className="mt-0.5">{step.replace(/^\d+\.\s*/, '')}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {feature.capabilities && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">Capabilities:</h4>
                          <ul className="space-y-1">
                            {feature.capabilities.map((cap, cidx) => (
                              <li key={cidx} className="flex items-start gap-2 text-gray-300 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                <span>{cap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {feature.examples && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">Example Queries:</h4>
                          <div className="space-y-2">
                            {feature.examples.map((example, eidx) => (
                              <div key={eidx} className="bg-gray-800/50 rounded-lg p-3 border-l-2 border-purple-500">
                                <p className="text-purple-300 text-sm font-mono">{example}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(feature.details || feature.information || feature.output || feature.data) && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                          <p className="text-blue-300 text-sm">
                            {feature.details || feature.information || feature.output || feature.data}
                          </p>
                        </div>
                      )}

                      {(feature.statuses || feature.actions || feature.categories || feature.filters || feature.metrics || feature.sources) && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2">
                            {feature.statuses ? 'Status Options:' : 
                             feature.actions ? 'Actions:' :
                             feature.categories ? 'Categories:' :
                             feature.filters ? 'Filters:' :
                             feature.metrics ? 'Metrics:' : 'Sources:'}
                          </h4>
                          <ul className="space-y-1">
                            {(feature.statuses || feature.actions || feature.categories || feature.filters || feature.metrics || feature.sources)?.map((item, iidx) => (
                              <li key={iidx} className="text-gray-300 text-sm pl-4 border-l-2 border-gray-700 py-1">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Best Practices */}
                {currentSection.practices?.map((practice, idx) => (
                  <Card key={idx} className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{practice.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {practice.items.map((item, iidx) => (
                          <li key={iidx} className="flex items-start gap-2 text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}

                {/* Troubleshooting */}
                {currentSection.issues?.map((issue, idx) => (
                  <Card key={idx} className="border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <CardTitle className="text-white text-lg">{issue.problem}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Solutions:</h4>
                      <ul className="space-y-2">
                        {issue.solutions.map((solution, sidx) => (
                          <li key={sidx} className="flex items-start gap-2 text-gray-300 text-sm">
                            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50 shrink-0 mt-0.5">
                              {sidx + 1}
                            </Badge>
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}