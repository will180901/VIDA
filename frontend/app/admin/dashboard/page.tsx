'use client';

import StatCard from '@/components/admin/StatCard';
import QuickActions from '@/components/admin/QuickActions';
import RecentAppointments from '@/components/admin/RecentAppointments';
import DashboardCharts from '@/components/admin/DashboardCharts';
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboard';
import { DashboardSkeleton } from '@/components/admin/skeletons';

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-sm text-red-600 font-medium">Erreur de chargement</p>
          <p className="text-xs text-red-500 mt-1">
            Impossible de récupérer les statistiques. Vérifiez que le backend est démarré.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 font-heading">
          Dashboard
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">
          Vue d'ensemble de votre centre médical
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="RDV Aujourd'hui"
          value={stats?.today_appointments.total || 0}
          icon={Calendar}
          subtitle={stats?.today_appointments.subtitle}
          trend={{ value: stats?.trends.appointments || 0, isPositive: (stats?.trends.appointments || 0) >= 0 }}
        />
        <StatCard
          title="Patients Total"
          value={stats?.total_patients.total || 0}
          icon={Users}
          subtitle={stats?.total_patients.subtitle}
          trend={{ value: stats?.trends.patients || 0, isPositive: true }}
        />
        <StatCard
          title="Revenus Mois"
          value={stats?.month_revenue.formatted || '0 FCFA'}
          icon={DollarSign}
          subtitle={stats?.month_revenue.subtitle}
          trend={{ value: stats?.trends.revenue || 0, isPositive: true }}
        />
        <StatCard
          title="Taux Remplissage"
          value={stats?.fill_rate.formatted || '0%'}
          icon={TrendingUp}
          subtitle={stats?.fill_rate.subtitle}
          trend={{ value: stats?.trends.fill_rate || 0, isPositive: true }}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Appointments - 2/3 width */}
        <div className="lg:col-span-2">
          <RecentAppointments appointments={stats?.recent_appointments || []} />
        </div>

        {/* Quick Actions - 1/3 width */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Charts Section */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 font-heading mb-4">
          Statistiques & Analyses
        </h2>
        <DashboardCharts />
      </div>
    </div>
  );
}
