"""
Throttling personnalisé pour l'API VIDA
Protection contre le scraping, spam et abus
"""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class BurstAnonRateThrottle(AnonRateThrottle):
    """
    Throttle pour les pics de requêtes anonymes
    Limite stricte sur une courte période
    """
    scope = 'burst_anon'


class SustainedAnonRateThrottle(AnonRateThrottle):
    """
    Throttle pour les requêtes anonymes soutenues
    Limite plus large sur une longue période
    """
    scope = 'sustained_anon'


class BurstUserRateThrottle(UserRateThrottle):
    """
    Throttle pour les pics de requêtes utilisateurs authentifiés
    """
    scope = 'burst_user'


class SustainedUserRateThrottle(UserRateThrottle):
    """
    Throttle pour les requêtes utilisateurs authentifiés soutenues
    """
    scope = 'sustained_user'


class ContactRateThrottle(AnonRateThrottle):
    """
    Throttle spécifique pour le formulaire de contact
    Limite stricte pour éviter le spam
    """
    scope = 'contact'


class AppointmentRateThrottle(AnonRateThrottle):
    """
    Throttle spécifique pour la création de rendez-vous
    Limite pour éviter les réservations abusives
    """
    scope = 'appointment'


class SlotsRateThrottle(AnonRateThrottle):
    """
    Throttle pour la consultation des créneaux disponibles
    Évite le scraping massif des disponibilités
    """
    scope = 'slots'
