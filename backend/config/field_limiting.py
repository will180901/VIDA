"""
Limitation des champs dans les requêtes (FIX #30)
Protection contre DoS par requêtes complexes
"""
from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class FieldLimitingMixin:
    """
    Mixin pour limiter le nombre de champs dans les serializers
    
    Usage:
        class MySerializer(FieldLimitingMixin, serializers.ModelSerializer):
            max_fields = 50  # Limite personnalisée
            max_depth = 3    # Profondeur maximale
    """
    
    max_fields = None  # À définir dans la classe fille
    max_depth = None   # À définir dans la classe fille
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Récupérer les limites depuis settings si non définies
        if self.max_fields is None:
            self.max_fields = getattr(settings, 'MAX_FIELDS_PER_REQUEST', 100)
        
        if self.max_depth is None:
            self.max_depth = getattr(settings, 'MAX_SERIALIZER_DEPTH', 5)
        
        # Valider le nombre de champs
        self._validate_field_count()
        
        # Valider la profondeur
        self._validate_depth()
    
    def _validate_field_count(self):
        """Valide que le nombre de champs ne dépasse pas la limite"""
        field_count = len(self.fields)
        
        if field_count > self.max_fields:
            logger.warning(
                f"Serializer {self.__class__.__name__} has too many fields: {field_count} > {self.max_fields}"
            )
            raise ValidationError({
                'detail': f'Trop de champs dans la requête (max: {self.max_fields}, actuel: {field_count})'
            })
    
    def _validate_depth(self):
        """Valide que la profondeur ne dépasse pas la limite"""
        depth = self._calculate_depth()
        
        if depth > self.max_depth:
            logger.warning(
                f"Serializer {self.__class__.__name__} has too much depth: {depth} > {self.max_depth}"
            )
            raise ValidationError({
                'detail': f'Profondeur trop importante (max: {self.max_depth}, actuel: {depth})'
            })
    
    def _calculate_depth(self, current_depth=0):
        """Calcule la profondeur maximale du serializer"""
        max_child_depth = current_depth
        
        for field in self.fields.values():
            if isinstance(field, serializers.Serializer):
                # Serializer imbriqué
                child_depth = current_depth + 1
                
                # Récursion pour calculer la profondeur des enfants
                if hasattr(field, '_calculate_depth'):
                    child_depth = field._calculate_depth(child_depth)
                
                max_child_depth = max(max_child_depth, child_depth)
            
            elif isinstance(field, serializers.ListSerializer):
                # Liste de serializers
                if hasattr(field.child, '_calculate_depth'):
                    child_depth = field.child._calculate_depth(current_depth + 1)
                    max_child_depth = max(max_child_depth, child_depth)
        
        return max_child_depth


def validate_request_complexity(data, max_keys=100, max_depth=5, current_depth=0):
    """
    Valide la complexité d'une requête JSON
    
    Args:
        data: Données à valider (dict ou list)
        max_keys: Nombre maximum de clés
        max_depth: Profondeur maximale
        current_depth: Profondeur actuelle (pour récursion)
    
    Raises:
        ValidationError: Si la complexité dépasse les limites
    """
    # Vérifier la profondeur
    if current_depth > max_depth:
        raise ValidationError({
            'detail': f'Profondeur de requête trop importante (max: {max_depth})'
        })
    
    # Compter les clés
    key_count = 0
    
    if isinstance(data, dict):
        key_count = len(data)
        
        # Vérifier récursivement les valeurs
        for value in data.values():
            if isinstance(value, (dict, list)):
                validate_request_complexity(value, max_keys, max_depth, current_depth + 1)
    
    elif isinstance(data, list):
        key_count = len(data)
        
        # Vérifier récursivement les éléments
        for item in data:
            if isinstance(item, (dict, list)):
                validate_request_complexity(item, max_keys, max_depth, current_depth + 1)
    
    # Vérifier le nombre de clés
    if key_count > max_keys:
        raise ValidationError({
            'detail': f'Trop de clés dans la requête (max: {max_keys}, actuel: {key_count})'
        })


class RequestComplexityMiddleware:
    """
    Middleware pour valider la complexité des requêtes
    
    Vérifie que les requêtes POST/PUT/PATCH ne sont pas trop complexes
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.max_keys = getattr(settings, 'MAX_REQUEST_KEYS', 100)
        self.max_depth = getattr(settings, 'MAX_REQUEST_DEPTH', 5)
    
    def __call__(self, request):
        # Valider uniquement les requêtes avec body
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                # Récupérer les données
                if hasattr(request, 'data'):
                    data = request.data
                elif request.content_type == 'application/json':
                    import json
                    data = json.loads(request.body)
                else:
                    data = None
                
                # Valider la complexité
                if data:
                    validate_request_complexity(data, self.max_keys, self.max_depth)
            
            except ValidationError:
                # Laisser passer, sera géré par le serializer
                pass
            except Exception as e:
                logger.warning(f"Error validating request complexity: {e}")
        
        response = self.get_response(request)
        return response


class SparseFieldsetMixin:
    """
    Mixin pour supporter les sparse fieldsets (sélection de champs)
    
    Permet au client de spécifier quels champs il veut recevoir
    via le paramètre ?fields=field1,field2,field3
    
    Usage:
        class MySerializer(SparseFieldsetMixin, serializers.ModelSerializer):
            pass
        
        # Requête : GET /api/users/?fields=id,email,first_name
        # Réponse : Seulement les champs id, email, first_name
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Récupérer les champs demandés depuis la requête
        request = self.context.get('request')
        if request:
            # Gérer à la fois query_params (DRF) et GET (Django)
            if hasattr(request, 'query_params'):
                fields_param = request.query_params.get('fields')
            else:
                fields_param = request.GET.get('fields')
            
            if fields_param:
                # Parser les champs demandés
                requested_fields = set(fields_param.split(','))
                
                # Limiter le nombre de champs demandés
                max_fields = getattr(settings, 'MAX_SPARSE_FIELDS', 50)
                if len(requested_fields) > max_fields:
                    raise ValidationError({
                        'detail': f'Trop de champs demandés (max: {max_fields})'
                    })
                
                # Garder uniquement les champs demandés
                existing_fields = set(self.fields.keys())
                for field_name in existing_fields - requested_fields:
                    self.fields.pop(field_name)


class NestedDepthValidator:
    """
    Validateur pour limiter la profondeur des objets imbriqués
    
    Usage:
        class MySerializer(serializers.ModelSerializer):
            nested_data = serializers.JSONField(
                validators=[NestedDepthValidator(max_depth=3)]
            )
    """
    
    def __init__(self, max_depth=5):
        self.max_depth = max_depth
    
    def __call__(self, value):
        """Valide la profondeur de l'objet"""
        depth = self._calculate_depth(value)
        
        if depth > self.max_depth:
            raise ValidationError(
                f'Profondeur trop importante (max: {self.max_depth}, actuel: {depth})'
            )
    
    def _calculate_depth(self, obj, current_depth=0):
        """Calcule la profondeur d'un objet"""
        if not isinstance(obj, (dict, list)):
            return current_depth
        
        max_child_depth = current_depth
        
        if isinstance(obj, dict):
            for value in obj.values():
                child_depth = self._calculate_depth(value, current_depth + 1)
                max_child_depth = max(max_child_depth, child_depth)
        
        elif isinstance(obj, list):
            for item in obj:
                child_depth = self._calculate_depth(item, current_depth + 1)
                max_child_depth = max(max_child_depth, child_depth)
        
        return max_child_depth


class ArraySizeValidator:
    """
    Validateur pour limiter la taille des tableaux
    
    Usage:
        class MySerializer(serializers.ModelSerializer):
            items = serializers.ListField(
                validators=[ArraySizeValidator(max_size=100)]
            )
    """
    
    def __init__(self, max_size=100):
        self.max_size = max_size
    
    def __call__(self, value):
        """Valide la taille du tableau"""
        if not isinstance(value, list):
            return
        
        size = len(value)
        
        if size > self.max_size:
            raise ValidationError(
                f'Tableau trop volumineux (max: {self.max_size}, actuel: {size})'
            )
        
        # Valider récursivement les tableaux imbriqués
        for item in value:
            if isinstance(item, list):
                self.__call__(item)


def count_total_fields(data):
    """
    Compte le nombre total de champs dans une structure de données
    
    Args:
        data: dict, list ou autre
    
    Returns:
        int: Nombre total de champs
    """
    count = 0
    
    if isinstance(data, dict):
        count += len(data)
        for value in data.values():
            count += count_total_fields(value)
    
    elif isinstance(data, list):
        count += len(data)
        for item in data:
            count += count_total_fields(item)
    
    return count


def log_complex_request(request, field_count, depth):
    """
    Log une requête complexe pour analyse
    
    Args:
        request: Django request
        field_count: Nombre de champs
        depth: Profondeur
    """
    logger.info(
        f"Complex request detected",
        extra={
            'path': request.path,
            'method': request.method,
            'field_count': field_count,
            'depth': depth,
            'user': str(request.user) if request.user.is_authenticated else 'Anonymous',
            'ip': request.META.get('REMOTE_ADDR'),
        }
    )


class BulkOperationValidator:
    """
    Validateur pour limiter les opérations en masse
    
    Usage:
        class MyViewSet(viewsets.ModelViewSet):
            def create(self, request):
                # Valider les opérations en masse
                validator = BulkOperationValidator(max_items=50)
                validator.validate(request.data)
    """
    
    def __init__(self, max_items=50):
        self.max_items = max_items
    
    def validate(self, data):
        """Valide le nombre d'items dans une opération en masse"""
        if isinstance(data, list):
            if len(data) > self.max_items:
                raise ValidationError({
                    'detail': f'Trop d\'items dans l\'opération en masse (max: {self.max_items}, actuel: {len(data)})'
                })
        
        return data
