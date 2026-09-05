import React from 'react';
import { TimelineEvent } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Clock, CheckCircle2, AlertCircle, Bot, User, Cpu } from 'lucide-react';

interface IncidentTimelineProps {
  timeline: TimelineEvent[];
  className?: string;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  timeline,
  className = '',
}) => {
  const getAgentIcon = (agent: TimelineEvent['agent']) => {
    switch (agent) {
      case 'Detection Agent':
      case 'Investigation Agent':
      case 'Resolution Agent':
        return <Bot className="w-3.5 h-3.5 text-blue-400" />;
      case 'Human Operator':
        return <User className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <Card className={`p-5 sm:p-6 bg-white border-slate-200/80 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Incident Chronology & Agent Audit Log
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {timeline.length} Recorded Steps
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((event, index) => {
          const isLast = index === timeline.length - 1;
          const isCompleted = event.status === 'completed';

          return (
            <div key={event.id || index} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center ${
                  isCompleted
                    ? 'bg-white border-emerald-500 text-emerald-600 shadow-xs'
                    : 'bg-blue-50 border-blue-500 text-blue-600 animate-pulse'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`} />
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {event.title}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-white text-slate-700 border border-slate-200 font-semibold shadow-xs">
                      {getAgentIcon(event.agent)}
                      {event.agent}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {event.timestamp ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recently'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
