'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Heart, Calendar, FileText, MessageSquare, Activity, Save, Mail, Phone, MapPin, AlertCircle, Upload, Download, Trash2, Eye, Plus, Edit2, Star, Clock } from 'lucide-react';
import { backdropFade, modalScale } from '@/lib/animations';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/api';

interface Patient {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  email_verified: boolean;
  created_at: string;
  gender: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

interface Appointment {
  id: number;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string;
  doctor_name?: string;
}

interface MedicalRecord {
  id?: number;
  blood_group: string;
  allergies: string;
  medical_history: string;
  chronic_conditions: string;
  current_treatments: string;
  vision_left: string;
  vision_right: string;
  intraocular_pressure_left: string;
  intraocular_pressure_right: string;
  medical_notes: string;
}

interface PatientNote {
  id: number;
  content: string;
  is_important: boolean;
  author_name: string;
  created_at: string;
  updated_at: string;
}

interface PatientDocument {
  id: number;
  title: string;
  category: string;
  file_url: string;
  file_size: number;
  file_extension: string;
  description: string;
  uploaded_by_name: string;
  created_at: string;
}

interface PatientDetailsModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onUpdate?: () => void;
}

type TabType = 'info' | 'medical' | 'appointments' | 'documents' | 'notes' | 'activity';

const tabs = [
  { id: 'info' as TabType, label: 'Informations', icon: User },
  { id: 'medical' as TabType, label: 'Médical', icon: Heart },
  { id: 'appointments' as TabType, label: 'RDV', icon: Calendar },
  { id: 'documents' as TabType, label: 'Documents', icon: FileText },
  { id: 'notes' as TabType, label: 'Notes', icon: MessageSquare },
  { id: 'activity' as TabType, label: 'Activité', icon: Activity },
];

export default function PatientDetailsModalNew({
  isOpen,
  onClose,
  patient,
  onUpdate,
}: PatientDetailsModalNewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [loadingMedical, setLoadingMedical] = useState(false);
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteImportant, setNewNoteImportant] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { showToast } = useToast();
  
  // Form state pour l'onglet Informations
  const [formData, setFormData] = useState({
    first_name: patient?.first_name || '',
    last_name: patient?.last_name || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    gender: patient?.gender || '',
    date_of_birth: patient?.date_of_birth || '',
    address: patient?.address || '',
    emergency_contact: patient?.emergency_contact || '',
    emergency_phone: patient?.emergency_phone || '',
  });

  // Form state pour l'onglet Médical
  const [medicalFormData, setMedicalFormData] = useState<MedicalRecord>({
    blood_group: '',
    allergies: '',
    medical_history: '',
    chronic_conditions: '',
    current_treatments: '',
    vision_left: '',
    vision_right: '',
    intraocular_pressure_left: '',
    intraocular_pressure_right: '',
    medical_notes: '',
  });

  if (!patient) return null;

  // Calculer l'âge
  const calculateAge = (): string => {
    if (!patient.date_of_birth) return '-';
    const today = new Date();
    const birthDate = new Date(patient.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} ans`;
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch(`/auth/patients/${patient.id}/`, formData);
      showToast('Modifications enregistrées avec succès', 'success');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      showToast('Erreur lors de la sauvegarde', 'error');
      console.error('Erreur:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Annuler les modifications
  const handleCancel = () => {
    setFormData({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      gender: patient.gender || '',
      date_of_birth: patient.date_of_birth || '',
      address: patient.address || '',
      emergency_contact: patient.emergency_contact || '',
      emergency_phone: patient.emergency_phone || '',
    });
    setIsEditing(false);
  };

  // Charger les RDV quand on ouvre l'onglet
  const loadAppointments = async () => {
    if (!patient) return;
    setLoadingAppointments(true);
    try {
      const response = await api.get(`/auth/patients/${patient.id}/appointments/`);
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Erreur chargement RDV:', error);
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Charger le dossier médical
  const loadMedicalRecord = async () => {
    if (!patient) return;
    setLoadingMedical(true);
    try {
      const response = await api.get(`/auth/medical-records/by-patient/${patient.id}/`);
      const record = response.data.medical_record;
      setMedicalRecord(record);
      setMedicalFormData({
        blood_group: record.blood_group || '',
        allergies: record.allergies || '',
        medical_history: record.medical_history || '',
        chronic_conditions: record.chronic_conditions || '',
        current_treatments: record.current_treatments || '',
        vision_left: record.vision_left || '',
        vision_right: record.vision_right || '',
        intraocular_pressure_left: record.intraocular_pressure_left || '',
        intraocular_pressure_right: record.intraocular_pressure_right || '',
        medical_notes: record.medical_notes || '',
      });
    } catch (error) {
      console.error('Erreur chargement dossier médical:', error);
    } finally {
      setLoadingMedical(false);
    }
  };

  // Sauvegarder le dossier médical
  const handleSaveMedical = async () => {
    if (!patient || !medicalRecord?.id) return;
    setIsSaving(true);
    try {
      await api.patch(`/auth/medical-records/${medicalRecord.id}/`, medicalFormData);
      showToast('Dossier médical enregistré avec succès', 'success');
      setIsEditingMedical(false);
      await loadMedicalRecord();
    } catch (error) {
      showToast('Erreur lors de la sauvegarde', 'error');
      console.error('Erreur:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Annuler les modifications médicales
  const handleCancelMedical = () => {
    if (medicalRecord) {
      setMedicalFormData({
        blood_group: medicalRecord.blood_group || '',
        allergies: medicalRecord.allergies || '',
        medical_history: medicalRecord.medical_history || '',
        chronic_conditions: medicalRecord.chronic_conditions || '',
        current_treatments: medicalRecord.current_treatments || '',
        vision_left: medicalRecord.vision_left || '',
        vision_right: medicalRecord.vision_right || '',
        intraocular_pressure_left: medicalRecord.intraocular_pressure_left || '',
        intraocular_pressure_right: medicalRecord.intraocular_pressure_right || '',
        medical_notes: medicalRecord.medical_notes || '',
      });
    }
    setIsEditingMedical(false);
  };

  // Charger les notes
  const loadNotes = async () => {
    if (!patient) return;
    setLoadingNotes(true);
    try {
      const response = await api.get(`/auth/patient-notes/by-patient/${patient.id}/`);
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Erreur chargement notes:', error);
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Créer une note
  const handleCreateNote = async () => {
    if (!patient || !newNoteContent.trim() || newNoteContent.length < 5) {
      showToast('La note doit contenir au moins 5 caractères', 'error');
      return;
    }
    setIsAddingNote(true);
    try {
      await api.post('/auth/patient-notes/', {
        patient: patient.id,
        content: newNoteContent,
        is_important: newNoteImportant,
      });
      showToast('Note ajoutée avec succès', 'success');
      setNewNoteContent('');
      setNewNoteImportant(false);
      await loadNotes();
    } catch (error) {
      showToast('Erreur lors de l\'ajout de la note', 'error');
      console.error('Erreur:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  // Modifier une note
  const handleUpdateNote = async (noteId: number) => {
    if (!editingNoteContent.trim() || editingNoteContent.length < 5) {
      showToast('La note doit contenir au moins 5 caractères', 'error');
      return;
    }
    try {
      await api.patch(`/auth/patient-notes/${noteId}/`, {
        content: editingNoteContent,
      });
      showToast('Note modifiée avec succès', 'success');
      setEditingNoteId(null);
      setEditingNoteContent('');
      await loadNotes();
    } catch (error) {
      showToast('Erreur lors de la modification', 'error');
      console.error('Erreur:', error);
    }
  };

  // Supprimer une note
  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;
    try {
      await api.delete(`/auth/patient-notes/${noteId}/`);
      showToast('Note supprimée avec succès', 'success');
      await loadNotes();
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
      console.error('Erreur:', error);
    }
  };

  // Basculer l'importance d'une note
  const handleToggleImportant = async (noteId: number, currentValue: boolean) => {
    try {
      await api.patch(`/auth/patient-notes/${noteId}/`, {
        is_important: !currentValue,
      });
      await loadNotes();
    } catch (error) {
      showToast('Erreur lors de la modification', 'error');
      console.error('Erreur:', error);
    }
  };

  // Charger les documents
  const loadDocuments = async () => {
    if (!patient) return;
    setLoadingDocuments(true);
    try {
      const url = selectedCategory === 'all' 
        ? `/auth/patient-documents/by-patient/${patient.id}/`
        : `/auth/patient-documents/by-patient/${patient.id}/?category=${selectedCategory}`;
      const response = await api.get(url);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Upload un document
  const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !patient) return;

    // Vérifier la taille (max 10 Mo)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Le fichier ne doit pas dépasser 10 Mo', 'error');
      return;
    }

    setUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append('patient', patient.id.toString());
      formData.append('title', file.name);
      formData.append('category', 'other');
      formData.append('file', file);

      await api.post('/auth/patient-documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast('Document uploadé avec succès', 'success');
      await loadDocuments();
      
      // Reset input
      event.target.value = '';
    } catch (error) {
      showToast('Erreur lors de l\'upload', 'error');
      console.error('Erreur:', error);
    } finally {
      setUploadingDocument(false);
    }
  };

  // Supprimer un document
  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    try {
      await api.delete(`/auth/patient-documents/${documentId}/`);
      showToast('Document supprimé avec succès', 'success');
      await loadDocuments();
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
      console.error('Erreur:', error);
    }
  };

  // Télécharger un document
  const handleDownloadDocument = (fileUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Charger les RDV quand on change d'onglet
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'appointments' && appointments.length === 0) {
      loadAppointments();
    }
    if (tab === 'medical' && !medicalRecord) {
      loadMedicalRecord();
    }
    if (tab === 'notes' && notes.length === 0) {
      loadNotes();
    }
    if (tab === 'documents' && documents.length === 0) {
      loadDocuments();
    }
  };

  // Statut badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      confirmed: { label: 'Confirmé', className: 'bg-green-500/10 text-green-700 border-green-200/50' },
      pending: { label: 'En attente', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200/50' },
      cancelled: { label: 'Annulé', className: 'bg-red-500/10 text-red-700 border-red-200/50' },
      completed: { label: 'Terminé', className: 'bg-blue-500/10 text-blue-700 border-blue-200/50' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-500/10 text-gray-700 border-gray-200/50' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white/90 backdrop-blur-sm rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] border border-white/20 flex flex-col"
            variants={modalScale}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-vida-teal/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-vida-teal">
                    {patient.first_name?.[0]}{patient.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-heading">
                    {patient.first_name} {patient.last_name}, {calculateAge()}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Patient depuis le {new Date(patient.created_at).toLocaleDateString('fr-FR')} • ID: #{patient.id.toString().padStart(5, '0')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6 flex-shrink-0">
              <div className="flex gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`
                        flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative
                        ${isActive 
                          ? 'text-vida-teal' 
                          : 'text-gray-600 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-vida-teal"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'info' && (
                    <div className="space-y-6">
                      {/* Header avec bouton éditer */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Informations personnelles</h3>
                        {!isEditing && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1.5 text-xs font-medium text-vida-teal bg-vida-teal/10 border border-vida-teal/20 rounded-lg hover:bg-vida-teal/20 transition-colors"
                          >
                            Modifier
                          </button>
                        )}
                      </div>

                      {/* Formulaire */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Prénom */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Prénom <span className="text-red-500">*</span>
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.first_name}
                              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                              placeholder="Prénom"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">{patient.first_name || '-'}</p>
                          )}
                        </div>

                        {/* Nom */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Nom <span className="text-red-500">*</span>
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.last_name}
                              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                              placeholder="Nom"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">{patient.last_name || '-'}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Email <span className="text-red-500">*</span>
                          </label>
                          {isEditing ? (
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                                placeholder="email@exemple.com"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              <p className="text-sm text-gray-900">{patient.email}</p>
                            </div>
                          )}
                        </div>

                        {/* Téléphone */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Téléphone
                          </label>
                          {isEditing ? (
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                                placeholder="+33 6 12 34 56 78"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              <p className="text-sm text-gray-900">{patient.phone || '-'}</p>
                            </div>
                          )}
                        </div>

                        {/* Genre */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Genre
                          </label>
                          {isEditing ? (
                            <select
                              value={formData.gender}
                              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                            >
                              <option value="">Sélectionner</option>
                              <option value="M">Masculin</option>
                              <option value="F">Féminin</option>
                            </select>
                          ) : (
                            <p className="text-sm text-gray-900">
                              {patient.gender === 'M' ? 'Masculin' : patient.gender === 'F' ? 'Féminin' : '-'}
                            </p>
                          )}
                        </div>

                        {/* Date de naissance */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Date de naissance
                          </label>
                          {isEditing ? (
                            <input
                              type="date"
                              value={formData.date_of_birth}
                              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">
                              {patient.date_of_birth 
                                ? `${new Date(patient.date_of_birth).toLocaleDateString('fr-FR')} (${calculateAge()})`
                                : '-'
                              }
                            </p>
                          )}
                        </div>

                        {/* Adresse */}
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Adresse
                          </label>
                          {isEditing ? (
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" />
                              <textarea
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={2}
                                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors resize-none"
                                placeholder="Adresse complète"
                              />
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                              <p className="text-sm text-gray-900">{patient.address || '-'}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact d'urgence */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <h4 className="text-sm font-semibold text-gray-900">Contact d'urgence</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Nom contact urgence */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                              Nom du contact
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={formData.emergency_contact}
                                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                                placeholder="Nom complet"
                              />
                            ) : (
                              <p className="text-sm text-gray-900">{patient.emergency_contact || '-'}</p>
                            )}
                          </div>

                          {/* Téléphone contact urgence */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                              Téléphone du contact
                            </label>
                            {isEditing ? (
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                <input
                                  type="tel"
                                  value={formData.emergency_phone}
                                  onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                                  placeholder="+33 6 12 34 56 78"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                <p className="text-sm text-gray-900">{patient.emergency_phone || '-'}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Boutons d'action en mode édition */}
                      {isEditing && (
                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                          <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-vida-teal rounded-lg hover:bg-vida-teal-dark transition-colors disabled:opacity-50"
                          >
                            {isSaving ? (
                              <>
                                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enregistrement...
                              </>
                            ) : (
                              <>
                                <Save className="h-3.5 w-3.5" />
                                Enregistrer
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'medical' && (
                    <div className="space-y-6">
                      {loadingMedical ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="h-8 w-8 border-3 border-vida-teal/30 border-t-vida-teal rounded-full animate-spin" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Informations médicales</h3>
                            {!isEditingMedical && (
                              <button
                                onClick={() => setIsEditingMedical(true)}
                                className="px-3 py-1.5 text-xs font-medium text-vida-teal bg-vida-teal/10 border border-vida-teal/20 rounded-lg hover:bg-vida-teal/20 transition-colors"
                              >
                                Modifier
                              </button>
                            )}
                          </div>

                          {/* Groupe sanguin */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Groupe sanguin
                            </label>
                            {isEditingMedical ? (
                              <select
                                value={medicalFormData.blood_group}
                                onChange={(e) => setMedicalFormData({ ...medicalFormData, blood_group: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                              >
                                <option value="">Sélectionner</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                              </select>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                  <Heart className="h-5 w-5 text-red-600" />
                                </div>
                                <p className="text-sm text-gray-900">
                                  {medicalFormData.blood_group || 'Non renseigné'}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Allergies */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Allergies connues
                            </label>
                            {isEditingMedical ? (
                              <textarea
                                value={medicalFormData.allergies}
                                onChange={(e) => setMedicalFormData({ ...medicalFormData, allergies: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors resize-none"
                                placeholder="Médicaments, aliments, etc."
                              />
                            ) : (
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-700 whitespace-pre-wrap">
                                  {medicalFormData.allergies || <span className="italic text-gray-500">Aucune allergie renseignée</span>}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Antécédents médicaux */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Antécédents médicaux
                            </label>
                            {isEditingMedical ? (
                              <textarea
                                value={medicalFormData.medical_history}
                                onChange={(e) => setMedicalFormData({ ...medicalFormData, medical_history: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors resize-none"
                                placeholder="Historique médical du patient"
                              />
                            ) : (
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-700 whitespace-pre-wrap">
                                  {medicalFormData.medical_history || <span className="italic text-gray-500">Aucun antécédent renseigné</span>}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Pathologies chroniques */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Pathologies chroniques
                            </label>
                            {isEditingMedical ? (
                              <textarea
                                value={medicalFormData.chronic_conditions}
                                onChange={(e) => setMedicalFormData({ ...medicalFormData, chronic_conditions: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors resize-none"
                                placeholder="Maladies chroniques actuelles"
                              />
                            ) : (
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-700 whitespace-pre-wrap">
                                  {medicalFormData.chronic_conditions || <span className="italic text-gray-500">Aucune pathologie chronique renseignée</span>}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Traitements en cours */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Traitements en cours
                            </label>
                            {isEditingMedical ? (
                              <textarea
                                value={medicalFormData.current_treatments}
                                onChange={(e) => setMedicalFormData({ ...medicalFormData, current_treatments: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors resize-none"
                                placeholder="Médicaments et traitements actuels"
                              />
                            ) : (
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-700 whitespace-pre-wrap">
                                  {medicalFormData.current_treatments || <span className="italic text-gray-500">Aucun traitement en cours</span>}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Informations ophtalmologiques */}
                          <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-4">Informations ophtalmologiques</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                              {/* Acuité visuelle gauche */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Acuité visuelle œil gauche
                                </label>
                                {isEditingMedical ? (
                                  <input
                                    type="text"
                                    value={medicalFormData.vision_left}
                                    onChange={(e) => setMedicalFormData({ ...medicalFormData, vision_left: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                                    placeholder="Ex: 10/10"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{medicalFormData.vision_left || '-'}</p>
                                )}
                              </div>

                              {/* Acuité visuelle droite */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Acuité visuelle œil droit
                                </label>
                                {isEditingMedical ? (
                                  <input
                                    type="text"
                                    value={medicalFormData.vision_right}
                                    onChange={(e) => setMedicalFormData({ ...medicalFormData, vision_right: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                                    placeholder="Ex: 10/10"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{medicalFormData.vision_right || '-'}</p>
                                )}
                              </div>

                              {/* Pression intraoculaire gauche */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Pression intraoculaire gauche (mmHg)
                                </label>
                                {isEditingMedical ? (
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={medicalFormData.intraocular_pressure_left}
                                    onChange={(e) => setMedicalFormData({ ...medicalFormData, intraocular_pressure_left: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                                    placeholder="Ex: 15.5"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{medicalFormData.intraocular_pressure_left || '-'}</p>
                                )}
                              </div>

                              {/* Pression intraoculaire droite */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                  Pression intraoculaire droite (mmHg)
                                </label>
                                {isEditingMedical ? (
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={medicalFormData.intraocular_pressure_right}
                                    onChange={(e) => setMedicalFormData({ ...medicalFormData, intraocular_pressure_right: e.target.value })}
                                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                                    placeholder="Ex: 15.5"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-900">{medicalFormData.intraocular_pressure_right || '-'}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Notes médicales */}
                          <div className="pt-4 border-t border-gray-200">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Notes médicales confidentielles
                            </label>
                            {isEditingMedical ? (
                              <textarea
                                value={medicalFormData.medical_notes}
                                onChange={(e) => setMedicalFormData({ ...medicalFormData, medical_notes: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors resize-none"
                                placeholder="Notes confidentielles du médecin"
                              />
                            ) : (
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs text-gray-700 whitespace-pre-wrap">
                                  {medicalFormData.medical_notes || <span className="italic text-gray-500">Aucune note médicale</span>}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Boutons d'action en mode édition */}
                          {isEditingMedical && (
                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                              <button
                                onClick={handleCancelMedical}
                                disabled={isSaving}
                                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={handleSaveMedical}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-vida-teal rounded-lg hover:bg-vida-teal-dark transition-colors disabled:opacity-50"
                              >
                                {isSaving ? (
                                  <>
                                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enregistrement...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-3.5 w-3.5" />
                                    Enregistrer
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'appointments' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Historique des rendez-vous</h3>
                        <button
                          onClick={() => window.location.href = `/admin/appointments?create=true&patient=${patient.id}`}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-vida-teal rounded-lg hover:bg-vida-teal-dark transition-colors"
                        >
                          + Nouveau RDV
                        </button>
                      </div>

                      {loadingAppointments ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="h-8 w-8 border-3 border-vida-teal/30 border-t-vida-teal rounded-full animate-spin" />
                        </div>
                      ) : appointments.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-900 mb-1">Aucun rendez-vous</p>
                          <p className="text-xs text-gray-500">Ce patient n'a pas encore de rendez-vous</p>
                        </div>
                      ) : (
                        <>
                          {/* Statistiques RDV */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <p className="text-xs text-gray-600 mb-1">Total RDV</p>
                              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <p className="text-xs text-green-700 mb-1">Terminés</p>
                              <p className="text-2xl font-bold text-green-900">
                                {appointments.filter(a => a.status === 'completed').length}
                              </p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                              <p className="text-xs text-red-700 mb-1">Annulés</p>
                              <p className="text-2xl font-bold text-red-900">
                                {appointments.filter(a => a.status === 'cancelled').length}
                              </p>
                            </div>
                          </div>

                          {/* Timeline des RDV */}
                          <div className="space-y-3">
                            {appointments.map((appointment, index) => (
                              <div
                                key={appointment.id}
                                className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                              >
                                {/* Point timeline */}
                                <div className="absolute left-0 top-0 -translate-x-[9px] h-4 w-4 rounded-full bg-vida-teal border-2 border-white shadow" />
                                
                                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {new Date(appointment.appointment_date).toLocaleDateString('fr-FR', {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-0.5">
                                        {appointment.appointment_time}
                                      </p>
                                    </div>
                                    {getStatusBadge(appointment.status)}
                                  </div>
                                  
                                  <p className="text-xs text-gray-700 mb-2">
                                    <strong>Motif :</strong> {appointment.reason}
                                  </p>
                                  
                                  {appointment.doctor_name && (
                                    <p className="text-xs text-gray-600">
                                      <strong>Praticien :</strong> {appointment.doctor_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'documents' && (
                    <div className="space-y-6">
                      {loadingDocuments ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="h-8 w-8 border-3 border-vida-teal/30 border-t-vida-teal rounded-full animate-spin" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Documents du patient</h3>
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedCategory}
                                onChange={(e) => {
                                  setSelectedCategory(e.target.value);
                                  setTimeout(() => loadDocuments(), 0);
                                }}
                                className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors"
                              >
                                <option value="all">Toutes catégories</option>
                                <option value="prescription">Ordonnances</option>
                                <option value="exam">Examens</option>
                                <option value="report">Comptes-rendus</option>
                                <option value="invoice">Factures</option>
                                <option value="consent">Consentements</option>
                                <option value="other">Autres</option>
                              </select>
                              <label className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-vida-teal rounded-lg hover:bg-vida-teal-dark transition-colors cursor-pointer">
                                {uploadingDocument ? (
                                  <>
                                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Upload...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-3.5 w-3.5" />
                                    Ajouter
                                  </>
                                )}
                                <input
                                  type="file"
                                  onChange={handleUploadDocument}
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  className="hidden"
                                  disabled={uploadingDocument}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Zone de drop */}
                          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-vida-teal hover:bg-vida-teal/5 transition-colors cursor-pointer">
                            <input
                              type="file"
                              onChange={handleUploadDocument}
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              className="hidden"
                              disabled={uploadingDocument}
                            />
                            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Glissez-déposez vos fichiers ici
                            </p>
                            <p className="text-xs text-gray-500">
                              ou cliquez pour parcourir (PDF, Images, Word - max 10 Mo)
                            </p>
                          </label>

                          {/* Liste des documents */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700 mb-3">
                              Documents récents ({documents.length})
                            </p>
                            
                            {documents.length === 0 ? (
                              <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
                                <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-xs text-gray-500 italic">
                                  Aucun document disponible
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {documents.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex items-start gap-3">
                                      {/* Icône du fichier */}
                                      <div className="h-10 w-10 rounded-lg bg-vida-teal/10 flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-5 w-5 text-vida-teal" />
                                      </div>

                                      {/* Infos du document */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                              {doc.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700">
                                                {doc.file_extension}
                                              </span>
                                              <span className="text-[10px] text-gray-500">
                                                {doc.file_size} Mo
                                              </span>
                                              <span className="text-[10px] text-gray-400">•</span>
                                              <span className="text-[10px] text-gray-500">
                                                {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                                              </span>
                                            </div>
                                            {doc.description && (
                                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                {doc.description}
                                              </p>
                                            )}
                                            <p className="text-[10px] text-gray-500 mt-1">
                                              Uploadé par {doc.uploaded_by_name}
                                            </p>
                                          </div>

                                          {/* Actions */}
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                              onClick={() => handleDownloadDocument(doc.file_url, doc.title)}
                                              className="p-1.5 text-gray-400 hover:text-vida-teal hover:bg-vida-teal/10 rounded transition-colors"
                                              title="Télécharger"
                                            >
                                              <Download className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                              onClick={() => window.open(doc.file_url, '_blank')}
                                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                              title="Voir"
                                            >
                                              <Eye className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteDocument(doc.id)}
                                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                              title="Supprimer"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'notes' && (
                    <div className="space-y-6">
                      {loadingNotes ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="h-8 w-8 border-3 border-vida-teal/30 border-t-vida-teal rounded-full animate-spin" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Notes internes</h3>
                            <span className="text-xs text-gray-500">{notes.length} note(s)</span>
                          </div>

                          {/* Formulaire nouvelle note */}
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                              <MessageSquare className="h-4 w-4 text-vida-teal" />
                              <p className="text-xs font-medium text-gray-900">Ajouter une note interne</p>
                            </div>
                            <textarea
                              value={newNoteContent}
                              onChange={(e) => setNewNoteContent(e.target.value)}
                              placeholder="Ajouter une note interne (visible uniquement par le personnel médical)..."
                              rows={4}
                              className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors resize-none"
                            />
                            <div className="flex items-center justify-between mt-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newNoteImportant}
                                  onChange={(e) => setNewNoteImportant(e.target.checked)}
                                  className="h-3.5 w-3.5 text-vida-teal border-gray-300 rounded focus:ring-vida-teal/30"
                                />
                                <span className="text-xs text-gray-700">Marquer comme important</span>
                              </label>
                              <button
                                onClick={handleCreateNote}
                                disabled={isAddingNote || newNoteContent.length < 5}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-vida-teal rounded-lg hover:bg-vida-teal-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isAddingNote ? (
                                  <>
                                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Ajout...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-3.5 w-3.5" />
                                    Ajouter
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Liste des notes */}
                          <div className="space-y-3">
                            <p className="text-xs font-medium text-gray-700">Historique des notes</p>
                            
                            {notes.length === 0 ? (
                              <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
                                <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-xs text-gray-500 italic">
                                  Aucune note disponible
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {notes.map((note) => (
                                  <div
                                    key={note.id}
                                    className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
                                      note.is_important ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'
                                    }`}
                                  >
                                    {/* Header de la note */}
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-vida-teal/10 flex items-center justify-center flex-shrink-0">
                                          <span className="text-[10px] font-semibold text-vida-teal">
                                            {note.author_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                          </span>
                                        </div>
                                        <div>
                                          <p className="text-xs font-semibold text-gray-900">{note.author_name}</p>
                                          <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                              {new Date(note.created_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </span>
                                            {note.updated_at !== note.created_at && (
                                              <span className="text-gray-400">(modifié)</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Actions */}
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleToggleImportant(note.id, note.is_important)}
                                          className={`p-1.5 rounded transition-colors ${
                                            note.is_important
                                              ? 'text-orange-600 hover:bg-orange-100'
                                              : 'text-gray-400 hover:bg-gray-100'
                                          }`}
                                          title={note.is_important ? 'Retirer l\'importance' : 'Marquer comme important'}
                                        >
                                          <Star className={`h-3.5 w-3.5 ${note.is_important ? 'fill-current' : ''}`} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingNoteId(note.id);
                                            setEditingNoteContent(note.content);
                                          }}
                                          className="p-1.5 text-gray-400 hover:text-vida-teal hover:bg-vida-teal/10 rounded transition-colors"
                                          title="Modifier"
                                        >
                                          <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteNote(note.id)}
                                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                          title="Supprimer"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Contenu de la note */}
                                    {editingNoteId === note.id ? (
                                      <div className="space-y-2">
                                        <textarea
                                          value={editingNoteContent}
                                          onChange={(e) => setEditingNoteContent(e.target.value)}
                                          rows={4}
                                          className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal transition-colors resize-none"
                                        />
                                        <div className="flex items-center justify-end gap-2">
                                          <button
                                            onClick={() => {
                                              setEditingNoteId(null);
                                              setEditingNoteContent('');
                                            }}
                                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                          >
                                            Annuler
                                          </button>
                                          <button
                                            onClick={() => handleUpdateNote(note.id)}
                                            disabled={editingNoteContent.length < 5}
                                            className="px-3 py-1.5 text-xs font-medium text-white bg-vida-teal rounded-lg hover:bg-vida-teal-dark transition-colors disabled:opacity-50"
                                          >
                                            Enregistrer
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {note.content}
                                      </p>
                                    )}

                                    {/* Badge important */}
                                    {note.is_important && (
                                      <div className="mt-2 pt-2 border-t border-orange-200">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700">
                                          <Star className="h-3 w-3 fill-current" />
                                          Important
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'activity' && (
                    <div className="space-y-6">
                      <h3 className="text-sm font-semibold text-gray-900">Journal d'activité</h3>

                      {/* Timeline d'activité */}
                      <div className="space-y-3">
                        {/* Activité : Création du compte */}
                        <div className="relative pl-8 pb-4 border-l-2 border-gray-200">
                          <div className="absolute left-0 top-0 -translate-x-[9px] h-4 w-4 rounded-full bg-green-500 border-2 border-white shadow" />
                          
                          <div className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex items-start justify-between mb-1">
                              <p className="text-xs font-semibold text-gray-900">
                                Création du compte patient
                              </p>
                              <span className="text-[10px] text-gray-500">
                                {new Date(patient.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              Le patient s'est inscrit sur la plateforme
                            </p>
                          </div>
                        </div>

                        {/* Activité : Vérification email */}
                        {patient.email_verified && (
                          <div className="relative pl-8 pb-4 border-l-2 border-gray-200">
                            <div className="absolute left-0 top-0 -translate-x-[9px] h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow" />
                            
                            <div className="bg-white rounded-lg border border-gray-200 p-3">
                              <div className="flex items-start justify-between mb-1">
                                <p className="text-xs font-semibold text-gray-900">
                                  Email vérifié
                                </p>
                                <span className="text-[10px] text-gray-500">
                                  {new Date(patient.created_at).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">
                                Le patient a vérifié son adresse email
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Message si pas d'autres activités */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-xs text-gray-500 italic text-center">
                            Fin de l'historique
                          </p>
                        </div>
                      </div>

                      {/* Note */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                          <strong>Note :</strong> Le journal d'activité complet sera disponible dans une prochaine version. 
                          Il inclura toutes les actions effectuées sur le dossier patient (modifications, RDV, documents, etc.).
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 text-xs font-medium text-vida-teal bg-vida-teal/10 border border-vida-teal/20 rounded-lg hover:bg-vida-teal/20 transition-colors"
                >
                  Actions rapides ▼
                </button>
                <button
                  className="px-4 py-2 text-xs font-medium text-white bg-vida-teal rounded-lg hover:bg-vida-teal-dark transition-colors"
                >
                  Enregistrer modifications
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
