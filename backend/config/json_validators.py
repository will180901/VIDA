"""
Validateurs JSON stricts pour sécuriser les entrées
"""
import json
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer
from django.conf import settings


class StrictJSONParser(JSONParser):
    """
    Parser JSON strict qui rejette les JSON malformés
    """
    
    def parse(self, stream, media_type=None, parser_context=None):
        """
        Parse le JSON avec validation stricte
        """
        parser_context = parser_context or {}
        encoding = parser_context.get('encoding', settings.DEFAULT_CHARSET)
        
        try:
            decoded_stream = stream.read().decode(encoding)
            
            # Vérifier que ce n'est pas vide
            if not decoded_stream.strip():
                raise ValidationError({'detail': 'Le corps de la requête ne peut pas être vide'})
            
            # Parser avec strict=True pour rejeter les duplicates de clés
            data = json.loads(decoded_stream, strict=True)
            
            # Vérifier la profondeur maximale
            self._check_depth(data, max_depth=10)
            
            # Vérifier la taille maximale
            self._check_size(data, max_size=1000)
            
            return data
            
        except json.JSONDecodeError as e:
            raise ValidationError({
                'detail': 'JSON invalide',
                'error': str(e),
                'line': e.lineno,
                'column': e.colno
            })
        except UnicodeDecodeError as e:
            raise ValidationError({
                'detail': 'Encodage invalide',
                'error': str(e)
            })
    
    def _check_depth(self, obj, current_depth=0, max_depth=10):
        """
        Vérifier la profondeur maximale du JSON (protection contre DoS)
        """
        if current_depth > max_depth:
            raise ValidationError({
                'detail': f'JSON trop profond (max: {max_depth} niveaux)'
            })
        
        if isinstance(obj, dict):
            for value in obj.values():
                self._check_depth(value, current_depth + 1, max_depth)
        elif isinstance(obj, list):
            for item in obj:
                self._check_depth(item, current_depth + 1, max_depth)
    
    def _check_size(self, obj, current_count=0, max_size=1000):
        """
        Vérifier le nombre maximal d'éléments (protection contre DoS)
        """
        if isinstance(obj, dict):
            current_count += len(obj)
            if current_count > max_size:
                raise ValidationError({
                    'detail': f'JSON trop volumineux (max: {max_size} éléments)'
                })
            for value in obj.values():
                current_count = self._check_size(value, current_count, max_size)
        elif isinstance(obj, list):
            current_count += len(obj)
            if current_count > max_size:
                raise ValidationError({
                    'detail': f'JSON trop volumineux (max: {max_size} éléments)'
                })
            for item in obj:
                current_count = self._check_size(item, current_count, max_size)
        
        return current_count


class SafeJSONRenderer(JSONRenderer):
    """
    Renderer JSON sécurisé qui échappe les caractères dangereux
    """
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        """
        Render avec échappement des caractères dangereux
        """
        # Utiliser ensure_ascii=True pour échapper les caractères non-ASCII
        # Cela prévient les attaques XSS via JSON
        if data is None:
            return b''
        
        # Gérer le cas où renderer_context est None
        indent = None
        if renderer_context is not None:
            indent = self.get_indent(accepted_media_type, renderer_context)
        
        ret = json.dumps(
            data,
            cls=self.encoder_class,
            indent=indent,
            ensure_ascii=True,  # Échapper les caractères non-ASCII
            allow_nan=False,  # Rejeter NaN, Infinity
            separators=(',', ':')  # Compact
        )
        
        return ret.encode('utf-8')


def validate_json_field(value, field_name='field', max_depth=5, max_size=100):
    """
    Valider un champ JSON (pour JSONField dans les modèles)
    
    Usage:
        from config.json_validators import validate_json_field
        
        class MyModel(models.Model):
            data = models.JSONField(
                validators=[lambda v: validate_json_field(v, 'data')]
            )
    """
    if value is None:
        return
    
    # Vérifier le type
    if not isinstance(value, (dict, list)):
        raise ValidationError(f'{field_name} doit être un objet JSON ou un tableau')
    
    # Vérifier la profondeur
    def check_depth(obj, current_depth=0):
        if current_depth > max_depth:
            raise ValidationError(
                f'{field_name} est trop profond (max: {max_depth} niveaux)'
            )
        
        if isinstance(obj, dict):
            for v in obj.values():
                check_depth(v, current_depth + 1)
        elif isinstance(obj, list):
            for item in obj:
                check_depth(item, current_depth + 1)
    
    check_depth(value)
    
    # Vérifier la taille
    def count_elements(obj):
        count = 0
        if isinstance(obj, dict):
            count += len(obj)
            for v in obj.values():
                count += count_elements(v)
        elif isinstance(obj, list):
            count += len(obj)
            for item in obj:
                count += count_elements(item)
        return count
    
    total = count_elements(value)
    if total > max_size:
        raise ValidationError(
            f'{field_name} contient trop d\'éléments (max: {max_size}, actuel: {total})'
        )


def sanitize_json_keys(data):
    """
    Nettoyer les clés JSON pour éviter les injections
    
    - Supprime les clés commençant par __
    - Supprime les clés contenant des caractères dangereux
    - Limite la longueur des clés
    """
    if isinstance(data, dict):
        cleaned = {}
        for key, value in data.items():
            # Vérifier la clé
            if not isinstance(key, str):
                continue
            
            # Rejeter les clés dangereuses
            if key.startswith('__') or key.startswith('_'):
                continue
            
            # Limiter la longueur
            if len(key) > 100:
                continue
            
            # Rejeter les caractères dangereux
            if any(char in key for char in ['<', '>', '"', "'", '\\', '\x00']):
                continue
            
            # Nettoyer récursivement
            cleaned[key] = sanitize_json_keys(value)
        
        return cleaned
    
    elif isinstance(data, list):
        return [sanitize_json_keys(item) for item in data]
    
    else:
        return data


def validate_json_schema(data, schema):
    """
    Valider un JSON contre un schéma simple
    
    Usage:
        schema = {
            'name': str,
            'age': int,
            'email': str,
            'tags': list
        }
        validate_json_schema(data, schema)
    """
    if not isinstance(data, dict):
        raise ValidationError('Les données doivent être un objet JSON')
    
    errors = {}
    
    for field, expected_type in schema.items():
        if field not in data:
            errors[field] = 'Ce champ est requis'
            continue
        
        value = data[field]
        
        if expected_type == str and not isinstance(value, str):
            errors[field] = 'Doit être une chaîne de caractères'
        elif expected_type == int and not isinstance(value, int):
            errors[field] = 'Doit être un nombre entier'
        elif expected_type == float and not isinstance(value, (int, float)):
            errors[field] = 'Doit être un nombre'
        elif expected_type == bool and not isinstance(value, bool):
            errors[field] = 'Doit être un booléen'
        elif expected_type == list and not isinstance(value, list):
            errors[field] = 'Doit être un tableau'
        elif expected_type == dict and not isinstance(value, dict):
            errors[field] = 'Doit être un objet'
    
    if errors:
        raise ValidationError(errors)


class JSONValidationMixin:
    """
    Mixin pour ajouter la validation JSON stricte aux serializers
    
    Usage:
        class MySerializer(JSONValidationMixin, serializers.ModelSerializer):
            json_fields = ['data', 'metadata']  # Champs à valider
            json_max_depth = 5
            json_max_size = 100
    """
    
    json_fields = []
    json_max_depth = 5
    json_max_size = 100
    
    def validate(self, attrs):
        attrs = super().validate(attrs)
        
        # Valider les champs JSON
        for field_name in self.json_fields:
            if field_name in attrs:
                validate_json_field(
                    attrs[field_name],
                    field_name=field_name,
                    max_depth=self.json_max_depth,
                    max_size=self.json_max_size
                )
                
                # Nettoyer les clés
                attrs[field_name] = sanitize_json_keys(attrs[field_name])
        
        return attrs
