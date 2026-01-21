# 📄 CONTENU SITE VIDA - VERSION 1.0

**Date de création**: 17 janvier 2026  
**Version**: 1.0.0  
**Statut**: Archive du contenu initial (hardcodé dans le frontend)  
**Objectif**: Référence EXACTE pour la migration vers le backend

⚠️ **IMPORTANT**: Ce fichier contient UNIQUEMENT le contenu réellement présent dans le code frontend actuel. Aucune invention, aucune donnée des spécifications. Seulement ce qui est hardcodé.

---

## 🎯 HERO SLIDER (4 Slides)

**Fichier source**: `frontend/components/ui/HeroSlider.tsx`

### Slide 1
- **ID**: `1`
- **Titre**: `Votre Vue Mérite une Attention Sérieuse`
- **Sous-titre**: `Centre ophtalmologique moderne à Brazzaville. Équipement professionnel, soins de qualité.`
- **CTA Texte**: *(vide)*
- **CTA Lien**: *(vide)*
- **Type média**: `image`
- **URL média**: `/images/hero/hero-1-vision.jpg`
- **Ordre**: `1`

### Slide 2
- **ID**: `2`
- **Titre**: `Examens Complets et Diagnostics Précis`
- **Sous-titre**: `Dépistage des maladies oculaires. Équipements adaptés pour des résultats fiables.`
- **CTA Texte**: *(vide)*
- **CTA Lien**: *(vide)*
- **Type média**: `image`
- **URL média**: `/images/hero/hero-2-technology.png`
- **Ordre**: `2`

### Slide 3
- **ID**: `3`
- **Titre**: `Une Équipe à Votre Écoute`
- **Sous-titre**: `Ophtalmologues qualifiés et personnel attentionné. Nous prenons le temps de vous expliquer.`
- **CTA Texte**: *(vide)*
- **CTA Lien**: *(vide)*
- **Type média**: `image`
- **URL média**: `/images/hero/hero-3-team.png`
- **Ordre**: `3`

### Slide 4
- **ID**: `4`
- **Titre**: `Prenez Rendez-vous Facilement`
- **Sous-titre**: `En ligne, par téléphone ou WhatsApp. Nous sommes là pour vous accompagner.`
- **CTA Texte**: *(vide)*
- **CTA Lien**: *(vide)*
- **Type média**: `image`
- **URL média**: `/images/hero/hero-4-appointment.png`
- **Ordre**: `4`

---

## 🏥 SERVICES (4 Services)

### Service 1: Consultations
- **ID**: `1`
- **Titre**: `Consultations`
- **Description**: `Examens de vue complets, dépistage glaucome et cataracte`
- **Détails**: `Nos ophtalmologues réalisent des examens complets de la vue incluant le dépistage du glaucome, de la cataracte et d'autres pathologies oculaires. Consultation sur rendez-vous du lundi au samedi.`
- **Image**: `/images/services/consultation.png`
- **Icône**: *(non défini)*
- **Ordre**: `1`

### Service 2: Dépistage
- **ID**: `2`
- **Titre**: `Dépistage`
- **Description**: `Détection précoce des maladies oculaires (diabète, DMLA)`
- **Détails**: `Dépistage précoce des maladies oculaires liées au diabète, à l'hypertension et à l'âge (DMLA). Un diagnostic précoce permet une meilleure prise en charge.`
- **Image**: `/images/services/depistage.png`
- **Icône**: *(non défini)*
- **Ordre**: `2`

### Service 3: Lunetterie
- **ID**: `3`
- **Titre**: `Lunetterie`
- **Description**: `Large choix de montures et verres correcteurs adaptés`
- **Détails**: `Notre lunetterie propose un large choix de montures de qualité et de verres correcteurs adaptés à vos besoins. Conseils personnalisés pour trouver la monture qui vous convient.`
- **Image**: `/images/services/lunetterie.png`
- **Icône**: *(non défini)*
- **Ordre**: `3`

### Service 4: Chirurgie
- **ID**: `4`
- **Titre**: `Chirurgie`
- **Description**: `Chirurgie réfractive au laser (myopie, astigmatisme)`
- **Détails**: `Chirurgie réfractive au laser pour corriger la myopie, l'hypermétropie et l'astigmatisme. Intervention rapide et indolore avec suivi post-opératoire complet.`
- **Image**: `/images/services/chirurgie.png`
- **Icône**: *(non défini)*
- **Ordre**: `4`

---

## 💡 POURQUOI VIDA ? (4 Raisons)

### Raison 1: Compétence
- **ID**: `1`
- **Icône**: `BadgeCheck` (Lucide React)
- **Titre**: `Compétence`
- **Description**: `Ophtalmologues expérimentés et personnel formé pour vous offrir des soins de qualité`
- **Ordre**: `1`

### Raison 2: Équipement Moderne
- **ID**: `2`
- **Icône**: `Stethoscope` (Lucide React)
- **Titre**: `Équipement Moderne`
- **Description**: `Matériel adapté pour des examens fiables et un diagnostic précis`
- **Ordre**: `2`

### Raison 3: À Votre Écoute
- **ID**: `3`
- **Icône**: `Ear` (Lucide React)
- **Titre**: `À Votre Écoute`
- **Description**: `Chaque patient est unique. Nous prenons le temps de comprendre vos besoins`
- **Ordre**: `3`

### Raison 4: Facilité d'Accès
- **ID**: `4`
- **Icône**: `Smartphone` (Lucide React)
- **Titre**: `Facilité d'Accès`
- **Description**: `Réservation en ligne, par téléphone ou WhatsApp. Horaires du lundi au samedi`
- **Ordre**: `4`

---

## 📖 SECTION À PROPOS

### Contenu principal
- **Titre section**: `À propos de VIDA`
- **Sous-titre**: `Qui sommes-nous`
- **Texte**: `Centre ophtalmologique situé à Brazzaville, nous mettons notre expertise au service de votre santé visuelle. Notre équipe vous accueille dans un environnement professionnel et vous accompagne avec attention, de la consultation au suivi de vos soins.`

---

## 🧭 NAVIGATION (Header)

### Menu principal
1. **Accueil** → `#hero`
2. **Services** → `#services`
3. **À propos** → `#a-propos`
4. **Horaires & Tarifs** → `#` (dropdown)
5. **Contact** → `#` (dropdown)

---

## ⏰ HORAIRES D'OUVERTURE

### Horaires hebdomadaires
- **Lundi**: `08h30 - 17h00` (pause: `12h30 - 14h00`)
- **Mardi**: `08h30 - 17h00` (pause: `12h30 - 14h00`)
- **Mercredi**: `08h30 - 17h00` (pause: `12h30 - 14h00`)
- **Jeudi**: `08h30 - 17h00` (pause: `12h30 - 14h00`)
- **Vendredi**: `08h30 - 17h00` (pause: `12h30 - 14h00`)
- **Samedi**: `08h00 - 12h30`
- **Dimanche**: `Fermé`

### Notes
- Prise de rendez-vous en ligne disponible 24h/24, 7j/7
- Pour les urgences, contactez-nous directement au 06 569 12 35

---

## 💰 TARIFS CONSULTATIONS

**Fichier source**: `frontend/components/layout/Header.tsx` (Dropdown Horaires)

### Tarifs actuels
- **Consultation générale**: `15 000 FCFA`
- **Consultation spécialisée**: `25 000 FCFA`

**Note**: Pas d'autres informations sur les moyens de paiement dans le code actuel

---

## 📞 INFORMATIONS DE CONTACT

**Fichier source**: `frontend/components/layout/Footer.tsx` et `frontend/components/layout/Header.tsx`

### Adresse
- **Texte complet**: `08 Bis rue Mboko, Moungali` + `Brazzaville, Congo`
- **Note**: Pas de mention "Croisement Lénine - Maya-Maya" dans le code actuel

### Téléphones
- **Téléphone 1**: `06 569 12 35`
- **Téléphone 2**: `05 745 36 88`
- **Fonction copyToClipboard**: Copie `065691235` et `057453688` (sans espaces)

### WhatsApp
- **URL**: `https://wa.me/242066934735`
- **Note**: Numéro différent des téléphones affichés

### Email
- **Email**: `centremedvida@gmail.com`
- **Fonction copyToClipboard**: Copie l'email

### Informations légales
- **RCCM**: `B13-0506`
- **NIU**: `M2300009961883`
- **Copyright**: `© {currentYear} Centre Médical VIDA - Brazzaville, Congo`

**Note**: Pas de date de création ni de lien Google Maps dans le code actuel

---

## 🌐 RÉSEAUX SOCIAUX

**Fichier source**: `frontend/components/layout/Header.tsx` et `frontend/components/layout/Footer.tsx`

### Plateformes présentes dans le code

#### WhatsApp
- **URL**: `https://wa.me/242066934735`
- **Couleur hover**: `#25D366`
- **Statut**: Lien actif

#### Facebook
- **URL**: `#` (lien vide)
- **Couleur hover**: `#1877F2`
- **Statut**: Lien non défini

#### Instagram
- **URL**: `#` (lien vide)
- **Couleur hover**: `#E4405F`
- **Statut**: Lien non défini

#### TikTok
- **URL**: `#` (lien vide)
- **Couleur hover**: `#000000` (black)
- **Statut**: Lien non défini

#### LinkedIn
- **URL**: `#` (lien vide)
- **Couleur hover**: `#0A66C2`
- **Statut**: Lien non défini

#### YouTube
- **URL**: `#` (lien vide)
- **Couleur hover**: `#FF0000`
- **Statut**: Lien non défini

**Note**: Seul WhatsApp a un lien réel. Tous les autres pointent vers `#`

---

## 🔗 LIENS RAPIDES (Footer)

**Fichier source**: `frontend/components/layout/Footer.tsx`

### Navigation footer
1. **Accueil** → `#hero`
2. **Services** → `#services`
3. **À propos** → `#a-propos`
4. **Prendre RDV** → Ouvre modal (bouton, pas lien)

---

## 📝 SECTION CTA (Call to Action)

**Fichier source**: `frontend/app/page.tsx` (Section #cta)

### Contenu
- **Titre**: `Une Question sur Votre Vue ?`
- **Sous-titre**: `Contactez-nous, nous vous répondrons rapidement`
- **Bouton 1**: `Prendre RDV` (ouvre AppointmentModal)
- **Bouton 2**: `Nous écrire` (ouvre modal contact avec icône Telegram)

**Note**: Le bouton "Nous écrire" utilise une icône Telegram (SVG inline) mais ouvre un modal de contact générique

---

## 📝 MODAL CONTACT

**Fichier source**: `frontend/app/page.tsx` et `frontend/components/layout/Header.tsx`

### Contenu du modal
- **Titre**: `Nous écrire`
- **Description**: `Envoyez-nous un message, nous vous répondrons rapidement.`

### Champs du formulaire
1. **Nom complet** (requis) - Placeholder: `Votre nom`
2. **Email** (requis) - Placeholder: `votre@email.com`
3. **Sujet** (optionnel) - Placeholder: `Objet de votre message`
4. **Message** (requis) - Placeholder: `Votre message...` (textarea 4 rows)

### Bouton
- **Texte**: `Envoyer`
- **Icône**: `Send` (Lucide React)
- **Action**: Simulation d'envoi (TODO: Intégrer avec l'API backend)
- **Toast success**: `Message envoyé avec succès !`
- **Toast error**: `Erreur lors de l'envoi du message`

**Note**: Le formulaire ne fait actuellement qu'une simulation (setTimeout 1000ms), pas d'appel API réel

---

## 🎨 ÉLÉMENTS VISUELS

**Fichiers sources**: Divers composants

### Images Hero Slider
- `/images/hero/hero-1-vision.jpg`
- `/images/hero/hero-2-technology.png`
- `/images/hero/hero-3-team.png`
- `/images/hero/hero-4-appointment.png`

### Images Services
- `/images/services/consultation.png`
- `/images/services/depistage.png`
- `/images/services/lunetterie.png`
- `/images/services/chirurgie.png`

### Image Placeholder
- `/images/placeholder-service.jpg` (fallback pour services)

---

## 🎯 ICÔNES LUCIDE REACT UTILISÉES

**Fichiers sources**: Divers composants

### Page d'accueil (page.tsx)
- `BadgeCheck` - Compétence
- `Stethoscope` - Équipement Moderne
- `Ear` - À Votre Écoute
- `Smartphone` - Facilité d'Accès
- `ArrowRight` - Bouton CTA
- `X` - Fermer modal
- `Send` - Envoyer message

### Header (Header.tsx)
- `Menu` - Menu mobile
- `X` - Fermer menu
- `Calendar` - Prendre RDV
- `Phone` - Téléphone (dropdown contact)
- `Send` - Envoyer (modal contact)

### Footer (Footer.tsx)
- `MapPin` - Adresse
- `Phone` - Téléphone
- `Mail` - Email
- `Clock` - Horaires

**Note**: Pas d'icônes `Eye`, `Search`, `Glasses`, `Activity` dans le code actuel (contrairement à ce que j'avais écrit avant)

---

## 📊 STATISTIQUES

**Note**: Il n'y a PAS de section "Chiffres Clés" ou "Statistiques" dans le code actuel de `page.tsx`. Cette section n'existe pas.

---

## 🎨 CHARTE GRAPHIQUE

**Fichier source**: `frontend/tailwind.config.ts` et styles CSS

### Couleurs (définies dans Tailwind)
- **vida-teal**: `#1D9A94` (couleur primaire)
- **text-primary**: Défini dans Tailwind
- **text-secondary**: Défini dans Tailwind

### Backgrounds spéciaux
- `bg-[#F5F5F0]` - Background avec grain
- `bg-white/5` - Background ultra-transparent
- `bg-gray-900/5` - Background boutons

### Effets CSS
- **vida-grain-strong**: Classe CSS pour effet grain
- **service-details-dropdown**: Classe CSS pour dropdown services
- **hero-ken-burns**: Animation zoom sur images hero
- **scanner-rotate**: Animation rotation scanner (slide 1)

### Typographie (classes Tailwind)
- **font-hero**: Police pour logo et titres hero
- **font-heading**: Police pour titres de sections
- **font-body**: Police pour corps de texte

**Note**: Les polices exactes (Sora, Plus Jakarta Sans, Inter) ne sont pas visibles dans le code TypeScript, elles sont probablement définies dans `globals.css` ou `tailwind.config.ts`

---

## � COMPOSANTS SPÉCIAUX

### Eye Scanner (Slide 1 uniquement)
**Fichier source**: `frontend/components/ui/HeroSlider.tsx`

Animation SVG affichée uniquement sur le slide 1:
- Position: `right: 5%, top: 25%`
- Visible uniquement sur desktop (`hidden md:block`)
- Taille: 320x320px (lg: 380x380px)
- Animation: `scanner-rotate` (rotation)
- Couleurs: Blanc avec opacité + Orange (`rgba(249,115,22,0.8)`)

---

## � ANIMATIONS

**Fichier source**: `frontend/lib/animations.ts` (importé)

### Animations utilisées
- `fadeInUp` - Apparition avec montée
- `staggerContainer` - Container pour animations décalées
- `staggerItem` - Items avec animation décalée
- `backdropFade` - Fondu du backdrop modal
- `modalScale` - Zoom de la modale

### Paramètres Hero Slider
- **SLIDE_DURATION**: 8000ms (8 secondes)
- **TICK_INTERVAL**: 100ms
- **Transition opacity**: 700ms
- **Progress ring**: Animation linéaire 100ms

---

## 📋 DONNÉES MANQUANTES / NON IMPLÉMENTÉES

### Dans le code actuel
- ❌ Pas de section "Chiffres Clés" / "Statistiques"
- ❌ Pas de section "Témoignages"
- ❌ Pas de mention "Croisement Lénine - Maya-Maya" dans l'adresse
- ❌ Pas de date de création (23 décembre 2022)
- ❌ Pas de lien Google Maps
- ❌ Pas de délai de réponse email ("24h ouvrées")
- ❌ Pas de moyens de paiement détaillés
- ❌ Pas de pause déjeuner dans les horaires (12h30-14h00)
- ❌ URLs réseaux sociaux (Facebook, Instagram, TikTok, LinkedIn, YouTube) = `#`
- ❌ Formulaire contact ne fait qu'une simulation, pas d'API

### Incohérences
- ⚠️ Numéro WhatsApp (`242066934735`) différent des téléphones affichés (`06 569 12 35` / `05 745 36 88`)
- ⚠️ Fonction copyToClipboard copie les numéros sans espaces (`065691235`, `057453688`)

---

## 📅 HISTORIQUE DES VERSIONS

### Version 1.0.0 (17 janvier 2026)
- ✅ Extraction EXACTE du contenu frontend
- ✅ Vérification ligne par ligne du code
- ✅ Suppression de toutes les inventions
- ✅ Documentation UNIQUEMENT de ce qui existe réellement
- ✅ Identification des données manquantes
- ✅ Prêt pour migration vers backend

---

## 🎯 UTILISATION DE CE DOCUMENT

### Pour la migration backend
1. Utiliser UNIQUEMENT les données présentes ici
2. Ne PAS inventer de données supplémentaires
3. Compléter les données manquantes APRÈS validation utilisateur
4. Créer les fixtures Django avec ces données exactes

### Pour les tests
1. Comparer le rendu frontend avant/après migration
2. Vérifier que tous les textes sont identiques
3. Valider que toutes les images s'affichent
4. Tester tous les liens (beaucoup sont `#`)

---

**Document créé le**: 17 janvier 2026  
**Version**: 1.0.0 - CORRIGÉE  
**Statut**: Archive officielle du contenu RÉEL  
**Auteur**: Équipe projet VIDA  
**Prochaine étape**: Validation utilisateur avant migration



