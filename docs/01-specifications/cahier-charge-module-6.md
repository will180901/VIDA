# 📋 CAHIER DES CHARGES - CENTRE MÉDICAL VIDA
## Module 6 : Admin - Gestion RDV & Patients

---

## 🎯 OBJECTIF DU MODULE

Créer une interface d'administration complète permettant au personnel médical et administratif de :
- Visualiser et analyser l'activité du centre en temps réel
- Gérer tous les rendez-vous (création manuelle, modification, annulation)
- Consulter et gérer les dossiers patients
- Créer et mettre à jour les dossiers médicaux
- Suivre les statistiques et performances
- Accéder aux logs d'audit pour traçabilité

**Priorités** :
- **Efficacité** : Actions rapides, navigation fluide
- **Vue d'ensemble** : Dashboard analytics complet
- **Traçabilité** : Logs de toutes les actions sensibles
- **Sécurité** : Contrôle d'accès par rôle (RBAC)

---

## 🏗️ ARCHITECTURE ESPACE ADMIN

### Contrôle d'accès (RBAC)

**Rôles définis** :

#### 1. Super Admin
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs et rôles
- Configuration système
- Accès aux logs d'audit

#### 2. Médecin
- Consultation/modification dossiers médicaux
- Gestion de ses propres RDV
- Création prescriptions et ordonnances
- Ajout résultats d'examens
- Pas d'accès aux statistiques financières

#### 3. Secrétaire Médical
- Gestion complète des RDV (création, modification, annulation)
- Consultation dossiers patients (lecture seule sur partie médicale)
- Gestion informations administratives patients
- Pas d'accès aux données médicales sensibles

#### 4. Opticien
- Gestion stock lunetterie (Module 7)
- Consultation prescriptions lunettes
- Création commandes lunetterie
- Pas d'accès aux dossiers médicaux complets
- CORRIGÉ: Le terme correct est "opticien" et non "optométriste" (conformément à la réglementation locale)

**Matrice de permissions** :

| Fonctionnalité | Super Admin | Médecin | Secrétaire | Opticien |
|----------------|-------------|---------|------------|----------|
| Dashboard analytics | ✅ Complet | ✅ Limité | ✅ Limité | ❌ |
| Gestion RDV | ✅ | ✅ (ses RDV) | ✅ | ❌ |
| Dossiers patients | ✅ | ✅ | 👁️ Lecture | ❌ |
| Création/modif dossier médical | ✅ | ✅ | ❌ | ❌ |
| Prescriptions | ✅ | ✅ | 👁️ Lecture | 👁️ (lunettes) |
| Gestion utilisateurs | ✅ | ❌ | ❌ | ❌ |
| Logs d'audit | ✅ | 👁️ (ses actions) | ❌ | ❌ |
| Stock lunetterie | ✅ | ❌ | ❌ | ✅ |
| Paramètres système | ✅ | ❌ | ❌ | ❌ |

**CORRIGÉ: Matrice de permissions mise à jour pour inclure le rôle "opticien" (pas "optométriste")**

---

### Structure de navigation

**Sidebar gauche** (similaire à espace patient mais avec sections admin) :

**Section Analytics** :
- Dashboard (icône `BarChart3`)
- Rapports (icône `FileText`)

**Section Rendez-vous** :
- Planning (icône `Calendar`)
- Liste des RDV (icône `List`)
- Créer un RDV (icône `Plus`)

**Section Patients** :
- Tous les patients (icône `Users`)
- Nouveau patient (icône `UserPlus`)
- Recherche avancée (icône `Search`)

**Section Médical** :
- Consultations du jour (icône `Stethoscope`)
- Examens en attente (icône `FileText`)
- Prescriptions (icône `Pill`)

**Section Lunetterie** (Module 7) :
- Catalogue (icône `Glasses`)
- Stock (icône `Package`)
- Commandes (icône `ShoppingCart`)

**Section Administration** :
- Utilisateurs (icône `Users`)
- Rôles & Permissions (icône `Shield`)
- Logs d'audit (icône `History`)
- Paramètres (icône `Settings`)

**Section Utilisateur** :
- Mon profil (icône `User`)
- Déconnexion (icône `LogOut`)

---

## 📊 PAGE 1 : DASHBOARD ADMIN

### URL
`/admin/dashboard` ou `/admin`

### Objectif
Vue d'ensemble complète de l'activité du centre en temps réel.

### Structure détaillée

#### Section 1 : Header Dashboard

**Contenu** :
- Message personnalisé : "Bonjour Dr. [Nom]" ou "Bonjour [Prénom]"
- Date et heure actuelles (mise à jour temps réel)
- Statut du centre : Badge "Ouvert" (vert) ou "Fermé" (rouge)
- Sélecteur de période : "Aujourd'hui" / "Cette semaine" / "Ce mois" / "Personnalisé"

---

#### Section 2 : Statistiques rapides (KPI Cards)

**Layout** : Grid 4 colonnes desktop, 2 colonnes tablet, 1 colonne mobile

**Card 1 : Rendez-vous aujourd'hui**
- Icône : `Calendar` (grande, teal)
- Chiffre principal : **12 RDV**
- Sous-stats :
  - Complétés : 5 (checkmark vert)
  - En cours : 2 (clock orange)
  - À venir : 5 (calendar teal)
- Variation : "+15% vs hier" (flèche verte)
- Action : "Voir le planning"

**Card 2 : Taux de présence (Show-up)**
- Icône : `UserCheck` (vert)
- Chiffre principal : **92%**
- Détails :
  - Présents : 11 patients
  - No-show : 1 patient
- Variation : "+3% vs semaine dernière"
- Graphique sparkline (mini courbe d'évolution 7 derniers jours)

**Card 3 : Nouveaux patients**
- Icône : `UserPlus` (orange)
- Chiffre principal : **8 nouveaux** (cette semaine)
- Total patients : 1 247
- Variation : "+12% vs semaine dernière"
- Action : "Voir les nouveaux"

**Card 4 : Revenus du jour** (si admin/finance)
- Icône : `DollarSign` (teal)
- Chiffre principal : **120 000 FCFA**
- Détails :
  - Consultations : 90 000 FCFA
  - Lunetterie : 30 000 FCFA
- Variation : "-5% vs hier"
- Action : "Voir les détails"

**Design cards** :
- Background : Blanc
- Border-radius : 4px
- Shadow : Niveau 1, hover niveau 2
- Padding : `p-6`
- Icônes : 64px dans circle coloré/10
- Chiffre principal : `text-3xl font-bold`
- Variation : Couleur conditionnelle (vert si positif, rouge si négatif)

---

#### Section 3 : Planning du jour (Vue rapide)

**Titre** : "Planning d'aujourd'hui"

**Affichage** : Timeline verticale des RDV du jour

**Contenu** :
- Heure : "09h30"
- Patient : "Jean Dupont"
- Type : "Consultation de suivi"
- Médecin : "Dr. Martin"
- Statut : Badge "En cours" / "Complété" / "À venir" / "Annulé"
- Durée : "30 min"
- Actions rapides :
  - Icône `Eye` : "Voir la fiche patient"
  - Icône `Edit` : "Modifier le RDV"
  - Icône `Check` : "Marquer comme complété"

**Filtres rapides** :
- Tous les médecins
- Par médecin (dropdown)
- Statut (dropdown)

**Heure actuelle** : Ligne horizontale animée qui indique l'heure en temps réel

**Empty state** (aucun RDV aujourd'hui) :
- Message : "Aucun rendez-vous prévu aujourd'hui"
- Illustration : `relax.svg`

---

#### Section 4 : Statistiques hebdomadaires (Graphiques)

**Layout** : 2 colonnes desktop, 1 colonne mobile

**Graphique 1 : Évolution des RDV (Ligne)**
- Titre : "Rendez-vous cette semaine"
- Axe X : Jours de la semaine (Lun-Dim)
- Axe Y : Nombre de RDV
- Lignes :
  - RDV pris (teal)
  - RDV complétés (vert)
  - No-show (rouge)
- Légende interactive
- Tooltip au survol
- Export : Bouton "Exporter ce graphique" (PNG/SVG)

**Graphique 2 : Répartition par type de consultation (Donut)**
- Titre : "Types de consultations"
- Segments :
  - Première consultation : X%
  - Consultation de suivi : X%
  - Dépistage : X%
  - Urgence : X%
  - Essayage lunettes : X%
- Total au centre : "52 RDV"
- Couleurs : Palette teal/orange
- Export : Bouton "Exporter ce graphique" (PNG/SVG)

**Graphique 3 : Taux de remplissage (Barre horizontale)**
- Titre : "Taux de remplissage par médecin"
- Barres :
  - Dr. Dupont : 85% (17/20 créneaux)
  - Dr. Martin : 92% (23/25 créneaux)
  - Dr. Kamara : 78% (14/18 créneaux)
- Couleurs : Dégradé vert (> 80%) à rouge (< 60%)
- Export : Bouton "Exporter ce graphique" (PNG/SVG)

**Graphique 4 : Heures de pointe (Heatmap)**
- Titre : "Affluence par créneaux horaires"
- Grille : Jours (lignes) x Heures (colonnes)
- Couleur : Intensité selon nombre de RDV
  - Blanc : Aucun RDV
  - Teal clair : 1-3 RDV
  - Teal moyen : 4-6 RDV
  - Teal foncé : 7+ RDV
- Export : Bouton "Exporter ce graphique" (PNG/SVG)

**Graphique 5 : Taux de satisfaction (Gauge)**
- Titre : "Satisfaction patient moyenne"
- Valeur : 4.2/5
- Zones : Rouge (<3), Orange (3-4), Vert (>4)
- Dernier mois : "4.2/5" (vs 3.9/5 mois dernier)

**Graphique 6 : Rentabilité par praticien (Barre empilée)**
- Titre : "Revenus par praticien"
- Valeurs : Consultations / Lunetterie / Autres
- Comparaison : Mois actuel vs mois précédent

**Librairie graphiques** : Recharts (React) ou Chart.js

**Fonctionnalités analytics avancées** (CORRIGÉ: ajoutées à la priorité du dashboard):
- Filtrage par période personnalisée
- Comparaison avec période précédente
- Export des données brutes (CSV)
- Partage des graphiques (lien temporaire)
- Alertes : Seuil personnalisable (ex: "Alertez-moi si taux no-show > 10%")

---

#### Section 5 : Alertes & Actions à faire

**Titre** : "Alertes et tâches"

**Types d'alertes** :

**Alerte 1 : No-show à traiter**
- Icône : `AlertTriangle` (rouge)
- Badge compteur : "3"
- Message : "3 patients absents sans prévenir aujourd'hui"
- Action : "Voir la liste" → Page RDV filtrée

**Alerte 2 : RDV à confirmer**
- Icône : `Clock` (orange)
- Badge compteur : "5"
- Message : "5 rendez-vous en attente de confirmation"
- Action : "Confirmer" → Liste RDV

**Alerte 3 : Stock faible (Module 7)**
- Icône : `Package` (orange)
- Message : "7 produits en stock faible"
- Action : "Voir le stock"

**Alerte 4 : Documents à signer**
- Icône : `FileText` (teal)
- Badge compteur : "2"
- Message : "2 ordonnances en attente de signature électronique"
- Action : "Signer"

**Design alertes** :
- Cards compactes, cliquables
- Empilées verticalement
- Hover : Background teal/5
- Badge compteur : Position absolute, top-right

---

#### Section 6 : Patients récents

**Titre** : "Derniers patients inscrits"

**Affichage** : Liste compacte (5 derniers)

**Contenu** :
- Avatar + Nom + Prénom
- Date d'inscription : "Inscrit le 02/01/2026"
- Email ou Téléphone
- Statut : Badge "Email vérifié" (vert) ou "Email non vérifié" (orange)
- Actions :
  - Icône `Eye` : "Voir la fiche"
  - Icône `Calendar` : "Créer un RDV"

**Action** : Lien "Voir tous les patients"

---

#### Section 7 : Notifications système (Optionnel)

**Titre** : "Notifications système"

**Contenu** : Liste des événements récents
- "Dr. Martin a complété une consultation" - Il y a 5 min
- "Nouveau patient : Sarah Koumba" - Il y a 12 min
- "RDV annulé : Pierre Ndoki" - Il y a 1h
- "Paiement reçu : 10 000 FCFA" - Il y a 2h

**Design** :
- Liste scrollable (max 5 items visibles)
- Timestamps relatifs
- Icônes contextuelles

---

## 📅 PAGE 2 : PLANNING MÉDECINS

### URL
`/admin/planning` ou `/admin/calendar`

### Objectif
Vue calendrier complète pour gérer tous les rendez-vous de tous les médecins.

### Structure détaillée

#### Section 1 : Header Planning

**Contenu** :
- Titre : "Planning des Rendez-vous"
- Sélecteur médecin : Dropdown "Tous" / "Dr. Dupont" / "Dr. Martin" / etc.
- Sélecteur vue : Boutons toggle
  - Jour
  - Semaine (par défaut)
  - Mois
- Navigation date : 
  - Bouton "Aujourd'hui" (reset à date actuelle)
  - Flèches < > pour naviguer
  - Date picker pour saut direct
- Actions :
  - Bouton primaire : "Créer un RDV" (icône `Plus`)
  - Bouton secondaire : "Imprimer le planning" (icône `Printer`)
  - Bouton : "Bloquer un créneau" (icône `Ban`)

---

#### Vue Jour

**Affichage** : Timeline horaire verticale (08h00 - 18h00)

**Layout** : Colonnes par médecin (si plusieurs médecins sélectionnés)

**Contenu** :
- Grille horaire : Lignes toutes les 30 minutes
- Créneaux RDV : Blocks colorés positionnés selon heure et durée
- Chaque block RDV contient :
  - Heure : "09h30"
  - Nom patient : "Jean Dupont"
  - Type consultation : Icône + texte court
  - Statut : Badge couleur
- Hover : Tooltip avec détails complets
- Clic : Modale détails RDV avec actions

**Couleurs par statut** :
- Confirmé : Teal
- En cours : Orange
- Complété : Vert
- Annulé : Gris barré
- No-show : Rouge

**Drag & Drop** :
- Possibilité de déplacer un RDV en glissant le block
- Validation : Modale "Confirmer le déplacement ?"
- Mise à jour en temps réel
- Notification automatique envoyée au patient

**Créneaux libres** :
- Background blanc
- Double-clic : Ouvre formulaire "Créer RDV" avec heure préremplie

---

#### Vue Semaine

**Affichage** : Grille 7 colonnes (Lun-Dim) x Lignes horaires

**Layout** : Si plusieurs médecins, onglets ou dropdown pour switcher

**Contenu** : Similaire à Vue Jour, mais plus compact
- Blocks RDV : Taille réduite, texte essentiel uniquement
- Hover : Tooltip
- Clic : Modale

**Indicateurs** :
- Jours avec beaucoup de RDV : Border top orange épaisse
- Aujourd'hui : Column highlight background teal/5

---

#### Vue Mois

**Affichage** : Calendrier mensuel classique

**Contenu** :
- Chaque jour : Nombre total de RDV en badge
- Couleur badge selon charge :
  - Vert : Peu de RDV (< 50% capacité)
  - Orange : Chargé (50-80%)
  - Rouge : Complet (> 80%)
- Clic sur jour : Ouvre vue détaillée du jour (modale ou redirect)

**Légende** :
- Indicateurs de couleur expliqués

---

#### Modale "Détails RDV" (depuis planning)

**Contenu** :
- **Header** :
  - Numéro RDV : #VIDA-2026-00042
  - Statut : Badge grande taille
  - Menu 3 points : Actions supplémentaires
- **Informations patient** :
  - Avatar + Nom complet
  - Téléphone (cliquable `tel:`)
  - Email (cliquable `mailto:`)
  - Lien : "Voir la fiche patient complète"
- **Détails RDV** :
  - Date et heure
  - Type de consultation
  - Médecin
  - Durée
  - Motif de consultation (texte libre patient)
  - Symptômes rapportés
- **Actions** :
  - Bouton : "Modifier" → Formulaire édition
  - Bouton : "Annuler le RDV" (rouge) → Confirmation
  - Bouton : "Marquer comme complété"
  - Bouton : "Marquer comme no-show"
  - Bouton : "Créer un nouveau RDV" (pour ce patient)
  - Bouton : "Envoyer un rappel SMS/Email"
  - Bouton : "Consulter le dossier médical"

**Footer** :
- Historique des actions sur ce RDV :
  - Créé le X par Y
  - Modifié le X par Y
  - Rappel envoyé le X

---

## 📝 PAGE 3 : LISTE DES RENDEZ-VOUS

### URL
`/admin/rendez-vous` ou `/admin/appointments`

### Objectif
Vue en liste de tous les RDV avec filtres avancés et actions en masse.

### Structure détaillée

#### Section 1 : Filtres & Recherche

**Layout horizontal** (sticky top) :

**Champ 1 : Recherche globale**
- Input large : "Rechercher un patient, numéro RDV, téléphone..."
- Icône : `Search`
- Recherche en temps réel (debounce 300ms)

**Champ 2 : Filtres**
- Statut (multi-select) : Confirmé, En cours, Complété, Annulé, No-show
- Date range : Date picker start/end
- Type consultation (dropdown)
- Médecin (dropdown)
- Mode paiement : Payé / Non payé / Partiel

**Actions** :
- Bouton : "Réinitialiser les filtres"
- Bouton : "Exporter" (CSV/Excel/PDF)

---

#### Section 2 : Tableau des RDV

**Colonnes** :

1. **Checkbox** (sélection multiple)
2. **Statut** : Badge coloré
3. **N° RDV** : #VIDA-2026-00042 (cliquable)
4. **Date** : "06/01/2026"
5. **Heure** : "09h30"
6. **Patient** : Nom + Prénom (lien vers fiche)
7. **Téléphone** : Cliquable
8. **Type** : "Consultation de suivi"
9. **Médecin** : "Dr. Dupont"
10. **Paiement** : Badge "Payé" (vert) / "Impayé" (rouge)
11. **Actions** : Dropdown menu 3 points
    - Voir les détails
    - Modifier
    - Annuler
    - Marquer complété
    - Envoyer rappel
    - Consulter dossier patient

**Tri** :
- Clic sur header colonne : Tri ascendant/descendant
- Indicateur visuel : Flèche haut/bas

**Pagination** :
- 20 RDV par page (configurable : 10/20/50/100)
- Navigation : Précédent / Suivant + numéros pages
- Affichage : "Affichage de 1-20 sur 247 résultats"

**Actions en masse** (si checkboxes cochées) :
- Barre d'actions apparaît en haut du tableau
- Bouton : "Confirmer les RDV sélectionnés"
- Bouton : "Envoyer rappels groupés"
- Bouton : "Exporter la sélection"
- Bouton : "Annuler" (rouge, avec confirmation)

**Design** :
- Tableau responsive : Scroll horizontal mobile
- Lignes alternées : Background blanc / gray-50
- Hover ligne : Background teal/5
- Ligne RDV urgent : Border-left rouge 3px

---

#### Section 3 : Statistiques rapides (au-dessus du tableau)

**Cards horizontales compactes** :
- Total RDV : 247
- Confirmés : 180 (73%)
- Complétés : 45 (18%)
- Annulés : 15 (6%)
- No-show : 7 (3%)

---

## 👥 PAGE 4 : GESTION DES PATIENTS

### URL
`/admin/patients`

### Objectif
Liste complète des patients avec recherche avancée et accès aux fiches.

### Structure détaillée

#### Section 1 : Recherche & Filtres

**Barre de recherche principale** :
- Input large : "Rechercher par nom, email, téléphone, numéro dossier..."
- Icône : `Search`
- Recherche intelligente : Fuzzy matching
- Suggestions au typing (dropdown autocomplete)

**Filtres avancés** (collapsible) :
- Genre : Homme / Femme / Autre
- Tranche d'âge : Dropdown (0-18, 18-40, 40-60, 60+)
- Date d'inscription : Range
- Statut : Email vérifié / Non vérifié
- Dernière consultation : Range
- Pathologies : Dropdown multi-select (Myopie, Glaucome, Cataracte, etc.)
- Ville : Input texte (si plusieurs villes)

**Actions** :
- Bouton : "Réinitialiser"
- Bouton : "Recherche avancée" (ouvre modale avec formulaire complet)
- Bouton : "Exporter" (CSV/Excel)

---

#### Section 2 : Vue d'ensemble (Cards statistiques)

**3 cards horizontales** :
- Total patients : **1 247**
- Nouveaux ce mois : **23** (+12%)
- Actifs (consultation < 6 mois) : **892** (72%)

---

#### Section 3 : Liste des patients

**Affichage** : Tableau ou Cards (toggle vue)

**Vue Tableau** :

**Colonnes** :
1. **Avatar** + **Nom Prénom**
2. **Date naissance** (+ âge calculé)
3. **Genre**
4. **Téléphone** (cliquable)
5. **Email** (cliquable)
6. **Date inscription**
7. **Dernière consultation** : Date ou "Jamais"
8. **Statut** : Badge "Actif" / "Inactif"
9. **Actions** : Dropdown
   - Voir la fiche complète
   - Créer un RDV
   - Consulter le dossier médical
   - Envoyer un message
   - Modifier les infos
   - Désactiver le compte

**Vue Cards** :

**Contenu d'une card patient** :
- Avatar (grande taille)
- Nom + Prénom (titre)
- Age : "34 ans"
- Téléphone + Email (icônes)
- Dernière consultation : "15/12/2025"
- Nombre de consultations : "12 consultations"
- Badge : "Email vérifié"
- Boutons :
  - "Voir la fiche"
  - "Créer RDV"

**Pagination** : 24 patients par page

---

#### Section 4 : Bouton "Nouveau Patient"

**Action** : Ouvre modale ou page dédiée

**Formulaire création patient** :

**Étape 1 : Informations personnelles**
- Nom complet *
- Date de naissance *
- Genre *
- Téléphone *
- Email *
- Adresse complète (optionnel)
- Contact d'urgence (optionnel)

**Étape 2 : Informations médicales**
- Groupe sanguin (dropdown)
- Allergies (textarea)
- Antécédents médicaux (textarea)
- Traitements en cours (textarea)
- Médecin traitant externe (nom, téléphone)

**Étape 3 : Informations administratives**
- Mode de découverte : "Comment nous avez-vous connu ?" (dropdown)
- Consentements :
  - Traitement données médicales (checkbox obligatoire)
  - Recevoir communications (checkbox optionnel)
- Notes internes (textarea, visible uniquement admin)

**Actions** :
- Bouton : "Créer le patient" (génère numéro dossier automatique)
- Option : "Créer un RDV maintenant" (checkbox)

**Après création** :
- Notification succès
- Redirection vers fiche patient ou formulaire RDV
- Email de bienvenue envoyé automatiquement au patient

---

## 📄 PAGE 5 : FICHE PATIENT DÉTAILLÉE

### URL
`/admin/patients/{id}` ou `/admin/patients/{numero_dossier}`

### Objectif
Vue complète 360° d'un patient pour le personnel médical.

### Structure détaillée

#### Section 1 : Header Fiche Patient

**Contenu** :
- **Avatar** (grande taille, gauche)
  - Upload/modification possible
  - Placeholder : Initiales sur cercle coloré
- **Informations principales** (droite) :
  - Nom complet (H1)
  - Numéro dossier : **#DM-2026-00042** (grande typo)
  - Date de naissance : "18/09/1990" (34 ans)
  - Genre : Icône + texte
  - Email : Cliquable + Badge "Vérifié"
  - Téléphone : Cliquable
  - Adresse : Avec icône `MapPin`
- **Badges statut** :
  - "Patient actif" (vert)
  - "Email vérifié" (vert)
  - "Dernière visite : 15/12/2025" (gris)
- **Actions rapides** (boutons top-right) :
  - "Créer un RDV" (primaire teal)
  - "Envoyer un message" (secondaire)
  - "Modifier les infos" (secondaire)
  - Menu 3 points : Actions supplémentaires
    - Télécharger le dossier (PDF)
    - Imprimer la fiche
    - Désactiver le compte
    - Supprimer (danger)

**Design** :
- Background : Dégradé subtil `from-teal-50 to-white`
- Grain obligatoire
- Padding : `py-8 px-6`
- Shadow : Niveau 2

---

#### Section 2 : Navigation interne (Tabs)

**Tabs horizontaux sticky** :
1. **Vue d'ensemble** (Dashboard patient)
2. **Rendez-vous** (Historique complet RDV)
3. **Dossier médical** (Consultations, prescriptions, examens)
4. **Documents** (Fichiers uploadés)
5. **Historique d'activité** (Timeline actions)
6. **Notes internes** (Visible uniquement staff)

---

#### Tab 1 : Vue d'ensemble

**Section A : Statistiques rapides**

**3 cards horizontales** :
- **Total consultations** : "12" + Graphique sparkline évolution
- **Dernière consultation** : "15/12/2025" (Dr. Dupont)
- **Prochaine consultation** : "06/01/2026, 09h30" ou "Aucune prévue"

**Section B : Résumé médical**

**Card "État de santé actuel"** :
- Diagnostic principal : "Myopie modérée"
  - OD : -2.5 dioptries
  - OG : -2.0 dioptries
- Pathologies actives :
  - Liste avec statut : "Sous surveillance" / "En traitement"
- Traitements en cours :
  - Nom + Posologie + Date fin
- Allergies connues :
  - Liste avec badge sévérité

**Section C : Informations administratives**

**Card compacte** :
- Date d'inscription : "23/12/2022"
- Mode de découverte : "Recommandation ami"
- Assurance : "Oui - [Nom assurance]" (si renseigné)
- Contact d'urgence : Nom + Téléphone

**Section D : Timeline récente (5 derniers événements)**

- "Consultation de suivi - 15/12/2025"
- "Ordonnance lunettes prescrite - 15/12/2025"
- "Résultat fond d'œil ajouté - 15/12/2025"
- "RDV créé pour le 06/01/2026 - 02/01/2026"
- "Rappel SMS envoyé - 04/01/2026"

---

#### Tab 2 : Rendez-vous

**Contenu** : Liste complète des RDV du patient (similaire à page RDV admin mais filtrée)

**Filtres** :
- Statut : Tous / Complétés / À venir / Annulés
- Date range
- Type consultation

**Affichage** : Cards ou tableau

**Actions** :
- Bouton : "Créer un nouveau RDV" (top-right)

**Chaque RDV** :
- Date et heure
- Type
- Médecin
- Statut
- Motif
- Actions : Voir détails, Modifier (si à venir), Annuler

---

#### Tab 3 : Dossier médical

**Navigation secondaire (sous-tabs)** :
- Consultations
- Prescriptions
- Résultats d'examens
- Imagerie médicale

**Sous-tab 3.1 : Consultations**

**Liste chronologique** (plus récente en haut)

**Affichage** : Cards expandables (accordion)

**Header card (collapsed)** :
- Date : "15 décembre 2025"
- Type : "Consultation de suivi"
- Médecin : "Dr. Jean Dupont"
- Statut : Badge "Complétée"
- Icône : `ChevronDown`

**Contenu card (expanded)** :
- **Motif de consultation** : Texte libre
- **Anamnèse** (interrogatoire) : Notes médecin
- **Examen clinique** :
  - Acuité visuelle : OD X/10, OG X/10
  - Réfraction : Mesures détaillées (sphère, cylindre, axe)
  - Tension oculaire : OD X mmHg, OG X mmHg
  - Fond d'œil : Observations texte libre
  - Autres examens réalisés
- **Diagnostic** : Texte médecin (avec codes CIM-10 si applicable)
- **Traitement prescrit** :
  - Médicaments : Liste avec posologie
  - Lunettes : Si prescription
  - Autres recommandations
- **Plan de suivi** : "Contrôle dans 6 mois"
- **Documents associés** :
  - Lien : Ordonnance PDF
  - Lien : Résultats examens
  - Lien : Imagerie

**Actions** :
- Bouton : "Modifier" (icône `Edit`) - Si médecin auteur ou admin
- Bouton : "Télécharger le compte-rendu" (PDF)
- Bouton : "Imprimer"
- Bouton : "Envoyer au patient par email"

**Bouton top** : "Créer une nouvelle consultation" → Formulaire

---

**Formulaire "Nouvelle consultation"** (modale ou page) :

**Section 1 : Informations générales**
- Date consultation : Date picker (par défaut aujourd'hui)
- Type : Dropdown (Première visite, Suivi, Urgence, Dépistage)
- Médecin : Dropdown (par défaut médecin connecté)
- Durée effective : Input number (minutes)

**Section 2 : Motif & Anamnèse**
- Motif de consultation : Textarea
- Symptômes rapportés : Checkboxes + textarea libre
- Historique récent : Textarea

**Section 3 : Examen clinique**
- Acuité visuelle :
  - OD : Input (exemple : 8/10)
  - OG : Input (exemple : 7/10)
- Réfraction (si réalisée) :
  - OD : Sphère, Cylindre, Axe, Addition
  - OG : Sphère, Cylindre, Axe, Addition
- Tension oculaire :
  - OD : Input (mmHg)
  - OG : Input (mmHg)
- Fond d'œil : Textarea (observations)
- Autres examens : Textarea

**Section 4 : Diagnostic**
- Diagnostic principal : Textarea ou sélection pré-définie
- Diagnostics secondaires : Liste dynamique
- Codes CIM-10 : Input suggestion (optionnel)

**Section 5 : Traitement & Prescriptions**
- Médicaments prescrits :
  - Nom : Autocomplete base médicaments
  - Posologie : Textarea
  - Durée : Input number (jours)
  - Renouvelable : Checkbox
- Prescription lunettes : Checkbox "Prescrire des lunettes"
  - Si coché : Formulaire détaillé verres (sphère, cylindre, etc.)
- Autres traitements : Textarea

**Section 6 : Recommandations & Suivi**
- Recommandations : Textarea
- Prochain RDV recommandé : Date picker ou "Dans X mois/semaines"
- Examens à prévoir : Checkboxes

**Section 7 : Documents**
- Upload fichiers : PDF, images (résultats examens externes, imagerie)

**Actions** :
- Bouton : "Enregistrer" (sauvegarde brouillon)
- Bouton : "Enregistrer et finaliser" (verrouille la consultation)
- Bouton : "Annuler"

**Après finalisation** :
- Génération automatique PDF compte-rendu
- Si prescription : Génération PDF ordonnance avec signature électronique
- Envoi automatique au patient par email
- Notification push si app mobile

---

**Sous-tab 3.2 : Prescriptions**

**Liste de toutes les ordonnances** (médicaments + lunettes)

**Filtres** :
- Type : Médicaments / Lunettes / Tout
- Statut : Active / Expirée
- Date range

**Affichage** : Cards

**Contenu d'une card ordonnance** :
- Badge statut : "Active" (vert) / "Expirée" (gris)
- Type : "Ordonnance lunettes" ou "Ordonnance médicament"
- Date prescription : "15/12/2025"
- Médecin prescripteur : "Dr. Dupont"
- Détails :
  - Si lunettes : Correction complète OD/OG
  - Si médicament : Liste médicaments + posologies
- Validité : "Valide jusqu'au 15/12/2027"
- Actions :
  - Télécharger PDF
  - Envoyer au patient
  - Renouveler (crée nouvelle ordonnance pré-remplie)
  - Modifier (si < 24h après création)

**Bouton top** : "Créer une ordonnance" → Formulaire

---

**Sous-tab 3.3 : Résultats d'examens**

**Liste de tous les examens réalisés**

**Filtres** :
- Type examen : Dropdown (Fond d'œil, Champ visuel, OCT, Pachymétrie, etc.)
- Date range
- Médecin

**Affichage** : Cards avec preview

**Contenu d'une card examen** :
- Type : "Fond d'œil"
- Date : "15/12/2025"
- Médecin : "Dr. Dupont"
- Résultat synthétique : Badge "Normal" (vert) / "Anomalie détectée" (orange) / "Pathologique" (rouge)
- Preview image (si imagerie)
- Compte-rendu court : Premier paragraphe (truncate)
- Actions :
  - Voir le résultat complet (modale)
  - Télécharger PDF
  - Envoyer au patient
  - Comparer avec examen précédent

**Modale "Résultat complet"** :
- Image haute résolution (zoom + pan)
- Compte-rendu détaillé
- Comparaison avec examens antérieurs (slider before/after)
- Interprétation médecin
- Recommandations

**Bouton top** : "Ajouter un résultat d'examen" → Formulaire upload + texte

---

**Sous-tab 3.4 : Imagerie médicale**

**Galerie d'images médicales**

**Affichage** : Grille d'images (thumbnails)

**Contenu** :
- Type image : "Fond d'œil OD", "OCT OG", etc.
- Date : "15/12/2025"
- Médecin : "Dr. Dupont"
- Tags : Pathologie associée (si applicable)

**Actions** :
- Clic : Lightbox avec zoom + annotations possibles
- Download
- Comparer avec autre image
- Ajouter à un rapport

**Bouton top** : "Uploader une image" → Drag & drop + métadonnées

---

#### Tab 4 : Documents

**Stockage de tous les fichiers liés au patient**

**Catégories** (filtres) :
- Ordonnances
- Résultats d'examens
- Certificats médicaux
- Arrêts de travail
- Courriers médicaux
- Imagerie
- Documents administratifs
- Autres

**Affichage** : Liste ou grille avec icônes de type fichier

**Contenu d'un document** :
- Icône type (PDF, JPEG, PNG, DOCX)
- Nom fichier
- Catégorie
- Taille : "1.2 MB"
- Ajouté le : Date
- Ajouté par : "Dr. Dupont" ou "Patient" ou "Admin"
- Actions :
  - Prévisualiser
  - Télécharger
  - Envoyer au patient
  - Modifier les métadonnées
  - Supprimer (avec confirmation)

**Bouton top** : "Uploader un document" → Drag & drop + formulaire métadonnées

**Stockage** : AWS S3 ou Cloudinary avec URLs signées

---

#### Tab 5 : Historique d'activité

**Timeline complète de toutes les actions liées au patient**

**Types d'événements** :
- Création compte
- RDV créé/modifié/annulé
- Consultation réalisée
- Ordonnance générée
- Examen ajouté
- Document uploadé
- Message envoyé
- Paiement effectué
- Connexion patient à son espace

**Affichage** : Timeline verticale

**Contenu d'un événement** :
- Icône contextuelle (couleur selon type)
- Titre : "Consultation de suivi réalisée"
- Date et heure : "15/12/2025 à 14h30"
- Auteur : "Dr. Jean Dupont" ou "Patient" ou "Système"
- Description : Détails supplémentaires si applicable
- Lien : Vers l'élément concerné (RDV, consultation, etc.)

**Filtres** :
- Type d'événement : Dropdown multi-select
- Date range
- Auteur

**Pagination** : Chargement progressif (infinite scroll) ou pagination classique

---

#### Tab 6 : Notes internes

**Espace pour notes du personnel (NON visible par le patient)**

**Contenu** :
- Éditeur de texte riche (WYSIWYG)
  - Bold, Italic, Bullet lists
  - Couleurs texte
- Notes persistées automatiquement (autosave toutes les 30s)
- Historique des modifications :
  - Date
  - Auteur
  - Aperçu modification

**Cas d'usage** :
- Informations sensibles (comportement patient, conflits, etc.)
- Rappels pour le personnel
- Contexte administratif

**Sécurité** :
- Accès limité selon rôle (Admin + Médecins uniquement)
- Audit log des consultations de cette section

---

## 📈 PAGE 6 : RAPPORTS & ANALYTICS AVANCÉS

### URL
`/admin/rapports` ou `/admin/analytics`

### Objectif
Génération de rapports personnalisés et analyse approfondie des données.

### Structure détaillée

#### Section 1 : Générateur de rapports

**Formulaire** :
- Type de rapport : Dropdown
  - RDV par période
  - Taux de show-up
  - Nouveaux patients
  - Revenus par service
  - Performance médecins
  - Pathologies les plus fréquentes
  - Taux de satisfaction
  - Analyse de rentabilité
  - Rapport RGPD (donnees des patients)
- Période : Date range picker
- Filtres : Selon type de rapport (médecin, service, etc.)
- Format export : CSV / Excel / PDF / JSON
- Bouton : "Générer le rapport"

**Rapports prédéfinis** (templates) :
- Rapport mensuel d'activité
- Rapport annuel
- Rapport médecin (individuel)
- Rapport financier
- Rapport de conformité RGPD
- Rapport de sécurité (accès non autorisés)

**Fonctionnalités avancées** (CORRIGÉ: ajoutées à la priorité):
- Programmation de rapports (quotidien, hebdomadaire, mensuel)
- Abonnement à des rapports spécifiques
- Diffusion automatique par email
- Archivage des rapports générés

---

#### Section 2 : Dashboards analytiques

**Dashboard 1 : Analyse RDV**
- Graphique : Évolution RDV sur 12 mois (ligne)
- Graphique : Répartition par type (donut)
- Tableau : Top 10 jours les plus chargés
- Métrique : Délai moyen entre prise RDV et date consultation

**Dashboard 2 : Analyse patients**
- Graphique : Croissance patients (ligne)
- Graphique : Répartition par tranche d'âge (barre)
- Graphique : Répartition par genre (donut)
- Carte : Localisation patients (heatmap si données géo)

**Dashboard 3 : Analyse médicale**
- Graphique : Pathologies les plus fréquentes (barre horizontale)
- Graphique : Évolution myopie/hypermétropie (ligne)
- Tableau : Top prescriptions médicaments
- Tableau : Top verres prescrits

**Dashboard 4 : Performance**
- Tableau : Statistiques par médecin
  - Nombre consultations
  - Durée moyenne consultation
  - Taux de satisfaction patient
  - Revenus générés
- Graphique : Comparaison médecins (radar chart)

---

## 🔍 PAGE 7 : LOGS D'AUDIT

### URL
`/admin/audit-logs` ou `/admin/logs`

### Objectif
Traçabilité complète des actions pour conformité RGPD et sécurité.

### Structure détaillée

#### Section 1 : Filtres

**Filtres avancés** :
- Utilisateur : Dropdown (tous les utilisateurs)
- Action : Dropdown multi-select
  - Consultation dossier médical
  - Modification patient
  - Création RDV
  - Annulation RDV
  - Upload document
  - Download document
  - Connexion
  - Modification paramètres
  - Export données
  - Génération ordonnance
  - Accès analytics
- Type d'entité : Patient / RDV / Document / Utilisateur
- Date range : Date picker
- Niveau : Info / Warning / Critical
- Recherche textuelle : Input
- IP Address : Filtre par adresse IP
- Device Fingerprint : Filtre par empreinte appareil

**Fonctionnalités avancées** (CORRIGÉ: ajoutées pour conformité RGPD et sécurité renforcée):
- Recherche plein texte sur les détails des logs
- Export des logs (CSV, JSON, PDF)
- Surveillance en temps réel (real-time monitoring)
- Alertes automatiques (ex: "3 tentatives de connexion échouées")
- Journalisation immuable (logs d'audit avec chaînage cryptographique)

---

#### Section 2 : Liste des logs

**Affichage** : Tableau

**Colonnes** :
1. **Timestamp** : "04/01/2026 14:32:15"
2. **Utilisateur** : "Dr. Jean Dupont" (avec avatar)
3. **Action** : "Consultation dossier médical"
4. **Entité** : "Patient #DM-2026-00042 (Marie Koumba)"
5. **IP** : "192.168.1.100" (masquée partiellement)
6. **Niveau** : Badge (Info / Warning / Critical)
7. **Détails** : Icône `Eye` (ouvre modale)

**Pagination** : 50 logs par page

**Export** : Bouton "Exporter les logs" (CSV)

---

#### Section 3 : Modale Détails d'un log

**Contenu** :
- Timestamp exact (millisecondes)
- Utilisateur : Nom + Rôle + Email
- Action effectuée : Description détaillée
- Entité concernée : Lien cliquable vers l'entité
- IP source
- User Agent (navigateur, OS)
- Données modifiées : Avant / Après (si modification)
  - Affichage différentiel (highlight changements)
- Résultat : Succès / Échec
- Message d'erreur (si échec)

---

## 🎨 DESIGN SYSTEM ADMIN

### Layout

**Sidebar** (desktop) :
- Width : 260px
- Background : `bg-gray-900` (dark)
- Texte : Blanc
- Logo : Top, sur fond dark
- Menu items :
  - Height : 44px
  - Padding : `px-4 py-2`
  - Hover : `bg-gray-800`
  - Active : `bg-teal-600`, border-left blanc 3px
- Icônes : Blanc, 20px
- Collapse possible (icône hamburger) → Width 60px (icônes seules)

**Mobile** :
- Sidebar devient drawer slide-in
- Header : Hamburger + Titre page + Avatar

### Dashboard cards

**KPI Card** :
- Background : Blanc
- Border : 1px `border-gray-200`
- Border-radius : 4px
- Shadow : Niveau 1
- Padding : `p-6`
- Grain : Obligatoire
- Hover : Shadow niveau 2 (si interactive)

**Structure** :
- Icône : Top-left, circle 64px, background couleur/10
- Chiffre : Grande typo `text-3xl font-bold`, couleur contextuelle
- Label : `text-sm text-gray-500`
- Variation : `text-xs` avec icône flèche + couleur conditionnelle

### Tableaux

**Design** :
- Header : Background `bg-gray-100`, border-bottom `border-gray-300`
- Lignes : Alternées `bg-white` / `bg-gray-50`
- Hover ligne : `bg-teal-50`
- Padding cellules : `px-4 py-3`
- Font-size : `text-sm`
- Tri : Icône flèche dans header, hover cursor pointer

### Modales

**Tailles** :
- Small : max-width 400px (confirmations)
- Medium : max-width 600px (formulaires simples)
- Large : max-width 800px (formulaires complexes)
- Full : max-width 1200px (détails patients)

**Structure** :
- Overlay : Background noir/50, blur backdrop
- Contenu : Background blanc, border-radius 12px, shadow niveau 4
- Header : Padding `p-6`, border-bottom
- Body : Padding `p-6`, max-height scroll si nécessaire
- Footer : Padding `p-6`, border-top, buttons alignés right

### Graphiques

**Librairie** : Recharts (React)

**Palette couleurs** :
- Primaire : Teal (#1D9A94)
- Secondaire : Orange (#E89B6E)
- Succès : Vert (#10B981)
- Warning : Orange (#F59E0B)
- Danger : Rouge (#EF4444)
- Neutre : Gris (#6B7280)

**Configuration** :
- Axes : Couleur gris, font-size 12px
- Grid : Lignes pointillées grises claires
- Tooltips : Background blanc, shadow, border teal
- Légende : Position top ou bottom selon contexte

### Badges & Status

**Statuts RDV** :
- Confirmé : `bg-teal-100 text-teal-800`
- En cours : `bg-orange-100 text-orange-800`
- Complété : `bg-green-100 text-green-800`
- Annulé : `bg-gray-100 text-gray-800`
- No-show : `bg-red-100 text-red-800`

**Statuts paiement** :
- Payé : `bg-green-100 text-green-800`
- Impayé : `bg-red-100 text-red-800`
- Partiel : `bg-orange-100 text-orange-800`

**Design badges** :
- Padding : `px-2 py-1`
- Border-radius : 4px
- Font-size : `text-xs`
- Font-weight : Medium

---

## 🔒 SÉCURITÉ & PERMISSIONS

### Authentification admin

**Connexion** :
- URL dédiée : `/admin/login` (séparée du login public)
- Email + Mot de passe
- 2FA obligatoire pour Super Admin et Médecins (maintenant disponible, pas phase 2)
- Rate limiting strict uniformisé : 5 tentatives / 15 min (CORRIGÉ)
- Logging de toutes les tentatives
- Device fingerprinting : Suivi des appareils connus pour détection des connexions suspectes (CORRIGÉ)

**Session** :
- JWT avec expiration 8h (plus courte que patient)
- Refresh token 7 jours
- Auto-logout après 30 min d'inactivité
- Re-authentification pour actions critiques :
  - Suppression patient
  - Modification dossier médical sensible
  - Export données
  - Modification paramètres système

**Sécurité renforcée** (CORRIGÉ: mise en œuvre complète):
- Journalisation immuable des connexions/déconnexions
- Alerte en cas de connexion depuis nouvel appareil/localisation
- Possibilité de révoquer les sessions à distance

### RBAC (Role-Based Access Control)

**Middleware backend** :
- Vérification rôle sur chaque endpoint API
- Réponse 403 Forbidden si insuffisant
- CORRIGÉ: Vérification renforcée avec vérification des permissions fines (action-level)

**Frontend** :
- Masquage des éléments UI selon permissions
- Redirection si accès non autorisé
- Messages d'erreur clairs
- CORRIGÉ: Gestion des permissions côté client renforcée avec vérification serveur

**Politique de rôles mise à jour** (CORRIGÉ: rôle "opticien" correctement défini):
- Super Admin : Accès complet + gestion utilisateurs + paramètres système
- Médecin : Dossiers médicaux + consultations + prescriptions + ses RDV
- Secrétaire : Gestion RDV + patients + dossiers (lecture seule sur partie médicale)
- Opticien : Lunetterie + prescriptions lunettes + stock (pas d'accès dossiers médicaux)

**Permissions fines** (CORRIGÉ: ajoutées pour plus de granularité):
- Création patient
- Modification patient
- Consultation dossier médical
- Modification dossier médical
- Création consultation
- Modification consultation
- Génération ordonnance
- Upload document
- Download document
- Export données
- Accès analytics

### Audit & Traçabilité

**Actions auditées** :
- Consultation dossier patient (qui, quand, quelle page)
- Modification données patient
- Création/modification/suppression RDV
- Upload/download documents
- Export données
- Connexion/déconnexion
- Modification paramètres
- Actions sur utilisateurs (création, suppression, changement rôle)

**Conservation logs** :
- Durée : 5 ans (obligation légale santé)
- Stockage sécurisé
- Non modifiables (append-only)

### RGPD Compliance

**Droits patients** :
- Export complet données : Accessible via admin
- Rectification : Modification fiche patient
- Suppression/Anonymisation : Bouton "Supprimer le compte" avec workflow
  - Conservation minimale données pour conformité légale (20 ans dossiers médicaux)
  - Anonymisation complète du reste

**Consentements** :
- Historique visible dans fiche patient
- Preuve horodatée
- Révocable à tout moment

---

## 📱 RESPONSIVE ADMIN

### Mobile (< 768px)

**Navigation** :
- Sidebar → Drawer (slide-in from left)
- Header : Hamburger + Titre + Avatar
- Bottom navigation (optionnel) : 5 actions principales

**Tableaux** :
- Scroll horizontal avec shadow indicator
- OU transformation en cards empilées
- Actions : Menu 3 points condensé

**Dashboard** :
- Cards empilées verticalement (1 colonne)
- Graphiques : Ratio adapté, légendes dessous

**Formulaires** :
- Full-width inputs
- Boutons empilés verticalement

### Tablet (768px - 1023px)

**Navigation** :
- Sidebar collapse possible (60px, icônes seules)
- OU drawer persistant

**Dashboard** :
- Grid 2 colonnes

**Tableaux** :
- Affichage complet mais font-size réduit

---

## 🚀 PERFORMANCE & OPTIMISATIONS

### Chargement données

**Pagination** :
- Backend : Limite 20-50 items par page selon contexte
- Frontend : React Query avec cache
- Prefetch : Page suivante en background

**Lazy loading** :
- Graphiques : Chargés après render initial
- Images : Lazy load avec placeholder
- Modales : Code-splitting (dynamic import)

**Infinite scroll** :
- Pour logs d'audit (très nombreux)
- Pour timeline activité patient

### Cache stratégique

**React Query** :
- Cache 5 min : Dashboard stats (mise à jour fréquente)
- Cache 30 min : Liste patients (moins volatile)
- Cache 1h : Paramètres système

**Backend** :
- Redis cache pour queries lourdes (statistiques)
- Invalidation cache après mutations

### Recherche optimisée

**Elasticsearch** (recommandé Phase 2) :
- Indexation patients (nom, email, téléphone, numéro dossier)
- Recherche full-text performante
- Suggestions autocomplete
- Fuzzy matching (tolérance typos)

**Fallback** :
- PostgreSQL avec indexes sur colonnes recherchées
- Recherche ILIKE avec limite résultats

---

## 🧪 TESTS ADMIN

### Tests unitaires (Backend)

**Django Pytest** :
- Modèles : Validation, méthodes, relations
- Views/ViewSets : Permissions, réponses, filtres
- Serializers : Validation données, transformations
- Services : Logique métier (création RDV, génération PDF, etc.)

**Coverage** : > 80%

### Tests API (Backend)

**Pytest + Django REST Framework** :
- CRUD complet patients
- CRUD complet RDV
- Permissions RBAC (chaque rôle)
- Filtres et recherches
- Pagination
- Exports

### Tests E2E (Frontend)

**Playwright ou Cypress** :

**Scénarios critiques** :
1. Connexion admin → Dashboard visible
2. Recherche patient → Fiche patient
3. Création RDV manuel → RDV visible dans planning
4. Modification dossier médical → Sauvegarde persistée
5. Upload document → Document accessible
6. Export rapport → Fichier téléchargé

**Tests rôles** :
- Super Admin : Accès complet
- Médecin : Restrictions correctes (pas d'accès utilisateurs)
- Secrétaire : Restrictions correctes (pas de modification dossier médical)

### Tests accessibilité

**Axe-core** :
- Contraste texte/background
- Navigation clavier
- Labels formulaires
- Headings hiérarchie
- ARIA attributes

---

## 📊 MÉTRIQUES & MONITORING

### Métriques techniques

**Performance** :
- Temps de réponse API : < 200ms (P95)
- Temps chargement page : < 2s
- Erreurs API : < 0.5%

**Utilisation** :
- Nombre de sessions actives admin
- Endpoints les plus appelés
- Queries les plus lentes (APM)

### Métriques métier

**Activité** :
- Nombre d'actions par jour/semaine/mois
- Taux d'utilisation par fonctionnalité
- Utilisateurs les plus actifs

**Qualité** :
- Taux d'erreurs utilisateur (formulaires invalides)
- Temps moyen pour créer un RDV
- Temps moyen pour créer un dossier médical

### Alertes

**Monitoring** (Sentry, Datadog, ou similaire) :
- Erreurs 500 backend → Alerte immédiate
- Taux d'erreur > 5% → Alerte critique
- Temps réponse > 1s → Alerte warning
- Espace disque < 20% → Alerte infrastructure

---

## ✅ CRITÈRES D'ACCEPTATION MODULE 6

Ce module est validé lorsque :
- [ ] Dashboard admin affiche toutes les statistiques temps réel
- [ ] Planning médecins fonctionnel (vues jour/semaine/mois)
- [ ] Drag & drop RDV opérationnel
- [ ] Liste RDV avec filtres avancés et actions en masse
- [ ] Recherche patients performante (< 500ms)
- [ ] Fiche patient complète avec 6 tabs fonctionnels
- [ ] Création/modification consultations avec tous les champs
- [ ] Upload/download documents sécurisés
- [ ] Prescriptions générables (PDF avec signature)
- [ ] Résultats d'examens avec imagerie
- [ ] Formulaire création patient complet
- [ ] RBAC strictement appliqué (tests par rôle)
- [ ] Logs d'audit enregistrés pour toutes actions sensibles
- [ ] Exports rapports fonctionnels (CSV, Excel, PDF)
- [ ] Graphiques analytics affichés correctement
- [ ] Responsive mobile et tablet
- [ ] Accessibilité WCAG 2.1 AA validée
- [ ] Performance : Lighthouse > 85/100
- [ ] Tests unitaires passent (> 80% coverage)
- [ ] Tests E2E passent (scénarios critiques)
- [ ] Rôle "opticien" correctement implémenté (CORRIGÉ)
- [ ] Permissions fines RBAC appliquées (CORRIGÉ)
- [ ] Graphiques d'analyse avancée fonctionnels (satisfaction, rentabilité)
- [ ] Export des données brutes (CSV) disponible dans analytics
- [ ] Programmation et diffusion automatique des rapports
- [ ] Surveillance en temps réel des logs d'audit
- [ ] Alertes automatiques configurables
- [ ] Journalisation immuable des actions sensibles (logs d'audit blockchain-light)
- [ ] Filtres avancés sur les logs d'audit (IP, Device Fingerprint)

---

## 📄 PROCHAINES ÉTAPES

Une fois Module 6 validé, passage à :
- **Module 7** : Admin - Gestion Lunetterie & Stock
  - Catalogue produits (montures, verres)
  - Gestion inventaire temps réel
  - Alertes rupture stock
  - Commandes lunetterie
  - Statistiques ventes
  - Fournisseurs

---

**Document créé le** : 04 janvier 2026  
**Version** : 1.0  
**Statut** : En attente de validation  
**Auteur** : Équipe projet VIDA