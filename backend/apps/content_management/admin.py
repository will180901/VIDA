from django.contrib import admin
from .models import (
    ClinicSetting, HeroSlide, MedicalService, SocialLink, FAQ, 
    ClinicSchedule, ClinicHoliday, ConsultationFee
)

@admin.register(ClinicSetting)
class ClinicSettingAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone_primary', 'email')
    fieldsets = (
        ('Informations Générales', {
            'fields': ('name', 'address', 'phone_primary', 'phone_secondary', 'whatsapp', 'email')
        }),
        ('Tarifs de Consultation', {
            'fields': ('fee_general', 'fee_specialized')
        }),
        ('Horaires', {
            'fields': ('opening_hours',)
        }),
    )

    def has_add_permission(self, request):
        # Empêcher la création de plusieurs instances (Singleton)
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)

@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_active', 'created_at')
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'subtitle')

@admin.register(MedicalService)
class MedicalServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon_name', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'description')

@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ('platform', 'url', 'is_active')
    list_editable = ('is_active',)

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'order', 'is_active')
    list_editable = ('order', 'is_active')
    search_fields = ('question', 'answer')

@admin.register(ClinicSchedule)
class ClinicScheduleAdmin(admin.ModelAdmin):
    list_display = ['day_of_week', 'is_open', 'morning_start', 'morning_end', 
                    'afternoon_start', 'afternoon_end']
    list_editable = ['is_open', 'morning_start', 'morning_end', 
                     'afternoon_start', 'afternoon_end']

@admin.register(ClinicHoliday)
class ClinicHolidayAdmin(admin.ModelAdmin):
    list_display = ['date', 'name', 'is_recurring']
    list_filter = ['is_recurring']
    search_fields = ['name']


@admin.register(ConsultationFee)
class ConsultationFeeAdmin(admin.ModelAdmin):
    list_display = ('consultation_type', 'price', 'is_active', 'order', 'updated_at')
    list_editable = ('price', 'is_active', 'order')
    list_filter = ('is_active', 'consultation_type')
    search_fields = ('consultation_type', 'description')
    ordering = ('order', 'consultation_type')
    
    fieldsets = (
        ('Type de consultation', {
            'fields': ('consultation_type', 'description')
        }),
        ('Tarification', {
            'fields': ('price',)
        }),
        ('Affichage', {
            'fields': ('is_active', 'order')
        }),
    )
