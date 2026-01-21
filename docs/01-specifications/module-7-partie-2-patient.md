# 📋 CAHIER DES CHARGES - CENTRE MÉDICAL VIDA
## Module 7 (Partie 2) : Interface Patient & Technique

---

## 🛍️ INTERFACE PATIENT : CATALOGUE EN LIGNE

### URL : `/lunetterie`

### Objectif
Permettre aux patients de parcourir le catalogue, essayer virtuellement et commander en ligne.

### Architecture PWA Offline-First (CORRIGÉ: implémenté comme prioritaire)

**Stratégie de cache pour la lunetterie** :
- Cache produits : Catalogue complet hors-ligne
- Cache favoris : Sauvegarde locale des favoris
- Cache panier : Sauvegarde locale du panier

**Données synchronisées hors-ligne** :
- Produits disponibles
- Panier utilisateur
- Favoris
- Historique des consultations

**Fonctionnalités disponibles hors-ligne** :
- Consultation du catalogue
- Consultation des détails produits
- Accès aux favoris
- Navigation dans le catalogue

**Stratégie de synchronisation** :
- Sync automatique au retour en ligne
- Résolution des conflits
- Notifications de statut hors-ligne/en ligne

---

## 📄 PAGE 1 : CATALOGUE LUNETTERIE

### Structure

#### Section Hero

**Contenu** :
- Titre H1 : "Trouvez vos lunettes idéales"
- Sous-titre : "Large choix de montures et verres correcteurs. Essayage virtuel gratuit."
- Boutons :
  - Primaire : "Essayage virtuel" (icône `Camera`)
  - Secondaire : "Parcourir catalogue"
- Illustration : `shopping.svg`

**Design** :
- Background : Dégradé teal/10
- Grain obligatoire
- Height : 60vh

---

#### Section Filtres (Sidebar ou Collapsible)

**Layout** : Sidebar gauche (desktop) | Top collapsible (mobile)

**Filtres disponibles** :

1. **Recherche**
   - Input : "Rechercher montures, marques..."
   - Autocomplete

2. **Catégorie** (Radio)
   - Montures adultes
   - Montures enfants
   - Verres
   - Accessoires

3. **Genre** (Checkboxes multi-select, si montures)
   - Homme | Femme | Enfant | Mixte

4. **Forme** (Checkboxes, si montures)
   - Rectangulaire | Ronde | Ovale | Papillon | Aviateur | Carrée | Œil de chat

5. **Matériau** (Checkboxes)
   - Métal | Plastique | Titane | Acétate | Bois

6. **Marque** (Checkboxes)
   - Liste marques
   - Search bar si >10

7. **Prix** (Range slider)
   - Min : 0 FCFA
   - Max : 100 000 FCFA
   - Affichage temps réel

8. **Couleur** (Si montures)
   - Swatches cliquables
   - Multi-select

9. **Caractéristiques** (Checkboxes)
   - Charnières flex
   - Protection UV
   - Anti-rayures
   - Photochromique (verres)

**Actions** :
- Bouton : "Réinitialiser"
- Badge compteur : "47 produits trouvés"

**Design** :
- Background blanc
- Border-right 1px gray-200
- Sticky position
- Sections accordion collapsibles

---

#### Section Grille Produits

**Layout** : Grid 3 colonnes desktop, 2 tablet, 1 mobile

**Tri** (Dropdown top-right) :
- Pertinence (défaut)
- Prix croissant | décroissant
- Nouveautés
- Meilleures ventes
- Mieux notés

---

#### Card Produit

**Image** :
- Photo principale (aspect ratio 1:1)
- Badge coin sup. gauche : "Nouveau" (< 30j) | "Promo" (réduction)
- Badge coin sup. droit : "-20%" (si promo)
- Hover : Zoom léger + image secondaire (si existe)
- Icône overlay : `Eye` (essayage virtuel, si monture)

**Info produit** :
- Marque : Badge petit
- Nom : "Ray-Ban Aviator Classic"
- Prix :
  - Si promo : Prix barré + nouveau prix (teal, bold)
  - Sinon : Prix normal
- Rating : ⭐⭐⭐⭐⭐ (5.0) + "24 avis"
- Stock : Badge "En stock" (vert) | "Stock limité" (orange)

**Actions** :
- Bouton : "Voir détails" (hover visible)
- Icône `Heart` : Favoris (toggle)
- Icône `ShoppingCart` : Panier (quick add)

**Design** :
- Border-radius 4px
- Shadow niveau 1 → 2 hover
- Transition 300ms
- Gap `gap-6`

---

#### Pagination

- 24 produits/page
- Bouton "Charger plus" (load more) OU infinite scroll
- Affichage : "Produits 1-24 sur 47"

---

## 📄 PAGE 2 : DÉTAIL PRODUIT

### URL : `/lunetterie/produits/{slug}`

### Layout : 2 colonnes (Images 50% | Info 50%)

---

#### Colonne 1 : Galerie Images

**Contenu** :
- Image principale : Large (500x500px)
- Thumbnails dessous : Carrousel horizontal
- Clic thumbnail : Change principale
- Zoom : Clic image → Lightbox plein écran
- Badge : "4 photos"

**Design** :
- Border-radius 4px
- Zoom smooth

---

#### Colonne 2 : Informations

**Section A : Header**
- Marque : Badge + logo
- Nom produit : H1
- SKU : Petit texte gris
- Rating : ⭐⭐⭐⭐⭐ (5.0) + "24 avis" (cliquable → scroll)
- Stock : Badge "En stock (12)" (vert) | "Stock limité (3)" (orange)

---

**Section B : Prix**
- **Si promo** :
  - Prix barré : 50 000 FCFA
  - Nouveau : **40 000 FCFA** (grande typo teal)
  - Économie : Badge "Économisez 10 000 (20%)"
- **Sinon** : Prix unique

---

**Section C : Description**
- Texte formaté (HTML safe)
- Expandable si >200 caractères ("Lire plus")

---

**Section D : Caractéristiques** (Si monture)

Liste structurée :
- Genre : Homme
- Forme : Aviateur
- Matériau : Métal
- Couleur : Noir mat
- Dimensions : 52-18-140 mm
- Poids : 28g
- Protection UV : 100%
- Charnières flex : Oui

---

**Section E : Options** (Si verres)

- Type verre : Radio (Unifocal | Progressif)
- Traitements : Checkboxes
  - Anti-reflets (+5 000 FCFA)
  - Anti-rayures (+3 000 FCFA)
  - Photochromique (+15 000 FCFA)
- **Prix total** : Mise à jour temps réel

---

**Section F : Actions**

- Quantité : Input number (défaut 1, si accessoire)
- **Bouton primaire** : "Essayer virtuellement" (si monture)
  - Icône `Camera`
  - Ouvre module essayage
- **Bouton primaire** : "Ajouter au panier" (large, teal)
  - Si monture : Modal "Avec/sans verres correcteurs ?"
    - Option 1 : "Monture seule"
    - Option 2 : "Monture + verres" → Configurateur
- **Bouton secondaire** : "Favoris" (icône `Heart`)
- Lien : "Besoin d'aide ? Contactez-nous"

---

**Section G : Infos Pratiques**

- Icône `Truck` : "Livraison gratuite dès 50 000"
- Icône `RefreshCw` : "Retour gratuit 14 jours"
- Icône `Shield` : "Garantie 2 ans"
- Icône `Phone` : "Assistance téléphone"

---

#### Onglets Informations (Sous header)

**3 tabs** :

**Tab 1 : Spécifications**
- Tableau détaillé caractéristiques
- Format : Label | Valeur

**Tab 2 : Avis Clients (24)**
- Liste avis :
  - Avatar + Nom (initiales)
  - Rating ⭐
  - Date
  - Texte commentaire
  - Bouton "Utile" (like)
- Tri : Récents | Utiles | Meilleures notes
- Pagination : 10 avis/page
- Si patient avec achat : "Laisser un avis"

**Tab 3 : Questions & Réponses**
- Liste Q&R existantes
- Bouton : "Poser une question"
- Réponse par VIDA

---

#### Section Produits Similaires

**Titre** : "Vous aimerez aussi"

**Affichage** : Carrousel horizontal (4 visibles desktop)

**Contenu** : Cards produits identiques catalogue

**Algorithme** :
- Même catégorie + genre
- OU même marque
- Prix similaire ±20%

---

#### Section Récemment Consultés

**Titre** : "Récemment consultés"

**Affichage** : Carrousel (localStorage)

**Limite** : 10 derniers

---

## 📸 MODULE ESSAYAGE VIRTUEL

### URL : Modal overlay ou `/lunetterie/essayage-virtuel`

### Objectif
Essayer virtuellement montures via webcam ou photo.

---

### Technologies

- **Face AR API** : Détection faciale
- **TensorFlow.js** : Traitement client
- **Three.js** : Rendu 3D (si modèles 3D disponibles)
- **Fallback** : Overlay 2D simple

---

### Structure

#### Étape 1 : Choix Mode

**Modal intro** :

**Option 1 : Webcam en direct**
- Icône `Camera` (large)
- Titre : "Essayage en direct"
- Description : "Utilisez webcam pour essayer en temps réel"
- Note : "Autorisez l'accès caméra"
- Bouton : "Démarrer"

**Option 2 : Upload Photo**
- Icône `Upload` (large)
- Titre : "Essayer avec photo"
- Description : "Uploadez photo de face (bonne luminosité)"
- Formats : JPEG, PNG (max 5 MB)
- Bouton : "Choisir photo"

---

#### Étape 2 : Interface Essayage

**Layout** : Full-screen modal

**Zone centrale** :
- Vidéo stream (webcam) OU image uploadée
- Overlay monture superposé temps réel
- Détection auto position visage
- Ajustement taille/position selon morphologie

---

**Contrôles (Sidebar droite)** :

**Section A : Sélection Monture**
- Liste déroulante : Toutes montures
- Thumbnails cliquables
- Recherche rapide
- Favoris (si connecté)

**Section B : Ajustements Manuels**
- Slider : Taille (-20% à +20%)
- Slider : Position verticale
- Slider : Position horizontale
- Slider : Rotation (angle tête)
- Bouton : "Réinitialiser"

**Section C : Filtres/Effets**
- Toggle : "Verres teintés" (aperçu couleur)
- Toggle : "Afficher reflets" (réalisme)

---

**Actions (Footer)** :
- Bouton : "Capturer" (screenshot)
  - Enregistre dans galerie
  - Option : Télécharger | Partager
- Bouton : "Changer monture"
- Bouton : "Ajouter au panier" (monture actuelle)
- Bouton : "Fermer"

---

#### Étape 3 : Galerie Captures

**Affichage** : Grille photos capturées

**Contenu par photo** :
- Image avec monture
- Nom monture
- Prix
- Actions :
  - Télécharger
  - Partager (WhatsApp, Email, Facebook)
  - Supprimer
  - Comparer (sélection multiple)

**Comparateur** (2-4 photos) :
- Affichage côte à côte
- Facilite choix

---

### Contraintes Techniques

**Performances** :
- Détection faciale : <100ms latence
- FPS webcam : 30 fps min
- Rendu monture : Temps réel

**Compatibilité** :
- Chrome, Firefox, Safari (desktop + mobile)
- Fallback gracieux si WebRTC non supporté

**Confidentialité** :
- Traitement 100% client-side (pas d'envoi serveur)
- Images : localStorage temporaire
- Option RGPD : "Ne pas stocker"

---

## 🎨 DESIGN SYSTEM LUNETTERIE

### Couleurs Supplémentaires

```
Premium : #D4AF37 (Or) pour produits haut gamme
Sale : #EF4444 (Rouge) pour promos
```

---

### Badges Produits

**Nouveauté** :
- Background : Teal
- Texte : Blanc
- Position : Coin sup. gauche
- Animation : Pulse subtil

**Promotion** :
- Background : Rouge
- Texte : Blanc
- Position : Coin sup. droit
- Texte : "-20%" (dynamique)

**Stock** :
- En stock : Vert
- Stock limité : Orange (<5)
- Rupture : Rouge

---

### Cards Produits

**States** :
- Default : Border gray-200, shadow 1
- Hover : Border teal, shadow 2, scale 1.02
- Selected : Border teal 2px, background teal/5

---

### Grille Responsive

**Breakpoints** :
- Mobile (<768px) : 1 colonne
- Tablet (768-1023px) : 2 colonnes
- Desktop (≥1024px) : 3-4 colonnes

**Optimisations mobile** (CORRIGÉ: PWA Offline-First implémenté comme prioritaire):
- Touch targets : Min 44x44px
- Scrolling infini préféré à pagination lourde
- Lazy loading images
- **PWA Offline-First** : Mode hors-ligne complet avec synchronisation automatique
  - Données disponibles hors-ligne : Catalogue, produits, panier, favoris
  - Actions en attente : Ajout au panier, favoris
  - Sync automatique au retour en ligne

---

### Icônes Spécifiques (Lucide React)

- `Glasses` : Lunetterie
- `Eye` : Essayage virtuel
- `Camera` : Webcam
- `Upload` : Upload photo
- `ShoppingCart` : Panier
- `Heart` : Favoris
- `Star` : Notation
- `Package` : Stock/Livraison
- `TrendingUp` : Marge
- `AlertTriangle` : Alertes

---

## 🔌 API ENDPOINTS (Django REST Framework)

### Produits

```
GET    /api/lunetterie/products/
POST   /api/lunetterie/products/              [Admin]
GET    /api/lunetterie/products/{id}/
PATCH  /api/lunetterie/products/{id}/         [Admin]
DELETE /api/lunetterie/products/{id}/         [Admin]
GET    /api/lunetterie/products/{id}/similar/
POST   /api/lunetterie/products/{id}/review/  [Patient]
```

**Filtres** :
- `?category=montures-adultes`
- `?brand=ray-ban`
- `?min_price=10000&max_price=50000`
- `?gender=homme`
- `?shape=aviateur`
- `?material=metal`
- `?in_stock=true`
- `?is_promo=true`
- `?search=aviator`
- `?ordering=-created_at`

---

### Stock

```
GET    /api/lunetterie/stock/                [Admin]
POST   /api/lunetterie/stock/adjustment/     [Admin]
GET    /api/lunetterie/stock/movements/      [Admin]
GET    /api/lunetterie/stock/alerts/         [Admin]
POST   /api/lunetterie/stock/inventory/      [Admin]
PATCH  /api/lunetterie/stock/inventory/{id}/ [Admin]
```

---

### Commandes

```
GET    /api/lunetterie/orders/               [Admin/Patient]
POST   /api/lunetterie/orders/               [Patient/Admin]
GET    /api/lunetterie/orders/{id}/
PATCH  /api/lunetterie/orders/{id}/          [Admin]
POST   /api/lunetterie/orders/{id}/cancel/
PATCH  /api/lunetterie/orders/{id}/status/   [Admin]
GET    /api/lunetterie/orders/{id}/invoice/  [PDF]
```

---

### Fournisseurs (Admin uniquement)

```
GET    /api/lunetterie/suppliers/
POST   /api/lunetterie/suppliers/
GET    /api/lunetterie/suppliers/{id}/
PATCH  /api/lunetterie/suppliers/{id}/
GET    /api/lunetterie/suppliers/{id}/orders/
```

---

### Bons de Commande (Admin)

```
GET    /api/lunetterie/purchase-orders/
POST   /api/lunetterie/purchase-orders/
GET    /api/lunetterie/purchase-orders/{id}/
PATCH  /api/lunetterie/purchase-orders/{id}/
POST   /api/lunetterie/purchase-orders/{id}/send/
POST   /api/lunetterie/purchase-orders/{id}/receive/
```

---

### Statistiques (Admin)

```
GET    /api/lunetterie/stats/sales/
GET    /api/lunetterie/stats/products/
GET    /api/lunetterie/stats/inventory/
GET    /api/lunetterie/stats/suppliers/
GET    /api/lunetterie/stats/export/          [CSV/PDF]
```

**Paramètres** :
- `?period=this_month` (today, week, month, 3_months, year, custom)
- `?start_date=2026-01-01&end_date=2026-01-31`
- `?format=json|csv|pdf`

---

## 🧪 TESTS

### Tests Unitaires (Backend)

**Django Pytest** :

**Models** :
- Validation champs (SKU unique, prix >0)
- Calcul marge auto
- Calcul quantité disponible (quantity - reserved)
- Historique statuts commande

**Serializers** :
- Validation données produits
- Nested serializers (images, traitements)
- Calcul prix avec réductions

**Views/ViewSets** :
- Permissions RBAC (admin vs patient)
- Filtres produits
- Pagination
- Tri

**Services/Utils** :
- Génération SKU auto
- Génération N° commande unique
- Calcul stock après mouvement
- Déclenchement alertes stock
- Export PDF facture/bon commande

**Coverage** : >80%

---

### Tests API (Backend)

**Pytest + DRF** :

**Produits** :
```python
# Créer produit (admin OK, patient KO)
# Lister produits avec filtres
# Détail produit public
# Modifier (admin uniquement)
# Supprimer (vérif pas de stock)
```

**Stock** :
```python
# Ajustement stock
# Mouvements enregistrés
# Alertes générées si seuil
# Inventaire physique complet
```

**Commandes** :
```python
# Créer commande patient
# Réservation stock auto
# Changement statut workflow
# Calcul montants (HT, TTC, remise)
# Génération facture PDF
```

**Statistiques** :
```python
# Calculs corrects (CA, marge, rotation)
# Filtres période
# Export CSV/PDF
```

---

### Tests Frontend

**Jest + React Testing Library** :

**Composants Catalogue** :
- Affichage grille produits
- Filtres interactifs
- Tri fonctionnel
- Pagination
- Card produit (image, prix, stock)

**Page Détail** :
- Galerie images
- Sélection options (traitements)
- Calcul prix temps réel
- Ajout panier

**Essayage Virtuel** :
- Permission webcam
- Upload photo
- Overlay monture
- Capture screenshot

**Admin** :
- Formulaire produit (validation)
- Tableau stock (filtres)
- Commandes (changement statut)
- Graphiques statistiques (rendu)

---

### Tests E2E

**Playwright ou Cypress** :

**Scénario 1 : Parcours Patient**
1. Accès catalogue
2. Application filtres (genre, prix)
3. Clic produit → Détail
4. Essayage virtuel
5. Ajout panier
6. Validation commande

**Scénario 2 : Gestion Stock Admin**
1. Connexion admin
2. Accès inventaire
3. Ajustement stock produit
4. Vérification mouvement créé
5. Alerte déclenchée si seuil

**Scénario 3 : Commande Admin**
1. Nouvelle commande
2. Sélection patient
3. Ajout produits
4. Changement statut workflow
5. Génération facture

**Scénario 4 : Bon Commande Fournisseur**
1. Création PO
2. Ajout produits
3. Envoi fournisseur
4. Réception marchandises
5. MAJ stock auto

---

### Tests Accessibilité

**Axe-core** :
- Catalogue : Navigation clavier, ARIA labels
- Filtres : Checkboxes accessibles
- Essayage virtuel : Instructions claires, alternative texte
- Admin : Tableaux sémantiques, formulaires labelisés

**WCAG 2.1 AA** :
- Contraste ≥4.5:1
- Labels explicites
- Navigation clavier complète
- Focus visible

---

## ✅ CRITÈRES D'ACCEPTATION COMPLETS

### Fonctionnel

#### Admin
- [ ] Dashboard lunetterie : KPI temps réel + graphiques
- [ ] Catalogue produits : CRUD complet
- [ ] Upload multi-images (drag & drop)
- [ ] Gestion inventaire : Stock, mouvements, alertes
- [ ] Inventaire physique : Comptage + ajustements
- [ ] Commandes patients : Workflow complet
- [ ] Réservation stock automatique
- [ ] Fournisseurs : CRUD + bons commande
- [ ] Réceptions marchandises : MAJ stock auto
- [ ] Statistiques : Graphiques + export

#### Patient
- [ ] Catalogue en ligne : Filtres + tri + recherche
- [ ] Page détail produit : Galerie + specs + avis
- [ ] Essayage virtuel : Webcam + upload photo
- [ ] Ajout panier fonctionnel
- [ ] Favoris fonctionnels (si connecté)
- [ ] Mode hors-ligne PWA fonctionnel (CORRIGÉ: implémenté comme prioritaire)
- [ ] Données synchronisées en mode offline

---

### Technique

#### Backend
- [ ] Modèles Django complets (12 modèles)
- [ ] API endpoints : 25+ routes
- [ ] Permissions RBAC strictes
- [ ] Validations : SKU unique, prix >0
- [ ] Calculs auto : Marge, stock dispo, totaux
- [ ] Génération PDF : Factures, bons commande
- [ ] Export stats : CSV, Excel, PDF
- [ ] Upload images : S3/Cloudinary optimisé

#### Frontend
- [ ] Composants React réutilisables
- [ ] React Query : Cache + invalidation
- [ ] Formulaires : React Hook Form + Zod
- [ ] Essayage virtuel : Face AR API opérationnel
- [ ] Responsive : Mobile + tablet + desktop
- [ ] Lazy loading images
- [ ] Infinite scroll OU pagination

---

### Design
- [ ] Charte graphique VIDA respectée (100%)
- [ ] Cards produits uniformes
- [ ] Badges statuts colorés (vert/orange/rouge)
- [ ] Grilles responsives (1/2/3/4 colonnes)
- [ ] Graphiques Recharts lisibles
- [ ] Essayage virtuel : Interface intuitive
- [ ] Grain subtil obligatoire (opacity 15%)
- [ ] Border-radius : 4px (cards), 8px (containers)

---

### Performance
- [ ] Dashboard charge <2s
- [ ] Catalogue 247 produits <1s
- [ ] Upload images <3s
- [ ] Essayage virtuel : Latence <100ms
- [ ] FPS webcam : 30 fps min
- [ ] Lighthouse Score >90/100
- [ ] PWA : Score performance hors-ligne >95/100
- [ ] Temps de chargement hors-ligne <2s

---

### Tests
- [ ] Tests unitaires backend >80% coverage
- [ ] Tests API : Produits, stock, commandes
- [ ] Tests E2E : 4 scénarios critiques passent
- [ ] Tests accessibilité : WCAG 2.1 AA validée
- [ ] Tests cross-browser : Chrome, Firefox, Safari

---

### Sécurité & Conformité
- [ ] Images stockées sécurisées (S3 signed URLs)
- [ ] Logs audit mouvements stock
- [ ] Validation fichiers upload (formats, taille)
- [ ] RGPD : Consentement photos essayage
- [ ] Traitement essayage 100% client-side
- [ ] Pas d'envoi vidéo serveur
- [ ] Chiffrement E2E des données sensibles (CORRIGÉ: ajouté pour la sécurité des données de santé)
- [ ] Journalisation immuable des accès (logs d'audit avec chaînage cryptographique)
- [ ] Device fingerprinting pour détection des connexions suspectes

---

## 📊 MÉTRIQUES DE SUCCÈS

### Adoption
- Taux de conversion : Visiteur catalogue → Commande >2%
- Utilisation essayage virtuel : >30% des visiteurs
- Panier moyen : >35 000 FCFA

### Business
- CA lunetterie en ligne : +25% après 3 mois
- Taux de retour produits : <5%
- Satisfaction client : NPS >8/10

### Technique
- Uptime API : >99.5%
- Temps réponse API <200ms (P95)
- Taux erreurs <0.5%

---

## 📄 LIVRABLES MODULE 7

### Documentation Technique
1. README installation/configuration
2. API Documentation (Swagger/OpenAPI)
3. Guide intégration essayage virtuel
4. Architecture données (diagrammes)
5. Guide déploiement

### Documentation Utilisateur
1. Guide admin : Gestion catalogue/stock
2. Guide patient : Utilisation essayage
3. Tutoriels vidéo (optionnel)
4. FAQ lunetterie

### Code
1. Backend Django complet
2. Frontend React/Next.js complet
3. Tests unitaires + E2E
4. Scripts migration données
5. Seeds données démo

---

## 🔄 PROCHAINES ÉTAPES

Une fois Module 7 (Parties 1+2) validé, passage à :

### Module 8 : Fonctionnalités Avancées
- Téléconsultation vidéo (Twilio Video)
- Chatbot IA 24/7 (OpenAI/Claude)
- Rappels automatiques (Celery Beat + SMS)
- Programme fidélité (points, récompenses)
- Multi-langue (Français, Lingala, Kikongo)
- Blog santé oculaire (CMS + SEO)

### Module 9 : Intégrations Tierces & Paiements
- Stripe + Wave (paiement ligne)
- Twilio / Africa's Talking (SMS)
- SendGrid / Mailgun (emails)
- Google Maps API
- Google Calendar (sync)

### Prompt Ultime Final
- Synthèse complète 9 modules
- Guide step-by-step développement
- Bonnes pratiques
- Checklist validation complète

---

**Document créé le** : 05 janvier 2026  
**Version** : 2.0  
**Statut** : Partie 2/2 - Interface Patient & Technique  
**Complète avec** : Partie 1 (Back-office Admin)