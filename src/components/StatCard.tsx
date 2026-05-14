import React from 'react';
import { cn } from '../lib/utils';
import { TrendingUp, Users, Phone, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: string;
  type?: 'leads' | 'conversion' | 'calls' | 'response';
  chartData?: any[];
}

export function StatCard({ label, value, subValue, trend, type, chartData }: StatCardProps) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-8 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-primary text-xs font-serif italic">{label}</span>
          {type === 'leads' && <Users className="w-4 h-4 text-on-surface-variant opacity-50" />}
          {type === 'calls' && <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#C5A059]" />}
        </div>
        
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-light text-on-surface tracking-tight">{value}</span>
          {subValue && <span className="text-xs text-on-surface-variant uppercase tracking-widest">{subValue}</span>}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5">
          {trend && (
             <div className={cn(
              "flex items-center gap-1 text-[11px] font-medium tracking-wider",
              trend.startsWith('+') ? "text-primary" : "text-error"
            )}>
              {trend}
              <TrendingUp className="w-3 h-3" />
            </div>
          )}
          {type === 'calls' && <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-medium">In Progress</span>}
          {type === 'response' && <span className="text-[10px] font-serif italic text-on-surface-variant opacity-60">Elite Optimization</span>}
        </div>

        {chartData && (
          <div className="h-8 w-24 opacity-60 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#C5A059" strokeWidth={1} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
