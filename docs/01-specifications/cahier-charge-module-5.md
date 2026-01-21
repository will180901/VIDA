# 📋 CAHIER DES CHARGES - CENTRE MÉDICAL VIDA
## Module 5 : Espace Patient - Dashboard & Dossier Médical

---

## 🎯 OBJECTIF DU MODULE

Créer un espace personnel complet permettant aux patients de :
- Visualiser l'ensemble de leur parcours de soins
- Accéder à leur dossier médical numérique 24/7
- Consulter prescriptions et ordonnances
- Télécharger résultats d'examens
- Gérer leurs documents médicaux
- Suivre leur historique de consultations
- Accéder à leurs notifications
- Bénéficier du programme de fidélité (Phase 2)

**Priorités** :
- **Accessibilité** : Informations médicales disponibles partout, tout le temps
- **Sécurité** : Protection maximale des données de santé
- **Clarté** : Organisation intuitive du dossier médical
- **Autonomie** : Patient acteur de sa santé

---

## 🏗️ ARCHITECTURE ESPACE PATIENT

### Architecture PWA Offline-First (CORRIGÉ: implémenté comme prioritaire)

**Stratégie de cache multi-niveaux** :
- Cache API : Données utilisateur (profil, RDV, dossiers médicaux)
- Cache assets : Images, documents médicaux, fichiers statiques
- Cache hors-ligne : Pages critiques (dashboard, RDV, profil)

**Données synchronisées hors-ligne** :
- Profil patient
- RDV à venir et historique
- Dossier médical complet
- Prescriptions et ordonnances
- Documents médicaux
- Notifications

**Fonctionnalités disponibles hors-ligne** :
- Consultation des RDV
- Consultation du dossier médical
- Téléchargement de documents
- Mise à jour du profil (stocké en attente de synchro)
- Actions en attente (annulation RDV, messages)

**Stratégie de synchronisation** :
- Sync automatique au retour en ligne
- Résolution des conflits
- Notifications de statut hors-ligne/en ligne

### Structure de navigation

**Layout principal** :
- **Sidebar gauche** (desktop) ou **Menu hamburger** (mobile)
  - Dashboard (icône `Home`)
  - Mes rendez-vous (icône `Calendar`)
  - Mon dossier médical (icône `FileText`)
  - Mes documents (icône `FolderOpen`)
  - Notifications (icône `Bell` + badge compteur)
  - Programme fidélité (icône `Gift`, Phase 2)
  - Mon profil (icône `User`)
  - Paramètres (icône `Settings`)
  - Déconnexion (icône `LogOut`)

- **Header top** :
  - Logo VIDA (lien vers accueil public)
  - Fil d'ariane (breadcrumb)
  - Icône notifications (avec dropdown)
  - Avatar patient + menu dropdown

- **Zone de contenu principale** :
  - Titre de la page actuelle
  - Contenu dynamique selon section

### Permissions & Sécurité

**Accès** :
- Authentification obligatoire (redirection si non connecté)
- JWT valide requis
- Vérification email confirmé (sinon banner d'avertissement)

**Audit** :
- Toute consultation de dossier médical loguée
- Traçabilité : Qui, Quand, Quelle information

---

## 📊 PAGE 1 : DASHBOARD PATIENT

### URL
`/dashboard` ou `/patient/dashboard`

### Objectif
Vue d'ensemble rapide de l'état de santé et des actions à faire.

### Structure détaillée

#### Section 1 : Header Dashboard

**Contenu** :
- Message de bienvenue personnalisé : "Bonjour [Prénom] !" (grande typo, Poppins Bold)
- Date du jour : "Nous sommes le dimanche 04 janvier 2026"
- Météo locale (optionnel) : "Brazzaville, 28°C ☀️"
- Illustration : `dashboard.svg` (coin supérieur droit)

**Design** :
- Background : Dégradé subtil `from-teal-50 to-white`
- Grain obligatoire
- Padding : `py-8 px-6`

---

#### Section 2 : Cartes de statistiques rapides (Quick Stats)

**Layout** : Grid 4 colonnes desktop, 2 colonnes tablet, 1 colonne mobile

**Carte 1 : Prochain rendez-vous**
- Icône : `Calendar` (grande, teal, circle background teal/10)
- Titre : "Prochain RDV"
- Contenu :
  - Si RDV à venir : 
    - Date : "Lundi 06 janvier"
    - Heure : "09h30"
    - Type : "Consultation"
    - Countdown : "Dans 2 jours"
  - Si aucun RDV : 
    - Message : "Aucun RDV prévu"
    - Bouton : "Prendre RDV"
- Actions :
  - Lien : "Voir les détails" → Page RDV

**Carte 2 : Consultations cette année**
- Icône : `Activity` (orange)
- Titre : "Consultations 2026"
- Contenu :
  - Chiffre : "3 consultations"
  - Sous-texte : "Dernière : 15 déc. 2025"
- Actions :
  - Lien : "Voir l'historique" → Dossier médical

**Carte 3 : Documents récents**
- Icône : `FileText` (teal)
- Titre : "Documents"
- Contenu :
  - Chiffre : "5 documents"
  - Sous-texte : "2 nouveaux"
  - Badge : "Nouveau" (si documents non vus)
- Actions :
  - Lien : "Consulter" → Mes documents

**Carte 4 : Points fidélité** (Phase 2)
- Icône : `Gift` (orange)
- Titre : "Points VIDA"
- Contenu :
  - Chiffre : "450 points"
  - Progression : Barre vers prochain palier
  - Sous-texte : "50 points pour 1 consultation gratuite"
- Actions :
  - Lien : "Voir mes récompenses" → Programme fidélité

**Design cartes** :
- Background : Blanc
- Border-radius : 4px
- Shadow : Niveau 1
- Hover : Shadow niveau 2, légère élévation
- Padding : `p-6`
- Icônes : 48px dans circle 64px
- Gap : `gap-6`

---

#### Section 3 : Timeline des prochaines actions

**Titre** : "À venir" ou "Mes prochaines actions"

**Contenu** : Liste chronologique des événements à venir

**Types d'événements** :
1. **Rendez-vous à venir**
   - Icône : `Calendar` (teal)
   - Date : "Lundi 06 janvier 2026, 09h30"
   - Titre : "Consultation ophtalmologique"
   - Médecin : "Dr. Dupont"
   - Lieu : "Centre VIDA, Moungali"
   - Actions :
     - Bouton : "Voir les détails"
     - Bouton : "Modifier"
     - Lien : "Ajouter au calendrier"

2. **Rappel suivi médical**
   - Icône : `Bell` (orange)
   - Date : "Février 2026"
   - Titre : "Contrôle de routine recommandé"
   - Description : "Il est temps de faire votre contrôle annuel"
   - Action :
     - Bouton : "Prendre RDV"

3. **Ordonnance à renouveler**
   - Icône : `Pill` (teal)
   - Date : "Mars 2026"
   - Titre : "Renouvellement ordonnance lunettes"
   - Description : "Votre ordonnance expire bientôt"
   - Action :
     - Bouton : "Prendre RDV"

4. **Document à consulter**
   - Icône : `FileText` (orange)
   - Date : "Aujourd'hui"
   - Titre : "Nouveau résultat d'examen disponible"
   - Badge : "Nouveau" (rouge)
   - Action :
     - Bouton : "Consulter"

**Design** :
- Layout : Liste verticale avec ligne de temps à gauche
- Chaque événement : Card horizontale
- Ligne de temps : Points connectés par ligne verticale teal
- Point actif (événement proche) : Plus large, pulsant
- Empty state (si aucun événement) :
  - Illustration : `no_data.svg`
  - Message : "Aucune action prévue pour le moment"
  - Bouton : "Prendre rendez-vous"

---

#### Section 4 : Résumé du dossier médical

**Titre** : "Mon état de santé en un coup d'œil"

**Contenu** : Cards informatives compactes

**Card 1 : Dernière consultation**
- Date : "15 décembre 2025"
- Médecin : "Dr. Dupont"
- Diagnostic : "Myopie -2.5 (OD) / -2.0 (OG)"
- Lien : "Voir le compte-rendu complet"

**Card 2 : Ordonnances actives**
- Liste :
  - "Lunettes correctrices (valide jusqu'au 15/12/2027)"
  - "Gouttes oculaires (traitement terminé)"
- Lien : "Voir toutes mes ordonnances"

**Card 3 : Allergies & Antécédents**
- Si renseigné :
  - Liste des allergies connues
  - Antécédents médicaux importants
- Si non renseigné :
  - Message : "Aucune allergie renseignée"
  - Lien : "Compléter mon profil médical"

**Design** :
- Grid : 3 colonnes desktop, 1 colonne mobile
- Cards : Background `bg-gray-50`, grain
- Icônes : Petites (24px)

---

#### Section 5 : Raccourcis rapides

**Titre** : "Actions rapides"

**Contenu** : Boutons d'action fréquents

**Boutons** (layout horizontal, wrap mobile) :
1. "Prendre rendez-vous" (icône `CalendarPlus`, primaire teal)
2. "Télécharger mes documents" (icône `Download`, secondaire)
3. "Contacter le centre" (icône `Phone`, secondaire)
4. "Renouveler une ordonnance" (icône `RefreshCw`, secondaire)

**Design** :
- Boutons : Large padding, icône + texte
- Gap : `gap-4`

---

#### Section 6 : Conseils santé personnalisés (Optionnel Phase 2)

**Titre** : "Conseils pour vous"

**Contenu** : Cards de conseils générés par IA ou prédéfinis

**Exemples** :
- "Saviez-vous que 20 minutes d'écran = 20 secondes de pause pour vos yeux ?"
- "N'oubliez pas de faire contrôler votre tension oculaire tous les ans après 40 ans"
- "Les lunettes de soleil protègent aussi de la cataracte !"

**Design** :
- Carrousel ou grid 2 colonnes
- Cards : Background dégradé léger, icône illustrative
- CTA : "En savoir plus" → Article de blog

---

## 📅 PAGE 2 : MES RENDEZ-VOUS

### URL
`/patient/rendez-vous` ou `/patient/appointments`

### Objectif
Vue complète et détaillée de tous les rendez-vous (passés, à venir, annulés).

### Structure détaillée

#### Section 1 : Onglets (Tabs)

**3 onglets** :
1. **À venir** (badge compteur : nombre de RDV)
2. **Historique** (tous les RDV passés)
3. **Annulés** (RDV annulés, conservés 6 mois)

**Design** :
- Tabs horizontaux sticky (reste visible au scroll)
- Active state : Teal, underline épaisse
- Inactive : Gris, hover teal/20

---

#### Onglet 1 : Rendez-vous à venir

**Filtres** :
- Recherche par type de consultation (dropdown)
- Tri : Date croissante / décroissante

**Affichage** : Cards détaillées

**Contenu d'une card RDV à venir** :
- **Header card** :
  - Badge statut : "Confirmé" (vert) / "En attente de paiement" (orange) / "À confirmer" (bleu)
  - Numéro RDV : "#VIDA-2026-00042"
  - Menu 3 points (dropdown actions)
- **Corps card** :
  - Date : Grande, bold, teal : "Lundi 06 janvier 2026"
  - Heure : "09h30 - 10h20"
  - Durée : "45 minutes"
  - Type : "Première consultation ophtalmologique"
  - Médecin : Photo/Avatar + "Dr. Jean Dupont"
  - Lieu : "Centre VIDA, 08 Bis rue Mboko, Moungali"
  - Countdown : "Dans 2 jours" (avec icône `Clock`)
- **Footer card (actions)** :
  - Bouton primaire : "Voir les détails" (modale ou page dédiée)
  - Bouton secondaire : "Modifier" (si > 24h avant)
  - Bouton tertiaire : "Annuler" (rouge, outline)
  - Icône : "Ajouter au calendrier" (.ics download)
  - Icône : "Partager" (copie lien ou partage)

**Design** :
- Cards : Empilées verticalement
- Spacing : `space-y-4`
- Hover : Légère élévation
- RDV dans < 24h : Border orange, badge "Bientôt"

**Modale "Détails du RDV"** (si clic "Voir les détails") :
- Récapitulatif complet (toutes infos)
- Motif de consultation
- Instructions pré-consultation
- Carte Google Maps interactive (itinéraire)
- Documents à apporter (checklist)
- Boutons d'action (modifier, annuler, calendrier)

**Empty state** (aucun RDV à venir) :
- Illustration : `calendar.svg`
- Message : "Vous n'avez aucun rendez-vous prévu"
- Sous-texte : "Prenez rendez-vous dès maintenant pour un suivi régulier de votre santé visuelle"
- Bouton : "Prendre rendez-vous"

---

#### Onglet 2 : Historique

**Filtres avancés** :
- Plage de dates (date picker range)
- Type de consultation (dropdown multi-select)
- Médecin (dropdown)
- Statut : Complété / Absence
- Bouton : "Réinitialiser les filtres"

**Tri** :
- Date décroissante (par défaut : plus récent en premier)
- Date croissante
- Type de consultation

**Affichage** : Tableau ou cards (toggle vue)

**Contenu d'une card RDV passé** :
- Badge statut : "Complété" (vert) / "Absence" (rouge/gris)
- Date : "15 décembre 2025"
- Heure : "14h00"
- Type : "Consultation de suivi"
- Médecin : "Dr. Dupont"
- Durée effective : "35 minutes" (si tracée)
- **Actions disponibles** :
  - Icône `FileText` : "Compte-rendu" (si disponible) → Modale ou PDF
  - Icône `Pill` : "Ordonnance" (si disponible) → Télécharger PDF
  - Icône `FileImage` : "Résultats examens" (si disponibles) → Liste documents
  - Bouton : "Reprendre RDV" (même type consultation)

**Pagination** :
- 10 RDV par page
- Navigation : Précédent / Suivant + numéros pages

**Empty state** :
- Illustration : `no_data.svg`
- Message : "Aucune consultation dans l'historique"

---

#### Onglet 3 : Annulés

**Affichage** : Liste simple

**Contenu** :
- Date annulation : "Annulé le 02 janvier 2026"
- RDV initial : "Lundi 06 janvier 2026, 09h30"
- Type : "Première consultation"
- Raison annulation : "Indisponibilité patient" (si fournie)
- Frais éventuels : "Frais d'annulation : 5 000 FCFA" (si < 24h)
- Action : "Reprendre RDV"

**Rétention** : Données conservées 6 mois puis archivées

---

## 🏥 PAGE 3 : MON DOSSIER MÉDICAL

### URL
`/patient/dossier-medical` ou `/patient/medical-record`

### Objectif
Accès complet au dossier médical numérique sécurisé.

### Structure détaillée

#### Section 1 : Header du dossier

**Contenu** :
- Titre H1 : "Mon Dossier Médical"
- Sous-titre : "Numéro de dossier : **#DM-2026-00042**"
- Date d'ouverture dossier : "Ouvert le 23 décembre 2025"
- Badge : "Dossier à jour" (vert) ou "Informations manquantes" (orange)

**Call-out sécurité** :
- Icône : `Lock` (cadenas)
- Message : "Vos données médicales sont chiffrées et sécurisées. Seuls vous et le personnel médical autorisé y avez accès."
- Lien : "En savoir plus sur la sécurité"

**Sécurité renforcée** (CORRIGÉ: mise en œuvre du chiffrement E2E):
- Chiffrement E2E pour les données médicales sensibles
- Champs chiffrés pour les antécédents médicaux, allergies et traitements
- Journalisation immuable des accès au dossier (logs d'audit avec chaînage cryptographique)
- Traçabilité complète : qui, quand, quelle information consultée

**Actions** :
- Bouton : "Exporter mon dossier" (télécharge PDF complet)
- Bouton : "Demander une copie papier" (formulaire contact admin)

---

#### Section 2 : Navigation interne (Sous-menu)

**Tabs verticaux (sidebar) ou horizontaux (mobile)** :
1. Vue d'ensemble
2. Consultations
3. Prescriptions
4. Résultats d'examens
5. Allergies & Antécédents
6. Vaccinations (si applicable)
7. Documents divers

---

#### Tab 1 : Vue d'ensemble

**Résumé du dossier** : Synthèse des informations clés

**Section A : Informations personnelles**
- Nom complet
- Date de naissance (+ âge calculé)
- Genre
- Groupe sanguin (si renseigné)
- Contact d'urgence

**Section B : Résumé médical**

**Card "Diagnostic principal actuel"** :
- Si myopie/astigmatisme/hypermétropie :
  - Œil droit (OD) : Correction actuelle
  - Œil gauche (OG) : Correction actuelle
  - Date dernière mesure
- Graphique évolution (si plusieurs mesures dans le temps)

**Card "Pathologies diagnostiquées"** :
- Liste : Glaucome, Cataracte, Dégénérescence maculaire, etc.
- Statut : En traitement / Sous surveillance / Guéri
- Date diagnostic

**Card "Traitements en cours"** :
- Liste :
  - Nom médicament
  - Posologie
  - Date début - Date fin
  - Renouvellement : "À renouveler le 15/02/2026"
- Empty state : "Aucun traitement en cours"

**Section C : Derniers événements médicaux**

Timeline des 5 derniers événements :
- Consultation du 15/12/2025
- Ordonnance lunettes du 15/12/2025
- Résultat fond d'œil du 15/12/2025
- Consultation du 10/09/2025
- Dépistage glaucome du 10/09/2025

---

#### Tab 2 : Consultations

**Liste complète des consultations** (plus détaillée que "Mes RDV")

**Filtres** :
- Date (range)
- Médecin
- Type de consultation

**Affichage** : Cards expandables (accordion)

**Header card (collapsed)** :
- Date : "15 décembre 2025"
- Type : "Consultation de suivi"
- Médecin : "Dr. Jean Dupont"
- Icône expand : `ChevronDown`

**Contenu card (expanded)** :
- **Motif de consultation** : Texte libre patient
- **Symptômes rapportés** : Liste checkboxes cochées
- **Examen clinique** : Notes médecin
  - Acuité visuelle : OD X/10, OG X/10
  - Réfraction : Mesures détaillées
  - Tension oculaire : OD X mmHg, OG X mmHg
  - Fond d'œil : Observations
- **Diagnostic** : Texte médecin
- **Traitement prescrit** : Liste médicaments/lunettes
- **Recommandations** : Conseils médecin
- **Prochain RDV recommandé** : "Contrôle dans 6 mois"
- **Documents associés** :
  - Lien : Ordonnance PDF
  - Lien : Résultats examens
  - Lien : Imagerie (si applicable)

**Sécurité et conformité** (CORRIGÉ: journalisation renforcée):
- Accès tracé dans les logs d'audit
- Horodatage de la consultation
- Identification du professionnel ayant accédé
- Chiffrement des notes médicales

**Actions** :
- Bouton : "Télécharger le compte-rendu" (PDF)
- Bouton : "Reprendre un RDV de suivi"
- Icône : "Imprimer"

**Pagination** : 5 consultations par page

---

#### Tab 3 : Prescriptions & Ordonnances

**Liste de toutes les ordonnances** (médicaments + lunettes)

**Filtres** :
- Type : Médicaments / Lunettes / Tout
- Statut : Active / Expirée / Terminée
- Date (range)

**Affichage** : Cards

**Contenu d'une card ordonnance** :
- **Header** :
  - Badge statut : "Active" (vert) / "Expire bientôt" (orange) / "Expirée" (rouge)
  - Type : "Ordonnance lunettes" ou "Ordonnance médicament"
  - Date : "Prescrite le 15/12/2025"
- **Corps** :
  - Médecin prescripteur : "Dr. Dupont"
  - Si lunettes :
    - Œil droit : Sphère, Cylindre, Axe, Addition
    - Œil gauche : Sphère, Cylindre, Axe, Addition
    - Type verres : Unifocaux / Progressifs / Solaires
    - Traitements : Anti-reflets, Anti-rayures, etc.
  - Si médicament :
    - Nom médicament
    - Posologie : "2 gouttes 3 fois par jour"
    - Durée : "30 jours"
  - Date validité : "Valide jusqu'au 15/12/2027"
  - Statut renouvellement : "Renouvelable" / "Non renouvelable"
- **Actions** :
  - Bouton : "Télécharger PDF"
  - Bouton : "Imprimer"
  - Bouton : "Commander lunettes" (si ordonnance lunettes) → Lunetterie
  - Bouton : "Renouveler" (si proche expiration et renouvelable)

**Alerte intelligente** :
- Si ordonnance expire dans < 30 jours :
  - Banner orange en haut de page
  - Message : "Une ordonnance expire bientôt"
  - Action : "Prendre RDV pour renouvellement"

---

#### Tab 4 : Résultats d'examens

**Liste de tous les examens passés**

**Types d'examens** :
- Fond d'œil
- Champ visuel
- OCT (Tomographie en cohérence optique)
- Pachymétrie
- Topographie cornéenne
- Autres examens spécialisés

**Filtres** :
- Type examen
- Date (range)
- Médecin

**Affichage** : Cards avec prévisualisation

**Contenu d'une card examen** :
- **Header** :
  - Type : "Fond d'œil"
  - Date : "15 décembre 2025"
  - Badge : "Nouveau" (si non consulté)
- **Corps** :
  - Médecin : "Dr. Dupont"
  - Résultat synthétique : "Normal" / "Anomalie détectée" / "Surveillance nécessaire"
  - Icône statut : Checkmark vert / Warning orange / Alert rouge
  - Si imagerie : Thumbnail de l'image
  - Compte-rendu court : Premier paragraphe (truncate)
- **Actions** :
  - Bouton : "Voir le résultat complet" (modale ou page)
  - Bouton : "Télécharger PDF"
  - Icône : "Partager" (avec professionnel de santé externe si besoin)

**Modale "Résultat complet"** :
- Titre : Type examen + Date
- Médecin examinateur
- Compte-rendu détaillé (texte formaté)
- Images haute résolution (si applicable)
  - Zoom + pan
  - Comparaison avec examens précédents (slider avant/après)
- Interprétation médecin
- Recommandations
- Actions : Télécharger, Imprimer, Partager

---

#### Tab 5 : Allergies & Antécédents

**Section A : Allergies connues**

Si allergies renseignées :
- Liste :
  - Nom allergène : "Pénicilline"
  - Type réaction : "Éruption cutanée"
  - Sévérité : Badge "Modérée" (orange) / "Sévère" (rouge) / "Légère" (jaune)
  - Date découverte : "2010"
- Action : "Modifier" (lien vers profil)

Si aucune allergie :
- Message : "Aucune allergie renseignée"
- Call-out : "Il est important de renseigner vos allergies pour votre sécurité"
- Bouton : "Ajouter une allergie"

**Section B : Antécédents médicaux**

**Antécédents ophtalmologiques** :
- Chirurgie oculaire : Type + Date
- Traumatisme oculaire : Description + Date
- Pathologies passées : Conjonctivite, Orgelet, etc.

**Antécédents généraux** :
- Diabète : Type + Depuis quand + Contrôle
- Hypertension : Depuis quand + Traitement
- Maladies cardiovasculaires
- Autres pathologies chroniques

**Antécédents familiaux** :
- Glaucome familial : Lien de parenté
- Cataracte précoce
- Autres pathologies oculaires héréditaires

**Actions** :
- Bouton : "Compléter mes antécédents" → Formulaire structuré

---

#### Tab 6 : Vaccinations (Optionnel)

Si clinique propose vaccinations :
- Liste vaccins reçus :
  - Nom vaccin
  - Date administration
  - Lot
  - Prochain rappel
- Calendrier vaccinal

Sinon, tab masqué.

---

#### Tab 7 : Documents divers

**Stockage de documents uploadés par patient ou admin**

**Catégories** :
- Certificats médicaux
- Arrêts de travail
- Attestations
- Courriers médicaux
- Imagerie externe (apportée par patient)
- Autres

**Affichage** : Liste ou grille avec icônes de type fichier

**Contenu d'une card document** :
- Icône type fichier : PDF, JPEG, PNG, etc.
- Nom fichier
- Taille : "1.2 MB"
- Catégorie
- Date upload : "Ajouté le 15/12/2025"
- Ajouté par : "Dr. Dupont" ou "Moi"
- Actions :
  - Bouton : "Télécharger"
  - Icône : "Prévisualiser" (lightbox)
  - Icône : "Supprimer" (si uploadé par patient)

**Upload de documents** :
- Bouton : "Ajouter un document" (top right)
- Modale upload :
  - Drag & drop zone
  - Sélection fichier
  - Champs :
    - Nom document
    - Catégorie (dropdown)
    - Description (optionnel)
  - Formats acceptés : PDF, JPEG, PNG (max 10 MB)
  - Bouton : "Upload"

**Stockage sécurisé** :
- Fichiers chiffrés
- URL signées temporaires pour téléchargement
- Scan antivirus automatique

---

## 🔔 PAGE 4 : NOTIFICATIONS

### URL
`/patient/notifications`

### Objectif
Centre de notifications pour toutes les communications VIDA.

### Structure

#### Section 1 : Filtres & Paramètres

**Filtres** :
- Toutes (par défaut)
- Non lues (badge compteur)
- Rendez-vous
- Documents
- Messages
- Promotions

**Actions** :
- Bouton : "Tout marquer comme lu"
- Icône : "Paramètres notifications" → Page paramètres

---

#### Section 2 : Liste des notifications

**Affichage** : Liste chronologique (plus récentes en haut)

**Types de notifications** :

**1. Confirmation RDV**
- Icône : `Calendar` (cercle teal)
- Titre : "Rendez-vous confirmé"
- Message : "Votre RDV du 06/01/2026 à 09h30 est confirmé"
- Date : "Il y a 2 heures"
- Statut : Badge "Non lu" (point bleu) ou déjà lu (pas de badge)
- Action : "Voir les détails" → Page RDV

**2. Rappel RDV**
- Icône : `Bell` (orange)
- Titre : "Rappel : RDV demain"
- Message : "N'oubliez pas votre RDV demain à 09h30 avec Dr. Dupont"
- Date : "Il y a 1 jour"
- Action : "Confirmer ma présence"

**3. Nouveau document disponible**
- Icône : `FileText` (teal)
- Titre : "Nouveau document disponible"
- Message : "Votre ordonnance du 15/12/2025 est disponible"
- Badge : "Nouveau"
- Date : "Il y a 3 jours"
- Action : "Consulter" → Document

**4. Résultat examen**
- Icône : `Activity` (teal)
- Titre : "Résultat d'examen disponible"
- Message : "Les résultats de votre fond d'œil sont disponibles"
- Badge : "Important"
- Date : "Il y a 5 jours"
- Action : "Voir le résultat"

**5. Message du centre**
- Icône : `MessageCircle` (orange)
- Titre : "Message de VIDA"
- Message : "Le centre sera fermé le 01/01/2026 (jour férié)"
- Date : "Il y a 1 semaine"
- Action : "Voir le message"

**6. Promotion / Newsletter**
- Icône : `Gift` (orange)
- Titre : "Offre spéciale lunettes"
- Message : "-10% sur toute la collection printemps"
- Badge : "Promo"
- Date : "Il y a 2 semaines"
- Action : "Voir l'offre" → Lunetterie

**Design** :
- Card par notification
- Non lue : Background teal/5, border-left teal 3px
- Lue : Background blanc, opacity 70%
- Hover : Background teal/10
- Clic : Marque comme lue + action

**Pagination** : 20 notifications par page

**Empty state** :
- Illustration : `inbox.svg`
- Message : "Aucune notification"
- Sous-texte : "Vous serez averti ici de toute activité importante"

---

#### Section 3 : Paramètres notifications (Sous-page)

**URL** : `/patient/notifications/parametres`

**Contenu** : Contrôle granulaire des notifications

**Catégorie 1 : Rendez-vous**
- Toggle : Confirmation RDV (Email / SMS)
- Toggle : Rappels RDV 48h (Email / SMS)
- Toggle : Rappels RDV 24h (Email / SMS)
- Toggle : Modification RDV (Email / SMS)
- Toggle : Annulation RDV (Email / SMS)

**Catégorie 2 : Dossier médical**
- Toggle : Nouveau document (Email / Notification app)
- Toggle : Résultat examen (Email / SMS / Notification)
- Toggle : Ordonnance à renouveler (Email)

**Catégorie 3 : Communications**
- Toggle : Messages du centre (Email / Notification)
- Toggle : Newsletter santé (Email, hebdomadaire)
- Toggle : Conseils personnalisés (Email, mensuel)

**Catégorie 4 : Promotions**
- Toggle : Offres lunetterie (Email)
- Toggle : Programme fidélité (Email / Notification)

**Catégorie 5 : Notifications push (si app mobile Phase 3)**
- Toggle général : Activer/Désactiver toutes les push

**Bouton** : "Enregistrer les préférences"

---

## 🎁 PAGE 5 : PROGRAMME FIDÉLITÉ (Phase 2 - Optionnel)

### URL
`/patient/fidelite` ou `/patient/rewards`

### Objectif
Gamification et fidélisation des patients.

### Système de points

**Gains de points** :
- Consultation : +50 points
- Consultation de suivi : +30 points
- Achat lunetterie : +1 point par 1000 FCFA dépensés
- Parrainage ami : +100 points (si ami prend RDV)
- Avis Google : +20 points
- Complétion profil : +10 points

**Utilisation des points** :
- 500 points = Consultation gratuite (économie 10 000 FCFA)
- 300 points = -50% consultation suivante
- 200 points = -20% lunetterie
- 100 points = Examen gratuit (dépistage)

### Structure page

#### Section 1 : Header fidélité

**Contenu** :
- Illustration : `gift.svg` ou `loyalty.svg`
- Titre : "Mon Programme VIDA"
- Solde actuel : **450 points** (très grande typo, colorée)
- Badge niveau : "Bronze" / "Argent" / "Or" / "Platine"
- Barre de progression vers niveau supérieur
  - Texte : "50 points pour passer au niveau Argent"

**Design** :
- Background : Dégradé selon niveau
  - Bronze : Orange doux
  - Argent : Gris clair brillant
  - Or : Jaune doré
  - Platine : Bleu/violet

---

#### Section 2 : Gagner des points

**Titre** : "Comment gagner des points ?"

**Cards actions** (grid 3 colonnes) :

**Card 1 : Consultations**
- Icône : `Calendar`
- Points : "+50 points"
- Action : "Prendre RDV"
- Note : "Par consultation complétée"

**Card 2 : Achats lunetterie**
- Icône : `Glasses`
- Points : "+1 point / 1000 FCFA"
- Action : "Voir la boutique"

**Card 3 : Parrainage**
- Icône : `Users`
- Points : "+100 points"
- Action : "Inviter un ami"
- Note : "Votre ami bénéficie aussi de 50 points"

**Card 4 : Compléter profil**
- Icône : `User`
- Points : "+10 points"
- Statut : "Fait" (checkmark vert) ou "À faire"
- Action : "Compléter"

**Card 5 : Laisser un avis**
- Icône : `Star`
- Points : "+20 points"
- Action : "Laisser un avis"
- Note : "Avis Google vérifié"

---

#### Section 3 : Mes récompenses disponibles

**Titre** : "Mes récompenses"

**Filtres** :
- Toutes
- Disponibles (assez de points)
- Bientôt disponibles (proche du seuil)
- Utilisées

**Affichage** : Cards récompenses

**Contenu d'une card récompense** :
- Image illustrative
- Titre : "Consultation gratuite"
- Description : "Une consultation complète offerte"
- Coût : "500 points" (badge)
- Économie : "Valeur : 10 000 FCFA"
- Statut :
  - Si assez de points : Bouton "Échanger" (actif)
  - Sinon : Bouton disabled + "Il vous manque X points"
- Validité : "Valable 6 mois après échange"

**Modale "Échanger des points"** :
- Confirmation : "Voulez-vous échanger 500 points contre une consultation gratuite ?"
- Avertissement : "Cette action est irréversible"
- Bouton : "Confirmer l'échange"
- Après confirmation :
  - Déduction points
  - Génération code promo unique
  - Envoi email avec code
  - Notification : "Récompense débloquée !"

---

#### Section 4 : Historique des points

**Tableau ou liste** :

**Colonnes** :
- Date : "15/12/2025"
- Action : "Consultation de suivi"
- Points : "+30" (vert) ou "-500" (rouge si échange)
- Solde après : "450 points"

**Filtres** :
- Gains uniquement
- Dépenses uniquement
- Date range

**Export** : Bouton "Télécharger l'historique" (CSV)

---

#### Section 5 : Code parrainage

**Contenu** :
- Titre : "Invitez vos proches"
- Code unique : **VIDA-JEAN-2026** (grande typo, copiable)
- Bouton : "Copier le code" (clipboard)
- Boutons partage :
  - WhatsApp : "Partager sur WhatsApp"
  - Email : "Envoyer par email"
  - SMS : "Envoyer par SMS"
- Message prédéfini :
  "Bonjour, je te recommande le Centre VIDA pour tes soins oculaires. Utilise mon code VIDA-JEAN-2026 pour bénéficier de 50 points de bienvenue ! 🎁"

**Statistiques parrainage** :
- Nombre d'amis parrainés : "3 amis"
- Points gagnés via parrainage : "300 points"

---

## ⚙️ PAGE 6 : MON PROFIL & PARAMÈTRES

### URL
`/patient/profil`

### Structure

#### Section 1 : Informations personnelles

(Identique à Module 3, mais intégré ici)

- Voir/Éditer : Nom, Email, Téléphone, Date naissance, Genre, Adresse
- Upload photo de profil
- Modification mot de passe

---

#### Section 2 : Informations médicales

**Formulaire structuré** (optionnel mais recommandé) :
- Groupe sanguin (dropdown)
- Taille / Poids (pour calcul IMC si pertinent)
- Allergies (textarea + suggestions)
- Traitements en cours (liste dynamique)
- Antécédents familiaux (checkboxes + texte libre)
- Contact médecin traitant (externe)
  - Nom
  - Téléphone
  - Email

**Confidentialité** :
- Message : "Ces informations ne seront partagées qu'avec le personnel médical de VIDA"
- Badge : "Sécurisé" avec icône cadenas

---

#### Section 3 : Préférences

- Langue interface (dropdown : Français, Lingala, Kikongo) - Phase 2
- Format date (JJ/MM/AAAA ou MM/JJ/AAAA)
- Fuseau horaire (par défaut : Africa/Brazzaville)
- Notifications (lien vers page Notifications/Paramètres)

---

#### Section 4 : Sécurité & Confidentialité

- Historique connexions :
  - Date/Heure dernière connexion
  - Appareil
  - Localisation (si disponible)
  - IP (masquée partiellement)
- Sessions actives :
  - Liste appareils connectés
  - Bouton : "Déconnecter toutes les sessions sauf celle-ci"
- 2FA : Toggle activer/désactiver (maintenant disponible, pas phase 2)
- Bouton : "Télécharger mes données" (RGPD, génère ZIP)
- Bouton : "Supprimer mon compte" (Danger zone, rouge)

**Sécurité renforcée** (CORRIGÉ: mise en œuvre complète):
- Device fingerprinting : Suivi des appareils connus pour détection des connexions suspectes
- Journalisation immuable des actions sensibles
- Alerte en cas de connexion depuis nouvel appareil/localisation
- Historique des modifications de profil

---

#### Section 5 : Préférences de communication

**Déjà détaillée dans Notifications/Paramètres, raccourci ici**

---

## 🎨 DESIGN SYSTEM ESPACE PATIENT

### Layout principal

**Sidebar** (desktop) :
- Width : 240px fixe
- Background : Blanc
- Border-right : 1px gray-200
- Logo VIDA : Top, 48px height
- Menu items : Vertical list
  - Height : 44px par item
  - Padding : `px-4 py-2`
  - Hover : Background teal/10
  - Active : Background teal/20, border-left teal 3px
- User section : Bottom sticky
  - Avatar + Nom
  - Badge niveau fidélité
  - Déconnexion

**Mobile** :
- Sidebar devient drawer (slide-in from left)
- Header : Hamburger menu (left) + Logo (center) + Avatar (right)

### Cards standards

**Default card** :
- Background : Blanc
- Border : 1px gray-100
- Border-radius : 4px
- Shadow : Niveau 1
- Padding : `p-6`
- Hover : Shadow niveau 2 (si interactive)
- Grain : Obligatoire (opacity 15%)

**Card avec header** :
- Header : Background `bg-gray-50`, border-bottom gray-200
- Padding header : `px-6 py-4`
- Titre : `text-lg font-semibold`

### Badges & Status

**Statut RDV** :
- Confirmé : Background vert, texte blanc
- En attente : Background orange, texte blanc
- Annulé : Background rouge, texte blanc
- Complété : Background vert clair, texte vert foncé

**Statut document** :
- Nouveau : Background rouge, texte blanc, pulse animation
- Consulté : Gris

### Empty states

Tous les empty states doivent avoir :
- Illustration undraw.co (couleur teal)
- Message principal (H3)
- Sous-texte explicatif
- Action CTA (bouton primaire)

### Loading states

**Skeleton screens** :
- Utiliser pour chargements > 500ms
- Forme similaire au contenu final
- Animation pulse subtile

**Spinners** :
- Couleur : Teal
- Taille : Adaptée au contexte (small, medium, large)

---

## 🔒 SÉCURITÉ & CONFORMITÉ

### Protection données de santé

**Chiffrement** :
- Données au repos : Chiffrement base de données
- Données en transit : HTTPS/TLS 1.3
- Documents : Chiffrement AES-256
- **Chiffrement E2E** pour les données médicales sensibles (CORRIGÉ: implémenté comme prioritaire)

**Accès** :
- Authentification 2FA pour données sensibles (maintenant disponible, pas phase 2)
- Session timeout : 30 minutes d'inactivité
- Re-authentification pour actions critiques (export données, suppression compte)
- Device fingerprinting : Suivi des appareils connus pour détection des connexions suspectes

**Audit** :
- Log de tous les accès au dossier médical
- Traçabilité : Qui, Quand, Quelle page
- Conservation logs : 5 ans (obligation légale)
- **Journalisation immuable** : Logs d'audit avec chaînage cryptographique (blockchain light) pour garantir l'intégrité

### RGPD

**Droits patients** :
- Droit d'accès : Export complet données (ZIP) - Téléchargement en 1 clic
- Droit de rectification : Édition profil en temps réel
- Droit à l'oubli : Anonymisation (pas suppression totale pour conformité légale)
- Droit à la portabilité : Export JSON structuré + PDF complet
- Droit de limitation du traitement : Possibilité de limiter le traitement de certaines données
- Droit à la portabilité : Export complet des données dans format standard (FHIR pour données médicales)

**Consentements** :
- Traçabilité des consentements donnés avec horodatage
- Révocation possible à tout moment via interface claire
- Historique des consentements avec détails
- Consentement explicite pour chaque finalité (marketing, données médicales, etc.)
- Gestion centralisée des préférences de confidentialité

**Fonctionnalités RGPD** :
- Interface de demande d'exercice des droits (DSAR - Data Subject Access Request)
- Automatisation de la réponse aux demandes RGPD
- Délai de réponse : 30 jours maximum
- Export des données dans formats ouverts (JSON, CSV, PDF)
- Portabilité vers autres systèmes de santé

---

## 📊 ANALYTICS & MÉTRIQUES

### Métriques patient (visibles par admin)

**Engagement** :
- Nombre de connexions / mois
- Pages les plus consultées
- Temps moyen par session
- Taux d'ouverture notifications

**Utilisation dossier médical** :
- % patients qui consultent leur dossier
- Documents les plus téléchargés
- Fréquence d'accès

**Satisfaction** :
- NPS (Net Promoter Score) via sondages
- Taux de complétion profil
- Utilisation programme fidélité

---

## 📱 RESPONSIVE & ACCESSIBILITÉ

### Mobile

**Priorités affichage mobile** :
1. Prochain RDV (visible immédiatement)
2. Actions rapides (prendre RDV, contacter)
3. Notifications (badge compteur)
4. Navigation simplifiée (bottom nav ou drawer)

**Optimisations** :
- Touch targets : Min 44x44px
- Scrolling infini préféré à pagination lourde
- Lazy loading images
- **PWA Offline-First** : Mode hors-ligne complet avec synchronisation automatique (CORRIGÉ: implémenté comme prioritaire et non comme Phase 2)
  - Données disponibles hors-ligne : Profil, RDV à venir, historique RDV, dossiers médicaux, prescriptions, notifications
  - Actions en attente : Annulation RDV, mise à jour profil, messages
  - Sync automatique au retour en ligne

### Accessibilité

**WCAG 2.1 AA** :
- Hiérarchie headings correcte (H1 unique par page)
- Alt text sur toutes images médicales
- Descriptions ARIA pour graphiques
- Contraste texte/background ≥ 4.5:1
- Focus keyboard visible
- Skip links (aller au contenu principal)

**Lecteurs d'écran** :
- Live regions pour notifications temps réel
- Annoncer changements de statut
- Descriptions complètes des documents médicaux

---

## ✅ CRITÈRES D'ACCEPTATION MODULE 5

Ce module est validé lorsque :
- [ ] Dashboard patient affiche vue d'ensemble complète
- [ ] Rendez-vous (à venir, historique, annulés) consultables
- [ ] Dossier médical numérique accessible et complet
- [ ] Consultations détaillées avec tous les champs
- [ ] Prescriptions/ordonnances téléchargeables (PDF)
- [ ] Résultats d'examens consultables (avec imagerie)
- [ ] Allergies & antécédents modifiables
- [ ] Documents uploadables et téléchargeables
- [ ] Notifications fonctionnelles avec préférences
- [ ] Programme fidélité opérationnel (Phase 2)
- [ ] Profil modifiable avec toutes sections
- [ ] Export complet des données (RGPD)
- [ ] Sécurité : Audit logs, chiffrement, sessions
- [ ] Responsive mobile et desktop
- [ ] Accessibilité WCAG 2.1 AA validée
- [ ] Tests unitaires et E2E passent
- [ ] Mode hors-ligne PWA fonctionnel (CORRIGÉ: implémenté comme prioritaire)
- [ ] Données synchronisées en mode offline
- [ ] Chiffrement E2E des données médicales sensibles
- [ ] Journalisation immuable des accès (logs d'audit blockchain-light)
- [ ] Device fingerprinting pour détection des connexions suspectes
- [ ] 2FA disponible pour les données sensibles

---

## 📄 PROCHAINES ÉTAPES

Une fois Module 5 validé, passage à :
- **Module 6** : Admin - Gestion RDV & Patients
  - Dashboard analytics admin
  - Planning médecins
  - Gestion rendez-vous (CRUD, statuts)
  - Gestion patients (fiches, dossiers)
  - Création/modification dossiers médicaux
  - Logs d'audit

---

**Document créé le** : 04 janvier 2026  
**Version** : 1.0  
**Statut** : En attente de validation  
**Auteur** : Équipe projet VIDA