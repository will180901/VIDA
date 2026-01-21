'use client';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface DashboardChartsProps {
  appointmentsData?: any[];
  revenueData?: any[];
  typeDistribution?: any[];
}

const COLORS = ['#0D5C63', '#14919B', '#45B7D1', '#96CEB4'];

export default function DashboardCharts({ 
  appointmentsData = [], 
  revenueData = [],
  typeDistribution = []
}: DashboardChartsProps) {
  
  // Données par défaut si vides
  const defaultAppointmentsData = [
    { name: 'Lun', rdv: 12 },
    { name: 'Mar', rdv: 19 },
    { name: 'Mer', rdv: 15 },
    { name: 'Jeu', rdv: 22 },
    { name: 'Ven', rdv: 18 },
    { name: 'Sam', rdv: 8 },
  ];

  const defaultRevenueData = [
    { month: 'Jan', revenue: 450000 },
    { month: 'Fév', revenue: 520000 },
    { month: 'Mar', revenue: 480000 },
    { month: 'Avr', revenue: 590000 },
    { month: 'Mai', revenue: 610000 },
    { month: 'Juin', revenue: 580000 },
  ];

  const defaultTypeDistribution = [
    { name: 'Consultation générale', value: 65, fill: COLORS[0] },
    { name: 'Consultation spécialisée', value: 35, fill: COLORS[1] },
  ];

  const chartAppointments = appointmentsData.length > 0 ? appointmentsData : defaultAppointmentsData;
  const chartRevenue = revenueData.length > 0 ? revenueData : defaultRevenueData;
  const chartTypes = typeDistribution.length > 0 ? typeDistribution : defaultTypeDistribution;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Évolution des RDV (Courbe) */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-vida-teal/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-vida-teal" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-heading">
              Évolution des RDV
            </h3>
            <p className="text-[10px] text-gray-500">Cette semaine</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartAppointments}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              stroke="#E5E7EB"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              stroke="#E5E7EB"
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
            <Line 
              type="monotone" 
              dataKey="rdv" 
              stroke="#0D5C63" 
              strokeWidth={2}
              dot={{ fill: '#0D5C63', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Répartition par type (Camembert) */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-4 vida-grain">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-vida-teal/10 rounded-lg">
            <Calendar className="h-4 w-4 text-vida-teal" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-heading">
              Types de consultation
            </h3>
            <p className="text-[10px] text-gray-500">Répartition ce mois</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartTypes}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
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
            <Legend 
              wrapperStyle={{ fontSize: '10px' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Revenus mensuels (Barres) */}
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
          <BarChart data={chartRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              stroke="#E5E7EB"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6B7280' }}
              stroke="#E5E7EB"
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
              fill="#0D5C63" 
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
