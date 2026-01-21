from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Count, Q
from datetime import datetime, timedelta, time
from .models import Appointment, AppointmentSlotLock, AppointmentHistory, AppointmentProposal, AppointmentRequest
from .serializers import (
    AppointmentSerializer, AvailableSlotsSerializer,
    AppointmentRespondSerializer, AppointmentAcceptSerializer,
    AppointmentRejectSerializer, AppointmentCounterProposeSerializer,
    AppointmentModifySerializer, AppointmentCancelSerializer,
    AppointmentHistorySerializer, AppointmentProposalSerializer,
    AppointmentRequestSerializer, AppointmentRequestCreateSerializer,
    AppointmentRequestValidateSerializer
)
from .emails import (
    send_appointment_confirmation, send_proposal_email,
    send_counter_proposal_email, send_modification_request_email,
    send_rejection_email, send_rejection_by_patient_email,
    send_proposal_accepted_email, send_appointment_cancellation
)
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
    
    def perform_update(self, serializer):
        """
        Surcharge pour enregistrer l'utilisateur qui a modifié le RDV.
        La traçabilité complète est gérée automatiquement par les signals.
        """
        serializer.save(last_modified_by=self.request.user)
    
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
        from apps.content_management.models import ClinicSetting
        
        today = timezone.now().date()
        
        # Récupérer les tarifs depuis les paramètres
        settings = ClinicSetting.objects.first()
        fee_general = float(settings.fee_general) if settings else 15000
        fee_specialized = float(settings.fee_specialized) if settings else 25000
        
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
        
        # Calcul des revenus avec tarifs dynamiques
        month_revenue = (general_count * fee_general) + (specialized_count * fee_specialized)
        
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
        
        # Trend RDV
        last_month_appointments = Appointment.objects.filter(
            date__gte=last_month_start,
            date__lte=last_month_end
        ).count()
        
        current_month_appointments = month_appointments.count()
        
        appointments_trend = 0
        if last_month_appointments > 0:
            appointments_trend = ((current_month_appointments - last_month_appointments) / last_month_appointments) * 100
        
        # Trend Patients
        last_month_patients = Appointment.objects.filter(
            created_at__gte=last_month_start,
            created_at__lte=last_month_end
        ).values('patient_email').distinct().count()
        
        patients_trend = 0
        if last_month_patients > 0:
            patients_trend = ((new_patients_month - last_month_patients) / last_month_patients) * 100
        
        # Trend Revenus
        last_month_appts = Appointment.objects.filter(
            date__gte=last_month_start,
            date__lte=last_month_end,
            status__in=['confirmed', 'completed']
        )
        last_month_general = last_month_appts.filter(consultation_type='generale').count()
        last_month_specialized = last_month_appts.filter(consultation_type='specialisee').count()
        last_month_revenue = (last_month_general * fee_general) + (last_month_specialized * fee_specialized)
        
        revenue_trend = 0
        if last_month_revenue > 0:
            revenue_trend = ((month_revenue - last_month_revenue) / last_month_revenue) * 100
        
        # Trend Taux de remplissage
        last_month_days = (last_month_end - last_month_start).days + 1
        last_month_working_days = last_month_days * 6 // 7
        last_month_total_slots = last_month_working_days * 30
        last_month_occupied = last_month_appts.count()
        last_month_fill_rate = (last_month_occupied / last_month_total_slots * 100) if last_month_total_slots > 0 else 0
        
        fill_rate_trend = 0
        if last_month_fill_rate > 0:
            fill_rate_trend = ((fill_rate - last_month_fill_rate) / last_month_fill_rate) * 100
        
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
                'patients': round(patients_trend, 0),
                'revenue': round(revenue_trend, 0),
                'fill_rate': round(fill_rate_trend, 0)
            },
            'recent_appointments': recent_appointments_data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsStaffOrAdmin])
    def chart_data(self, request):
        """Retourne les données pour les graphiques du dashboard."""
        from apps.content_management.models import ClinicSetting
        
        today = timezone.now().date()
        
        # Récupérer les tarifs depuis les paramètres
        settings = ClinicSetting.objects.first()
        fee_general = float(settings.fee_general) if settings else 15000
        fee_specialized = float(settings.fee_specialized) if settings else 25000
        
        # 1. Évolution des RDV (7 derniers jours)
        appointments_evolution = []
        days_fr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
        
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            count = Appointment.objects.filter(date=date).count()
            day_name = days_fr[date.weekday()]
            appointments_evolution.append({
                'name': day_name,
                'rdv': count
            })
        
        # 2. Répartition par type de consultation (ce mois)
        first_day_month = today.replace(day=1)
        month_appointments = Appointment.objects.filter(
            date__gte=first_day_month,
            status__in=['confirmed', 'completed']
        )
        
        # Statistiques par statut pour le graphique "Actions requises"
        status_distribution = [
            {
                'name': 'Nouvelles demandes',
                'value': Appointment.objects.filter(status='pending').count(),
                'fill': 'rgba(245, 158, 11, 0.8)',  # Orange vif - ACTION REQUISE
                'description': 'À traiter en priorité'
            },
            {
                'name': 'En attente patient',
                'value': Appointment.objects.filter(status='awaiting_patient_response').count(),
                'fill': 'rgba(59, 130, 246, 0.7)',  # Bleu
                'description': 'Proposition envoyée'
            },
            {
                'name': 'Contre-propositions',
                'value': Appointment.objects.filter(status='awaiting_admin_response').count(),
                'fill': 'rgba(139, 92, 246, 0.7)',  # Violet
                'description': 'Patient a répondu'
            },
            {
                'name': 'Confirmés',
                'value': Appointment.objects.filter(status='confirmed').count(),
                'fill': 'rgba(16, 185, 129, 0.7)',  # Vert
                'description': 'RDV validés'
            },
            {
                'name': 'Annulés/Refusés',
                'value': Appointment.objects.filter(
                    status__in=['cancelled', 'rejected', 'rejected_by_patient']
                ).count(),
                'fill': 'rgba(239, 68, 68, 0.6)',  # Rouge
                'description': 'Terminés sans suite'
            }
        ]
        
        # 3. Revenus mensuels (6 derniers mois)
        revenue_data = []
        months_fr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        
        for i in range(5, -1, -1):
            # Calculer le premier jour du mois
            if today.month - i <= 0:
                month = 12 + (today.month - i)
                year = today.year - 1
            else:
                month = today.month - i
                year = today.year
            
            month_start = today.replace(year=year, month=month, day=1)
            
            # Calculer le dernier jour du mois
            if month == 12:
                month_end = today.replace(year=year + 1, month=1, day=1) - timedelta(days=1)
            else:
                month_end = today.replace(year=year, month=month + 1, day=1) - timedelta(days=1)
            
            # Compter les consultations du mois
            month_appts = Appointment.objects.filter(
                date__gte=month_start,
                date__lte=month_end,
                status__in=['confirmed', 'completed']
            )
            
            general = month_appts.filter(consultation_type='generale').count()
            specialized = month_appts.filter(consultation_type='specialisee').count()
            suivi = month_appts.filter(consultation_type='suivi').count()
            urgence = month_appts.filter(consultation_type='urgence').count()
            
            # Calculer le revenu avec tarifs dynamiques
            # Utiliser ConsultationFee si disponible, sinon fallback sur ClinicSetting
            from apps.content_management.models import ConsultationFee
            
            try:
                fee_general = ConsultationFee.get_price('generale')
                fee_specialized = ConsultationFee.get_price('specialisee')
                fee_suivi = ConsultationFee.get_price('suivi')
                fee_urgence = ConsultationFee.get_price('urgence')
            except:
                # Fallback sur les anciens champs
                fee_general = float(settings.fee_general) if settings else 15000
                fee_specialized = float(settings.fee_specialized) if settings else 25000
                fee_suivi = 10000
                fee_urgence = 30000
            
            revenue = (
                (general * fee_general) + 
                (specialized * fee_specialized) +
                (suivi * fee_suivi) +
                (urgence * fee_urgence)
            )
            
            revenue_data.append({
                'month': months_fr[month - 1],
                'revenue': revenue
            })
        
        return Response({
            'appointments_evolution': appointments_evolution,
            'status_distribution': status_distribution,
            'revenue_data': revenue_data
        })
    
    # ============================================================================
    # NOUVELLES ACTIONS POUR WORKFLOW BIDIRECTIONNEL
    # ============================================================================
    
    @action(detail=True, methods=['post'], permission_classes=[IsStaffOrAdmin])
    def respond(self, request, pk=None):
        """Admin répond à une demande de RDV (accepter/refuser/proposer)."""
        appointment = self.get_object()
        
        # Vérifier que le RDV est en attente
        if appointment.status != 'pending':
            return Response(
                {'error': 'Ce rendez-vous n\'est plus en attente.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AppointmentRespondSerializer(
            data=request.data,
            context={'appointment_id': appointment.id}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        action_type = serializer.validated_data['action']
        
        if action_type == 'accept':
            # Accepter le RDV
            appointment.status = 'confirmed'
            appointment.confirmed_at = timezone.now()
            appointment.responded_at = timezone.now()
            appointment.last_modified_by = request.user
            appointment.save()
            
            # Créer entrée historique
            AppointmentHistory.objects.create(
                appointment=appointment,
                action_type='confirmed',
                actor=request.user,
                actor_type='admin',
                new_status='confirmed',
                old_status='pending'
            )
            
            # Envoyer email de confirmation
            send_appointment_confirmation(appointment)
            
            return Response({
                'id': appointment.id,
                'status': appointment.status,
                'message': 'Rendez-vous confirmé avec succès'
            })
        
        elif action_type == 'reject':
            # Refuser le RDV
            appointment.status = 'rejected'
            appointment.rejection_reason = serializer.validated_data.get('rejection_reason', '')
            appointment.admin_message = serializer.validated_data.get('admin_message', '')
            appointment.responded_at = timezone.now()
            appointment.last_modified_by = request.user
            appointment.save()
            
            # Créer entrée historique
            AppointmentHistory.objects.create(
                appointment=appointment,
                action_type='rejected',
                actor=request.user,
                actor_type='admin',
                new_status='rejected',
                old_status='pending',
                reason=appointment.rejection_reason,
                message=appointment.admin_message
            )
            
            # Envoyer email de refus
            send_rejection_email(appointment)
            
            return Response({
                'id': appointment.id,
                'status': appointment.status,
                'message': 'Rendez-vous refusé'
            })
        
        elif action_type == 'propose':
            # Proposer une alternative
            proposed_date = serializer.validated_data['proposed_date']
            proposed_time = serializer.validated_data['proposed_time']
            proposed_type = serializer.validated_data.get('proposed_consultation_type', '')
            admin_message = serializer.validated_data.get('admin_message', '')
            
            # Mettre à jour le RDV
            appointment.status = 'awaiting_patient_response'
            appointment.proposed_date = proposed_date
            appointment.proposed_time = proposed_time
            appointment.proposed_consultation_type = proposed_type
            appointment.admin_message = admin_message
            appointment.proposal_sent_at = timezone.now()
            appointment.last_modified_by = request.user
            appointment.save()
            
            # Créer la proposition
            expires_at = timezone.now() + timedelta(days=7)  # Expire dans 7 jours
            proposal = AppointmentProposal.objects.create(
                appointment=appointment,
                proposal_type='admin_to_patient',
                proposed_date=proposed_date,
                proposed_time=proposed_time,
                proposed_consultation_type=proposed_type,
                message=admin_message,
                proposed_by=request.user,
                expires_at=expires_at
            )
            
            # Créer entrée historique
            AppointmentHistory.objects.create(
                appointment=appointment,
                action_type='proposal_sent',
                actor=request.user,
                actor_type='admin',
                old_date=appointment.date,
                old_time=appointment.time,
                new_date=proposed_date,
                new_time=proposed_time,
                new_status='awaiting_patient_response',
                old_status='pending',
                message=admin_message
            )
            
            # Envoyer email de proposition
            send_proposal_email(appointment)
            
            return Response({
                'id': appointment.id,
                'status': appointment.status,
                'proposal_id': proposal.id,
                'message': 'Proposition envoyée au patient'
            })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def accept(self, request, pk=None):
        """Patient accepte une proposition."""
        appointment = self.get_object()
        
        # Vérifier que le patient est propriétaire
        if appointment.patient_email != request.user.email:
            return Response(
                {'error': 'Vous n\'êtes pas autorisé à modifier ce rendez-vous.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier le statut
        if appointment.status not in ['awaiting_patient_response', 'modification_pending']:
            return Response(
                {'error': 'Aucune proposition en attente pour ce rendez-vous.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AppointmentAcceptSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        proposal_id = serializer.validated_data['proposal_id']
        
        try:
            proposal = AppointmentProposal.objects.get(id=proposal_id, appointment=appointment)
        except AppointmentProposal.DoesNotExist:
            return Response(
                {'error': 'Proposition introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Sauvegarder anciennes valeurs pour l'historique
        old_date = appointment.date
        old_time = appointment.time
        
        # Mettre à jour le RDV avec les données proposées
        appointment.date = proposal.proposed_date
        appointment.time = proposal.proposed_time
        if proposal.proposed_consultation_type:
            appointment.consultation_type = proposal.proposed_consultation_type
        appointment.status = 'confirmed'
        appointment.confirmed_at = timezone.now()
        appointment.responded_at = timezone.now()
        appointment.last_modified_by = request.user
        appointment.save()
        
        # Marquer la proposition comme acceptée
        proposal.status = 'accepted'
        proposal.responded_at = timezone.now()
        proposal.save()
        
        # Créer entrée historique
        AppointmentHistory.objects.create(
            appointment=appointment,
            action_type='proposal_accepted',
            actor=request.user,
            actor_type='patient',
            old_date=old_date,
            old_time=old_time,
            new_date=appointment.date,
            new_time=appointment.time,
            new_status='confirmed',
            old_status='awaiting_patient_response'
        )
        
        # Envoyer notification admin
        send_proposal_accepted_email(appointment)
        
        return Response({
            'id': appointment.id,
            'status': appointment.status,
            'date': appointment.date,
            'time': appointment.time,
            'message': 'Proposition acceptée, rendez-vous confirmé'
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        """Patient refuse une proposition."""
        appointment = self.get_object()
        
        # Vérifier que le patient est propriétaire
        if appointment.patient_email != request.user.email:
            return Response(
                {'error': 'Vous n\'êtes pas autorisé à modifier ce rendez-vous.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AppointmentRejectSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        proposal_id = serializer.validated_data['proposal_id']
        reason = serializer.validated_data.get('reason', '')
        
        try:
            proposal = AppointmentProposal.objects.get(id=proposal_id, appointment=appointment)
        except AppointmentProposal.DoesNotExist:
            return Response(
                {'error': 'Proposition introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Mettre à jour le RDV
        appointment.status = 'rejected_by_patient'
        appointment.patient_message = reason
        appointment.responded_at = timezone.now()
        appointment.last_modified_by = request.user
        appointment.save()
        
        # Marquer la proposition comme refusée
        proposal.status = 'rejected'
        proposal.responded_at = timezone.now()
        proposal.response_message = reason
        proposal.save()
        
        # Créer entrée historique
        AppointmentHistory.objects.create(
            appointment=appointment,
            action_type='proposal_rejected',
            actor=request.user,
            actor_type='patient',
            new_status='rejected_by_patient',
            old_status='awaiting_patient_response',
            reason=reason
        )
        
        # Envoyer notification admin
        send_rejection_by_patient_email(appointment)
        
        return Response({
            'id': appointment.id,
            'status': appointment.status,
            'message': 'Proposition refusée'
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def counter_propose(self, request, pk=None):
        """Patient contre-propose une date."""
        appointment = self.get_object()
        
        # Vérifier que le patient est propriétaire
        if appointment.patient_email != request.user.email:
            return Response(
                {'error': 'Vous n\'êtes pas autorisé à modifier ce rendez-vous.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AppointmentCounterProposeSerializer(
            data=request.data,
            context={'appointment_id': appointment.id}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        proposed_date = serializer.validated_data['proposed_date']
        proposed_time = serializer.validated_data['proposed_time']
        patient_message = serializer.validated_data.get('patient_message', '')
        
        # Mettre à jour le RDV
        appointment.status = 'awaiting_admin_response'
        appointment.proposed_date = proposed_date
        appointment.proposed_time = proposed_time
        appointment.patient_message = patient_message
        appointment.proposal_sent_at = timezone.now()
        appointment.last_modified_by = request.user
        appointment.save()
        
        # Créer la contre-proposition
        expires_at = timezone.now() + timedelta(days=7)
        proposal = AppointmentProposal.objects.create(
            appointment=appointment,
            proposal_type='patient_to_admin',
            proposed_date=proposed_date,
            proposed_time=proposed_time,
            message=patient_message,
            proposed_by=request.user,
            expires_at=expires_at
        )
        
        # Créer entrée historique
        AppointmentHistory.objects.create(
            appointment=appointment,
            action_type='counter_proposed',
            actor=request.user,
            actor_type='patient',
            old_date=appointment.date,
            old_time=appointment.time,
            new_date=proposed_date,
            new_time=proposed_time,
            new_status='awaiting_admin_response',
            message=patient_message
        )
        
        # Envoyer notification admin
        send_counter_proposal_email(appointment)
        
        return Response({
            'id': appointment.id,
            'status': appointment.status,
            'proposal_id': proposal.id,
            'message': 'Contre-proposition envoyée à l\'admin'
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def modify(self, request, pk=None):
        """Patient modifie un RDV confirmé."""
        appointment = self.get_object()
        
        # Vérifier que le patient est propriétaire
        if appointment.patient_email != request.user.email:
            return Response(
                {'error': 'Vous n\'êtes pas autorisé à modifier ce rendez-vous.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Vérifier que le RDV est confirmé
        if appointment.status != 'confirmed':
            return Response(
                {'error': 'Seuls les rendez-vous confirmés peuvent être modifiés.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AppointmentModifySerializer(
            data=request.data,
            context={'appointment': appointment}
        )
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        new_date = serializer.validated_data['new_date']
        new_time = serializer.validated_data['new_time']
        reason = serializer.validated_data.get('reason', '')
        
        # Sauvegarder anciennes valeurs
        old_date = appointment.date
        old_time = appointment.time
        
        # Mettre à jour le RDV
        appointment.status = 'modification_pending'
        appointment.proposed_date = new_date
        appointment.proposed_time = new_time
        appointment.patient_message = reason
        appointment.proposal_sent_at = timezone.now()
        appointment.last_modified_by = request.user
        appointment.save()
        
        # Créer la proposition
        expires_at = timezone.now() + timedelta(days=7)
        proposal = AppointmentProposal.objects.create(
            appointment=appointment,
            proposal_type='patient_to_admin',
            proposed_date=new_date,
            proposed_time=new_time,
            message=reason,
            proposed_by=request.user,
            expires_at=expires_at
        )
        
        # Créer entrée historique
        AppointmentHistory.objects.create(
            appointment=appointment,
            action_type='modified',
            actor=request.user,
            actor_type='patient',
            old_date=old_date,
            old_time=old_time,
            new_date=new_date,
            new_time=new_time,
            old_status='confirmed',
            new_status='modification_pending',
            reason=reason
        )
        
        # Envoyer notification admin
        send_modification_request_email(appointment)
        
        return Response({
            'id': appointment.id,
            'status': appointment.status,
            'proposal_id': proposal.id,
            'message': 'Demande de modification envoyée'
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        """Patient ou admin annule un RDV."""
        appointment = self.get_object()
        
        # Vérifier les permissions
        is_patient = appointment.patient_email == request.user.email
        is_staff = request.user.role in ['staff', 'doctor', 'admin']
        
        if not (is_patient or is_staff):
            return Response(
                {'error': 'Vous n\'êtes pas autorisé à annuler ce rendez-vous.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Si c'est un patient, valider le délai de 24h
        if is_patient:
            serializer = AppointmentCancelSerializer(
                data=request.data,
                context={'appointment': appointment}
            )
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            reason = serializer.validated_data.get('reason', '')
            actor_type = 'patient'
        else:
            # Staff peut annuler sans restriction
            reason = request.data.get('reason', '')
            actor_type = 'admin'
        
        # Annuler le RDV
        appointment.status = 'cancelled'
        appointment.cancelled_at = timezone.now()
        appointment.cancellation_reason = reason
        appointment.last_modified_by = request.user
        appointment.save()
        
        # Créer entrée historique
        AppointmentHistory.objects.create(
            appointment=appointment,
            action_type='cancelled',
            actor=request.user,
            actor_type=actor_type,
            new_status='cancelled',
            reason=reason
        )
        
        # Envoyer notification
        send_appointment_cancellation(appointment, reason)
        
        return Response({
            'id': appointment.id,
            'status': appointment.status,
            'message': 'Rendez-vous annulé avec succès'
        })
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def history(self, request, pk=None):
        """Récupère l'historique d'un RDV."""
        appointment = self.get_object()
        
        # Vérifier les permissions
        is_patient = appointment.patient_email == request.user.email
        is_staff = request.user.role in ['staff', 'doctor', 'admin']
        
        if not (is_patient or is_staff):
            return Response(
                {'error': 'Vous n\'êtes pas autorisé à voir cet historique.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Récupérer l'historique
        history = AppointmentHistory.objects.filter(appointment=appointment).order_by('-created_at')
        serializer = AppointmentHistorySerializer(history, many=True, context={'request': request})
        
        return Response({
            'appointment_id': appointment.id,
            'history': serializer.data
        })
    
    def _get_available_slots_for_date(self, date):
        """Retourne les créneaux disponibles pour une date."""
        # Logique existante de génération de créneaux
        # (à implémenter selon la logique métier)
        return []


# ============================================================================
# APPOINTMENT REQUEST VIEWSET
# ============================================================================

class AppointmentRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des demandes de rendez-vous sans compte.
    
    Endpoints:
    - POST /api/v1/appointments/request/ - Créer une demande de RDV
    - GET /api/v1/appointments/request/validate/<code>/ - Valider avec code d'accès
    """
    queryset = AppointmentRequest.objects.all()
    serializer_class = AppointmentRequestSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentRequestCreateSerializer
        return AppointmentRequestSerializer
    
    def get_queryset(self):
        """Filtrer les demandes selon le rôle."""
        user = self.request.user
        
        if not user.is_authenticated:
            return AppointmentRequest.objects.none()
        
        # Personnel médical voit toutes les demandes
        if user.role in ['staff', 'doctor', 'admin']:
            queryset = AppointmentRequest.objects.all()
            
            # Filtres optionnels
            status_filter = self.request.query_params.get('status', None)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            return queryset.order_by('-created_at')
        
        # Patient n'a pas accès à ces endpoints
        return AppointmentRequest.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Créer une nouvelle demande de rendez-vous."""
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Sauvegarder avec génération du code d'accès
        appointment_request = serializer.save()
        
        # Retourner le serializer complet
        output_serializer = AppointmentRequestSerializer(appointment_request)
        
        return Response({
            'success': True,
            'message': 'Demande de rendez-vous créée avec succès.',
            'data': output_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='validate/(?P<access_code>[^/]+)')
    def validate(self, request, access_code=None):
        """
        Valider une demande de rendez-vous avec le code d'accès.
        
        Retourne les détails de la demande si le code est valide et non expiré.
        """
        try:
            appointment_request = AppointmentRequest.objects.get(access_code=access_code.upper())
        except AppointmentRequest.DoesNotExist:
            return Response({
                'valid': False,
                'error': 'Code d\'accès invalide.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Vérifier si expiré
        if appointment_request.is_expired():
            return Response({
                'valid': False,
                'error': 'Ce code d\'accès a expiré. Veuillez soumettre une nouvelle demande.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Retourner les détails
        serializer = AppointmentRequestSerializer(appointment_request)
        
        return Response({
            'valid': True,
            'data': serializer.data
        })
    
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def details(self, request, pk=None):
        """Récupérer les détails d'une demande (par ID interne)."""
        appointment_request = self.get_object()
        
        # Vérifier si expiré
        if appointment_request.is_expired():
            return Response({
                'error': 'Cette demande a expiré.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = AppointmentRequestSerializer(appointment_request)
        return Response(serializer.data)
