'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Cell } from 'recharts';
import { TrendingUp, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { useChartData } from '@/hooks/useDashboard';

// Palette de couleurs professionnelles selon le contexte
const COLORS = {
  // Bleu pour informations neutres (RDV)
  blue: {
    primary: '#3B82F6',      // Bleu vif
    opacity80: 'rgba(59, 130, 246, 0.8)',
    opacity60: 'rgba(59, 130, 246, 0.6)',
    opacity40: 'rgba(59, 130, 246, 0.4)',
    opacity20: 'rgba(59, 130, 246, 0.2)',
  },
  // Vert pour positif (revenus, succès)
  green: {
    primary: '#10B981',      // Vert émeraude
    opacity80: 'rgba(16, 185, 129, 0.8)',
    opacity60: 'rgba(16, 185, 129, 0.6)',
    opacity40: 'rgba(16, 185, 129, 0.4)',
    opacity20: 'rgba(16, 185, 129, 0.2)',
  },
  // Orange pour attention (consultations générales)
  orange: {
    primary: '#F59E0B',      // Orange ambré
    opacity80: 'rgba(245, 158, 11, 0.8)',
    opacity60: 'rgba(245, 158, 11, 0.6)',
    opacity40: 'rgba(245, 158, 11, 0.4)',
  },
  // Bleu foncé pour important (consultations spécialisées)
  indigo: {
    primary: '#6366F1',      // Indigo
    opacity80: 'rgba(99, 102, 241, 0.8)',
    opacity60: 'rgba(99, 102, 241, 0.6)',
    opacity40: 'rgba(99, 102, 241, 0.4)',
  },
  // Rouge pour critique/urgent
  red: {
    primary: '#EF4444',      // Rouge vif
    opacity80: 'rgba(239, 68, 68, 0.8)',
    opacity60: 'rgba(239, 68, 68, 0.6)',
  },
};

export default function DashboardCharts() {
  const { data: chartData, isLoading, error } = useChartData();

  // Données par défaut si vides ou en chargement
  const defaultAppointmentsData = [
    { name: 'Lun', rdv: 0 },
    { name: 'Mar', rdv: 0 },
    { name: 'Mer', rdv: 0 },
    { name: 'Jeu', rdv: 0 },
    { name: 'Ven', rdv: 0 },
    { name: 'Sam', rdv: 0 },
  ];

  const defaultRevenueData = [
    { month: 'Jan', revenue: 0 },
    { month: 'Fév', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Avr', revenue: 0 },
    { month: 'Mai', revenue: 0 },
    { month: 'Juin', revenue: 0 },
  ];

  const defaultStatusDistribution = [
    { name: 'Nouvelles demandes', value: 0, fill: COLORS.orange.opacity80, description: 'À traiter en priorité' },
    { name: 'En attente patient', value: 0, fill: COLORS.blue.opacity60, description: 'Proposition envoyée' },
    { name: 'Contre-propositions', value: 0, fill: 'rgba(139, 92, 246, 0.7)', description: 'Patient a répondu' },
    { name: 'Confirmés', value: 0, fill: COLORS.green.opacity60, description: 'RDV validés' },
    { name: 'Annulés/Refusés', value: 0, fill: COLORS.red.opacity60, description: 'Terminés sans suite' },
  ];

  const chartAppointments = chartData?.appointments_evolution || defaultAppointmentsData;
  const chartRevenue = chartData?.revenue_data || defaultRevenueData;
  const chartStatus = chartData?.status_distribution || defaultStatusDistribution;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className={`bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain flex items-center justify-center ${i === 3 ? 'lg:col-span-2' : ''}`}
            style={{ height: i === 3 ? '300px' : '250px' }}
          >
            <Loader2 className="h-6 w-6 animate-spin text-vida-teal" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-xs text-red-600">Erreur de chargement des graphiques</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Évolution des RDV (Courbe avec remplissage dégradé) */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-vida-teal/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-vida-teal" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-heading">
              Évolution des RDV
            </h3>
            <p className="text-[10px] text-gray-500">7 derniers jours</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartAppointments}>
            <defs>
              <linearGradient id="colorRdv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.blue.primary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.blue.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              stroke="#E5E7EB"
              strokeOpacity={0.5}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              stroke="#E5E7EB"
              strokeOpacity={0.5}
              domain={[0, 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                fontSize: '11px', 
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="rdv" 
              stroke={COLORS.blue.primary} 
              strokeWidth={2}
              fill="url(#colorRdv)"
              dot={{ fill: COLORS.blue.primary, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: COLORS.blue.primary, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Statut des demandes (Barres horizontales) */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-vida-teal/10 rounded-lg">
            <Calendar className="h-4 w-4 text-vida-teal" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-heading">
              Demandes de rendez-vous par statut
            </h3>
            <p className="text-[10px] text-gray-500">Actions requises et suivi en temps réel</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartStatus} layout="vertical" barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
            <XAxis 
              type="number"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              stroke="#E5E7EB"
              strokeOpacity={0.5}
              domain={[0, 'auto']}
            />
            <YAxis 
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              stroke="#E5E7EB"
              strokeOpacity={0.5}
              width={120}
            />
            <Tooltip 
              contentStyle={{ 
                fontSize: '11px', 
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)'
              }}
              formatter={(value: any, name: any, props: any) => {
                const val = Number(value) || 0;
                return [
                  `${val} demande${val > 1 ? 's' : ''}`,
                  props.payload.description || name
                ];
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
            >
              {chartStatus.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenus mensuels (Barres minces sans border radius) */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain lg:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-vida-teal/10 rounded-lg">
            <DollarSign className="h-4 w-4 text-vida-teal" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-heading">
              Revenus mensuels
            </h3>
            <p className="text-[10px] text-gray-500">6 derniers mois</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartRevenue} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              stroke="#E5E7EB"
              strokeOpacity={0.5}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              stroke="#E5E7EB"
              strokeOpacity={0.5}
              domain={[0, 'auto']}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                fontSize: '11px', 
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)'
              }}
              formatter={(value: number | undefined) => {
                if (value === undefined) return ['0 FCFA', 'Revenus'];
                return [`${value.toLocaleString('fr-FR')} FCFA`, 'Revenus'];
              }}
            />
            <Bar 
              dataKey="revenue" 
              fill={COLORS.green.opacity60}
              radius={[0, 0, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
