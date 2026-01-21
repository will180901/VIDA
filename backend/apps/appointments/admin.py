from django.contrib import admin
from .models import Appointment, AppointmentSlotLock


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
    )
    readonly_fields = ['created_at', 'updated_at', 'confirmed_at', 'cancelled_at']


@admin.register(AppointmentSlotLock)
class AppointmentSlotLockAdmin(admin.ModelAdmin):
    list_display = ['date', 'time', 'locked_by', 'locked_at', 'expires_at']
    list_filter = ['date']
