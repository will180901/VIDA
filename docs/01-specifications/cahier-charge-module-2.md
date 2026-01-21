# 📋 CAHIER DES CHARGES - CENTRE MÉDICAL VIDA
## Module 2 : Site Vitrine Public (Pages Statiques)

---

## 🎯 OBJECTIF DU MODULE

Créer les pages institutionnelles du site vitrine accessible au grand public, sans nécessiter d'authentification. Ces pages servent à :
- Présenter l'identité et les valeurs de VIDA
- Établir la confiance et la crédibilité
- Informer sur les services proposés
- Faciliter la prise de contact
- Optimiser le référencement naturel (SEO)

---

## 📄 PAGES À DÉVELOPPER

### Liste des pages statiques
1. **Page d'accueil** (Homepage)
2. **À propos** (About)
3. **Nos services** (Services)
4. **Pourquoi choisir VIDA** (Why Choose Us)
5. **Horaires & Tarifs** (Schedule & Pricing)
6. **Contact** (Contact)
7. **Mentions légales** (Legal)
8. **Politique de confidentialité** (Privacy Policy)
9. **Conditions générales d'utilisation** (Terms of Service)
10. **Page 404** (Not Found)
11. **Page 500** (Server Error)

---

## 1️⃣ PAGE D'ACCUEIL (Homepage)

### URL
`/` ou `/accueil`

### Objectif
Captiver immédiatement le visiteur et le diriger vers une action (prise de RDV ou découverte des services).

### Structure détaillée

#### Section 1 : Hero Section (Above the fold)
**Positionnement** : Première section visible à l'arrivée

**Contenu** :
- **Titre H1** : "Redonnez de la clarté à votre regard" (48px desktop, 32px mobile)
- **Sous-titre** : "Centre médical spécialisé en ophtalmologie à Brazzaville. Expertise, équipements modernes et approche humaine." (18px desktop, 16px mobile)
- **2 CTA principaux** :
  - Bouton primaire : "Prendre rendez-vous" → Redirection `/rendez-vous` (avec animation hover)
  - Bouton secondaire : "Découvrir nos services" → Scroll vers section Services
- **Illustration** : `hero-doctors.svg` ou `medical_care.svg` (undraw.co, couleur #1D9A94)
- **Image d'arrière-plan** : Photo réelle du centre médical VIDA (optionnel, avec overlay sombre 40% pour lisibilité texte)

**Design** :
- Layout : 2 colonnes desktop (texte gauche 50%, illustration droite 50%)
- Layout mobile : 1 colonne (texte puis illustration)
- Hauteur : 80vh minimum desktop, auto mobile
- Padding : `px-6 py-16` desktop, `px-4 py-12` mobile
- Background : Gradient subtil `from-gray-50 to-white` ou blanc pur
- Grain subtil : Obligatoire (opacity 15%)

**Animations** :
- Fade in + slide up au chargement (Framer Motion)
- Durée : 0.8s
- Délai décalé : titre → sous-titre → CTA

**Fonctionnalités PWA Offline-First** :
- **Service Worker** : Mise en cache des pages statiques (accueil, services, contact)
- **IndexedDB** : Stockage local des données de base (horaires, contacts)
- **Background Sync** : Envoi des messages de contact en mode offline
- **Push Notifications** : Activation possible pour les rappels et notifications
- **Cache First Strategy** : Chargement instantané même en mode lent

---

#### Section 2 : Chiffres Clés (Statistics)
**Positionnement** : Juste après Hero, pour crédibilité immédiate

**Contenu** : 4 statistiques en cartes horizontales
1. **"3+ ans d'excellence"**
   - Icône : `Calendar` (Lucide, teal)
   - Sous-texte : "Depuis décembre 2022"
   
2. **"10 000+ patients soignés"**
   - Icône : `Users` (Lucide, teal)
   - Sous-texte : "Consultations réalisées"
   
3. **"Équipe qualifiée"**
   - Icône : `Award` (Lucide, teal)
   - Sous-texte : "Médecins spécialisés"
   
4. **"Équipements modernes"**
   - Icône : `Activity` (Lucide, teal)
   - Sous-texte : "Technologie de pointe"

**Design** :
- Layout : Grid 4 colonnes desktop, 2 colonnes tablet, 1 colonne mobile
- Chaque carte : Fond blanc, border-radius 4px, shadow niveau 1, padding `p-6`
- Icônes : Container teal/10 background, border-radius 8px, taille 20px
- Chiffres : `text-3xl font-bold text-gray-900`
- Labels : `text-sm text-gray-500`
- Gap : `gap-6`
- Animation : Counter animé (chiffres incrémentent au scroll)

---

#### Section 3 : Services en Bref (Services Overview)
**Positionnement** : Présentation rapide des 3 services principaux

**Contenu** : 3 cartes de services

**Carte 1 : Consultations Ophtalmologiques**
- Icône : `Eye` (Lucide, 24px, teal)
- Titre : "Consultations & Examens"
- Description : "Examens de la vue, du champ visuel et consultations spécialisées par nos ophtalmologues"
- Liste à puces :
  - Première consultation
  - Suivi médical
  - Examens complets
- Illustration : `medical_research.svg`
- CTA : "En savoir plus" → `/services#consultations`

**Carte 2 : Dépistages**
- Icône : `Search` (Lucide, 24px, teal)
- Titre : "Dépistage & Prévention"
- Description : "Détection précoce du glaucome et de la cataracte pour une prise en charge rapide"
- Liste à puces :
  - Dépistage glaucome
  - Dépistage cataracte
  - Suivi préventif
- Illustration : `scientist.svg`
- CTA : "En savoir plus" → `/services#depistages`

**Carte 3 : Lunetterie**
- Icône : `Glasses` (Lucide, 24px, teal)
- Titre : "Lunetterie & Correction"
- Description : "Large choix de montures et verres correcteurs pour tous les âges"
- Liste à puces :
  - Montures variées
  - Verres sur mesure
  - Essayage virtuel
- Illustration : `shopping.svg` ou custom lunettes
- CTA : "En savoir plus" → `/services#lunetterie`

**Design** :
- Layout : Grid 3 colonnes desktop, 1 colonne mobile
- Chaque carte : Hover élévation shadow niveau 2, transition 300ms
- Border-radius : 4px
- Padding : `p-6`
- Background : Blanc
- Gap : `gap-6`
- Illustration positionnée en background coin supérieur droit (opacity 10%)

---

#### Section 4 : Pourquoi VIDA (Why Us)
**Positionnement** : Arguments différenciants

**Contenu** : 4 arguments sous forme de liste iconique

1. **Expertise Reconnue**
   - Icône : `Certificate` (Lucide, orange)
   - Texte : "Équipe de professionnels qualifiés avec expérience en ophtalmologie"

2. **Équipements Modernes**
   - Icône : `Zap` (Lucide, orange)
   - Texte : "Matériel de dernière génération pour diagnostics précis"

3. **Approche Humaine**
   - Icône : `Heart` (Lucide, orange)
   - Texte : "Écoute, bienveillance et personnalisation de chaque prise en charge"

4. **Accessibilité**
   - Icône : `Clock` (Lucide, orange)
   - Texte : "Horaires flexibles et prise de rendez-vous en ligne 24/7"

**Design** :
- Layout : 2 colonnes desktop, 1 colonne mobile
- Chaque élément : Flex row (icône + texte)
- Icône : Circle background orange/10, padding 12px, border-radius 50%
- Gap entre éléments : `gap-8`
- Background section : `bg-gray-50` avec grain
- Padding : `py-16 px-6`
- Illustration large côté droit : `feeling_proud.svg` ou `team_collaboration.svg`

---

#### Section 5 : Témoignages (Testimonials)
**Positionnement** : Preuve sociale

**Contenu** : 3 témoignages patients (anonymisés ou génériques)

**Structure d'un témoignage** :
- Avatar : Initiales dans cercle coloré (pas de photos réelles)
- Nom : "Marie K." (prénom + initiale)
- Note : 5 étoiles (icônes `Star` remplies)
- Texte : Citation courte (max 150 caractères)
- Date : "Il y a 2 mois"

**Exemples** :
1. "Excellent accueil et équipe à l'écoute. Mon problème de vision a été résolu rapidement." - **Sarah M.**
2. "Centre moderne avec du matériel de qualité. Je recommande vivement !" - **Jean-Paul D.**
3. "Très satisfaite du service lunetterie, large choix et bon conseil." - **Élise K.**

**Design** :
- Carrousel ou grid statique 3 colonnes
- Chaque carte : Fond blanc, border gauche teal 4px, shadow niveau 1
- Padding : `p-4`
- Avatar : 48px circle, background aléatoire pastel
- Note : Étoiles jaunes (`text-amber-400`)
- Texte : `text-sm italic text-gray-600`

---

#### Section 6 : Call to Action Final (CTA)
**Positionnement** : Avant footer

**Contenu** :
- Titre H2 : "Prêt à prendre soin de votre vue ?"
- Texte : "Prenez rendez-vous en ligne en quelques clics ou contactez-nous directement."
- 2 boutons :
  - Primaire : "Prendre rendez-vous" → `/rendez-vous`
  - Secondaire : "Nous contacter" → `/contact`
- Illustration : `booking.svg` ou `confirmation.svg`

**Design** :
- Background : Gradient teal `from-[#1D9A94] to-[#16807A]`
- Texte : Blanc
- Padding : `py-20 px-6`
- Layout : Centré, max-width 800px
- Border-radius container : 12px (si dans une section blanche)
- Shadow niveau 3

**Fonctionnalités hors ligne** :
- Bouton "Prendre rendez-vous" : Redirige vers page offline si pas de connexion
- Bouton "Nous contacter" : Affiche les coordonnées locales sauvegardées en cache

---

### SEO & Métadonnées

**Title** : "Centre Médical VIDA | Ophtalmologie à Brazzaville, Congo"

**Meta Description** : "Centre médical spécialisé en ophtalmologie à Brazzaville. Consultations, dépistages glaucome/cataracte, lunetterie. Prenez RDV en ligne. Équipe qualifiée, équipements modernes."

**Keywords** : "ophtalmologie brazzaville, centre médical vida, ophtalmologue congo, lunetterie brazzaville, dépistage glaucome, dépistage cataracte, rdv ophtalmologue"

**Open Graph** :
- `og:title` : "Centre Médical VIDA - Ophtalmologie Brazzaville"
- `og:description` : Meta description
- `og:image` : Logo VIDA haute résolution ou photo centre
- `og:url` : URL canonique

**Structured Data (JSON-LD)** :
- Type : `MedicalBusiness` + `Physician`
- Inclure : Nom, adresse, téléphone, horaires, services

**Performance & Core Web Vitals** :
- **Lighthouse Score** : > 90/100
- **First Contentful Paint** : < 1.5s
- **Largest Contentful Paint** : < 2.5s
- **First Input Delay** : < 100ms
- **Cumulative Layout Shift** : < 0.1
- **Time to Interactive** : < 3s

**PWA Manifest** :
- **Name** : "VIDA - Centre Médical"
- **Short Name** : "VIDA"
- **Description** : "Plateforme digitale du Centre Médical VIDA"
- **Start URL** : `/`
- **Display** : `standalone`
- **Background Color** : `#FFFFFF`
- **Theme Color** : `#1D9A94`
- **Icons** : Plusieurs tailles (192x192, 512x512, etc.)

---

## 2️⃣ PAGE À PROPOS (About)

### URL
`/a-propos`

### Objectif
Raconter l'histoire de VIDA, présenter l'équipe et les valeurs pour créer un lien émotionnel.

### Structure détaillée

#### Section 1 : Qui sommes-nous (Header)
**Contenu** :
- Breadcrumb : `Accueil > À propos`
- Titre H1 : "Qui sommes-nous"
- Sous-titre : "L'histoire et les valeurs du Centre Médical VIDA"
- Illustration : `team_collaboration.svg`

**Design** :
- Header glassmorphism avec grain (identique charte)
- Padding : `px-6 py-12`
- Layout : Texte centré

---

#### Section 2 : Notre Histoire
**Contenu** :
- Titre H2 : "Notre Histoire"
- Paragraphes :
  - "Créé le 23 décembre 2022, le Centre Médical VIDA est né d'une volonté de rendre les soins ophtalmologiques de qualité accessibles à tous à Brazzaville et en Afrique centrale."
  - "Depuis notre ouverture, nous avons accompagné des milliers de patients dans la préservation et l'amélioration de leur santé visuelle."
  - "Grâce à une équipe dévouée et à des équipements modernes, VIDA s'impose progressivement comme un acteur de référence en ophtalmologie au Congo."
- Timeline visuelle (optionnel) :
  - 2022 : Création du centre
  - 2023 : 5 000 consultations
  - 2024 : Extension service lunetterie
  - 2025 : Lancement plateforme digitale
- Illustration : `visionary_technology.svg` ou `goals.svg`

**Design** :
- Layout : 2 colonnes (texte 60%, illustration 40%)
- Texte : `text-base leading-relaxed text-gray-700`
- Timeline : Points connectés par ligne verticale teal

---

#### Section 3 : Notre Vision
**Contenu** :
- Titre H2 : "Notre Vision"
- Texte principal :
  - "Être un centre de référence en ophtalmologie au Congo et en Afrique centrale, reconnu pour :"
  - Liste :
    - La qualité exceptionnelle de ses soins
    - Son expertise médicale pointue
    - Son approche humaine et bienveillante
- Citation encadrée : *"VIDA aspire à redonner à chacun le plaisir de voir clairement le monde et d'en apprécier chaque couleur."*
- Illustration : `visionary_technology.svg`

**Design** :
- Background : `bg-teal-50` avec grain
- Padding : `py-16 px-6`
- Citation : Card centrée, fond blanc, border-left teal 4px, italic

---

#### Section 4 : Nos Valeurs
**Contenu** :
- Titre H2 : "Nos Valeurs"
- Intro : "Chez VIDA, nous croyons que la vue est le reflet de la vie. Nos valeurs guident chacune de nos actions :"

**4 valeurs en cartes** :

1. **Professionnalisme**
   - Icône : `Award` (teal)
   - Description : "Excellence médicale et rigueur dans chaque acte de soin"
   - Illustration : `certificate.svg`

2. **Empathie**
   - Icône : `Heart` (orange)
   - Description : "Écoute attentive et accompagnement personnalisé de chaque patient"
   - Illustration : `empathy.svg`

3. **Accueil**
   - Icône : `Smile` (teal)
   - Description : "Un environnement chaleureux et rassurant pour tous nos visiteurs"
   - Illustration : `welcoming.svg`

4. **Accessibilité**
   - Icône : `Users` (orange)
   - Description : "Des soins de qualité accessibles à tous, sans compromis"
   - Illustration : `people_search.svg`

**Design** :
- Grid 2x2 desktop, 1 colonne mobile
- Chaque carte : Fond blanc, hover effet scale 1.02, shadow niveau 1→2
- Icône : Circle 64px, background couleur/10
- Padding carte : `p-6`
- Gap : `gap-6`

---

#### Section 5 : L'Équipe (Team) - Optionnel
**Contenu** :
- Titre H2 : "Notre Équipe"
- Texte : "Une équipe pluridisciplinaire de professionnels dévoués à votre santé visuelle"
- **Si photos disponibles** :
  - Cartes individuelles : Photo + Nom + Titre + Courte bio
  - Exemple : "Dr. [Nom] - Ophtalmologue - 10 ans d'expérience"
- **Si pas de photos** :
  - Description générale de la composition de l'équipe
  - "Notre équipe comprend des ophtalmologues certifiés, des opticiens qualifiés et un personnel administratif dévoué"
- Illustration : `team_collaboration.svg` ou `professor.svg`

**Design** :
- Grid 3 colonnes (si photos individuelles)
- Photos : Carrées, border-radius 50%, grayscale avec couleur au hover
- Fond : `bg-gray-50`

---

### SEO & Métadonnées

**Title** : "À propos de VIDA | Centre Médical d'Ophtalmologie à Brazzaville"

**Meta Description** : "Découvrez l'histoire, la vision et les valeurs du Centre Médical VIDA. Équipe qualifiée, approche humaine et équipements modernes depuis 2022."

---

## 3️⃣ PAGE NOS SERVICES (Services)

### URL
`/services`

### Objectif
Détailler exhaustivement tous les services proposés par VIDA avec descriptions, bénéfices et tarifs.

### Structure détaillée

#### Section 1 : Header Services
**Contenu** :
- Breadcrumb : `Accueil > Services`
- Titre H1 : "Nos Services"
- Sous-titre : "Une gamme complète de soins pour préserver et améliorer votre vue"
- Illustration : `medicine.svg`

---

#### Section 2 : Menu de Navigation Interne (Anchor Links)
**Contenu** : Tabs horizontaux avec scroll smooth vers sections
- Consultations & Examens
- Dépistages
- Lunetterie

**Design** :
- Sticky top (reste visible au scroll)
- Background blanc avec shadow niveau 2
- Tabs : Active state teal, inactive gray
- Underline animé qui suit le tab actif

---

#### Section 3 : Consultations & Examens {#consultations}
**Contenu** :
- Titre H2 : "Consultations & Examens Ophtalmologiques"
- Description générale : "Nos ophtalmologues réalisent des examens complets pour diagnostiquer et traiter toutes affections oculaires."

**Liste des prestations** (cartes expandables) :

1. **Consultation Ophtalmologique Complète**
   - Icône : `Stethoscope`
   - Description : Examen complet de la vue incluant réfraction, fond d'œil, mesure tension oculaire
   - Durée : 30-45 minutes
   - Tarif : **10 000 FCFA**
   - Inclus : Prescription lunettes si nécessaire
   - CTA : "Prendre RDV"

2. **Examen de la Vue et du Champ Visuel**
   - Icône : `Eye`
   - Description : Test d'acuité visuelle et évaluation du champ de vision périphérique
   - Durée : 20 minutes
   - Tarif : Inclus dans consultation
   - CTA : "Prendre RDV"

3. **Fond d'Œil (Ophtalmoscopie)**
   - Icône : `Search`
   - Description : Examen de la rétine pour détecter anomalies, dégénérescence, lésions
   - Durée : 15 minutes
   - Tarif : Inclus dans consultation
   - CTA : "Prendre RDV"

4. **Tonométrie (Mesure Pression Oculaire)**
   - Icône : `Activity`
   - Description : Mesure de la pression intraoculaire pour dépistage glaucome
   - Durée : 10 minutes
   - Tarif : Inclus dans consultation
   - CTA : "Prendre RDV"

**Illustration section** : `medical_research.svg` ou `doctor.svg`

**Design** :
- Cards collapsibles (accordion)
- Header card : Clic pour expand/collapse
- Contenu expand : Animation smooth height
- Tarif : Badge orange, large, bold

---

#### Section 4 : Dépistages {#depistages}
**Contenu** :
- Titre H2 : "Dépistage & Prévention"
- Description : "La détection précoce est essentielle. Nos dépistages permettent d'identifier les pathologies avant complications."

**2 dépistages principaux** :

1. **Dépistage du Glaucome**
   - Icône : `AlertCircle`
   - Qu'est-ce que c'est : Le glaucome est une maladie silencieuse qui endommage progressivement le nerf optique
   - Pourquoi dépister : Détection précoce pour prévenir la cécité irréversible
   - Méthode : Mesure pression oculaire + examen nerf optique + champ visuel
   - Recommandé pour :
     - Personnes > 40 ans
     - Antécédents familiaux
     - Myopes
     - Diabétiques
   - Fréquence : Annuelle si facteurs de risque
   - Tarif : Inclus consultation ou forfait dépistage
   - CTA : "Prendre RDV dépistage"

2. **Dépistage de la Cataracte**
   - Icône : `CloudOff`
   - Qu'est-ce que c'est : Opacification progressive du cristallin entraînant baisse de vision
   - Pourquoi dépister : Intervention chirurgicale précoce si nécessaire
   - Méthode : Examen à la lampe à fente + test acuité visuelle
   - Recommandé pour :
     - Personnes > 60 ans
     - Vision floue progressive
     - Éblouissement fréquent
   - Fréquence : Annuelle après 60 ans
   - Tarif : Inclus consultation
   - CTA : "Prendre RDV dépistage"

**Illustration section** : `scientist.svg` ou `medical_care.svg`

**Design** :
- 2 grandes cartes côte à côte (desktop) ou empilées (mobile)
- Icônes : Grandes (48px), circle background teal/10
- Sections expandables pour détails
- Call-out box : "💡 Le dépistage précoce peut sauver votre vue !"

---

#### Section 5 : Lunetterie {#lunetterie}
**Contenu** :
- Titre H2 : "Service de Lunetterie"
- Description : "Large choix de montures et verres correcteurs pour tous les styles et tous les âges."

**Sous-sections** :

**A. Montures**
- Variété : Hommes, Femmes, Enfants
- Styles : Classique, Sport, Fashion, Professionnel
- Marques : [Si applicable, lister marques disponibles]
- Matériaux : Métal, Plastique, Titane
- Illustration : Custom lunettes ou `shopping.svg`

**B. Verres Correcteurs**
- Types :
  - Unifocaux (myopie, hypermétropie)
  - Progressifs (presbytie)
  - Solaires correcteurs
- Traitements :
  - Anti-reflets
  - Anti-rayures
  - Anti-UV
  - Photochromiques (transitions)

**C. Essayage Virtuel** (Mise en avant innovation)
- Titre : "Essayez vos lunettes en ligne !"
- Description : Uploadez votre photo et visualisez instantanément les montures sur votre visage
- CTA : "Essayer maintenant" → `/lunetterie/essayage`
- Illustration : `specs.svg` ou custom AR

**D. Suivi Visuel Enfants & Adultes**
- Contrôles réguliers
- Adaptation progressive
- Conseils d'entretien

**Tarifs** :
- Montures : À partir de [prix]
- Verres unifocaux : À partir de [prix]
- Verres progressifs : À partir de [prix]
- Forfait complet : Consultation + Monture + Verres

**Design** :
- Layout mixte : Grid + tabs
- Photos produits si disponibles (montures)
- Carrousel montures populaires
- Background : `bg-gradient-to-br from-teal-50 to-orange-50` avec grain

---

#### Section 6 : CTA Prise de RDV
**Contenu** :
- Titre : "Prêt à consulter ?"
- Texte : "Choisissez le service qui vous convient et prenez rendez-vous en quelques clics."
- Bouton : "Prendre rendez-vous maintenant"
- Illustration : `booking.svg`

**Design** :
- Centré, fond teal, texte blanc
- Shadow niveau 3
- Padding : `py-16`

---

### SEO & Métadonnées

**Title** : "Nos Services | Consultations, Dépistages, Lunetterie - Centre VIDA"

**Meta Description** : "Découvrez nos services : consultations ophtalmologiques complètes, dépistages glaucome/cataracte, lunetterie avec essayage virtuel. Tarifs transparents. Prenez RDV."

**Structured Data** : `MedicalProcedure` pour chaque service

---

## 4️⃣ PAGE POURQUOI VIDA (Why Choose Us)

### URL
`/pourquoi-vida`

### Objectif
Convaincre les visiteurs hésitants en mettant en avant les avantages compétitifs de VIDA.

### Structure détaillée

#### Section 1 : Header
**Contenu** :
- Breadcrumb
- Titre H1 : "Pourquoi Choisir VIDA ?"
- Sous-titre : "Ce qui fait de nous votre meilleur choix pour vos soins oculaires"

---

#### Section 2 : 6 Raisons Principales

**1. Expertise Médicale Reconnue**
- Icône : `Award` + Badge (grande taille 80px)
- Titre : "Équipe Hautement Qualifiée"
- Description détaillée :
  - Ophtalmologues certifiés avec expérience internationale
  - Formation continue aux dernières techniques
  - Approche basée sur les meilleures pratiques médicales
- Stat : "10+ années d'expérience cumulée"
- Illustration : `certificate.svg`

**2. Équipements de Dernière Génération**
- Icône : `Zap`
- Titre : "Technologie de Pointe"
- Description :
  - Matériel diagnostic moderne (tonométrie, fond d'œil numérique)
  - Équipement renouvelé régulièrement
  - Précision maximale des diagnostics
- Stat : "100% équipements certifiés"
- Illustration : `updated.svg`

**3. Approche Humaine & Bienveillante**
- Icône : `Heart`
- Titre : "Vous Êtes au Centre de Nos Préoccupations"
- Description :
  - Écoute attentive de vos besoins
  - Explications claires et pédagogiques
  - Accompagnement personnalisé
  - Suivi post-consultation
- Illustration : `care.svg` ou `empathy.svg`

**4. Accessibilité & Flexibilité**
- Icône : `Clock`
- Titre : "Des Horaires Adaptés à Votre Vie"
- Description :
  - Ouvert 6 jours/7
  - Prise de RDV en ligne 24/7
  - Rappels automatiques SMS
  - Consultation téléphonique possible
- Illustration : `time_management.svg`

**5. Transparence des Prix**
- Icône : `DollarSign`
- Titre : "Tarifs Clairs, Sans Surprise"
- Description :
  - Consultation : 10 000 FCFA (affichage clair)
  - Devis lunetterie détaillé avant achat
  - Pas de frais cachés
  - Options de paiement flexibles
- Illustration : `wallet.svg`

**6. Innovation Digitale**
- Icône : `Smartphone`
- Titre : "La Santé Oculaire à l'Ère Digitale"
- Description :
  - Plateforme en ligne moderne
  - Dossier médical numérique sécurisé
  - Téléconsultation disponible
  - Essayage virtuel lunettes
  - Chatbot assistance 24/7
  - **Paiement Mobile Money** (MTN MoMo, Airtel Money)
  - **Gamification et programme de fidélité**
  - **Téléconsultation sécurisée**
  - **Intégration WhatsApp Business** pour rappels
- Illustration : `mobile_testing.svg`

**Design** :
- Alternance layout : Image gauche/texte droite puis inverse
- Chaque raison = Section full-width
- Background alterné : blanc / gray-50
- Padding vertical : `py-16`
- Grain sur toutes sections

**Fonctionnalités hors ligne** :
- Accès aux raisons principales même sans connexion
- Données sauvegardées en cache pour consultation hors ligne

---

#### Section 3 : Comparatif (Optionnel mais impactant)
**Contenu** : Tableau comparatif VIDA vs Centres traditionnels

| Critère | Centre VIDA | Autres centres |
|---------|-------------|----------------|
| Prise RDV en ligne | ✅ 24/7 | ❌ Téléphone uniquement |
| Dossier médical numérique | ✅ | ❌ |
| Rappels automatiques | ✅ SMS + Email | ❌ |
| Essayage virtuel lunettes | ✅ | ❌ |
| Téléconsultation | ✅ | ❌ |
| Équipements modernes | ✅ | ⚠️ Ancien |
| Transparence tarifs | ✅ | ⚠️ Variable |

**Design** :
- Tableau responsive (cards mobiles)
- Checkmarks verts, croix rouges
- Highlight ligne VIDA (background teal/5)

---

#### Section 4 : Témoignages Approfondis
**Contenu** : 2-3 témoignages longs avec contexte

Exemple :
> **"Un diagnostic qui m'a sauvé la vue"**
> "J'ai consulté VIDA pour une simple baisse de vision. L'équipe a détecté un début de glaucome que je n'aurais jamais suspecté. Grâce à leur dépistage précoce et à leur prise en charge rapide, j'ai pu éviter des complications graves. Merci VIDA !"
> — **Martin L., 52 ans, consultant**

---

#### Section 5 : CTA Final
**Contenu** :
- Titre : "Convaincu ? Rejoignez des milliers de patients satisfaits"
- Bouton : "Prendre mon premier rendez-vous"
- Illustration : `winners.svg`

---

### SEO & Métadonnées

**Title** : "Pourquoi Choisir VIDA | 6 Raisons de Nous Faire Confiance"

**Meta Description** : "Expertise médicale, équipements modernes, approche humaine, innovation digitale. Découvrez pourquoi VIDA est le meilleur choix pour vos soins oculaires à Brazzaville."

---

## 5️⃣ PAGE HORAIRES & TARIFS (Schedule & Pricing)

### URL
`/horaires-tarifs`

### Objectif
Informer clairement sur disponibilités et prix pour éviter frustrations et questions répétées.

### Structure détaillée

#### Section 1 : Header
**Contenu** :
- Breadcrumb
- Titre H1 : "Horaires & Tarifs"
- Sous-titre : "Informations pratiques pour votre visite"

---

#### Section 2 : Horaires d'Ouverture
**Contenu** :
- Titre H2 : "Nos Horaires"
- Illustration : `schedule.svg` ou `calendar.svg`

**Tableau horaires** :
| Jour | Horaires |
|------|----------|
| Lundi | 08h30 - 17h00 |
| Mardi | 08h30 - 17h00 |
| Mercredi | 08h30 - 17h00 |
| Jeudi | 08h30 - 17h00 |
| Vendredi | 08h30 - 17h00 |
| Samedi | 08h00 - 12h30 |
| Dimanche | Fermé |

**Call-out** : 
- "🕒 Prise de rendez-vous en ligne disponible 24h/24, 7j/7"
- "📞 Pour les urgences, contactez-nous directement au 06 569 12 35"

**Design** :
- Card centrée, max-width 600px
- Jour actuel highlighted (background teal/10)
- Icons : `Clock` pour chaque ligne
- Responsive : Stack vertical mobile

---

#### Section 3 : Tarifs des Consultations
**Contenu** :
- Titre H2 : "Tarifs Consultations"
- Texte explicatif : "Nos tarifs sont transparents et affichés clairement. Aucun frais caché."

**Grille tarifs** :

**Consultation Ophtalmologique Complète** : **10 000 FCFA**
- Inclus :
  - Examen de la vue
  - Réfraction
  - Mesure pression oculaire
  - Fond d'œil
  - Prescription lunettes si nécessaire

**Consultation de Suivi** : **8 000 FCFA**
- Pour patients déjà suivis chez VIDA

**Dépistage Glaucome** : Inclus dans consultation

**Dépistage Cataracte** : Inclus dans consultation

**Consultation Urgence** : **15 000 FCFA**
- Rendez-vous dans les 24h

**Design** :
- Cards avec prix en gros (text-4xl, font-bold, teal)
- Badge "Inclus" pour prestations gratuites
- Icon `CheckCircle` pour items inclus
- Layout : 2 colonnes desktop, 1 mobile

---

#### Section 4 : Tarifs Lunetterie (Fourchettes)
**Contenu** :
- Titre H2 : "Tarifs Lunetterie"
- Note : "Les prix varient selon modèles et traitements choisis. Devis personnalisé fourni en boutique."

**Fourchettes** :
- **Montures adultes** : À partir de [X] FCFA
- **Montures enfants** : À partir de [X] FCFA
- **Verres unifocaux** : À partir de [X] FCFA
- **Verres progressifs** : À partir de [X] FCFA
- **Verres solaires correcteurs** : À partir de [X] FCFA

**Forfaits** :
- **Forfait Complet Vision** : Consultation + Monture + Verres unifocaux = [X] FCFA *(Économisez [Y] FCFA)*
- **Forfait Premium** : Consultation + Monture + Verres progressifs + Traitement anti-reflets = [X] FCFA

**Design** :
- Cards avec badge "À partir de..."
- Forfaits : Card différenciée (border teal, background teal/5)
- Icon `Tag` pour remises

---

#### Section 5 : Moyens de Paiement
**Contenu** :
- Titre H2 : "Moyens de Paiement Acceptés"
- Icônes :
  - Espèces (CFA)
  - Cartes bancaires (Visa, Mastercard)
  - **Mobile Money** (MTN MoMo, Airtel Money) - *Principalement utilisé au Congo*
  - Paiement en ligne (Wave, Stripe)
  - **VIDA Pay** (Portefeuille numérique interne avec points de fidélité)

**Design** :
- Icons grandes (64px) colorés
- Layout : Horizontal flex wrap
- Background : `bg-gray-50`

**Fonctionnalités hors ligne** :
- Affichage des moyens de paiement même sans connexion
- Sauvegarde locale des informations de paiement pour consultation hors ligne

---

#### Section 6 : Politique Annulation
**Contenu** :
- Titre H2 : "Politique d'Annulation"
- Règles :
  - Annulation gratuite jusqu'à 24h avant RDV
  - Annulation < 24h : Frais de 5 000 FCFA
  - No-show (absence sans prévenir) : Facturation intégrale
  - Reprogrammation : Gratuite (dans la limite de 2 fois)

**Design** :
- Card info avec icône `Info`
- Texte clair, numéroté

---

#### Section 7 : CTA
**Contenu** :
- "Prêt à prendre rendez-vous ?"
- Bouton : "Réserver ma consultation"

---

### SEO & Métadonnées

**Title** : "Horaires & Tarifs | Centre Médical VIDA - Consultation 10 000 FCFA"

**Meta Description** : "Horaires : Lundi-Vendredi 8h30-17h, Samedi 8h-12h30. Consultation 10 000 FCFA. Tarifs transparents. Paiement carte, espèces, mobile money. Prenez RDV."

---

## 6️⃣ PAGE CONTACT (Contact)

### URL
`/contact`

### Objectif
Faciliter la prise de contact par tous les canaux possibles.

### Structure détaillée

#### Section 1 : Header
**Contenu** :
- Breadcrumb
- Titre H1 : "Contactez-Nous"
- Sous-titre : "Nous sommes à votre écoute pour toute question ou demande"
- Illustration : `contact_us.svg`

---

#### Section 2 : Informations de Contact (Sidebar ou Top)
**Contenu** : 4 moyens de contact

**1. Adresse**
- Icône : `MapPin` (teal)
- Texte : "08 Bis rue Mboko, Moungali"
- Texte : "Croisement Lénine - Maya-Maya"
- Texte : "Brazzaville, Congo"
- CTA : "Voir sur Google Maps" (lien externe)

**2. Téléphones**
- Icône : `Phone` (teal)
- Numéro 1 : `06 569 12 35` (lien `tel:`)
- Numéro 2 : `05 745 36 88` (lien `tel:`)
- Badge "Urgences" sur premier numéro

**3. Email**
- Icône : `Mail` (teal)
- Email : `centremedvida@gmail.com` (lien `mailto:`)
- Délai réponse : "Réponse sous 24h ouvrées"

**4. Horaires**
- Icône : `Clock` (teal)
- Recap horaires (version condensée)
- Lien : "Voir tous les horaires" → `/horaires-tarifs`

**Design** :
- Cards verticales ou horizontales
- Hover : Background teal/5
- Icons : Circle 48px, background teal/10
- Liens cliquables (téléphone, email) avec couleur teal

---

#### Section 3 : Formulaire de Contact
**Contenu** :
- Titre H2 : "Envoyez-nous un message"
- Champs :
  1. **Nom complet** (required)
     - Placeholder : "Votre nom et prénom"
     - Type : text
     - Validation : Min 3 caractères
  
  2. **Email** (required)
     - Placeholder : "votre.email@exemple.com"
     - Type : email
     - Validation : Format email valide
  
  3. **Téléphone** (optional)
     - Placeholder : "06 XXX XX XX"
     - Type : tel
  
  4. **Sujet** (required)
     - Dropdown :
       - Prise de rendez-vous
       - Question sur un service
       - Réclamation
       - Demande de devis lunetterie
       - Autre
  
  5. **Message** (required)
     - Placeholder : "Décrivez votre demande en détail..."
     - Type : textarea
     - Rows : 6
     - Validation : Min 20 caractères
  
  6. **Consentement RGPD** (required)
     - Checkbox : "J'accepte que mes données soient utilisées pour répondre à ma demande (voir Politique de confidentialité)"

- Bouton Submit : "Envoyer le message"
  - Icône : `Send`
  - Loading state : Spinner + "Envoi en cours..."
  - Success : Message vert "Message envoyé avec succès !"
  - Error : Message rouge "Erreur, veuillez réessayer"
  - **Offline mode** : Message sauvegardé localement, envoi automatique au retour en ligne

**Design** :
- Card blanche, shadow niveau 1
- Inputs : Conformes charte (border-radius 4px, focus teal)
- Bouton : Pleine largeur mobile, auto desktop
- Formulaire max-width 600px

**Fonctionnalités hors ligne** :
- Affichage des informations de contact même sans connexion
- Sauvegarde locale des messages en mode offline
- Envoi automatique des messages au retour en ligne

---

#### Section 4 : Carte Interactive Google Maps
**Contenu** :
- Carte intégrée (Google Maps iframe ou Leaflet)
- Marker sur 08 Bis rue Mboko, Moungali
- Zoom optimal sur quartier
- Hauteur : 400px desktop, 300px mobile

**Design** :
- Border-radius 8px
- Shadow niveau 2
- Full-width container

---

#### Section 5 : Réseaux Sociaux (Si applicables)
**Contenu** :
- Titre : "Suivez-nous"
- Icons + liens :
  - Facebook (si actif)
  - Instagram (si actif)
  - LinkedIn (si actif)
  - **WhatsApp Business** (lien direct chat) - *Intégré à notre système de notifications*

**Design** :
- Icons rondes 48px, hover scale 1.1
- Couleurs originales marques
- Layout horizontal centré

**Fonctionnalités hors ligne** :
- Affichage des liens réseaux sociaux même sans connexion
- Sauvegarde locale des coordonnées pour consultation hors ligne

---

### SEO & Métadonnées

**Title** : "Contactez-Nous | Centre Médical VIDA Brazzaville"

**Meta Description** : "Contactez le Centre Médical VIDA : 06 569 12 35 / 05 745 36 88. Email : centremedvida@gmail.com. Adresse : Moungali, Brazzaville. Formulaire en ligne disponible."

**Structured Data** : `ContactPoint`

---

## 7️⃣ PAGES LÉGALES (Footer Pages)

### 7.1 Mentions Légales

**URL** : `/mentions-legales`

**Contenu** :
- Raison sociale : Centre Médical VIDA
- Forme juridique : [À compléter]
- RCCM : B13-0506 (visible sur dépliant)
- NIU : M2300009961883 (visible sur dépliant)
- Siège social : Adresse complète
- Responsable publication : [Nom Directeur]
- Hébergeur : [Nom hébergeur + adresse]
- Numéro agrément médical : [Si applicable]

---

### 7.2 Politique de Confidentialité

**URL** : `/confidentialite`

**Contenu** (sections obligatoires RGPD) :
1. Introduction
2. Données collectées (nom, email, téléphone, données médicales)
3. Finalités du traitement (RDV, dossier médical, newsletters)
4. Base légale (consentement, intérêt légitime, obligation légale)
5. Destinataires des données (personnel médical uniquement)
6. Durée de conservation (dossiers médicaux : 20 ans minimum)
7. Droits des patients (accès, rectification, suppression, portabilité)
8. Sécurité des données (chiffrement, accès restreint)
9. Cookies (si utilisés)
10. Contact DPO ou responsable : Email dédié

---

### 7.3 Conditions Générales d'Utilisation

**URL** : `/conditions-utilisation` ou `/cgu`

**Contenu** :
1. Objet du site
2. Acceptation des CGU
3. Accès au site (gratuit, disponibilité non garantie)
4. Création de compte (conditions, suspension)
5. Propriété intellectuelle (contenu protégé)
6. Responsabilité (limitation responsabilité éditeur)
7. Modification des CGU
8. Droit applicable (loi congolaise)
9. Litige (tribunal compétent Brazzaville)

---

**Design pages légales** :
- Layout simple : 1 colonne, max-width 800px
- Typographie : `text-sm leading-relaxed`
- Titres H2 : `text-lg font-semibold`
- Background : Blanc
- Padding : `py-12 px-6`

---

## 8️⃣ PAGES D'ERREUR (Error Pages)

### 8.1 Page 404 (Not Found)

**URL** : `/404` (catch-all)

**Contenu** :
- Illustration : `page_not_found.svg` (grande, centrée)
- Code : "404"
- Titre H1 : "Oups ! Page introuvable"
- Message : "La page que vous recherchez n'existe pas ou a été déplacée."
- Suggestions :
  - Lien : "Retour à l'accueil"
  - Lien : "Voir nos services"
  - Lien : "Prendre rendez-vous"
  - Lien : "Nous contacter"
- Barre de recherche (optionnel)

**Design** :
- Centré verticalement et horizontalement
- Illustration : 300px desktop, 200px mobile
- Couleurs : Maintenir charte (pas de couleurs d'erreur agressives)
- Tone : Amical, pas frustrant

---

### 8.2 Page 500 (Server Error)

**URL** : `/500`

**Contenu** :
- Illustration : `server_down.svg` ou `maintenance.svg`
- Code : "500"
- Titre H1 : "Erreur serveur temporaire"
- Message : "Nos serveurs rencontrent un problème technique. Nous travaillons à le résoudre au plus vite."
- Instructions :
  - "Veuillez réessayer dans quelques minutes"
  - "Si le problème persiste, contactez-nous : centremedvida@gmail.com"
- Bouton : "Réessayer" (reload page)
- Bouton : "Retour à l'accueil"

**Design** :
- Similar à 404
- Tone : Rassurant, professionnel

---

## 🎨 DESIGN SYSTEM GLOBAL (Rappels)

### Layout Général

**Container** :
- Max-width : 1280px (xl)
- Padding horizontal : `px-6` desktop, `px-4` mobile
- Centré : `mx-auto`

**Sections** :
- Padding vertical : `py-16` desktop, `py-12` mobile
- Margin bottom entre sections : `space-y-16`

**Grids** :
- Gap standard : `gap-6`
- Responsive : `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

### Composants Récurrents

**Breadcrumb** :
```jsx
<nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
  <Link href="/">Accueil</Link>
  <ChevronRight className="w-3 h-3" />
  <span className="text-gray-900">Page actuelle</span>
</nav>
```

**CTA Button** :
- Primaire : Background teal, texte blanc
- Secondaire : Border teal, texte teal
- Hover : Légère élévation (shadow niveau 2)
- Padding : `px-6 py-3` (CTA large) ou `px-3 py-1.5` (standard)
- Font-size : `text-base` (CTA) ou `text-xs` (standard)
- Border-radius : 4px

**Card Standard** :
- Background : Blanc
- Border : `border border-gray-100`
- Border-radius : 4px
- Shadow : Niveau 1 (repos) → Niveau 2 (hover)
- Padding : `p-6`
- Transition : `transition-all duration-300`

---

### Animations (Framer Motion)

**Fade In** :
```javascript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

**Stagger Children** (listes, grilles) :
```javascript
container: {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}
item: {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

| Device | Width | Behavior |
|--------|-------|----------|
| Mobile | < 768px | 1 colonne, stack vertical, touch-friendly |
| Tablet | 768px - 1023px | 2 colonnes, hybrid navigation |
| Desktop | ≥ 1024px | 3 colonnes, full features |

**Best Practices** :
- Images : Lazy loading obligatoire
- Illustrations : Redimensionnement adaptatif (50% taille mobile)
- Font-size : Scale responsive (mobile 14px-16px, desktop 16px-18px)
- Touch targets : Min 44x44px mobile

---

## 🔍 SEO GLOBAL PAGES STATIQUES

### Optimisations Obligatoires

**Balises Meta** :
- Title unique par page (max 60 caractères)
- Meta description unique (max 155 caractères)
- Meta robots : `index, follow`
- Canonical URL : Éviter duplicate content
- Hreflang : Si multi-langue implémenté

**Open Graph** (partage réseaux sociaux) :
- `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- Twitter Cards si applicable

**Structured Data (JSON-LD)** :
- Homepage : `Organization` + `MedicalBusiness`
- Services : `MedicalProcedure`
- About : `AboutPage`
- Contact : `ContactPage` + `ContactPoint`

**Performance** :
- Images : Format WebP, lazy loading, dimensions explicites
- Fonts : Preload Poppins & Inter
- CSS : Critical CSS inline, reste async
- JS : Code splitting, defer non-critical

**Accessibilité** :
- Landmarks ARIA (`<main>`, `<nav>`, `<aside>`)
- Headings hiérarchisés (H1 unique par page)
- Alt text descriptifs images
- Focus visible au clavier
- Contraste ≥ 4.5:1

---

## 🌐 NAVIGATION GLOBALE

### Header (Navbar)

**Structure** :
- Logo VIDA (left)
- Menu navigation (center/right) :
  - Accueil
  - À propos
  - Services
  - Horaires & Tarifs
  - Contact
  - **[CTA] Prendre RDV** (bouton primaire teal)
  - **[CTA] Connexion** (lien texte ou icône `User`)

**Sticky** : Oui (reste visible au scroll)
**Mobile** : Hamburger menu (slide-in drawer)
**Design** : Glassmorphism + grain (charte ARCEE)

---

### Footer

**Structure 4 colonnes** (desktop) / Stack (mobile) :

**Colonne 1 : À propos**
- Logo VIDA
- Texte court : "Centre médical spécialisé en ophtalmologie à Brazzaville"
- Réseaux sociaux (icons)

**Colonne 2 : Liens Rapides**
- Accueil
- Services
- Prendre RDV
- Contact
- Blog (si activé)

**Colonne 3 : Contact**
- Adresse (icône `MapPin`)
- Téléphones (icônes `Phone`)
- Email (icône `Mail`)
- Horaires résumé

**Colonne 4 : Légal**
- Mentions légales
- Politique de confidentialité
- CGU
- Gestion cookies

**Footer Bottom** :
- Copyright : "© 2026 Centre Médical VIDA. Tous droits réservés."
- RCCM : B13-0506 | NIU : M2300009961883
- Design by : [Agence/Nom]

**Design** :
- Background : `bg-gray-900` (dark)
- Texte : `text-gray-300`
- Links : `text-gray-400 hover:text-teal-400`
- Border top : `border-t border-gray-800`
- Padding : `py-12`

---

## 📊 ANALYTICS & TRACKING

### Outils à intégrer

**Google Analytics 4** :
- Tracking pages vues
- Événements personnalisés :
  - Clic CTA "Prendre RDV"
  - Soumission formulaire contact
  - Téléchargement documents (si applicable)
  - Scroll depth
  - Temps passé par page

**Google Tag Manager** : Gestion centralisée tags

**Hotjar ou Microsoft Clarity** (optionnel) :
- Heatmaps
- Session recordings
- Surveys utilisateurs

---

## ✅ CRITÈRES D'ACCEPTATION MODULE 2

Ce module est validé lorsque :
- [ ] Toutes les pages statiques sont créées et responsive
- [ ] Charte graphique VIDA strictement respectée (couleurs, typo, grain, border-radius)
- [ ] Illustrations undraw.co intégrées (couleur #1D9A94)
- [ ] SEO optimisé (meta tags, structured data, performance)
- [ ] Navigation header + footer fonctionnels
- [ ] Formulaire contact opérationnel (backend à implémenter Module 9)
- [ ] Pages 404/500 custom créées
- [ ] Accessibilité WCAG 2.1 AA validée
- [ ] Lighthouse Score > 90/100
- [ ] Tests cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] Tests mobiles (iOS, Android)

---

## 🔄 PROCHAINES ÉTAPES

Une fois Module 2 validé, passage à :
- **Module 3** : Système inscription/authentification
  - Formulaires inscription/connexion
  - Validation emails
  - Gestion sessions JWT
  - Profils patients

---

**Document créé le** : 04 janvier 2026  
**Version** : 1.0  
**Statut** : En attente de validation  
**Auteur** : Équipe projet VIDA