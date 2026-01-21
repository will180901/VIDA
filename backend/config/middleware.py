"""
Middleware de sécurité personnalisé
Ajoute des headers de sécurité avancés (CSP, Permissions-Policy, etc.)
"""


class SecurityHeadersMiddleware:
    """
    Ajoute des headers de sécurité HTTP avancés
    
    Headers ajoutés :
    - Content-Security-Policy (CSP) : Prévient XSS, injection de code
    - Permissions-Policy : Contrôle les APIs du navigateur
    - Referrer-Policy : Contrôle les informations de référence
    - X-Content-Type-Options : Prévient le MIME sniffing
    - X-Frame-Options : Prévient le clickjacking
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Content Security Policy (CSP)
        # Politique stricte : seulement les ressources du même domaine
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hcaptcha.com https://hcaptcha.com",  # hCaptcha nécessite unsafe-inline
            "style-src 'self' 'unsafe-inline' https://hcaptcha.com",  # Styles inline pour Tailwind + hCaptcha
            "img-src 'self' data: https: blob:",  # Images du domaine + data URLs + HTTPS
            "font-src 'self' data:",
            "connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com",  # API calls + hCaptcha
            "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com",  # iframes hCaptcha
            "object-src 'none'",  # Pas de plugins (Flash, etc.)
            "base-uri 'self'",  # Prévient l'injection de balise <base>
            "form-action 'self'",  # Formulaires seulement vers le même domaine
            "frame-ancestors 'none'",  # Pas d'iframe de ce site (clickjacking)
            "upgrade-insecure-requests",  # Force HTTPS
        ]
        response['Content-Security-Policy'] = "; ".join(csp_directives)
        
        # Permissions Policy (anciennement Feature-Policy)
        # Désactive les APIs du navigateur non nécessaires
        permissions_directives = [
            "geolocation=()",  # Pas de géolocalisation
            "microphone=()",  # Pas de micro
            "camera=()",  # Pas de caméra
            "payment=()",  # Pas de Payment API
            "usb=()",  # Pas d'USB
            "magnetometer=()",  # Pas de magnétomètre
            "gyroscope=()",  # Pas de gyroscope
            "accelerometer=()",  # Pas d'accéléromètre
        ]
        response['Permissions-Policy'] = ", ".join(permissions_directives)
        
        # Referrer Policy
        # Ne pas envoyer le referrer vers des sites externes
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # X-Content-Type-Options
        # Prévient le MIME type sniffing
        response['X-Content-Type-Options'] = 'nosniff'
        
        # X-Frame-Options (redondant avec CSP frame-ancestors mais pour compatibilité)
        response['X-Frame-Options'] = 'DENY'
        
        # X-XSS-Protection (legacy, mais pour compatibilité navigateurs anciens)
        response['X-XSS-Protection'] = '1; mode=block'
        
        return response
