# 🎓 Premiers pas avec VIDA

Tutoriel pratique pour découvrir et utiliser le projet VIDA après l'installation.

---

## 📋 Table des matières

1. [Accéder aux interfaces](#-accéder-aux-interfaces)
2. [Créer votre premier utilisateur](#-créer-votre-premier-utilisateur)
3. [Charger les données de démonstration](#-charger-les-données-de-démonstration)
4. [Explorer l'interface publique](#-explorer-linterface-publique)
5. [Tester la prise de rendez-vous](#-tester-la-prise-de-rendez-vous)
6. [Accéder à l'administration](#-accéder-à-ladministration)
7. [Explorer l'API](#-explorer-lapi)
8. [Développer votre première fonctionnalité](#-développer-votre-première-fonctionnalité)

---

## 🌐 Accéder aux interfaces

Après avoir lancé le projet, vous avez accès à plusieurs interfaces :

### Frontend (Site public)
- **URL** : http://localhost:3000
- **Description** : Site vitrine avec prise de rendez-vous
- **Utilisateurs** : Grand public

### Backend API
- **URL** : http://localhost:8000/api/v1/
- **Description** : API REST pour le frontend
- **Format** : JSON

### Admin Django
- **URL** : http://localhost:8000/admin
- **Description** : Interface d'administration
- **Accès** : Superutilisateur uniquement

### Documentation API (Swagger)
- **URL** : http://localhost:8000/api/schema/swagger-ui/
- **Description** : Documentation interactive de l'API
- **Fonctionnalité** : Tester les endpoints directement

### Documentation API (ReDoc)
- **URL** : http://localhost:8000/api/schema/redoc/
- **Description** : Documentation API alternative (plus lisible)

---

## 👤 Créer votre premier utilisateur

### 1. Créer un superutilisateur (Admin)

```bash
cd backend
source venv/bin/activate  # Linux/macOS
# ou venv\Scripts\activate  # Windows

python manage.py createsuperuser
```

**Informations demandées :**
```
Email: admin@vida.cg
Prénom: Admin
Nom: VIDA
Mot de passe: ********
Mot de passe (confirmation): ********
```

**Recommandations :**
- Utilisez un email valide
- Mot de passe : minimum 12 caractères, majuscule, minuscule, chiffre, caractère spécial
- Exemple : `AdminVida2026!Secure`

### 2. Se connecter à l'admin Django

1. Ouvrir http://localhost:8000/admin
2. Entrer l'email et le mot de passe
3. Vous êtes connecté ! 🎉

### 3. Créer un utilisateur patient (via l'interface)

1. Ouvrir http://localhost:3000
2. Cliquer sur "Connexion" (en haut à droite)
3. Cliquer sur "Créer un compte"
4. Remplir le formulaire :
   - Email : `patient@example.com`
   - Prénom : `Jean`
   - Nom : `Dupont`
   - Téléphone : `06 123 45 67`
   - Mot de passe : `Patient2026!Secure`
5. Valider le CAPTCHA
6. Cliquer sur "S'inscrire"

**Note** : En développement, les emails de vérification s'affichent dans la console backend.

---

## 📦 Charger les données de démonstration

### 1. Charger les fixtures

```bash
cd backend
source venv/bin/activate

# Charger les paramètres de la clinique
python manage.py loaddata fixtures/clinic_settings.json

# Charger les slides du hero
python manage.py loaddata fixtures/hero_slides.json

# Charger les services médicaux
python manage.py loaddata fixtures/medical_services.json
```

**Résultat :**
- ✅ Informations de la clinique (adresse, téléphones, horaires)
- ✅ 4 slides pour le carousel de la page d'accueil
- ✅ 4 services médicaux (Consultations, Dépistage, Lunetterie, Chirurgie)

### 2. Vérifier les données chargées

**Via l'admin Django :**
1. Aller sur http://localhost:8000/admin
2. Section "Content Management" :
   - Clinic Settings (1 entrée)
   - Hero Slides (4 entrées)
   - Medical Services (4 entrées)

**Via l'API :**
```bash
# Paramètres clinique
curl http://localhost:8000/api/v1/content/clinic-settings/

# Slides hero
curl http://localhost:8000/api/v1/content/hero-slides/

# Services
curl http://localhost:8000/api/v1/content/services/
```

---

## 🏠 Explorer l'interface publique

### 1. Page d'accueil

Ouvrir http://localhost:3000

**Sections visibles :**
- 🎯 **Hero Slider** : Carousel avec 4 slides
- 🏥 **Services** : 4 services médicaux
- 💡 **Pourquoi VIDA** : 4 raisons de choisir le centre
- 📖 **À propos** : Présentation du centre
- 📞 **Call to Action** : Boutons "Prendre RDV" et "Nous écrire"

### 2. Navigation

**Menu principal :**
- Accueil
- Services
- À propos
- Horaires & Tarifs (dropdown)
- Contact (dropdown)

**Header :**
- Logo VIDA
- Bouton "Prendre RDV"
- Bouton "Connexion"

**Footer :**
- Informations de contact
- Liens rapides
- Réseaux sociaux
- Horaires d'ouverture

### 3. Tester les interactions

**Copier les informations de contact :**
1. Cliquer sur un numéro de téléphone
2. Un toast confirme la copie
3. Le numéro est dans le presse-papier

**Ouvrir WhatsApp :**
1. Cliquer sur l'icône WhatsApp
2. S'ouvre dans un nouvel onglet

---

## 📅 Tester la prise de rendez-vous

### 1. Ouvrir le modal de rendez-vous

**Méthode 1 :** Cliquer sur "Prendre RDV" (header ou CTA)

**Méthode 2 :** Aller sur http://localhost:3000/?modal=appointment

### 2. Remplir le formulaire

**Étape 1 : Informations personnelles**
```
Prénom : Jean
Nom : Dupont
Email : jean.dupont@example.com
Téléphone : 06 123 45 67
```

**Étape 2 : Choix du rendez-vous**
```
Date : [Choisir une date future]
Heure : [Choisir un créneau disponible]
Type de consultation : Consultation générale (15 000 FCFA)
Motif : Contrôle de routine
```

**Étape 3 : Confirmation**
- Vérifier les informations
- Valider le CAPTCHA
- Cliquer sur "Confirmer le rendez-vous"

### 3. Vérifier le rendez-vous créé

**Via l'admin Django :**
1. Aller sur http://localhost:8000/admin
2. Section "Appointments" → "Appointments"
3. Voir le rendez-vous créé (statut : "En attente")

**Via l'API :**
```bash
# Se connecter d'abord (obtenir un token)
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vida.cg","password":"AdminVida2026!Secure","captcha":"test"}'

# Lister les rendez-vous (avec le token)
curl http://localhost:8000/api/v1/appointments/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Gérer le rendez-vous (Admin)

1. Dans l'admin Django, ouvrir le rendez-vous
2. Changer le statut : "En attente" → "Confirmé"
3. Sauvegarder
4. Un email de confirmation est envoyé (visible dans la console)

---

## 🔐 Accéder à l'administration

### 1. Se connecter

1. Aller sur http://localhost:8000/admin
2. Email : `admin@vida.cg`
3. Mot de passe : `AdminVida2026!Secure`

### 2. Explorer les sections

**Users (Utilisateurs) :**
- Users : Liste des utilisateurs
- Email verification tokens : Tokens de vérification
- Password reset tokens : Tokens de reset

**Appointments (Rendez-vous) :**
- Appointments : Liste des rendez-vous
- Appointment slot locks : Verrouillages de créneaux

**Content Management (Gestion du contenu) :**
- Clinic Settings : Paramètres de la clinique
- Hero Slides : Slides du carousel
- Medical Services : Services médicaux
- Clinic Schedules : Horaires d'ouverture
- Clinic Holidays : Jours fériés
- Contact Messages : Messages de contact

### 3. Modifier les paramètres de la clinique

1. Section "Content Management" → "Clinic Settings"
2. Cliquer sur "Centre Médical VIDA"
3. Modifier les informations :
   - Nom, adresse, téléphones
   - Tarifs des consultations
   - Horaires d'ouverture
   - Texte "À propos"
4. Sauvegarder
5. Rafraîchir le frontend → Les changements sont visibles

### 4. Ajouter un service médical

1. Section "Content Management" → "Medical Services"
2. Cliquer sur "Add Medical Service"
3. Remplir :
   - Titre : `Orthoptie`
   - Description : `Rééducation des troubles visuels`
   - Détails : `Traitement du strabisme, amblyopie...`
   - Ordre : `5`
   - Actif : ✅
4. Sauvegarder
5. Le nouveau service apparaît sur le site

---

## 🔌 Explorer l'API

### 1. Documentation interactive (Swagger)

1. Ouvrir http://localhost:8000/api/schema/swagger-ui/
2. Explorer les endpoints disponibles
3. Tester directement depuis l'interface

**Endpoints principaux :**
- `/api/v1/auth/` : Authentification
- `/api/v1/appointments/` : Rendez-vous
- `/api/v1/content/` : Contenu du site

### 2. Tester avec curl

**Obtenir les créneaux disponibles :**
```bash
curl "http://localhost:8000/api/v1/appointments/slots/?date=2026-02-01"
```

**Créer un rendez-vous :**
```bash
curl -X POST http://localhost:8000/api/v1/appointments/ \
  -H "Content-Type: application/json" \
  -d '{
    "patient_first_name": "Marie",
    "patient_last_name": "Martin",
    "patient_email": "marie.martin@example.com",
    "patient_phone": "06 987 65 43",
    "date": "2026-02-01",
    "time": "10:00",
    "consultation_type": "generale",
    "reason": "Examen de vue"
  }'
```

**S'inscrire :**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau@example.com",
    "password": "Password2026!Secure",
    "password_confirm": "Password2026!Secure",
    "first_name": "Nouveau",
    "last_name": "Patient",
    "phone": "06 111 22 33",
    "captcha": "test_token"
  }'
```

### 3. Tester avec Postman

1. Télécharger Postman : https://www.postman.com/
2. Importer la collection : `docs/postman/VIDA_API.postman_collection.json`
3. Configurer l'environnement :
   - `base_url` : `http://localhost:8000`
   - `api_url` : `http://localhost:8000/api/v1`
4. Tester les requêtes

---

## 💻 Développer votre première fonctionnalité

### Exemple : Ajouter un champ "Allergies" aux rendez-vous

#### 1. Modifier le modèle (Backend)

**Fichier** : `backend/apps/appointments/models.py`

```python
class Appointment(models.Model):
    # ... champs existants ...
    
    # Nouveau champ
    allergies = models.TextField(
        blank=True,
        null=True,
        help_text="Allergies connues du patient"
    )
```

#### 2. Créer la migration

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

#### 3. Mettre à jour le serializer

**Fichier** : `backend/apps/appointments/serializers.py`

```python
class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            # ... champs existants ...
            'allergies',  # Nouveau champ
        ]
```

#### 4. Mettre à jour le formulaire (Frontend)

**Fichier** : `frontend/components/modals/AppointmentModal.tsx`

```typescript
// Ajouter au schéma Zod
const appointmentSchema = z.object({
  // ... champs existants ...
  allergies: z.string().optional(),
});

// Ajouter au formulaire
<FormField
  control={form.control}
  name="allergies"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Allergies connues</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Mentionnez vos allergies (médicaments, produits...)"
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### 5. Tester

1. Rafraîchir le frontend
2. Ouvrir le modal de rendez-vous
3. Le nouveau champ "Allergies" est visible
4. Créer un rendez-vous avec des allergies
5. Vérifier dans l'admin Django que le champ est sauvegardé

---

## 🧪 Lancer les tests

### Tests Backend

```bash
cd backend
source venv/bin/activate

# Tous les tests
pytest

# Tests avec couverture
pytest --cov=apps --cov-report=html

# Voir le rapport de couverture
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

### Tests Frontend

```bash
cd frontend

# Linter
pnpm lint

# Type checking
pnpm type-check

# Build de production (test)
pnpm build
```

---

## 📊 Surveiller les logs

### Logs Backend (Console)

```bash
cd backend
python manage.py runserver

# Les logs s'affichent dans la console :
# - Requêtes HTTP
# - Erreurs
# - Emails envoyés (en mode console)
```

### Logs Celery

```bash
cd backend
celery -A config worker -l info

# Voir les tâches exécutées :
# - Envoi d'emails
# - Nettoyage de tokens
# - Rappels de rendez-vous
```

### Logs Frontend (Console navigateur)

1. Ouvrir les DevTools (F12)
2. Onglet "Console"
3. Voir les logs de l'application React

---

## 🎯 Prochaines étapes

Maintenant que vous maîtrisez les bases :

1. **Comprendre l'architecture** → [Architecture overview](../02-architecture/overview.md)
2. **Explorer l'API en détail** → [Documentation API](../03-api-documentation/README.md)
3. **Développer le frontend** → [Guide frontend](../04-frontend-guide/README.md)
4. **Développer le backend** → [Guide backend](../05-backend-guide/README.md)
5. **Déployer en production** → [Guide de déploiement](../06-deployment/README.md)

---

## 🆘 Besoin d'aide ?

- 📖 [Guide de dépannage](../07-maintenance/troubleshooting.md)
- 💬 [Forum de discussion](https://github.com/your-repo/vida/discussions)
- 🐛 [Signaler un bug](https://github.com/your-repo/vida/issues)

---

**Félicitations ! Vous êtes prêt à développer sur VIDA ! 🎉**
