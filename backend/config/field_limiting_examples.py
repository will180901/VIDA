"""
Exemples d'utilisation de la limitation des champs
"""
from rest_framework import serializers, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from config.field_limiting import (
    FieldLimitingMixin,
    SparseFieldsetMixin,
    NestedDepthValidator,
    ArraySizeValidator,
    BulkOperationValidator,
    validate_request_complexity,
)


# =============================================================================
# Exemple 1 : Serializer avec limitation de champs
# =============================================================================
class UserSerializer(FieldLimitingMixin, serializers.Serializer):
    """
    Serializer avec limitation automatique du nombre de champs
    """
    max_fields = 50  # Max 50 champs
    max_depth = 3    # Max 3 niveaux de profondeur
    
    id = serializers.IntegerField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    # ... autres champs


# =============================================================================
# Exemple 2 : Serializer avec sparse fieldsets
# =============================================================================
class ProductSerializer(SparseFieldsetMixin, serializers.Serializer):
    """
    Serializer qui supporte la sélection de champs
    
    Usage:
        GET /api/products/?fields=id,name,price
        Retourne seulement id, name, price
    """
    id = serializers.IntegerField()
    name = serializers.CharField()
    description = serializers.CharField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    stock = serializers.IntegerField()
    category = serializers.CharField()


# =============================================================================
# Exemple 3 : Validation de profondeur pour JSONField
# =============================================================================
class ConfigSerializer(serializers.Serializer):
    """
    Serializer avec validation de profondeur pour données JSON
    """
    settings = serializers.JSONField(
        validators=[NestedDepthValidator(max_depth=3)]
    )
    
    def validate_settings(self, value):
        """Validation supplémentaire"""
        # La profondeur est déjà validée par NestedDepthValidator
        return value


# =============================================================================
# Exemple 4 : Validation de taille de tableau
# =============================================================================
class BatchSerializer(serializers.Serializer):
    """
    Serializer pour opérations en masse avec limite de taille
    """
    items = serializers.ListField(
        child=serializers.IntegerField(),
        validators=[ArraySizeValidator(max_size=100)]
    )


# =============================================================================
# Exemple 5 : ViewSet avec validation de complexité
# =============================================================================
class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet avec validation de complexité des requêtes
    """
    
    def create(self, request):
        """Créer une commande avec validation de complexité"""
        # Valider la complexité de la requête
        try:
            validate_request_complexity(
                request.data,
                max_keys=50,
                max_depth=3
            )
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
        # Traiter la requête
        return super().create(request)


# =============================================================================
# Exemple 6 : Opérations en masse avec validation
# =============================================================================
class BulkCreateView(viewsets.ViewSet):
    """
    Vue pour créer plusieurs objets en une seule requête
    """
    
    def create(self, request):
        """Créer plusieurs objets avec validation"""
        # Valider le nombre d'items
        validator = BulkOperationValidator(max_items=50)
        
        try:
            validator.validate(request.data)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
        # Créer les objets
        # ...
        
        return Response({'created': len(request.data)})


# =============================================================================
# Exemple 7 : Serializer combinant plusieurs protections
# =============================================================================
class SecureSerializer(FieldLimitingMixin, SparseFieldsetMixin, serializers.Serializer):
    """
    Serializer avec toutes les protections
    """
    max_fields = 30
    max_depth = 2
    
    id = serializers.IntegerField()
    name = serializers.CharField()
    data = serializers.JSONField(
        validators=[NestedDepthValidator(max_depth=2)]
    )
    tags = serializers.ListField(
        child=serializers.CharField(),
        validators=[ArraySizeValidator(max_size=20)]
    )


# =============================================================================
# Exemple 8 : Vue avec validation manuelle
# =============================================================================
@api_view(['POST'])
def complex_operation(request):
    """
    Vue avec validation manuelle de la complexité
    """
    # Compter les champs
    from config.field_limiting import count_total_fields
    
    field_count = count_total_fields(request.data)
    
    if field_count > 100:
        return Response({
            'error': f'Trop de champs ({field_count} > 100)'
        }, status=400)
    
    # Traiter la requête
    return Response({'status': 'ok'})


# =============================================================================
# Exemple 9 : Serializer avec validation conditionnelle
# =============================================================================
class ConditionalSerializer(serializers.Serializer):
    """
    Serializer avec validation conditionnelle selon le contexte
    """
    data = serializers.JSONField()
    
    def validate_data(self, value):
        """Validation conditionnelle"""
        # Limites différentes selon l'utilisateur
        request = self.context.get('request')
        
        if request and request.user.is_authenticated:
            if request.user.is_staff:
                max_depth = 10  # Staff : limite haute
            else:
                max_depth = 5   # Utilisateurs : limite normale
        else:
            max_depth = 3  # Anonymes : limite basse
        
        # Valider avec la limite appropriée
        validator = NestedDepthValidator(max_depth=max_depth)
        validator(value)
        
        return value


# =============================================================================
# Exemple 10 : Middleware personnalisé pour logging
# =============================================================================
class ComplexityLoggingMiddleware:
    """
    Middleware qui log les requêtes complexes
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Analyser la complexité avant traitement
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                if hasattr(request, 'data'):
                    from config.field_limiting import count_total_fields
                    
                    field_count = count_total_fields(request.data)
                    
                    # Logger si complexe
                    if field_count > 50:
                        from config.field_limiting import log_complex_request
                        log_complex_request(request, field_count, 0)
            except:
                pass
        
        response = self.get_response(request)
        return response


# =============================================================================
# Exemple 11 : Serializer avec limites dynamiques
# =============================================================================
class DynamicLimitSerializer(FieldLimitingMixin, serializers.Serializer):
    """
    Serializer avec limites qui s'adaptent au contexte
    """
    
    def __init__(self, *args, **kwargs):
        # Ajuster les limites selon le contexte
        request = kwargs.get('context', {}).get('request')
        
        if request and request.user.is_authenticated:
            if request.user.is_staff:
                self.max_fields = 200  # Staff : limite haute
                self.max_depth = 10
            else:
                self.max_fields = 100  # Utilisateurs : limite normale
                self.max_depth = 5
        else:
            self.max_fields = 50  # Anonymes : limite basse
            self.max_depth = 3
        
        super().__init__(*args, **kwargs)
    
    # Champs du serializer
    id = serializers.IntegerField()
    data = serializers.JSONField()


# =============================================================================
# Exemple 12 : Vue avec protection complète
# =============================================================================
class ProtectedViewSet(viewsets.ModelViewSet):
    """
    ViewSet avec toutes les protections de limitation
    """
    
    def get_serializer_class(self):
        """Retourne le serializer avec les bonnes limites"""
        return SecureSerializer
    
    def create(self, request):
        """Créer avec validation de complexité"""
        # 1. Valider la complexité globale
        try:
            validate_request_complexity(request.data, max_keys=50, max_depth=3)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
        # 2. Valider les opérations en masse
        if isinstance(request.data, list):
            validator = BulkOperationValidator(max_items=50)
            try:
                validator.validate(request.data)
            except Exception as e:
                return Response({'error': str(e)}, status=400)
        
        # 3. Traiter normalement
        return super().create(request)
