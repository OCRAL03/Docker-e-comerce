import React from 'react';

export default function Monitor(){
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-slate-200 rounded">
        <div className="p-3 border-b border-slate-200 font-medium">MailHog</div>
        <iframe title="mailhog" src="http://localhost:8025" className="w-full h-[70vh]"></iframe>
      </div>
      <div className="bg-white border border-slate-200 rounded">
        <div className="p-3 border-b border-slate-200 font-medium">Grafana</div>
        <iframe title="grafana" src="http://localhost:3000" className="w-full h-[70vh]"></iframe>
      </div>
    </div>
  );
}

