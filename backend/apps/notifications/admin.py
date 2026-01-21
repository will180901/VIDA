from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin pour le modèle Notification"""
    
    list_display = [
        'id',
        'user',
        'type',
        'title',
        'is_read',
        'created_at',
        'get_time_ago_display'
    ]
    
    list_filter = [
        'type',
        'is_read',
        'created_at',
    ]
    
    search_fields = [
        'user__email',
        'user__first_name',
        'user__last_name',
        'title',
        'message',
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'read_at',
        'get_time_ago_display',
        'get_date_group_display'
    ]
    
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user',)
        }),
        ('Contenu', {
            'fields': ('type', 'title', 'message', 'icon', 'color')
        }),
        ('Action', {
            'fields': ('action_url', 'related_appointment')
        }),
        ('État', {
            'fields': ('is_read', 'read_at')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at', 'get_time_ago_display', 'get_date_group_display'),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'created_at'
    
    actions = ['mark_as_read', 'mark_as_unread', 'delete_selected']
    
    def get_time_ago_display(self, obj):
        """Afficher le temps écoulé"""
        return obj.get_time_ago()
    get_time_ago_display.short_description = 'Il y a'
    
    def get_date_group_display(self, obj):
        """Afficher le groupe de date"""
        return obj.get_date_group()
    get_date_group_display.short_description = 'Groupe'
    
    def mark_as_read(self, request, queryset):
        """Action pour marquer comme lu"""
        count = 0
        for notification in queryset:
            notification.mark_as_read()
            count += 1
        self.message_user(request, f"{count} notification(s) marquée(s) comme lue(s).")
    mark_as_read.short_description = "Marquer comme lu"
    
    def mark_as_unread(self, request, queryset):
        """Action pour marquer comme non lu"""
        count = 0
        for notification in queryset:
            notification.mark_as_unread()
            count += 1
        self.message_user(request, f"{count} notification(s) marquée(s) comme non lue(s).")
    mark_as_unread.short_description = "Marquer comme non lu"
