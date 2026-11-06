import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  teacherById,
  SKILL_LABELS,
  type TeacherId,
  type Skill,
} from '@fluencialab/shared';

export interface ProgressChartLineProps {
  type: 'line' | 'area';
  data: { date: string; minutes: number }[];
  title?: string;
  subtitle?: string;
}

export interface ProgressChartBarProps {
  type: 'bar';
  data: { teacherId: TeacherId; minutes: number }[];
  title?: string;
  subtitle?: string;
}

export interface ProgressChartRadarProps {
  type: 'radar';
  data: { skill: Skill; score: number }[];
  title?: string;
  subtitle?: string;
}

export type ProgressChartProps =
  | ProgressChartLineProps
  | ProgressChartBarProps
  | ProgressChartRadarProps;

function formatDateShort(isoDate: string): string {
  try {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return isoDate;
  } catch {
    return isoDate;
  }
}

export function ProgressChart(props: ProgressChartProps) {
  const { type, title, subtitle } = props;

  const chartContent = useMemo(() => {
    if (type === 'line' || type === 'area') {
      const lineData = props.data.map((d) => ({
        ...d,
        label: formatDateShort(d.date),
      }));

      return (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              unit="m"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value ?? 0} minutos`, 'Tempo de Estudo']}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#areaGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'bar') {
      const barData = props.data.map((d) => {
        const meta = teacherById(d.teacherId);
        return {
          teacherId: d.teacherId,
          name: meta?.shortName ?? d.teacherId,
          minutes: d.minutes,
        };
      });

      return (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              angle={-25}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              unit="m"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value ?? 0} minutos`, 'Dedicação semanal']}
            />
            <Bar
              dataKey="minutes"
              fill="#38bdf8"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'radar') {
      const radarData = props.data.map((d) => ({
        skillName: SKILL_LABELS[d.skill] ?? d.skill,
        score: d.score,
        fullMark: 100,
      }));

      return (
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis
              dataKey="skillName"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 9 }}
              stroke="#1e293b"
            />
            <Radar
              name="Domínio (%)"
              dataKey="score"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '12px',
              }}
              formatter={(value) => [`${value ?? 0}%`, 'Nível']}
            />
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    return null;
  }, [props, type]);

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="w-full flex-1 min-h-[260px] flex items-center justify-center">
        {chartContent}
      </div>
    </div>
  );
}
