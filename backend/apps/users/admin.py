from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, EmailVerificationToken, PasswordResetToken


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
