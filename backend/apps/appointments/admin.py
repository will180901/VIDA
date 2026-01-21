from django.contrib import admin
from .models import Appointment, AppointmentSlotLock, AppointmentHistory, AppointmentProposal


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'patient_full_name', 'date', 'time', 'consultation_type', 
        'status', 'patient_phone', 'created_at'
    ]
    list_filter = ['status', 'consultation_type', 'date']
    search_fields = ['patient_first_name', 'patient_last_name', 'patient_email', 'patient_phone']
    date_hierarchy = 'date'
    ordering = ['-date', '-time']
    
    fieldsets = (
        ('Patient', {
            'fields': ('patient', 'patient_first_name', 'patient_last_name', 'patient_email', 'patient_phone')
        }),
        ('Rendez-vous', {
            'fields': ('date', 'time', 'consultation_type', 'reason', 'status')
        }),
        ('Workflow Bidirectionnel', {
            'fields': ('rejection_reason', 'admin_message', 'patient_message'),
            'classes': ('collapse',)
        }),
        ('Propositions', {
            'fields': ('proposed_date', 'proposed_time', 'proposed_consultation_type'),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes_patient', 'notes_staff'),
            'classes': ('collapse',)
        }),
        ('Annulation', {
            'fields': ('cancelled_at', 'cancellation_reason'),
            'classes': ('collapse',)
        }),
        ('Rappels', {
            'fields': ('reminder_sent', 'reminder_sent_at'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_by', 'last_modified_by', 'created_at', 'updated_at', 'confirmed_at', 'responded_at', 'proposal_sent_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at', 'updated_at', 'confirmed_at', 'cancelled_at', 'responded_at', 'proposal_sent_at']


@admin.register(AppointmentSlotLock)
class AppointmentSlotLockAdmin(admin.ModelAdmin):
    list_display = ['date', 'time', 'locked_by', 'locked_at', 'expires_at']
    list_filter = ['date']


@admin.register(AppointmentHistory)
class AppointmentHistoryAdmin(admin.ModelAdmin):
    list_display = ['appointment', 'action_type', 'actor_type', 'actor', 'created_at']
    list_filter = ['action_type', 'actor_type', 'created_at']
    search_fields = ['appointment__patient_first_name', 'appointment__patient_last_name', 'message', 'reason']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'ip_address', 'user_agent']
    
    fieldsets = (
        ('Rendez-vous', {
            'fields': ('appointment', 'action_type', 'actor', 'actor_type')
        }),
        ('Anciennes Valeurs', {
            'fields': ('old_date', 'old_time', 'old_consultation_type', 'old_status'),
            'classes': ('collapse',)
        }),
        ('Nouvelles Valeurs', {
            'fields': ('new_date', 'new_time', 'new_consultation_type', 'new_status'),
            'classes': ('collapse',)
        }),
        ('Messages', {
            'fields': ('message', 'reason')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AppointmentProposal)
class AppointmentProposalAdmin(admin.ModelAdmin):
    list_display = ['appointment', 'proposal_type', 'status', 'proposed_date', 'proposed_time', 'created_at']
    list_filter = ['proposal_type', 'status', 'created_at']
    search_fields = ['appointment__patient_first_name', 'appointment__patient_last_name', 'message']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'responded_at']
    
    fieldsets = (
        ('Rendez-vous', {
            'fields': ('appointment', 'proposal_type', 'status')
        }),
        ('Proposition', {
            'fields': ('proposed_date', 'proposed_time', 'proposed_consultation_type', 'message')
        }),
        ('Métadonnées', {
            'fields': ('proposed_by', 'created_at', 'expires_at', 'responded_at', 'response_message'),
            'classes': ('collapse',)
        }),
    )
