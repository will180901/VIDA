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


class PatientViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour la gestion des patients
    
    Permissions:
    - Liste et détails : Personnel médical uniquement (staff, doctor, admin)
    
    Endpoints:
    - GET /api/v1/users/patients/ - Liste des patients
    - GET /api/v1/users/patients/{id}/ - Détails d'un patient
    - GET /api/v1/users/patients/{id}/appointments/ - RDV d'un patient
    - GET /api/v1/users/patients/stats/ - Statistiques patients
    """
    
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsStaffOrAdmin]
    
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
    
    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        """
        Récupère tous les rendez-vous d'un patient
        """
        patient = self.get_object()
        appointments = Appointment.objects.filter(
            patient_email=patient.email
        ).order_by('-appointment_date', '-appointment_time')
        
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
        # Total patients
        total_patients = User.objects.filter(role=User.Role.PATIENT).count()
        
        # Nouveaux patients ce mois
        first_day_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_patients_this_month = User.objects.filter(
            role=User.Role.PATIENT,
            created_at__gte=first_day_of_month
        ).count()
        
        # Patients avec email vérifié
        verified_patients = User.objects.filter(
            role=User.Role.PATIENT,
            email_verified=True
        ).count()
        
        # Patients par genre
        patients_by_gender = User.objects.filter(
            role=User.Role.PATIENT
        ).values('gender').annotate(count=Count('id'))
        
        # Patients avec RDV
        patients_with_appointments = User.objects.filter(
            role=User.Role.PATIENT,
            email__in=Appointment.objects.values_list('patient_email', flat=True).distinct()
        ).count()
        
        return Response({
            'total_patients': total_patients,
            'new_patients_this_month': new_patients_this_month,
            'verified_patients': verified_patients,
            'verification_rate': round((verified_patients / total_patients * 100) if total_patients > 0 else 0, 1),
            'patients_by_gender': list(patients_by_gender),
            'patients_with_appointments': patients_with_appointments,
            'active_rate': round((patients_with_appointments / total_patients * 100) if total_patients > 0 else 0, 1)
        })
