import React from 'react';
import { Server, Database, Zap, Clock, AlertTriangle } from 'lucide-react';

export default function ArchitectureStatus({ headers }){
  if (!headers) return null;
  const timingHeader = headers.get('server-timing');
  const durationMatch = timingHeader ? timingHeader.match(/dur=([\d.]+)/) : null;
  const duration = durationMatch ? parseFloat(durationMatch[1]) : 0;
  const sourceRaw = headers.get('x-source-service') || 'gateway';
  const SERVICE_NAMES = {
    'users-service': 'Users Core',
    'products-service': 'Catalog API',
    'orders-service': 'Order Manager',
    'auth-service': 'Identity (Auth)',
    'gateway': 'API Gateway'
  };
  const source = SERVICE_NAMES[String(sourceRaw).toLowerCase()] || sourceRaw || 'API Gateway';
  const dataSource = headers.get('x-data-source') || 'db';
  const health = headers.get('x-system-health') || 'healthy';
  const isCache = dataSource === 'redis';
  const isFast = duration < 50;
  const isDegraded = health === 'degraded';
  const statusColor = isDegraded ? 'bg-amber-500' : (isCache ? 'bg-emerald-500' : (isFast ? 'bg-blue-500' : 'bg-amber-500'));
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 px-4 py-2 bg-white text-slate-900 rounded-full shadow-xl border border-slate-200">
        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
          <Server size={14} className="text-slate-500" />
          <span className="text-xs font-mono uppercase tracking-wider">{source}</span>
        </div>
        <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
          {isDegraded ? (
            <div className="flex items-center gap-1 text-amber-600">
              <AlertTriangle size={14} />
              <span className="text-xs font-bold">FAILOVER</span>
            </div>
          ) : (
            <>
              {isCache ? <Zap size={14} className="text-emerald-600" /> : <Database size={14} className="text-indigo-600" />}
              <span className="text-xs font-medium">{isCache ? 'REDIS CACHE' : 'MONGODB'}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`} />
          <Clock size={14} className="text-slate-500" />
          <span className={`text-xs font-mono font-bold ${isFast ? 'text-emerald-600' : 'text-amber-600'}`}>{duration.toFixed(2)}ms</span>
        </div>
      </div>
    </div>
  );
}
