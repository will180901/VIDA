# 📋 CAHIER DES CHARGES - CENTRE MÉDICAL VIDA
## Module 9 : Multi-Praticiens

---

## 🎯 OBJECTIF DU MODULE

Créer un système multi-praticiens permettant la gestion de plusieurs médecins/techniciens avec :
- **Gestion des profils** : Médecins, optométristes, orthoptistes, secrétaires médicales
- **Planning individuel** : Chaque praticien gère ses propres disponibilités
- **Affectation intelligente** : Système de matching patient-praticien
- **Suivi des performances** : Statistiques par praticien
- **Accès sécurisé** : RBAC spécifique aux rôles médicaux
- **Synchronisation temps réel** : Disponibilités en temps réel

**Priorités** :
- **Sécurité** : Isolation des données médicales par praticien
- **Flexibilité** : Adaptation aux emplois du temps variés
- **Traçabilité** : Journalisation des actions par praticien
- **Performance** : Affichage rapide des disponibilités

---

## 👥 ARCHITECTURE DES PRATICIENS

### Modèles Django

**UserProfile** (extension de User) :
```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    role = models.CharField(max_length=20, choices=USER_ROLES)  # DOCTOR, OPTOMETRIST, ORTHOPTIST, SECRETARY
    speciality = models.CharField(max_length=100, blank=True)  # Ophtalmologie, etc.
    license_number = models.CharField(max_length=50, unique=True)  # Numéro d'agrément
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Practitioner** (spécialisation pour les praticiens médicaux) :
```python
class Practitioner(models.Model):
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE)
    registration_number = models.CharField(max_length=50, unique=True)  # Numéro d'ordre
    years_experience = models.IntegerField()
    medical_school = models.CharField(max_length=100)
    certifications = models.TextField(blank=True)  # JSONField pour certifications multiples
    languages_spoken = models.JSONField(default=list)  # ['fr', 'en', 'kg', 'ln']
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='practitioners/', blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)  # Honoraires de base
    is_available = models.BooleanField(default=True)  # Disponibilité globale
```

**PractitionerSchedule** (horaires spécifiques) :
```python
class PractitionerSchedule(models.Model):
    practitioner = models.ForeignKey(Practitioner, on_delete=models.CASCADE)
    day_of_week = models.IntegerField(choices=DAY_CHOICES)  # 0=Lundi, 6=Dimanche
    start_time = models.TimeField()  # Ex: 08:00
    end_time = models.TimeField()    # Ex: 17:00
    break_start = models.TimeField(null=True, blank=True)  # Ex: 12:00
    break_end = models.TimeField(null=True, blank=True)    # Ex: 13:00
    max_daily_appointments = models.IntegerField(default=20)  # Max RDV par jour
    is_active = models.BooleanField(default=True)
```

**PractitionerAvailability** (disponibilités spécifiques) :
```python
class PractitionerAvailability(models.Model):
    practitioner = models.ForeignKey(Practitioner, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    reason = models.CharField(max_length=200, blank=True)  # Congé, formation, etc.
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 🗓️ GESTION DES EMPLOIS DU TEMPS

### Planning Individuel

**Vue par praticien** :
- Accès exclusif à son propre planning
- Modification de ses disponibilités
- Gestion des congés/indisponibilités
- Visualisation des RDV assignés

**Vue par secrétaire médicale** :
- Accès en lecture à tous les plannings
- Création/modification RDV pour tous les praticiens
- Gestion globale des indisponibilités

**Vue par patient** :
- Consultation des disponibilités de tous les praticiens (selon critères)
- Sélection du praticien préféré (si applicable)
- Réservation selon spécialité/compétence

### Créneau de Consultation

**Unité de base** :
- Durée configurable : 30, 45 ou 60 minutes
- Type : Première consultation, Suivi, Urgence, Dépistage
- Salle d'examen attribuée (si plusieurs salles)

**Règles de disponibilité** :
- Respect des horaires définis
- Gestion des pauses
- Maximum quotidien configurable
- Interdiction des doubles réservations

---

## 🔍 SYSTÈME D'AFFECTATION INTELLIGENTE

### Algorithmes de Matching

**Matching basé sur la spécialité** :
- Correspondance entre le type de consultation et la spécialité du praticien
- Praticiens généralistes pour consultations de base
- Spécialistes pour consultations spécifiques

**Matching basé sur la langue** :
- Priorité aux praticiens parlant la langue du patient
- Option "Traducteur" si aucune correspondance

**Matching basé sur les préférences** :
- Historique des consultations (praticien habituel)
- Notes/avis précédents
- Localisation géographique (optionnel)

**Matching basé sur la disponibilité** :
- Praticien le plus rapidement disponible
- Praticien avec le meilleur taux de satisfaction
- Praticien avec le moins de RDV en attente

### Interface de Sélection

**Pour le patient** :
- Filtres : Spécialité, Langue, Notes, Localisation
- Comparaison : Disponibilités, prix, avis
- Option : "Meilleur praticien pour moi" (IA)

**Pour la secrétaire médicale** :
- Sélection manuelle ou suggestion automatique
- Justification du choix (pour traçabilité)
- Possibilité de forcer l'affectation

---

## 📊 STATISTIQUES ET PERFORMANCES

### Tableau de Bord Praticien

**KPI individuels** :
- Nombre de consultations (journalier, hebdomadaire, mensuel)
- Taux de satisfaction patient
- Durée moyenne des consultations
- Taux de show-up (présence aux RDV)
- Revenus générés (si applicable)

**Graphiques** :
- Évolution du nombre de consultations
- Répartition par type de consultation
- Comparaison avec les autres praticiens
- Évolution de la satisfaction

### Tableau de Bord Administratif

**Vue globale** :
- Statistiques consolidées de tous les praticiens
- Comparaison des performances
- Charge de travail équilibrée
- Identification des goulets d'étranglement

**Alertes intelligentes** :
- Praticien surchargé (> 90% capacité)
- Praticien sous-utilisé (< 50% capacité)
- Taux de satisfaction en baisse
- Augmentation des no-shows

---

## 🔐 SÉCURITÉ ET ACCÈS

### RBAC Multi-Praticiens

**Rôles définis** :
- Super Admin : Accès complet à tous les modules
- Médecin : Accès à ses patients, ses RDV, ses dossiers médicaux
- Optométriste : Accès limité (tests fonctionnels, prescriptions lunettes)
- Orthoptiste : Accès spécifique (tests orthoptiques)
- Secrétaire médicale : Gestion RDV, accès limité aux dossiers
- Opticien : Accès prescriptions lunettes uniquement

**Politiques d'accès fines** :
- Chaque praticien ne voit que ses propres patients
- Les dossiers médicaux sont cloisonnés
- Les consultations sont accessibles uniquement par l'auteur
- Les secrétaires ont un accès limité (lecture seule sur partie médicale)

### Journalisation Avancée

**Traçabilité des actions** :
- Qui a consulté quel dossier et quand
- Modifications apportées aux dossiers
- Accès non autorisés (tentatives)
- Exportations de données

**Journalisation immuable** :
- Logs d'audit avec chaînage cryptographique
- Impossible de modifier ou supprimer les logs
- Preuve de conformité RGPD

---

## 🔄 SYSTÈME DE SYNCHRONISATION

### Temps Réel

**Synchronisation des disponibilités** :
- Mise à jour instantanée des créneaux
- Gestion des conflits d'accès
- Notifications en temps réel

**WebSocket pour les mises à jour** :
- Changement de statut RDV
- Nouveaux RDV programmés
- Annulations en temps réel
- Notifications de disponibilité

### Gestion des Conflits

**Détection des doubles réservations** :
- Vérification avant validation
- Système de verrouillage temporaire
- Journalisation des tentatives concurrentes

**Résolution automatique** :
- Priorité aux réservations les plus anciennes
- Notification des conflits
- Suggestions alternatives

---

## 📱 INTERFACES UTILISATEURS

### Interface Praticien

**Dashboard personnalisé** :
- Agenda du jour
- Patients à venir
- Notifications urgentes
- Statistiques personnelles

**Gestion de disponibilité** :
- Calendrier interactif
- Modification en drag & drop
- Gestion des congés
- Définition des horaires récurrents

### Interface Secrétaire Médicale

**Vue globale** :
- Plannings de tous les praticiens
- Gestion des RDV pour tous
- Interface de matching automatique
- Outils d'optimisation de la charge

### Interface Patient

**Sélection du praticien** :
- Profils détaillés
- Disponibilités en temps réel
- Système de notation
- Options de préférences

---

## 🔌 API ENDPOINTS

### Praticiens (Admin/Secrétaire)

```
GET    /api/practitioners/                    # Liste tous les praticiens
POST   /api/practitioners/                    # Créer praticien
GET    /api/practitioners/{id}/               # Détail praticien
PATCH  /api/practitioners/{id}/               # Modifier praticien
DELETE /api/practitioners/{id}/               # Désactiver praticien

GET    /api/practitioners/{id}/schedule/      # Horaire spécifique
POST   /api/practitioners/{id}/schedule/      # Ajouter horaire
PATCH  /api/practitioners/{id}/schedule/{sid}/ # Modifier horaire
DELETE /api/practitioners/{id}/schedule/{sid}/ # Supprimer horaire

GET    /api/practitioners/{id}/availability/  # Disponibilités
POST   /api/practitioners/{id}/availability/  # Ajouter disponibilité
PATCH  /api/practitioners/{id}/availability/{aid}/ # Modifier
DELETE /api/practitioners/{id}/availability/{aid}/ # Supprimer
```

### Disponibilités (Patient/Secrétaire)

```
GET    /api/availability/                     # Disponibilités selon critères
GET    /api/availability/{practitioner_id}/   # Disponibilités spécifiques
POST   /api/availability/match/               # Système de matching intelligent
```

### Statistiques (Admin/Praticien)

```
GET    /api/stats/practitioners/              # Stats globales
GET    /api/stats/practitioners/{id}/         # Stats individuelles
GET    /api/stats/practitioners/comparison/   # Comparaison entre praticiens
```

---

## 🧪 TESTS

### Tests Unitaires

**Backend (Pytest)** :
- Validation des rôles et permissions
- Calcul des disponibilités
- Algorithmes de matching
- Gestion des conflits de réservation
- Calcul des statistiques

**Frontend (Jest)** :
- Interface de sélection du praticien
- Calendrier interactif
- Système de filtres
- Affichage des disponibilités

### Tests API

**Scénarios critiques** :
- Création de praticien avec validation des rôles
- Réservation concurrente (test de robustesse)
- Changement de disponibilité en temps réel
- Système de matching selon différents critères
- Gestion des accès non autorisés

### Tests E2E

**Playwright** :
1. **Parcours patient** : Sélection praticien → Vérification disponibilité → Réservation
2. **Parcours praticien** : Gestion de ses horaires → Consultation de son agenda
3. **Parcours secrétaire** : Création RDV pour praticien spécifique → Vérification
4. **Synchronisation** : Changement de disponibilité → Mise à jour temps réel

---

## ✅ CRITÈRES D'ACCEPTATION

### Fonctionnel
- [ ] Gestion des profils praticiens complets
- [ ] Système de planning individuel fonctionnel
- [ ] Algorithmes de matching intelligents
- [ ] Interface de gestion des disponibilités
- [ ] Statistiques par praticien
- [ ] Synchronisation temps réel des disponibilités
- [ ] Système de notifications en temps réel
- [ ] Gestion des conflits de réservation

### Sécurité
- [ ] RBAC strictement appliqué selon les rôles
- [ ] Isolation des données médicales par praticien
- [ ] Journalisation complète des accès
- [ ] Journalisation immuable (logs d'audit blockchain-light)
- [ ] Protection contre les accès non autorisés
- [ ] Validation des permissions à chaque accès

### Performance
- [ ] Chargement planning < 2s
- [ ] Mise à jour disponibilités temps réel
- [ ] Recherche praticien < 1s
- [ ] Interface fluide et responsive
- [ ] Système de matching < 500ms

### UX
- [ ] Interface intuitive pour les praticiens
- [ ] Sélection facile du praticien pour les patients
- [ ] Visualisation claire des disponibilités
- [ ] Notifications claires et non intrusives
- [ ] Accès rapide aux fonctionnalités principales

### Conformité
- [ ] RGPD : Isolation des données par praticien
- [ ] Traçabilité complète des actions
- [ ] Accès limité selon les rôles
- [ ] Documentation API complète
- [ ] Tests de sécurité complétés

---

## 🚀 DÉPLOIEMENT

### Migration des Données

**Données existantes** :
- Import des profils praticiens existants
- Conversion des anciens plannings
- Migration des statistiques historiques

**Validation** :
- Vérification de l'intégrité des données
- Test des permissions sur données historiques
- Validation du système de matching sur données réelles

### Surveillance

**Métriques suivies** :
- Taux d'utilisation du système par praticien
- Temps de réponse des interfaces
- Nombre de conflits de réservation
- Satisfaction des patients par praticien
- Équilibre de charge entre praticiens

**Alertes** :
- Praticien non disponible pendant >1 semaine
- Conflits fréquents de disponibilité
- Déséquilibre important de charge
- Tentatives d'accès non autorisés

---

**Document créé le** : 07 janvier 2026  
**Version** : 1.0  
**Statut** : En attente de validation  
**Auteur** : Équipe projet VIDA