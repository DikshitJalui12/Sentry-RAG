import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Search, Filter, FileText, User, Calendar, 
  ShieldAlert, CheckCircle, XCircle, Clock, Terminal
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Events() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => base44.entities.SecurityEvent.list('-timestamp', 100),
  });

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery || 
      JSON.stringify(event).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || event.event_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesUser = !userFilter || 
      event.user_identifier?.toLowerCase().includes(userFilter.toLowerCase());

    return matchesSearch && matchesType && matchesStatus && matchesUser;
  });

  const statusColors = {
    success: "text-green-400",
    failure: "text-red-400",
    blocked: "text-orange-400",
    suspicious: "text-yellow-400"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Terminal className="w-10 h-10 text-blue-400" />
            Security Events Log
          </h1>
          <p className="text-gray-400">
            Detailed event logs including logins, access attempts, and system activities.
          </p>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search generic logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              
              <div className="w-[200px]">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Filter by User (e.g. svc_admin)"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="failed_login">Failed Login</SelectItem>
                  <SelectItem value="file_access">File Access</SelectItem>
                  <SelectItem value="network_connection">Network</SelectItem>
                  <SelectItem value="privilege_escalation">Privilege Esc</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="suspicious">Suspicious</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-800/50">
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-gray-400">Timestamp</TableHead>
                  <TableHead className="text-gray-400">Event Type</TableHead>
                  <TableHead className="text-gray-400">User</TableHead>
                  <TableHead className="text-gray-400">Source IP</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                      No events found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id} className="border-gray-800 hover:bg-gray-800/30">
                      <TableCell className="font-mono text-sm text-gray-300">
                        {event.timestamp ? format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
                          {event.event_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {event.user_identifier}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-400">
                        {event.source_ip}
                      </TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1.5 ${statusColors[event.status] || "text-gray-400"}`}>
                          {event.status === 'success' && <CheckCircle className="w-4 h-4" />}
                          {event.status === 'failure' && <XCircle className="w-4 h-4" />}
                          {['blocked', 'suspicious'].includes(event.status) && <ShieldAlert className="w-4 h-4" />}
                          {event.status?.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-gray-500 text-sm" title={event.details}>
                        {event.details}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}