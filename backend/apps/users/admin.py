from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, EmailVerificationToken, PasswordResetToken, Patient
from .models_medical import MedicalRecord, PatientNote, PatientDocument


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'email_verified', 'is_active']
    list_filter = ['role', 'email_verified', 'is_active', 'is_staff']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {
            'fields': ('first_name', 'last_name', 'phone', 'date_of_birth', 'gender', 'address', 'avatar')
        }),
        ('Contact urgence', {
            'fields': ('emergency_contact', 'emergency_phone')
        }),
        ('Permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Vérifications', {
            'fields': ('email_verified', 'phone_verified')
        }),
        ('Dates', {
            'fields': ('last_login', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'expires_at', 'used']
    list_filter = ['used']
    search_fields = ['user__email']


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'expires_at', 'used']
    list_filter = ['used']
    search_fields = ['user__email']


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['patient', 'blood_group', 'updated_at']
    list_filter = ['blood_group']
    search_fields = ['patient__email', 'patient__first_name', 'patient__last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Patient', {'fields': ('patient',)}),
        ('Informations de base', {'fields': ('blood_group',)}),
        ('Allergies et antécédents', {
            'fields': ('allergies', 'medical_history', 'chronic_conditions', 'current_treatments')
        }),
        ('Ophtalmologie', {
            'fields': ('vision_left', 'vision_right', 'intraocular_pressure_left', 'intraocular_pressure_right')
        }),
        ('Notes', {'fields': ('medical_notes',)}),
        ('Dates', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(PatientNote)
class PatientNoteAdmin(admin.ModelAdmin):
    list_display = ['patient', 'author', 'is_important', 'created_at']
    list_filter = ['is_important', 'created_at']
    search_fields = ['patient__email', 'patient__first_name', 'patient__last_name', 'content']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        (None, {'fields': ('patient', 'author', 'is_important')}),
        ('Contenu', {'fields': ('content',)}),
        ('Dates', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(PatientDocument)
class PatientDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient', 'category', 'uploaded_by', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['title', 'patient__email', 'patient__first_name', 'patient__last_name']
    readonly_fields = ['created_at', 'file_size', 'file_extension']
    
    fieldsets = (
        (None, {'fields': ('patient', 'title', 'category')}),
        ('Fichier', {'fields': ('file', 'file_size', 'file_extension')}),
        ('Détails', {'fields': ('description', 'uploaded_by')}),
        ('Dates', {'fields': ('created_at',), 'classes': ('collapse',)}),
    )


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    """
    Admin pour le modèle Patient.
    Un Patient est créé automatiquement après une première consultation complétée.
    """
    list_display = ['__str__', 'email', 'phone', 'first_consultation_date', 'created_at']
    list_filter = ['created_at', 'gender']
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'first_consultation_date']
    
    fieldsets = (
        ('Informations personnelles', {
            'fields': ('user', 'first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'gender', 'address')
        }),
        ('Première consultation', {
            'fields': ('appointment_request', 'first_consultation_date'),
            'classes': ('collapse',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
