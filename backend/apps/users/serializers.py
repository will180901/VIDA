from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .validators import calculate_password_strength
from .captcha import HCaptchaMixin
from .sanitizers import sanitize_text_input
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
