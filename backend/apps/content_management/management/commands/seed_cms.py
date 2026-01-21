from django.core.management.base import BaseCommand
from apps.content_management.models import ClinicSetting, HeroSlide, MedicalService, SocialLink, FAQ

class Command(BaseCommand):
    help = 'Seed initial CMS data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding CMS data...')

        # 1. Clinic Setting
        setting, created = ClinicSetting.objects.get_or_create(id=1)
        setting.name = "Centre Médical VIDA"
        setting.address = "08 Bis rue Mboko, Moungali, Brazzaville, Congo"
        setting.phone_primary = "06 569 12 35"
        setting.phone_secondary = "05 745 36 88"
        setting.whatsapp = "242066934735"
        setting.email = "centremedvida@gmail.com"
        setting.fee_general = 15000
        setting.fee_specialized = 25000
        setting.opening_hours = {
            "lun-ven": "08h30 - 17h00",
            "pause": "12h30 - 14h00",
            "sam": "08h00 - 12h30",
            "dim": "Fermé"
        }
        setting.about_text = "Centre ophtalmologique situé à Brazzaville, nous mettons notre expertise au service de votre santé visuelle. Notre équipe vous accueille dans un environnement professionnel et vous accompagne avec attention, de la consultation au suivi de vos soins."
        setting.rccm = "B13-0506"
        setting.niu = "M2300009961883"
        setting.save()

        # 2. Hero Slides
        HeroSlide.objects.all().delete()
        slides = [
            {
                "title": "Votre Vue Mérite une Attention Sérieuse",
                "subtitle": "Centre ophtalmologique moderne à Brazzaville. Équipement professionnel, soins de qualité.",
                "image": "hero/hero-1-vision.jpg",
                "order": 1
            },
            {
                "title": "Examens Complets et Diagnostics Précis",
                "subtitle": "Dépistage des maladies oculaires. Équipements adaptés pour des résultats fiables.",
                "image": "hero/hero-2-technology.png",
                "order": 2
            },
            {
                "title": "Une Équipe à Votre Écoute",
                "subtitle": "Ophtalmologues qualifiés et personnel attentionné. Nous prenons le temps de vous expliquer.",
                "image": "hero/hero-3-team.png",
                "order": 3
            },
            {
                "title": "Prenez Rendez-vous Facilement",
                "subtitle": "En ligne, par téléphone ou WhatsApp. Nous sommes là pour vous accompagner.",
                "image": "hero/hero-4-appointment.png",
                "order": 4
            }
        ]
        for s in slides:
            HeroSlide.objects.create(**s)

        # 3. Medical Services
        MedicalService.objects.all().delete()
        services = [
            {
                "title": "Consultations",
                "description": "Examens de vue complets, dépistage glaucome et cataracte",
                "details": "Nos ophtalmologues réalisent des examens complets de la vue incluant le dépistage du glaucome, de la cataracte et d'autres pathologies oculaires. Consultation sur rendez-vous du lundi au samedi.",
                "image": "services/consultation.png",
                "order": 1
            },
            {
                "title": "Dépistage",
                "description": "Détection précoce des maladies oculaires (diabète, DMLA)",
                "details": "Dépistage précoce des maladies oculaires liées au diabète, à l'hypertension et à l'âge (DMLA). Un diagnostic précoce permet une meilleure prise en charge.",
                "image": "services/depistage.png",
                "order": 2
            },
            {
                "title": "Lunetterie",
                "description": "Large choix de montures et verres correcteurs adaptés",
                "details": "Notre lunetterie propose un large choix de montures de qualité et de verres correcteurs adaptés à vos besoins. Conseils personnalisés pour trouver la monture qui vous convient.",
                "image": "services/lunetterie.png",
                "order": 3
            },
            {
                "title": "Chirurgie",
                "description": "Chirurgie réfractive au laser (myopie, astigmatisme)",
                "details": "Chirurgie réfractive au laser pour corriger la myopie, l'hypermétropie et l'astigmatisme. Intervention rapide et indolore avec suivi post-opératoire complet.",
                "image": "services/chirurgie.png",
                "order": 4
            }
        ]
        for s in services:
            MedicalService.objects.create(**s)

        # 4. Social Links
        SocialLink.objects.all().delete()
        links = [
            {"platform": "whatsapp", "url": "https://wa.me/242066934735", "order": 1},
            {"platform": "facebook", "url": "#", "order": 2},
            {"platform": "instagram", "url": "#", "order": 3},
            {"platform": "tiktok", "url": "#", "order": 4},
            {"platform": "linkedin", "url": "#", "order": 5},
            {"platform": "youtube", "url": "#", "order": 6},
        ]
        for l in links:
            SocialLink.objects.create(**l)

        self.stdout.write(self.style.SUCCESS('Successfully seeded CMS data from CONTENT-V1.0.md'))
