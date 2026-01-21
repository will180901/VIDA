from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Count, Q
from datetime import datetime, timedelta, time
from .models import Appointment, AppointmentSlotLock
from .serializers import AppointmentSerializer, AvailableSlotsSerializer
from apps.content_management.models import ClinicSchedule, ClinicHoliday
from apps.users.permissions import IsStaffOrAdmin, CanViewAppointments


class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des rendez-vous."""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'available_slots']:
            return [AllowAny()]
        elif self.action in ['list', 'retrieve']:
            return [IsAuthenticated(), CanViewAppointments()]
        elif self.action in ['update', 'partial_update', 'destroy', 'dashboard_stats']:
            return [IsStaffOrAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        Filtrer les rendez-vous selon le rôle de l'utilisateur
        - Personnel médical : Tous les RDV
        - Patient : Uniquement ses RDV
        """
        queryset = Appointment.objects.all()
        user = self.request.user
        
        # Si l'utilisateur n'est pas authentifié, retourner un queryset vide
        if not user.is_authenticated:
            return queryset.none()
        
        # Personnel médical voit tous les RDV
        if user.role in ['staff', 'doctor', 'admin']:
            # Filtres optionnels pour le personnel
            status_filter = self.request.query_params.get('status', None)
            date_filter = self.request.query_params.get('date', None)
            patient_filter = self.request.query_params.get('patient', None)
            
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            if date_filter:
                queryset = queryset.filter(date=date_filter)
            if patient_filter:
                queryset = queryset.filter(
                    Q(patient_first_name__icontains=patient_filter) |
                    Q(patient_last_name__icontains=patient_filter) |
                    Q(patient_email__icontains=patient_filter)
                )
        
        # Patient ne voit que ses propres RDV
        elif user.role == 'patient':
            queryset = queryset.filter(patient_email=user.email)
        
        else:
            # Rôle non reconnu, aucun accès
            return queryset.none()
        
        return queryset.order_by('-date', '-time')
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def available_slots(self, request):
        """Retourne les créneaux disponibles pour une date donnée."""
        date_str = request.query_params.get('date')
        if not date_str:
            return Response(
                {'error': 'Le paramètre date est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Format de date invalide. Utilisez YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer les créneaux disponibles
        slots = self._get_available_slots_for_date(date)
        
        serializer = AvailableSlotsSerializer({'date': date_str, 'slots': slots})
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def lock_slot(self, request):
        """Verrouille temporairement un créneau."""
        date_str = request.data.get('date')
        time_str = request.data.get('time')
        
        if not date_str or not time_str:
            return Response(
                {'error': 'Les paramètres date et time sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-d').date()
            time_obj = datetime.strptime(time_str, '%H:%M').time()
        except ValueError:
            return Response(
                {'error': 'Format de date ou heure invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si le créneau est déjà pris
        if Appointment.objects.filter(
            date=date,
            time=time_obj,
            status__in=['pending', 'confirmed']
        ).exists():
            return Response(
                {'error': 'Ce créneau est déjà réservé'},
                status=status.HTTP_409_CONFLICT
            )
        
        # Créer ou mettre à jour le lock
        lock_id = request.data.get('lock_id', f"{request.META.get('REMOTE_ADDR')}_{timezone.now().timestamp()}")
        expires_at = timezone.now() + timedelta(minutes=5)
        
        lock, created = AppointmentSlotLock.objects.update_or_create(
            date=date,
            time=time_obj,
            defaults={
                'locked_by': lock_id,
                'expires_at': expires_at
            }
        )
        
        return Response({
            'lock_id': lock_id,
            'expires_at': expires_at.isoformat()
        })
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def unlock_slot(self, request):
        """Déverrouille un créneau."""
        date_str = request.data.get('date')
        time_str = request.data.get('time')
        
        if not date_str or not time_str:
            return Response(
                {'error': 'Les paramètres date et time sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            time_obj = datetime.strptime(time_str, '%H:%M').time()
        except ValueError:
            return Response(
                {'error': 'Format de date ou heure invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        AppointmentSlotLock.objects.filter(date=date, time=time_obj).delete()
        
        return Response({'message': 'Créneau déverrouillé'})
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def dashboard_stats(self, request):
        """Retourne les statistiques pour le dashboard admin."""
        today = timezone.now().date()
        
        # RDV aujourd'hui
        today_appointments = Appointment.objects.filter(date=today)
        today_total = today_appointments.count()
        today_confirmed = today_appointments.filter(status='confirmed').count()
        today_pending = today_appointments.filter(status='pending').count()
        
        # Patients total
        total_patients = Appointment.objects.values('patient_email').distinct().count()
        
        # Nouveaux patients ce mois
        first_day_month = today.replace(day=1)
        new_patients_month = Appointment.objects.filter(
            created_at__gte=first_day_month
        ).values('patient_email').distinct().count()
        
        # Revenus du mois (estimation basée sur les consultations)
        month_appointments = Appointment.objects.filter(
            date__gte=first_day_month,
            status__in=['confirmed', 'completed']
        )
        general_count = month_appointments.filter(consultation_type='generale').count()
        specialized_count = month_appointments.filter(consultation_type='specialisee').count()
        
        # Tarifs (15000 FCFA général, 25000 FCFA spécialisé)
        month_revenue = (general_count * 15000) + (specialized_count * 25000)
        
        # Taux de remplissage (estimation)
        # Supposons 30 créneaux par jour, 6 jours par semaine
        days_in_month = (today - first_day_month).days + 1
        working_days = days_in_month * 6 // 7  # Approximation
        total_slots = working_days * 30
        occupied_slots = month_appointments.count()
        fill_rate = (occupied_slots / total_slots * 100) if total_slots > 0 else 0
        
        # RDV récents (derniers 10)
        recent_appointments = Appointment.objects.all()[:10]
        recent_appointments_data = AppointmentSerializer(recent_appointments, many=True).data
        
        # Calcul des trends (comparaison avec le mois dernier)
        last_month_start = (first_day_month - timedelta(days=1)).replace(day=1)
        last_month_end = first_day_month - timedelta(days=1)
        
        last_month_appointments = Appointment.objects.filter(
            date__gte=last_month_start,
            date__lte=last_month_end
        ).count()
        
        current_month_appointments = month_appointments.count()
        
        appointments_trend = 0
        if last_month_appointments > 0:
            appointments_trend = ((current_month_appointments - last_month_appointments) / last_month_appointments) * 100
        
        return Response({
            'today_appointments': {
                'total': today_total,
                'confirmed': today_confirmed,
                'pending': today_pending,
                'subtitle': f"{today_confirmed} confirmés, {today_pending} en attente"
            },
            'total_patients': {
                'total': total_patients,
                'new_this_month': new_patients_month,
                'subtitle': f"{new_patients_month} nouveaux ce mois"
            },
            'month_revenue': {
                'amount': month_revenue,
                'formatted': f"{month_revenue / 1000000:.1f}M FCFA",
                'consultations': general_count + specialized_count,
                'subtitle': f"Sur {general_count + specialized_count} consultations"
            },
            'fill_rate': {
                'rate': round(fill_rate, 0),
                'formatted': f"{round(fill_rate, 0)}%",
                'subtitle': "Créneaux occupés"
            },
            'trends': {
                'appointments': round(appointments_trend, 0),
                'patients': 8,  # Mock pour l'instant
                'revenue': 12,  # Mock pour l'instant
                'fill_rate': 5  # Mock pour l'instant
            },
            'recent_appointments': recent_appointments_data
        })
    
    def _get_available_slots_for_date(self, date):
        """Retourne les créneaux disponibles pour une date."""
        # Logique existante de génération de créneaux
        # (à implémenter selon la logique métier)
        return []

