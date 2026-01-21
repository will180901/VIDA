'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Calendar, FileText, User, LogOut } from 'lucide-react';

export default function PatientDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      {/* Bienvenue */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-6 vida-grain">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Bienvenue, {user?.first_name} {user?.last_name} !
        </h2>
        <p className="text-sm text-gray-600">
          Vous êtes connecté en tant que <span className="font-semibold text-vida-teal">Patient</span>
        </p>
      </div>

      {/* Informations utilisateur */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-6 vida-grain">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-vida-teal" />
          Vos informations
        </h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Email :</span> {user?.email}</p>
          <p><span className="font-medium">Téléphone :</span> {user?.phone || 'Non renseigné'}</p>
          <p><span className="font-medium">Rôle :</span> {user?.role}</p>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a 
          href="/patient/appointments"
          className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-6 vida-grain hover:shadow-lg transition-all text-left block"
        >
          <Calendar className="h-8 w-8 text-vida-teal mb-3" />
          <h4 className="font-semibold text-gray-900 mb-1">Mes rendez-vous</h4>
          <p className="text-xs text-gray-600">Voir et gérer vos RDV</p>
        </a>

        <button className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-6 vida-grain hover:shadow-lg transition-all text-left">
          <FileText className="h-8 w-8 text-vida-teal mb-3" />
          <h4 className="font-semibold text-gray-900 mb-1">Mon dossier médical</h4>
          <p className="text-xs text-gray-600">Consulter votre historique</p>
        </button>

        <button 
          onClick={logout}
          className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 p-6 vida-grain hover:shadow-lg transition-all text-left hover:border-red-300"
        >
          <LogOut className="h-8 w-8 text-red-600 mb-3" />
          <h4 className="font-semibold text-gray-900 mb-1">Déconnexion</h4>
          <p className="text-xs text-gray-600">Se déconnecter de l'espace patient</p>
        </button>
      </div>

      {/* Message d'isolation */}
      <div className="bg-vida-teal/10 border border-vida-teal/30 rounded-lg p-4">
        <p className="text-sm text-vida-teal-dark">
          🔒 <span className="font-semibold">Espace sécurisé</span> - Vous ne pouvez voir que vos propres données. 
          L'accès à l'espace administrateur est restreint au personnel médical.
        </p>
      </div>
    </div>
  );
}
