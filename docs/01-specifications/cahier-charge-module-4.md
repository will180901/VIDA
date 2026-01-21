# 📋 CAHIER DES CHARGES - CENTRE MÉDICAL VIDA
## Module 4 : Système de Prise de Rendez-vous

---

## 🎯 OBJECTIF DU MODULE

Créer un système complet et intuitif permettant aux patients de :
- Prendre rendez-vous en ligne 24/7
- Consulter les disponibilités en temps réel
- Choisir leur type de consultation
- Recevoir des confirmations automatiques
- Gérer leurs rendez-vous (modification, annulation)
- Recevoir des rappels automatiques

**Priorités** :
- **Simplicité maximale** (prise de RDV en 3 étapes)
- **Temps réel** (disponibilités synchronisées)
- **Automatisation** (confirmations, rappels, follow-up)
- **Flexibilité** (modification facile)

---

## 🏗️ ARCHITECTURE SYSTÈME RDV

### Composants principaux

#### 1. Gestionnaire de créneaux (Time Slots)
- Définition des plages horaires disponibles par praticien
- Gestion des jours de travail et jours fériés
- Durée standard par type de consultation
- Blocage automatique des créneaux réservés

#### 2. Système de gestion multi-praticiens (NOUVEAU)
- Profils détaillés des praticiens (médecins, opticiens, etc.)
- Planning hebdomadaire individuel par praticien
- Gestion des congés et absences
- Système d'affectation automatique des RDV
- Statistiques par praticien

#### 3. Calendrier de disponibilités
- Affichage visuel des dates disponibles
- Navigation mois par mois
- Indication du niveau de disponibilité (complet, limité, disponible)
- Synchronisation temps réel

#### 4. Moteur de réservation
- Validation disponibilité avant confirmation
- Protection contre les double-réservations
- Gestion des priorités (urgences)
- File d'attente si besoin
- Timer de réservation (10 minutes)

#### 5. Système de notifications
- Confirmation immédiate (email + SMS)
- Rappels programmés (48h et 24h avant)
- Notifications de modification/annulation
- Follow-up post-consultation

#### 1. Gestionnaire de créneaux (Time Slots)
- Définition des plages horaires disponibles par médecin
- Gestion des jours de travail et jours fériés
- Durée standard par type de consultation
- Blocage automatique des créneaux réservés

#### 2. Calendrier de disponibilités
- Affichage visuel des dates disponibles
- Navigation mois par mois
- Indication du niveau de disponibilité (complet, limité, disponible)
- Synchronisation temps réel

#### 3. Moteur de réservation
- Validation disponibilité avant confirmation
- Protection contre les double-réservations
- Gestion des priorités (urgences)
- File d'attente si besoin

#### 4. Système de notifications
- Confirmation immédiate (email + SMS)
- Rappels programmés (48h et 24h avant)
- Notifications de modification/annulation
- Follow-up post-consultation

---

## 📅 CONFIGURATION DES CRÉNEAUX HORAIRES

### Définition des créneaux (Back-office Admin)

**Paramètres configurables par praticien** :

1. **Jours de travail**
   - Sélection des jours de la semaine
   - Exemple : Lundi-Vendredi pour Dr. Dupont, Lundi-Samedi pour Opt. Martin
   - Gestion des exceptions (congés, formations)

2. **Horaires de consultation**
   - Heure début : 08h30 (configurable)
   - Heure fin : 17h00 (configurable)
   - Pause déjeuner : 12h30-14h00 (configurable)
   - Exemple VIDA : Lundi-Vendredi 08h30-12h30 et 14h00-17h00

3. **Durée par type de consultation**
   - Première consultation : 45 minutes
   - Consultation de suivi : 30 minutes
   - Consultation urgence : 30 minutes
   - Dépistage : 20 minutes
   - Essayage lunettes : 20 minutes

4. **Nombre de patients simultanés**
   - Par défaut : 1 patient par créneau
   - Optionnel : 2 patients si consultation courte (dépistage)

5. **Temps de battement**
   - 5-10 minutes entre chaque patient (nettoyage, préparation)
   - Configurable par praticien

6. **Spécialité et compétences**
   - Spécialité médicale (ophtalmologue, opticien, etc.)
   - Compétences spécifiques
   - Autorisations de consultation

1. **Jours de travail**
   - Sélection des jours de la semaine
   - Exemple : Lundi-Vendredi pour Dr. Dupont, Lundi-Samedi pour Dr. Martin
   - Gestion des exceptions (congés, formations)

2. **Horaires de consultation**
   - Heure début : 08h30 (configurable)
   - Heure fin : 17h00 (configurable)
   - Pause déjeuner : 12h30-14h00 (configurable)
   - Exemple VIDA : Lundi-Vendredi 08h30-12h30 et 14h00-17h00

3. **Durée par type de consultation**
   - Première consultation : 45 minutes
   - Consultation de suivi : 30 minutes
   - Consultation urgence : 30 minutes
   - Dépistage : 20 minutes
   - Essayage lunettes : 20 minutes

4. **Nombre de patients simultanés**
   - Par défaut : 1 patient par créneau
   - Optionnel : 2 patients si consultation courte (dépistage)

5. **Temps de battement**
   - 5-10 minutes entre chaque patient (nettoyage, préparation)
   - Configurable par médecin

### Génération automatique des créneaux

**Algorithme** :
1. Pour chaque jour de travail configuré
2. De heure_début à heure_fin
3. Exclure pause déjeuner
4. Créer créneaux de durée_consultation + temps_battement
5. Marquer créneaux disponibles ou bloqués

**Exemple concret VIDA** :
- Lundi 06 janvier 2026, Dr. Dupont
- Horaires : 08h30-12h30 et 14h00-17h00
- Type consultation : Première consultation (45 min + 5 min battement = 50 min)
- Créneaux générés :
  - 08h30-09h20
  - 09h20-10h10
  - 10h10-11h00
  - 11h00-11h50
  - 11h50-12h40 (déborde pause → créneau 11h40-12h30)
  - 14h00-14h50
  - 14h50-15h40
  - 15h40-16h30
  - 16h30-17h20 (déborde horaire → créneau jusqu'à 17h00 seulement)

### Gestion des exceptions

**Jours fériés congolais** (blocage automatique) :
- 1er janvier : Nouvel An
- Lundi de Pâques (variable)
- 1er mai : Fête du Travail
- Jeudi de l'Ascension (variable)
- Lundi de Pentecôte (variable)
- 15 août : Assomption
- 1er novembre : Toussaint
- 25 décembre : Noël
- + Jours fériés locaux à configurer

**Congés médecins** :
- Interface admin : Sélection plage de dates
- Blocage automatique tous créneaux concernés
- Notification patients ayant RDV pendant cette période
- Proposition re-programmation automatique

**Urgences & imprévus** :
- Bouton "Bloquer créneau" manuel
- Raison : Urgence médicale, retard, autre
- Notification automatique patients concernés

---

## 🖥️ INTERFACE PATIENT : PRISE DE RDV

### URL
`/rendez-vous` ou `/prendre-rdv`

### Accès
- **Non connecté** : Redirection vers inscription/connexion avec paramètre redirect
- **Connecté** : Accès direct au formulaire

---

### Étape 1 : Sélection du type de consultation

**Layout** :
- Titre H1 : "Prendre rendez-vous"
- Sous-titre : "Étape 1 sur 3 : Choisissez votre consultation"
- Progress bar : 33% remplie (couleur teal)

**Contenu** : Cards cliquables pour chaque type

**Type 1 : Première Consultation Ophtalmologique**
- Icône : `Eye` (64px, teal)
- Titre : "Première Consultation"
- Description : "Examen complet de la vue, réfraction, fond d'œil, mesure pression oculaire"
- Durée : 45 minutes
- Tarif : **10 000 FCFA**
- Badge : "Recommandé si vous n'avez jamais consulté chez VIDA"
- Inclus : 
  - Examen de la vue
  - Réfraction
  - Fond d'œil
  - Tonométrie
  - Prescription si nécessaire

**Type 2 : Consultation de Suivi**
- Icône : `Repeat` (64px, teal)
- Titre : "Consultation de Suivi"
- Description : "Pour patients déjà suivis chez VIDA"
- Durée : 30 minutes
- Tarif : **8 000 FCFA**
- Condition : Réservé aux patients avec historique VIDA
- Badge : "Économisez 2 000 FCFA"

**Type 3 : Dépistage Glaucome/Cataracte**
- Icône : `Search` (64px, orange)
- Titre : "Dépistage"
- Description : "Détection précoce du glaucome et de la cataracte"
- Durée : 20 minutes
- Tarif : **Inclus dans consultation** ou **5 000 FCFA** (si seul)
- Recommandé : Personnes > 40 ans, antécédents familiaux

**Type 4 : Consultation Urgence**
- Icône : `AlertCircle` (64px, rouge)
- Titre : "Consultation d'Urgence"
- Description : "Pour douleur oculaire intense, traumatisme, perte de vision soudaine"
- Durée : 30 minutes
- Tarif : **15 000 FCFA**
- Disponibilité : Dans les 24h
- Badge rouge : "Urgence médicale"

**Type 5 : Essayage Lunettes**
- Icône : `Glasses` (64px, orange)
- Titre : "Essayage & Conseil Lunetterie"
- Description : "Sélection montures et verres avec notre opticien"
- Durée : 20 minutes
- Tarif : **Gratuit** (si consultation préalable) ou **3 000 FCFA**
- Note : Prescription valide requise

**Design cards** :
- Grid : 2 colonnes desktop, 1 colonne mobile
- Hover : Élévation shadow niveau 2, border teal 2px
- Sélection : Background teal/5, border teal 3px, checkmark top-right
- Border-radius : 4px
- Padding : `p-6`
- Gap : `gap-6`
- Grain subtil obligatoire

**Bouton "Continuer"** :
- Activé uniquement si type sélectionné
- Texte : "Continuer"
- Icône : `ArrowRight`
- Position : Bas droite, fixe mobile

---

### Étape 2 : Sélection de la date et de l'heure

**Layout** :
- Titre : "Choisissez votre créneau"
- Sous-titre : "Étape 2 sur 3 : Date et heure"
- Progress bar : 66%
- Bouton "Retour" : Retour étape 1

**Section A : Sélection du praticien (optionnel)**

Si plusieurs praticiens disponibles (médecins, opticiens, etc.) :
- Dropdown ou cards : Liste des praticiens
- Chaque praticien :
  - Photo (si disponible) ou avatar initiales
  - Nom : "Dr. [Nom Prénom]" ou "Opt. [Nom Prénom]"
  - Spécialité : "Ophtalmologue", "Opticien", etc.
  - Badge : "Disponible" / "Complet cette semaine"
- Option : "Pas de préférence" (affiche tous créneaux disponibles)

**Système d'affectation automatique** :
- Si pas de préférence, le système sélectionne le praticien le plus disponible
- Priorité donnée aux praticiens avec moins de charge de travail
- Historique du patient pris en compte si applicable

**Section B : Calendrier des dates disponibles**

**Composant** : Calendrier interactif mois par mois

**Fonctionnalités** :
- Navigation : Flèches < > pour mois précédent/suivant
- Limite : Pas de RDV avant J+1 (pas de RDV le jour même)
- Limite : Affichage jusqu'à J+60 (2 mois à l'avance)
- Vue : Grille 7 colonnes (Lun-Dim)
- Synchronisation en temps réel : Mise à jour automatique des disponibilités via WebSocket
- Indication des créneaux réservés temporairement (en attente de confirmation)

**États des dates** :
1. **Passée ou aujourd'hui** : Grisée, non cliquable
2. **Indisponible** (aucun créneau libre) : 
   - Background gris clair
   - Texte gris barré
   - Tooltip : "Aucun créneau disponible"
3. **Disponible** :
   - Background blanc
   - Border teal au hover
   - Nombre de créneaux libres en badge : "5 créneaux"
4. **Peu de créneaux** (< 3 restants) :
   - Background orange/10
   - Badge orange : "2 créneaux restants"
5. **Sélectionnée** :
   - Background teal
   - Texte blanc
   - Border teal foncé

**Design** :
- Chaque date : Carrée, 48x48px desktop, 40x40px mobile
- Font-size : `text-sm`
- Border-radius : 4px
- Animations : Transition smooth au hover

**Section C : Créneaux horaires disponibles**

Affiché après sélection d'une date.

**Layout** :
- Titre : "Créneaux disponibles le [Date complète]"
- Exemple : "Créneaux disponibles le lundi 06 janvier 2026"

**Affichage créneaux** :
- Grid : 3-4 colonnes desktop, 2 colonnes mobile
- Chaque créneau : Bouton cliquable

**Contenu d'un créneau** :
- Heure : "09h30" (grande, bold)
- Médecin : "Dr. Dupont" (si plusieurs médecins)
- Statut : Badge vert "Disponible"

**États créneaux** :
1. **Disponible** :
   - Background blanc
   - Border gris
   - Hover : Border teal, background teal/5
2. **Sélectionné** :
   - Background teal
   - Texte blanc
   - Checkmark
3. **Peu de places** (si gestion liste d'attente) :
   - Badge orange : "Dernière place"

**Tri** : Créneaux affichés par ordre chronologique (matin puis après-midi)

**Bouton "Continuer"** :
- Activé si date + heure sélectionnées
- Texte : "Confirmer ce créneau"

---

### Étape 3 : Informations complémentaires & Confirmation

**Layout** :
- Titre : "Confirmez votre rendez-vous"
- Sous-titre : "Étape 3 sur 3 : Informations finales"
- Progress bar : 100%

**Section A : Récapitulatif (non modifiable ici)**

Card de résumé :
- Icône : `Calendar` (teal)
- Type consultation : "Première Consultation Ophtalmologique"
- Date : "Lundi 06 janvier 2026"
- Heure : "09h30 - 10h20"
- Médecin : "Dr. Dupont" (si applicable)
- Durée : "45 minutes"
- Tarif : **10 000 FCFA**
- Bouton : "Modifier" (retour étape 2)

**Section B : Motif de consultation (obligatoire)**

- Label : "Motif de votre consultation *"
- Type : `textarea`
- Placeholder : "Décrivez brièvement le motif de votre visite (ex: baisse de vision, douleur oculaire, contrôle de routine...)"
- Rows : 4
- Validation : Min 10 caractères, max 500 caractères
- Note : "Ces informations permettront au médecin de mieux préparer votre consultation"

**Section C : Symptômes ou antécédents (optionnel mais recommandé)**

Checkboxes multiples :
- "Baisse de vision"
- "Douleur oculaire"
- "Rougeur des yeux"
- "Maux de tête fréquents"
- "Éblouissement"
- "Vision floue"
- "Antécédents de glaucome"
- "Antécédents de cataracte"
- "Diabète"
- "Hypertension"
- "Autre" (champ texte libre si coché)

**Section D : Première visite ? (si Première Consultation)**

- Radio buttons :
  - "Oui, c'est ma première visite chez VIDA"
  - "Non, j'ai déjà consulté ici"
- Si "Non" : Demander date de dernière consultation (date picker)

**Section E : Allergies ou traitements en cours (optionnel)**

- Label : "Allergies ou traitements médicaux en cours (optionnel)"
- Type : `textarea`
- Placeholder : "Si vous suivez un traitement ou avez des allergies, merci de les indiquer ici"
- Rows : 3

**Section F : Préférences de notification**

Checkboxes :
- "Recevoir une confirmation par Email" (pré-coché)
- "Recevoir une confirmation par SMS" (pré-coché)
- "Recevoir des rappels 48h avant le RDV" (pré-coché)
- "Recevoir un rappel 24h avant le RDV" (pré-coché)

**Section G : Mode de paiement**

- Radio buttons :
  - "Payer sur place le jour du RDV" (par défaut)
  - "Payer en ligne maintenant" (si intégration Stripe/Wave activée)
    - Badge : "Économisez 5%" ou "Priorité de confirmation"

Si "Payer en ligne" :
- Redirection vers module paiement après validation
- Réservation confirmée automatiquement après paiement réussi

**Section H : Conditions d'annulation**

Call-out info :
- Icône : `Info`
- Texte : 
  - "Annulation gratuite jusqu'à 24h avant le RDV"
  - "Annulation < 24h : Frais de 5 000 FCFA"
  - "Absence sans prévenir : Facturation intégrale"
- Checkbox obligatoire : "J'ai lu et j'accepte la politique d'annulation"

**Bouton "Confirmer le rendez-vous"** :
- Texte : "Confirmer mon rendez-vous"
- Icône : `CheckCircle`
- Couleur : Teal (primaire)
- Loading state : Spinner + "Confirmation en cours..."
- Disabled si :
  - Motif non rempli
  - Politique annulation non acceptée

---

### Étape 4 : Confirmation finale (Page de succès)

**URL** : `/rendez-vous/confirmation/[id_rdv]`

**Contenu** :
- Illustration : `confirmation.svg` ou `booking.svg` (grande, centrée)
- Icône : `CheckCircle` (très grande, verte, animée)
- Titre H1 : "Rendez-vous confirmé !"
- Message principal : "Votre rendez-vous a été enregistré avec succès."

**Card récapitulatif détaillé** :
- Numéro de RDV : **#VIDA-2026-00042** (unique, visible)
- Type : Première Consultation Ophtalmologique
- Date : Lundi 06 janvier 2026
- Heure : 09h30 - 10h20
- Médecin : Dr. Dupont
- Lieu : Centre Médical VIDA, 08 Bis rue Mboko, Moungali, Brazzaville
- Tarif : 10 000 FCFA (à régler sur place)

**Notifications envoyées** :
- Icône `Mail` : "Confirmation envoyée à [email]"
- Icône `MessageCircle` : "SMS de confirmation envoyé au 06 XXX XX XX"

**Instructions** :
- Titre H3 : "À savoir avant votre RDV"
- Liste à puces :
  - "Arrivez 10 minutes avant l'heure de votre RDV"
  - "Apportez votre carte d'identité"
  - "Si vous portez déjà des lunettes, amenez-les"
  - "N'oubliez pas vos ordonnances et résultats d'examens précédents"
  - "Évitez le maquillage des yeux le jour de la consultation"

**Actions disponibles** :
- Bouton primaire : "Ajouter à mon calendrier" 
  - Télécharge fichier .ics (compatible Google Calendar, Outlook, Apple Calendar)
- Bouton secondaire : "Voir mon espace patient" → `/dashboard`
- Bouton tertiaire : "Retour à l'accueil" → `/`
- Lien : "Modifier mon rendez-vous" (si > 24h avant RDV)

**Call-out rappel** :
- Background : `bg-teal-50`
- Icône : `Bell`
- Texte : "Vous recevrez des rappels par SMS et email 48h et 24h avant votre RDV."

---

## 📧 SYSTÈME DE NOTIFICATIONS

### Types de notifications

#### 1. Confirmation immédiate (Email + SMS)

**Déclenchement** : Immédiatement après création RDV

**Email de confirmation** :
- **Sujet** : "Rendez-vous confirmé - Centre Médical VIDA"
- **Expéditeur** : "Centre Médical VIDA <rdv@centremedicalvida.com>"
- **Template HTML** :
  - Logo VIDA
  - Titre : "Bonjour [Nom Patient],"
  - Message : "Votre rendez-vous a été confirmé avec succès."
  - **Encadré récapitulatif** :
    - Numéro RDV
    - Date et heure
    - Type consultation
    - Médecin
    - Adresse centre
    - Tarif
  - **Boutons CTA** :
    - "Ajouter à mon calendrier" (lien .ics)
    - "Gérer mon RDV" (lien vers dashboard patient)
  - **Instructions** : Liste des éléments à apporter
  - **Politique annulation** : Rappel conditions
  - **Contact** : Téléphones + email si besoin de modifier
  - Footer standard

**SMS de confirmation** :
- Format concis (160 caractères max si possible)
- Exemple :
  ```
  VIDA - RDV confirmé
  Date: Lun 06/01 à 09h30
  Dr. Dupont
  Adresse: 08 Bis rue Mboko, Moungali
  Num: #VIDA-2026-00042
  Annulation gratuite > 24h avant
  ```

#### 2. Rappel 48h avant (Email + SMS)

**Déclenchement** : Celery Beat, 48h avant heure RDV

**Email de rappel** :
- **Sujet** : "Rappel : RDV dans 2 jours - Centre VIDA"
- Contenu similaire à confirmation
- Ajout : 
  - "Votre rendez-vous est dans 2 jours"
  - Bouton : "Confirmer ma présence" (lien qui enregistre confirmation)
  - Lien : "Je ne peux plus venir" (annulation facile)

**SMS de rappel** :
- Exemple :
  ```
  VIDA - Rappel RDV
  Dans 2 jours: Lun 06/01 à 09h30
  Dr. Dupont
  Confirmez: [lien court]
  Annuler: [lien court]
  ```

#### 3. Rappel 24h avant (SMS uniquement)

**Déclenchement** : 24h avant

**SMS** :
- Exemple :
  ```
  VIDA - RDV demain
  Lun 06/01 à 09h30
  Dr. Dupont, 08 Bis rue Mboko
  N'oubliez pas votre pièce d'identité
  ```

#### 4. Notification de modification (Email + SMS)

**Déclenchement** : Patient ou admin modifie RDV

**Contenu** :
- Sujet : "Votre rendez-vous a été modifié"
- Indication changements :
  - Ancien créneau : Barré
  - Nouveau créneau : En gras, surligné
- Raison modification (si fournie)
- Bouton : "Voir les détails"

#### 5. Notification d'annulation (Email + SMS)

**Déclenchement** : Patient ou admin annule RDV

**Contenu** :
- Sujet : "Rendez-vous annulé"
- Message : "Votre RDV du [date] à [heure] a été annulé."
- Raison (si fournie)
- Frais éventuels (si annulation < 24h)
- Bouton : "Reprendre un nouveau RDV"

#### 6. Follow-up post-consultation (Email)

**Déclenchement** : J+2 après RDV (si RDV marqué "Complété")

**Contenu** :
- Sujet : "Comment s'est passée votre consultation ?"
- Message : Remerciement pour la visite
- Demande d'évaluation :
  - Note sur 5 étoiles
  - Commentaire optionnel
  - Lien vers formulaire feedback
- Promotion : "Besoin de lunettes ? Découvrez notre lunetterie"
- Rappel : "Prochain contrôle recommandé dans 6 mois"

---

## 🔄 GESTION DES RENDEZ-VOUS (Patient)

### Vue dans Dashboard Patient

**Page** : `/dashboard/mes-rendez-vous`

**Sections** :

#### Section 1 : Rendez-vous à venir

**Layout** : Cards verticales ou liste

Chaque RDV affiché :
- Badge statut : "Confirmé" (vert) / "En attente de confirmation" (orange) / "À payer" (bleu) / "En attente de validation" (jaune) / "En cours" (bleu foncé) / "Terminé" (gris) / "Reporté" (violet)
- Date : Grande, bold
- Heure : En dessous de date
- Type consultation
- Médecin
- Countdown : "Dans 3 jours"
- Actions :
  - Bouton : "Voir les détails"
  - Bouton : "Modifier" (si > 24h avant)
  - Bouton : "Annuler" (avec confirmation)
  - Bouton : "Ajouter au calendrier" (.ics)

**Tri** : Chronologique, le plus proche en premier

**Empty state** (si aucun RDV à venir) :
- Illustration : `calendar.svg`
- Message : "Vous n'avez aucun rendez-vous prévu"
- Bouton : "Prendre rendez-vous"

#### Section 2 : Historique (RDV passés)

**Filtres** :
- Par date (date picker range)
- Par type de consultation (dropdown)
- Par médecin (dropdown)

**Chaque RDV passé** :
- Badge statut : "Complété" (vert) / "Annulé" (rouge) / "Absence" (gris)
- Date et heure
- Type consultation
- Médecin
- Actions :
  - "Voir compte-rendu" (si disponible)
  - "Télécharger ordonnance" (si disponible)
  - "Reprendre RDV" (même type)

**Pagination** : 10 RDV par page

---

### Modification de RDV

**Conditions** :
- Possible uniquement si > 24h avant RDV
- Maximum 2 modifications par RDV

**Flux** :
1. Patient clique "Modifier"
2. Modal confirmation : "Vous souhaitez modifier votre RDV du [date] à [heure] ?"
3. Si confirmé : Redirection vers calendrier (étape 2 de prise de RDV)
4. Présélection du même type de consultation
5. Affichage nouveaux créneaux disponibles
6. Confirmation modification
7. Notifications envoyées (email + SMS)
8. Ancien créneau libéré automatiquement

**Limitation** :
- Après 2 modifications : Message "Vous avez atteint le nombre maximum de modifications. Pour changer ce RDV, contactez-nous."

---

### Annulation de RDV

**Flux** :
1. Patient clique "Annuler"
2. Modal confirmation :
   - "Êtes-vous sûr de vouloir annuler ce RDV ?"
   - Affichage politique annulation :
     - Si > 24h avant : "Annulation gratuite"
     - Si < 24h avant : "Frais d'annulation : 5 000 FCFA"
   - Champ optionnel : "Raison de l'annulation" (aide à améliorer le service)
   - Checkbox : "J'ai lu et j'accepte les conditions d'annulation"
3. Bouton : "Confirmer l'annulation" (rouge)
4. Confirmation : "Votre RDV a été annulé"
5. Notifications envoyées
6. Si frais : Facture générée, envoyée par email
7. Créneau libéré pour d'autres patients

---

## 🔒 GESTION CONFLITS & EDGE CASES

### Protection double-réservation

**Scénario** : 2 patients tentent de réserver le même créneau simultanément

**Solution** :
- Verrouillage optimiste (Optimistic Locking)
- Vérification finale au moment de la confirmation
- Système de réservation temporaire avec timer (10 minutes)
- Si créneau déjà pris : Message d'erreur
  - "Désolé, ce créneau vient d'être réservé par un autre patient."
  - "Veuillez en choisir un autre."
- Proposition automatique des 3 créneaux les plus proches disponibles
- Synchronisation en temps réel via WebSocket pour mise à jour immédiate des disponibilités

### Temps de réservation limité (Timer de réservation)

**Objectif** : Éviter qu'un patient bloque un créneau indéfiniment

**Solution** :
- Lors de la sélection d'un créneau : Démarrage timer 10 minutes (CORRIGÉ: Défini à 10 minutes avec comportement spécifié)
- Indicateur visible : "Créneau réservé pour vous pendant 10:00"
- Compte à rebours en temps réel affiché dans l'interface
- Si délai expiré sans confirmation :
  - Créneau libéré automatiquement
  - Notification WebSocket envoyée pour mise à jour en temps réel
  - Redirection vers calendrier avec message : "Votre temps de réservation a expiré. Veuillez sélectionner à nouveau."
- Système de gestion des réservations temporaires :
  - Créneau marqué comme "réservé temporairement" dans la base de données
  - Synchronisation en temps réel via WebSocket pour empêcher les doubles réservations

### Absence de créneaux disponibles

**Scénario** : Aucun créneau libre dans les 60 prochains jours

**Solution** :
- Message : "Aucun créneau disponible pour ce type de consultation dans les 60 prochains jours."
- Proposition :
  - "Inscrivez-vous sur liste d'attente" (formulaire simple)
  - "Contactez-nous directement pour un RDV : 06 569 12 35"
  - "Choisir un autre type de consultation" (retour étape 1)

### Liste d'attente (Optionnel Phase 2)

**Fonctionnement** :
- Patient s'inscrit avec préférences (plage horaire, jour de semaine)
- Si annulation ou ouverture nouveau créneau : Notification automatique patients en attente
- Premier inscrit = premier servi
- Délai de réponse : 2h pour confirmer, sinon créneau proposé au suivant

---

## 📊 ANALYTICS & REPORTING (Admin)

### Indicateurs temps réel

**Dashboard admin** :
- Nombre de RDV pris aujourd'hui
- Nombre de RDV à venir (7 prochains jours)
- Taux de remplissage : X% des créneaux réservés
- Taux de show-up : X% des patients présents
- Taux de no-show : X% d'absences sans prévenir
- Taux d'annulation : X% de RDV annulés
- Délai moyen entre prise de RDV et date consultation

### Graphiques

**Vue hebdomadaire** :
- Graphique en barres : Nombre de RDV par jour
- Graphique circulaire : Répartition par type de consultation
- Ligne du temps : Créneaux réservés vs disponibles

**Vue mensuelle** :
- Calendrier heatmap : Jours les plus chargés
- Évolution taux de remplissage mois par mois

### Rapports exportables

**Formats** : PDF, Excel, CSV

**Rapports disponibles** :
- Liste RDV par période (date début - date fin)
- Statistiques par médecin
- RDV annulés avec raisons
- No-show pour relance
- Revenus générés par consultations

---

## ⚙️ BACKEND : ENDPOINTS API

### Principaux endpoints

#### Créneaux disponibles
```
GET /api/appointments/slots/available/
Query params:
- date: YYYY-MM-DD
- consultation_type_id: int
- practitioner_id: int (optionnel - CORRIGÉ: uniformisé à practitioner_id au lieu de doctor_id)

Response: Liste des créneaux libres
```

#### Praticiens disponibles
```
GET /api/appointments/practitioners/
Query params:
- date: YYYY-MM-DD (optionnel)
- consultation_type_id: int (optionnel)
- specialty: string (optionnel)

Response: Liste des praticiens avec disponibilités
```

#### Réservation temporaire (timer 10 min)
```
POST /api/appointments/reserve/
Body:
- slot_id: int
- patient_id: int

Response: Confirmation de réservation temporaire avec expiration
```

#### Création RDV
```
POST /api/appointments/
Body:
- slot_id: int
- consultation_type_id: int
- reason: string
- symptoms: array
- preferences: object

Response: Objet RDV créé + id
```

#### Liste RDV patient
```
GET /api/appointments/my-appointments/
Query params:
- status: upcoming | past | cancelled
- page: int

Response: Liste paginée des RDV
```

#### Modification RDV
```
PATCH /api/appointments/{id}/
Body:
- new_slot_id: int (optionnel)
- reason: string (optionnel)

Response: RDV mis à jour
```

#### Annulation RDV
```
POST /api/appointments/{id}/cancel/
Body:
- cancellation_reason: string (optionnel)

Response: Confirmation annulation + frais éventuels
```

#### Confirmation présence
```
POST /api/appointments/{id}/confirm-presence/

Response: Confirmation enregistrée
```

---

## 🎨 DESIGN SPECIFICATIONS

### Calendrier de dates

**Composant custom** (pas de lib externe pour respecter charte)

**Structure** :
- Header : Mois + Année + Flèches navigation
- Grid : 7 colonnes (jours de semaine)
- Cellules : Dates

**Couleurs** :
- Date disponible : Background blanc, border `border-gray-200`
- Date hover : Border teal, background `bg-teal-50`
- Date sélectionnée : Background `bg-[#1D9A94]`, texte blanc
- Date indisponible : Background `bg-gray-100`, texte `text-gray-400`
- Date peu de créneaux : Background `bg-orange-50`, texte orange

**Animations** :
- Transition smooth changement de mois (fade in/out)
- Hover : Scale 1.02

### Créneaux horaires

**Layout** :
- Grid responsive : 4 colonnes desktop, 2 colonnes mobile
- Gap : `gap-3`

**Chaque créneau (bouton)** :
- Width : Full
- Height : 56px
- Padding : `px-4 py-3`
- Border-radius : 4px
- Border : `border border-gray-300`
- Background : Blanc
- Font-size : `text-sm`
- Hover : Border teal, background `bg-teal-50`
- Sélectionné : Background teal, texte blanc, checkmark visible

### Progress bar (étapes)

**Design** :
- 3 steps : Dots connectés par ligne
- Step actuel : Dot rempli teal, large (16px)
- Step passé : Dot rempli teal, checkmark, taille normale (12px)
- Step futur : Dot vide, border gray, taille normale
- Ligne entre dots : Gris si non fait, teal si fait
- Labels sous chaque dot : "Type", "Date & Heure", "Confirmation"

---

## ✅ CRITÈRES D'ACCEPTATION MODULE 4

Ce module est validé lorsque :
- [ ] Prise de RDV en 3 étapes fonctionnelle
- [ ] Calendrier temps réel avec disponibilités exactes
- [ ] Notifications automatiques (confirmation + rappels) opérationnelles
- [ ] Modification RDV possible (si > 24h avant)
- [ ] Annulation RDV avec gestion des frais
- [ ] Dashboard patient affiche RDV à venir et historique
- [ ] Protection contre double-réservation implémentée
- [ ] Timer de réservation (10 min) fonctionnel
- [ ] Admin peut voir et gérer tous les RDV
- [ ] Analytics temps réel visibles en admin
- [ ] Responsive mobile et desktop
- [ ] Accessibilité WCAG 2.1 AA
- [ ] Emails et SMS envoyés correctement
- [ ] Tests unitaires et E2E passent

---

## 📄 PROCHAINES ÉTAPES

Une fois Module 4 validé, passage à :
- **Module 5** : Espace Patient - Dashboard & Dossier Médical
  - Dashboard analytics patient
  - Historique consultations détaillé
  - Dossier médical numérique
  - Prescriptions et ordonnances
  - Upload/download documents
  - Programme fidélité (optionnel)

---

**Document créé le** : 04 janvier 2026  
**Version** : 1.0  
**Statut** : En attente de validation  
**Auteur** : Équipe projet VIDA