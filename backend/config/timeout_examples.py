"""
Exemples d'utilisation des timeouts dans les vues et tâches
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from config.timeouts import (
    timeout_decorator,
    make_request,
    DatabaseTimeoutMixin,
    with_db_timeout,
    get_timeout,
)


# =============================================================================
# Exemple 1 : Vue avec timeout DB via Mixin
# =============================================================================
class ReportView(DatabaseTimeoutMixin, APIView):
    """
    Vue pour générer des rapports (peut prendre du temps)
    """
    db_timeout = 60  # 60 secondes pour les requêtes DB
    
    def get(self, request):
        # Les requêtes DB dans cette vue auront un timeout de 60s
        from apps.appointments.models import Appointment
        
        appointments = Appointment.objects.all()
        # ... génération du rapport
        
        return Response({'status': 'ok'})


# =============================================================================
# Exemple 2 : Vue avec timeout DB via décorateur
# =============================================================================
from rest_framework.decorators import api_view

@api_view(['GET'])
@with_db_timeout(30)
def simple_report_view(request):
    """
    Vue simple avec timeout DB de 30s
    """
    from apps.appointments.models import Appointment
    
    appointments = Appointment.objects.all()
    # ... traitement
    
    return Response({'status': 'ok'})


# =============================================================================
# Exemple 3 : Fonction avec timeout via décorateur
# =============================================================================
@timeout_decorator(10)
def slow_computation():
    """
    Fonction qui peut prendre du temps
    Timeout de 10 secondes
    """
    import time
    time.sleep(5)  # Simulation
    return "Done"


# =============================================================================
# Exemple 4 : Requête HTTP externe avec timeout
# =============================================================================
def fetch_external_data():
    """
    Récupérer des données d'une API externe avec timeout
    """
    try:
        # Timeout automatique : connect=5s, read=30s
        response = make_request('GET', 'https://api.example.com/data')
        return response.json()
    except Exception as e:
        print(f"Erreur lors de la requête : {e}")
        return None


# =============================================================================
# Exemple 5 : Requête HTTP avec timeout personnalisé
# =============================================================================
def fetch_with_custom_timeout():
    """
    Requête avec timeout personnalisé
    """
    import requests
    
    try:
        # Timeout personnalisé : connect=3s, read=10s
        response = requests.get(
            'https://api.example.com/data',
            timeout=(3, 10)
        )
        return response.json()
    except requests.Timeout:
        print("Timeout dépassé")
        return None


# =============================================================================
# Exemple 6 : Tâche Celery avec timeout
# =============================================================================
from celery import shared_task

@shared_task(
    soft_time_limit=get_timeout('celery', 'soft'),  # 300s
    time_limit=get_timeout('celery', 'hard'),       # 600s
)
def long_running_task():
    """
    Tâche Celery avec timeouts configurés
    """
    import time
    time.sleep(60)  # Simulation
    return "Task completed"


# =============================================================================
# Exemple 7 : Upload de fichier avec timeout étendu
# =============================================================================
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import parser_classes

class FileUploadView(APIView):
    """
    Vue pour upload de fichiers avec timeout étendu
    """
    parser_classes = [MultiPartParser]
    
    def post(self, request):
        # Le timeout pour cette vue devrait être plus long
        # Configurer dans gunicorn : --timeout 120
        
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {'error': 'Aucun fichier fourni'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Traiter le fichier
        # ...
        
        return Response({'status': 'uploaded'})


# =============================================================================
# Exemple 8 : Gestion des timeouts dans les tests
# =============================================================================
def test_timeout_handling():
    """
    Tester la gestion des timeouts
    """
    import pytest
    from config.timeouts import RequestTimeoutError
    
    # Test qu'une fonction lève bien un timeout
    with pytest.raises(TimeoutError):
        @timeout_decorator(1)
        def slow_function():
            import time
            time.sleep(5)
        
        slow_function()


# =============================================================================
# Exemple 9 : Récupération gracieuse après timeout
# =============================================================================
class RobustView(APIView):
    """
    Vue qui gère gracieusement les timeouts
    """
    
    def get(self, request):
        try:
            # Opération qui peut timeout
            result = self.fetch_data_with_timeout()
            return Response({'data': result})
        
        except TimeoutError:
            # Fallback : retourner des données en cache
            cached_data = self.get_cached_data()
            return Response({
                'data': cached_data,
                'warning': 'Données en cache (timeout dépassé)'
            })
    
    @timeout_decorator(10)
    def fetch_data_with_timeout(self):
        # Opération longue
        import time
        time.sleep(5)
        return {'value': 123}
    
    def get_cached_data(self):
        # Retourner des données en cache
        return {'value': 0}


# =============================================================================
# Exemple 10 : Configuration dynamique des timeouts
# =============================================================================
class DynamicTimeoutView(APIView):
    """
    Vue avec timeout dynamique selon le type de requête
    """
    
    def get_db_timeout(self, request):
        """Déterminer le timeout selon les paramètres"""
        if request.query_params.get('detailed') == 'true':
            return get_timeout('database', 'long_query')  # 60s
        return get_timeout('database', 'default')  # 30s
    
    def get(self, request):
        timeout = self.get_db_timeout(request)
        
        # Appliquer le timeout
        from django.db import connection
        if connection.vendor == 'postgresql':
            with connection.cursor() as cursor:
                cursor.execute(f"SET statement_timeout = {timeout * 1000}")
        
        # Exécuter la requête
        # ...
        
        return Response({'status': 'ok'})
