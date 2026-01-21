from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import models
from .validators import calculate_password_strength
from .captcha import HCaptchaMixin
from .sanitizers import sanitize_text_input
from .models import Patient, Invoice, Payment
from drf_spectacular.utils import extend_schema_field, extend_schema_serializer, OpenApiExample

User = get_user_model()


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Inscription valide',
            value={
                'email': 'patient@example.com',
                'password': 'MotDePasse123!Secure',
                'password_confirm': 'MotDePasse123!Secure',
                'first_name': 'Jean',
                'last_name': 'Dupont',
                'phone': '06 123 45 67',
                'captcha': 'token_hcaptcha_ici'
            },
            request_only=True,
        ),
    ]
)
class UserRegistrationSerializer(HCaptchaMixin, serializers.ModelSerializer):
    """
    Serializer pour l'inscription d'un nouvel utilisateur.
    
    Nécessite un token hCaptcha valide pour prévenir les bots.
    Le mot de passe doit contenir au moins 12 caractères.
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    password_strength = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'password_strength', 'first_name', 'last_name', 'phone']

    def get_password_strength(self, obj):
        """Retourne la force du mot de passe pour feedback"""
        password = self.initial_data.get('password', '')
        if password:
            return calculate_password_strength(password)
        return None

    def validate(self, attrs):
        # Valider CAPTCHA d'abord (via HCaptchaMixin)
        attrs = super().validate(attrs)
        
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'phone',
            'role', 'date_of_birth', 'gender', 'address',
            'emergency_contact', 'emergency_phone', 'avatar',
            'email_verified', 'phone_verified', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'email_verified', 'phone_verified', 'created_at']

    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def validate_first_name(self, value):
        """Sanitize first_name pour prévenir XSS"""
        return sanitize_text_input(value)
    
    def validate_last_name(self, value):
        """Sanitize last_name pour prévenir XSS"""
        return sanitize_text_input(value)
    
    def validate_address(self, value):
        """Sanitize address pour prévenir XSS"""
        return sanitize_text_input(value)
    
    def validate_emergency_contact(self, value):
        """Sanitize emergency_contact pour prévenir XSS"""
        return sanitize_text_input(value)


# Alias pour compatibilité avec l'API patients
UserSerializer = UserProfileSerializer


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Les mots de passe ne correspondent pas."})
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Les mots de passe ne correspondent pas."})
        return attrs


# ============================================================================
# PATIENT SERIALIZERS
# ============================================================================

class PatientSerializer(serializers.ModelSerializer):
    """Serializer pour les patients."""
    full_name = serializers.CharField(read_only=True)
    appointment_request_id = serializers.CharField(
        source='appointment_request.id', 
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'first_name', 'last_name', 'full_name',
            'phone', 'email', 'date_of_birth', 'gender', 'address',
            'appointment_request', 'appointment_request_id',
            'first_consultation_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_first_name(self, value):
        return sanitize_text_input(value)
    
    def validate_last_name(self, value):
        return sanitize_text_input(value)
    
    def validate_address(self, value):
        return sanitize_text_input(value)


class PatientCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un patient."""
    
    class Meta:
        model = Patient
        fields = [
            'first_name', 'last_name', 'phone', 'email',
            'date_of_birth', 'gender', 'address',
            'appointment_request', 'first_consultation_date'
        ]
    
    def validate_first_name(self, value):
        return sanitize_text_input(value)
    
    def validate_last_name(self, value):
        return sanitize_text_input(value)


# ============================================================================
# INVOICE SERIALIZERS
# ============================================================================

class PaymentSerializer(serializers.ModelSerializer):
    """Serializer pour les paiements."""
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'invoice', 'amount', 'payment_date',
            'payment_method', 'payment_method_display',
            'reference', 'status', 'status_display',
            'notes', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer pour les factures."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    total_paid = serializers.SerializerMethodField()
    balance_due = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'medical_record', 'patient_name',
            'invoice_number', 'issue_date', 'due_date',
            'amount', 'status', 'status_display',
            'payments', 'total_paid', 'balance_due',
            'notes', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'invoice_number', 'created_at', 'updated_at'
        ]
    
    def get_total_paid(self, obj):
        """Calcule le total des paiements."""
        return sum(payment.amount for payment in obj.payments.filter(status='completed'))
    
    def get_balance_due(self, obj):
        """Calcule le solde dû."""
        total_paid = self.get_total_paid(obj)
        return obj.amount - total_paid
    
    def get_patient_name(self, obj):
        """Retourne le nom du patient."""
        if obj.medical_record and obj.medical_record.patient:
            return obj.medical_record.patient.get_full_name()
        return None


class InvoiceCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une facture."""
    
    class Meta:
        model = Invoice
        fields = ['medical_record', 'issue_date', 'due_date', 'amount', 'notes']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        return value


class InvoiceUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour modifier une facture."""
    
    class Meta:
        model = Invoice
        fields = ['status', 'notes']


# ============================================================================
# PAYMENT SERIALIZERS
# ============================================================================

class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un paiement."""
    
    class Meta:
        model = Payment
        fields = ['invoice', 'amount', 'payment_date', 'payment_method', 'reference', 'notes']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        return value
    
    def validate(self, attrs):
        """Valide que le paiement ne dépasse pas le solde dû."""
        invoice = attrs['invoice']
        amount = attrs['amount']
        
        # Calculer le total des paiements existants
        total_paid = invoice.payments.filter(status='completed').aggregate(
            total=models.Sum('amount')
        )['total'] or 0
        
        balance_due = invoice.amount - total_paid
        
        if amount > balance_due:
            raise serializers.ValidationError({
                'amount': f"Le montant ne peut pas dépasser le solde dû ({balance_due})."
            })
        
        return attrs
