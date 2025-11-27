import React from 'react';
import { Server, Database, Zap, Clock, AlertTriangle } from 'lucide-react';

export default function ArchitectureStatus({ headers }){
  if (!headers) return null;
  const timingHeader = headers.get('server-timing');
  const durationMatch = timingHeader ? timingHeader.match(/dur=([\d.]+)/) : null;
  const duration = durationMatch ? parseFloat(durationMatch[1]) : 0;
  const source = headers.get('x-source-service') || 'Unknown';
  const dataSource = headers.get('x-data-source') || 'db';
  const health = headers.get('x-system-health') || 'healthy';
  const isCache = dataSource === 'redis';
  const isFast = duration < 50;
  const isDegraded = health === 'degraded';
  const statusColor = isDegraded ? 'bg-amber-500' : (isCache ? 'bg-emerald-500' : (isFast ? 'bg-blue-500' : 'bg-amber-500'));
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 px-4 py-2 bg-slate-900/90 backdrop-blur text-slate-50 rounded-full shadow-2xl border border-slate-700 transition-all hover:scale-105">
        <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
          <Server size={14} className="text-slate-400" />
          <span className="text-xs font-mono uppercase tracking-wider">{source}</span>
        </div>
        <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
          {isDegraded ? (
            <div className="flex items-center gap-1 text-amber-400 animate-pulse">
              <AlertTriangle size={14} />
              <span className="text-xs font-bold">FAILOVER (Redis Down)</span>
            </div>
          ) : (
            <>
              {isCache ? <Zap size={14} className="text-yellow-400" /> : <Database size={14} className="text-blue-400" />}
              <span className="text-xs font-medium">{isCache ? 'REDIS CACHE' : 'MONGODB'}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
          <Clock size={14} className="text-slate-400" />
          <span className={`text-xs font-mono font-bold ${isFast ? 'text-emerald-400' : 'text-amber-400'}`}>{duration.toFixed(2)}ms</span>
        </div>
      </div>
    </div>
  );
}
