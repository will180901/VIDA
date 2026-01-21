"""
Vues API pour la gestion des patients
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta

from .models import User
from .serializers import UserSerializer
from .permissions import IsStaffOrAdmin
from apps.appointments.models import Appointment


class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des patients
    
    Permissions:
    - Liste et détails : Personnel médical uniquement (staff, doctor, admin)
    - Modification : Personnel médical uniquement
    
    Endpoints:
    - GET /api/v1/users/patients/ - Liste des patients
    - GET /api/v1/users/patients/{id}/ - Détails d'un patient
    - PATCH /api/v1/users/patients/{id}/ - Modifier un patient
    - GET /api/v1/users/patients/{id}/appointments/ - RDV d'un patient
    - GET /api/v1/users/patients/stats/ - Statistiques patients
    """
    
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    http_method_names = ['get', 'patch', 'head', 'options']  # Autoriser GET et PATCH uniquement
    
    def get_queryset(self):
        """
        Retourne uniquement les patients
        """
        queryset = User.objects.filter(role=User.Role.PATIENT).order_by('-created_at')
        
        # Recherche
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        
        # Filtre par vérification email
        email_verified = self.request.query_params.get('email_verified', None)
        if email_verified is not None:
            queryset = queryset.filter(email_verified=email_verified.lower() == 'true')
        
        # Filtre par genre
        gender = self.request.query_params.get('gender', None)
        if gender:
            queryset = queryset.filter(gender=gender)
        
        return queryset
    
    def update(self, request, *args, **kwargs):
        """
        Mise à jour partielle d'un patient (PATCH uniquement)
        """
        partial = kwargs.pop('partial', True)  # Forcer partial=True pour PATCH
        instance = self.get_object()
        
        # Vérifier que c'est bien un patient
        if instance.role != User.Role.PATIENT:
            return Response(
                {'error': 'Cet utilisateur n\'est pas un patient'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        """
        Récupère tous les rendez-vous d'un patient
        """
        patient = self.get_object()
        appointments = Appointment.objects.filter(
            patient_email=patient.email
        ).order_by('-date', '-time')
        
        # Sérialiser les RDV
        from apps.appointments.serializers import AppointmentSerializer
        serializer = AppointmentSerializer(appointments, many=True)
        
        return Response({
            'patient': UserSerializer(patient).data,
            'appointments': serializer.data,
            'total': appointments.count()
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Statistiques globales sur les patients
        """
        now = timezone.now()
        
        # Total patients
        total_patients = User.objects.filter(role=User.Role.PATIENT).count()
        
        # Nouveaux patients ce mois
        first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_patients_this_month = User.objects.filter(
            role=User.Role.PATIENT,
            created_at__gte=first_day_of_month
        ).count()
        
        # Nouveaux patients le mois dernier (pour trend)
        first_day_last_month = (first_day_of_month - timedelta(days=1)).replace(day=1)
        new_patients_last_month = User.objects.filter(
            role=User.Role.PATIENT,
            created_at__gte=first_day_last_month,
            created_at__lt=first_day_of_month
        ).count()
        
        # Patients actifs (avec RDV dans les 6 derniers mois)
        six_months_ago = now - timedelta(days=180)
        active_patient_emails = Appointment.objects.filter(
            date__gte=six_months_ago.date()
        ).values_list('patient_email', flat=True).distinct()
        
        active_patients = User.objects.filter(
            role=User.Role.PATIENT,
            email__in=active_patient_emails
        ).count()
        
        # Patients inactifs (sans RDV depuis > 6 mois ou jamais de RDV)
        inactive_patients = total_patients - active_patients
        
        # Trends (comparaison avec le mois dernier)
        # Total patients le mois dernier
        total_patients_last_month = User.objects.filter(
            role=User.Role.PATIENT,
            created_at__lt=first_day_of_month
        ).count()
        
        # Calcul des trends en pourcentage
        total_trend = round(
            ((total_patients - total_patients_last_month) / total_patients_last_month * 100) 
            if total_patients_last_month > 0 else 0, 
            1
        )
        
        new_trend = round(
            ((new_patients_this_month - new_patients_last_month) / new_patients_last_month * 100) 
            if new_patients_last_month > 0 else 0, 
            1
        )
        
        return Response({
            'total': total_patients,
            'new_this_month': new_patients_this_month,
            'active': active_patients,
            'inactive': inactive_patients,
            'trends': {
                'total': total_trend,
                'new_this_month': new_trend,
                'active': 0,  # Pas de comparaison pour actifs (nécessiterait historique)
                'inactive': 0,  # Pas de comparaison pour inactifs
            }
        })
