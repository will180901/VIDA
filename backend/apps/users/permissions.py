"""
Permissions personnalisées pour VIDA
Gestion stricte des accès selon les rôles
"""

from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permission pour les administrateurs uniquement
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsStaffOrAdmin(permissions.BasePermission):
    """
    Permission pour le personnel médical (staff, doctor, admin)
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['staff', 'doctor', 'admin']
        )


class IsPatient(permissions.BasePermission):
    """
    Permission pour les patients uniquement
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'patient'


class IsOwnerOrStaff(permissions.BasePermission):
    """
    Permission pour le propriétaire de la ressource ou le personnel médical
    Utilisé pour les données patients (RDV, dossiers médicaux, etc.)
    """
    def has_object_permission(self, request, view, obj):
        # Le personnel médical peut tout voir
        if request.user.role in ['staff', 'doctor', 'admin']:
            return True
        
        # Le patient ne peut voir que ses propres données
        # Adapter selon le modèle (obj.patient, obj.user, etc.)
        if hasattr(obj, 'patient'):
            return obj.patient == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class CanViewAppointments(permissions.BasePermission):
    """
    Permission pour voir les rendez-vous
    - Personnel médical : Tous les RDV
    - Patient : Uniquement ses RDV
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Personnel médical peut tout voir
        if request.user.role in ['staff', 'doctor', 'admin']:
            return True
        
        # Patient ne voit que ses RDV
        if request.user.role == 'patient':
            return obj.patient_email == request.user.email
        
        return False


class CanManageAppointments(permissions.BasePermission):
    """
    Permission pour gérer les rendez-vous (confirmer, annuler, modifier)
    Seul le personnel médical peut gérer
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['staff', 'doctor', 'admin']
        )
