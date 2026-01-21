'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import DatePicker from '@/components/ui/DatePicker';
import Dropdown from '@/components/ui/Dropdown';
import api from '@/lib/api';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewPatientModal({ isOpen, onClose, onSuccess }: NewPatientModalProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    gender: 'M',
    date_of_birth: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/auth/register/', {
        ...formData,
        role: 'patient',
      });

      showToast('Patient créé avec succès', 'success');
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        gender: 'M',
        date_of_birth: '',
        address: '',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.email?.[0] || 
                          error.response?.data?.phone?.[0] ||
                          'Une erreur est survenue. Veuillez réessayer.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[201] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vida-teal/10">
                    <User className="h-5 w-5 text-vida-teal" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 font-heading">
                      Nouveau Patient
                    </h2>
                    <p className="text-xs text-gray-600">
                      Créer un nouveau compte patient
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Prénom */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-vida-teal focus:border-vida-teal"
                      placeholder="Jean"
                    />
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-vida-teal focus:border-vida-teal"
                      placeholder="Dupont"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-vida-teal focus:border-vida-teal"
                        placeholder="jean.dupont@email.com (optionnel)"
                      />
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-vida-teal focus:border-vida-teal"
                        placeholder="06 123 45 67"
                      />
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-vida-teal focus:border-vida-teal"
                      placeholder="••••••••"
                      minLength={8}
                    />
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Genre *
                    </label>
                    <Dropdown
                      value={formData.gender}
                      onChange={(value) => setFormData({ ...formData, gender: value })}
                      options={[
                        { value: 'M', label: 'Masculin' },
                        { value: 'F', label: 'Féminin' },
                      ]}
                    />
                  </div>

                  {/* Date de naissance */}
                  <div>
                    <DatePicker
                      label="Date de naissance"
                      value={formData.date_of_birth}
                      onChange={(date) => setFormData({ ...formData, date_of_birth: date })}
                      maxDate={new Date().toISOString().split('T')[0]}
                      placeholder="Sélectionner la date de naissance"
                      highlightWeekends={false}
                    />
                  </div>

                  {/* Adresse */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" />
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-vida-teal focus:border-vida-teal resize-none"
                        placeholder="Adresse complète du patient"
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-medium text-white bg-vida-teal hover:bg-vida-teal-dark rounded-md transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Création...' : 'Créer le patient'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
