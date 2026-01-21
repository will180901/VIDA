# 📋 CAHIER DES CHARGES - CENTRE MÉDICAL VIDA
## Module 7 (Partie 1) : Admin - Gestion Lunetterie & Stock

---

## 🎯 OBJECTIF DU MODULE

Créer un système complet de gestion lunetterie permettant :
- **Catalogue produits** : Montures, verres, accessoires avec fiches détaillées
- **Gestion inventaire** : Suivi stock temps réel, alertes rupture/seuil
- **Commandes patients** : Workflow devis → production → livraison
- **Fournisseurs** : Bons de commande, réceptions marchandises
- **Statistiques** : Analytics ventes, marge, rotation stock

**Priorités** :
- **Traçabilité** : Chaque mouvement stock enregistré (audit)
- **Temps réel** : Synchronisation instantanée
- **Alertes intelligentes** : Automatisation notifications
- **UX optimale** : Interface rapide et intuitive

---

## 🗃️ ARCHITECTURE DONNÉES

### Architecture PWA Offline-First (CORRIGÉ: implémenté comme prioritaire)

**Stratégie de cache pour la lunetterie** :
- Cache produits : Catalogue complet hors-ligne
- Cache commandes : Historique des commandes
- Cache fournisseurs : Informations fournisseurs

**Données synchronisées hors-ligne** :
- Produits disponibles
- Stocks (en lecture seule)
- Historique des commandes
- Informations des fournisseurs

**Fonctionnalités disponibles hors-ligne** :
- Consultation du catalogue
- Consultation des stocks
- Consultation des commandes
- Consultation des fournisseurs

**Stratégie de synchronisation** :
- Sync automatique au retour en ligne
- Résolution des conflits
- Notifications de statut hors-ligne/en ligne

### Modèles Django principaux

#### 1. Produits

**Product** (modèle parent)
```python
- id : UUID
- sku : String unique ("MON-RAY-001")
- name : String
- category : FK → Category
- brand : FK → Brand
- description : Text
- price_purchase : Decimal (HT)
- price_sale : Decimal (TTC)
- margin_percent : Decimal (auto-calculé)
- is_active : Boolean
- created_at, updated_at : DateTime
```

**Frame** (Monture - héritage Product)
```python
- product_ptr : OneToOne → Product
- type : Enum (Homme, Femme, Enfant, Mixte, Solaire)
- shape : Enum (Rectangulaire, Ronde, Aviateur, etc.)
- material : Enum (Métal, Plastique, Titane, Acétate)
- color : String
- size : String ("52-18-140")
- weight : Integer (grammes)
- images : ManyToMany → ProductImage
```

**Lens** (Verre - héritage Product)
```python
- product_ptr : OneToOne → Product
- type : Enum (Unifocal, Progressif, Solaire)
- material : Enum (Organique, Polycarbonate, Minéral)
- index : Decimal (1.5, 1.6, 1.67, 1.74)
- treatments : ManyToMany → Treatment
- diameter : Integer (mm)
```

**Accessory** (Accessoire - héritage Product)
```python
- product_ptr : OneToOne → Product
- type : Enum (Étui, Chaînette, Spray, Chiffon)
```

---

#### 2. Stock

**StockItem**
```python
- id : UUID
- product : FK → Product
- location : FK → StockLocation ("Boutique", "Réserve")
- quantity : Integer
- reserved_quantity : Integer (commandes en cours)
- available_quantity : Integer (quantity - reserved)
- reorder_point : Integer (seuil alerte)
- optimal_quantity : Integer
- last_counted_at : DateTime
```

**StockMovement**
```python
- id : UUID
- product : FK → Product
- location : FK → StockLocation
- type : Enum (ENTRY, SALE, RETURN, ADJUSTMENT, DAMAGE)
- quantity : Integer (+/-)
- reference : String (N° commande/PO)
- reason : Text
- user : FK → User
- created_at : DateTime
```

**StockAlert**
```python
- id : UUID
- product : FK → Product
- type : Enum (LOW_STOCK, OUT_OF_STOCK, OVERSTOCKED)
- severity : Enum (INFO, WARNING, CRITICAL)
- is_resolved : Boolean
- created_at, resolved_at : DateTime
```

---

#### 3. Commandes

**Order**
```python
- id : UUID
- order_number : String unique ("ORD-2026-00001")
- patient : FK → Patient
- prescription : FK → Prescription (ordonnance)
- status : Enum (QUOTE, CONFIRMED, IN_PRODUCTION, READY, DELIVERED)
- total_ht, total_ttc : Decimal
- discount_percent, discount_amount : Decimal
- payment_status : Enum (UNPAID, PARTIAL, PAID)
- payment_method : Enum (CASH, CARD, MOBILE_MONEY)
- notes : Text
- created_by : FK → User
- created_at, confirmed_at, delivered_at : DateTime
```

**OrderItem**
```python
- id : UUID
- order : FK → Order
- product : FK → Product
- quantity : Integer
- unit_price : Decimal
- customization : JSONField (specs verres OD/OG)
- production_status : Enum (PENDING, IN_PROGRESS, COMPLETED)
```

---

#### 4. Fournisseurs

**Supplier**
```python
- id : UUID
- name : String
- code : String unique ("SUPP-001")
- contact_person, email, phone : String
- address : Text
- payment_terms : String ("30 jours")
- delivery_delay : Integer (jours)
- rating : Integer (1-5)
- is_active : Boolean
```

**PurchaseOrder** (Bon de commande)
```python
- id : UUID
- po_number : String unique ("PO-2026-00001")
- supplier : FK → Supplier
- status : Enum (DRAFT, SENT, CONFIRMED, RECEIVED)
- order_date, expected_delivery : DateField
- total_ht, total_ttc : Decimal
- notes : Text
- created_by : FK → User
```

**Reception** (Réception marchandises)
```python
- id : UUID
- purchase_order : FK → PurchaseOrder
- reception_number : String unique ("REC-2026-00001")
- received_date : DateField
- received_by : FK → User
- has_issues : Boolean
- issues_description : Text
```

---

## 📊 PAGE 1 : DASHBOARD LUNETTERIE

**URL** : `/admin/lunetterie/dashboard`

### Structure

#### Header
- Titre H1 : "Gestion Lunetterie"
- Breadcrumb : `Admin > Lunetterie > Dashboard`
- Actions rapides :
  - Bouton "Nouvelle commande" (icône `Plus`, teal)
  - Bouton "Réception marchandises" (icône `Package`)

---

#### Section KPI (4 cards)

**Card 1 : Valeur stock total**
- Icône `Package` (teal, 64px circle)
- Chiffre : **2 450 000 FCFA**
- Détails :
  - Montures : 1 200 000 (156 unités)
  - Verres : 950 000 (89 paires)
  - Accessoires : 300 000 (234 unités)
- Variation : "+8% vs mois dernier" (flèche verte)

**Card 2 : Commandes en cours**
- Icône `ShoppingCart` (orange)
- Chiffre : **12 commandes**
- Répartition :
  - Devis : 3
  - En production : 5
  - Prêtes : 4
- Action : "Voir toutes"

**Card 3 : Ventes du mois**
- Icône `TrendingUp` (teal)
- Chiffre : **850 000 FCFA**
- Détails :
  - 23 ventes | Panier moyen : 36 956 FCFA
- Variation : "+15%"

**Card 4 : Alertes stock**
- Icône `AlertTriangle` (rouge si alertes)
- Badge compteur : "7"
- Détails :
  - Rupture : 2
  - Stock faible : 5
- Action : "Gérer"

**Design cards** :
- Grid 4 colonnes desktop, 2 mobile
- Background blanc, border-radius 4px
- Shadow niveau 1 → 2 hover
- Padding `p-6`, grain obligatoire

---

#### Section Graphique Ventes

**Titre** : "Évolution ventes - 30 derniers jours"

**Type** : Ligne (Recharts)
- Axe X : Dates
- Axe Y : Montant FCFA
- Lignes :
  - Ventes (teal solide)
  - Objectif (orange pointillé)
- Tooltip : Date + montant + nb ventes
- Export CSV (bouton top-right)

**Design** :
- Card blanche, height 300px
- Légende interactive

---

#### Section Best-Sellers

**Titre** : "Top 5 produits du mois"

**Affichage** : Liste compacte

**Contenu par ligne** :
- Rank : Badge "#1" (doré), "#2", "#3"...
- Image : Thumbnail 48x48px
- Nom : "Ray-Ban Aviator Classic"
- Catégorie : Badge "Monture adulte"
- Qté vendue : "12 unités"
- Revenus : "240 000 FCFA"
- Stock actuel : Badge vert/orange

**Design** :
- Hover ligne : Background teal/5
- Clic : Redirect fiche produit

---

#### Section Commandes récentes

**Titre** : "Commandes récentes" (5 dernières)

**Affichage** : Cards empilées

**Contenu card** :
- Badge statut (couleur)
- N° commande : "ORD-2026-00042"
- Patient : Avatar + Nom
- Date : "02/01/2026"
- Montant : **85 000 FCFA**
- Barre progression production : 0-100%
- Actions : Voir | Modifier

**Design** :
- Stack vertical, `gap-3`
- Shadow niveau 1

---

#### Section Alertes & Tâches

**Titre** : "Actions à faire"

**Alertes** (cards cliquables) :

1. **Rupture de stock** (rouge)
   - "2 produits en rupture"
   - Liste produits
   - Action : "Commander"

2. **Stock faible** (orange)
   - "5 produits sous seuil"
   - Action : "Voir liste"

3. **Devis en attente** (teal)
   - "3 devis sans validation"
   - Action : "Relancer"

4. **Réception à traiter** (teal)
   - "1 livraison reçue"
   - Action : "Traiter"

**Design** :
- Cards empilées
- Hover : Background teal/5
- Badge compteur top-right

---

## 📦 PAGE 2 : CATALOGUE PRODUITS

**URL** : `/admin/lunetterie/produits`

### Structure

#### Header & Actions
- Titre H1 : "Catalogue Produits"
- Boutons :
  - "Ajouter produit" (icône `Plus`, primaire)
  - "Importer CSV" (icône `Upload`)
  - "Exporter" (icône `Download`)

---

#### Filtres & Recherche (Sticky)

**Barre horizontale** :

1. **Recherche**
   - Input : "Rechercher produit, SKU, marque..."
   - Icône `Search`
   - Autocomplete

2. **Filtres**
   - Catégorie : Multi-select dropdown
   - Marque : Multi-select
   - Statut : Actif | Inactif | Tous
   - Stock : En stock | Faible | Rupture
   - Prix : Range slider (min-max)

3. **Tri**
   - Dropdown : Plus récents | A-Z | Prix ↑↓ | Stock ↑↓

**Actions** :
- "Réinitialiser filtres"
- Badge compteur : "247 produits"

---

#### Vue Produits (Toggle Grid/Liste)

**Vue Grid** (défaut) :

**Grille** : 4 colonnes desktop, 2 tablet, 1 mobile

**Card produit** :
- **Image** : 200x200px
  - Badge coin sup. gauche : "Nouveau" | "Promo"
  - Badge coin sup. droit : Stock (vert/orange/rouge)
- **Header** :
  - Nom : "Ray-Ban Aviator Classic"
  - SKU : "MON-RAY-001" (petit, gris)
- **Corps** :
  - Marque : Badge + logo
  - Catégorie : "Monture homme"
  - Prix vente : **45 000 FCFA** (grand, bold)
  - Prix achat : "28 000" (petit)
  - Marge : "+61%" (badge vert)
  - Stock : "12 unités"
- **Footer** :
  - Dropdown 3 points :
    - Voir détails
    - Modifier
    - Dupliquer
    - Gérer stock
    - Activer/Désactiver
    - Supprimer

**Design** :
- Border-radius 4px
- Hover : Shadow niveau 2, scale 1.02
- Gap `gap-4`

---

**Vue Liste** :

**Tableau** :
1. Checkbox (sélection multiple)
2. Image (48x48px)
3. SKU
4. Nom
5. Catégorie
6. Marque
7. Prix vente
8. Marge %
9. Stock
10. Statut
11. Actions

**Actions en masse** (si checkboxes) :
- Barre en haut
- Activer/Désactiver
- Modifier prix
- Exporter
- Supprimer

---

#### Pagination
- "Produits 1-20 sur 247"
- Items/page : 20 | 50 | 100
- Précédent | Suivant + numéros

---

## ➕ PAGE 3 : AJOUTER/MODIFIER PRODUIT

**URL** : `/admin/lunetterie/produits/nouveau` ou `/{id}/modifier`

### Formulaire (2 colonnes : Formulaire 60% | Preview 40%)

#### Section 1 : Informations générales

1. **Type produit** (required)
   - Radio : Monture | Verre | Accessoire
   - Affiche champs spécifiques dynamiquement

2. **SKU** (required, unique)
   - Input
   - Bouton "Générer auto"
   - Validation unicité backend

3. **Nom** (required)
   - Input, min 3 caractères

4. **Catégorie** (required)
   - Dropdown

5. **Marque** (required)
   - Dropdown
   - Option : "Ajouter nouvelle"

6. **Description**
   - Textarea WYSIWYG (bold, italic, listes)
   - Max 1000 caractères

---

#### Section 2 : Tarification

1. **Prix achat HT** (required)
   - Input number + suffix "FCFA"

2. **Prix vente TTC** (required)
   - Input number

3. **Marge** (calculée auto)
   - Affichage : "+61%"
   - Couleur : Vert >30% | Orange 10-30% | Rouge <10%
   - Formule : (Vente - Achat) / Achat * 100

4. **Réduction** (optionnel)
   - Checkbox "Appliquer réduction"
   - Si coché :
     - Type : % | Montant fixe
     - Valeur : Input
     - Dates : Début/fin

---

#### Section 3 : Champs spécifiques

**Si Monture** :
- Type : Dropdown (Homme, Femme, Enfant, Mixte, Solaire)
- Forme : Dropdown (Rectangulaire, Ronde, Aviateur...)
- Matériau : Dropdown (Métal, Plastique, Titane...)
- Couleur : Input texte + color picker
- Dimensions : 3 inputs (Largeur, Pont, Branche) → Format "52-18-140"
- Poids : Input grammes
- Caractéristiques : Checkboxes (Charnières flex, Protection UV...)

**Si Verre** :
- Type : Dropdown (Unifocal, Progressif, Solaire)
- Matériau : Dropdown (Organique, Polycarbonate...)
- Indice : Dropdown (1.5, 1.6, 1.67, 1.74)
- Traitements : Multi-select checkboxes (Anti-reflets, Anti-rayures...)
- Diamètre : Input mm
- Protection UV : Input %

**Si Accessoire** :
- Type : Dropdown (Étui, Chaînette, Spray...)
- Couleur : Input
- Dimensions : Input texte libre

---

#### Section 4 : Images

- Drag & drop zone : "Glissez images ou cliquez"
- Formats : JPEG, PNG, WebP (max 5 MB)
- Max : 10 images
- Preview grid :
  - Thumbnails 100x100px
  - Bouton "Principale" (première = défaut)
  - Icône `Trash` : Supprimer
  - Drag & drop : Réorganiser
- **Validation** : Min 1 image obligatoire

---

#### Section 5 : Stock initial

1. **Emplacement** (required)
   - Dropdown : Boutique | Réserve | Vitrine
   - Défaut : "Boutique"

2. **Quantité initiale** (required)
   - Input number

3. **Seuil alerte** (required)
   - Input : "5"
   - Note : Alerte si stock < seuil

4. **Quantité optimale** (optionnel)
   - Input : "30"

---

#### Section 6 : Statut

- Toggle : **Produit actif** (Oui/Non)
  - Si Non : Caché catalogue patient

---

#### Preview Sidebar (Droite)

**Contenu** :
- Titre : "Aperçu produit"
- Card style client :
  - Image principale
  - Nom, Prix, Marque
  - Badges (Nouveau, Promo)
- Mise à jour temps réel

---

### Boutons Actions (Footer fixe)

- "Enregistrer" (primaire)
- "Enregistrer et ajouter un autre" (secondaire)
- "Annuler" (tertiaire)

**Validation** :
- Erreurs sous champs
- Scroll auto première erreur

---

## 📦 PAGE 4 : GESTION STOCK

**URL** : `/admin/lunetterie/stock`

### Onglets (4 tabs)

1. **Inventaire** (vue globale)
2. **Mouvements** (historique)
3. **Alertes** (ruptures, seuils)
4. **Inventaire physique** (comptage)

---

### Tab 1 : Inventaire

#### Filtres
- Recherche produit
- Catégorie, Marque, Emplacement
- Statut stock : Tous | En stock | Faible | Rupture | Surstock

#### Tableau inventaire

**Colonnes** :
1. Image (48px)
2. SKU
3. Nom
4. Catégorie
5. Emplacement
6. **Quantité actuelle** (chiffre + barre progress)
7. Réservé
8. Disponible (= actuel - réservé)
9. Seuil
10. Optimal
11. **Statut** : Badge vert/orange/rouge
12. Dernière MAJ
13. Actions (Ajuster | Voir mouvements | Définir seuils)

**Design** :
- Lignes alternées
- Hover : Background teal/5
- Rupture : Ligne background rouge/5

**Pagination** : 50 items/page

**Actions en masse** :
- Ajuster stock (modale)
- Exporter sélection
- Définir seuils

---

### Tab 2 : Mouvements de stock

#### Filtres
- Date range
- Type : Entrée | Vente | Retour | Ajustement | Transfert | Casse
- Produit (autocomplete)
- Utilisateur
- Emplacement

#### Tableau mouvements

**Colonnes** :
1. Date & Heure
2. **Type** (badge coloré)
3. Produit (image + nom)
4. Emplacement
5. **Quantité** (+ vert | - rouge)
6. Stock après
7. Référence (N° commande/PO)
8. Utilisateur
9. Raison
10. Actions (Voir | Annuler si <24h)

**Design** :
- Entrée : Border-left verte 3px
- Sortie : Border-left rouge 3px

**Pagination** : 100 mouvements/page

**Export** : CSV avec filtres

---

### Tab 3 : Alertes stock

#### Cards alertes actives

**Alerte 1 : Rupture**
- Icône `XCircle` (rouge)
- Titre : "Rupture de stock"
- Badge : "2 produits"
- Liste : Image + Nom + Stock "0"
- Action : "Commander"

**Alerte 2 : Stock faible**
- Icône `AlertTriangle` (orange)
- Titre : "Stock sous seuil"
- Badge : "5 produits"
- Liste : Produits + Stock actuel vs seuil
- Barre progress rouge
- Action : "Commander" | "Ignorer"

**Alerte 3 : Surstock**
- Icône `TrendingUp` (bleu)
- Titre : "Surstock"
- Badge : "3 produits"
- Liste : Stock actuel > optimal
- Suggestion : "Promotion -20%"
- Action : "Créer promo" | "Ignorer"

**Design** :
- Cards expandables (accordion)
- Badge compteur top-right

**Actions globales** :
- "Marquer toutes vues"
- "Créer bon de commande groupé"

---

### Tab 4 : Inventaire physique

#### Démarrer inventaire

**Bouton** : "Démarrer nouvel inventaire"

**Modale** :
- Nom : "Inventaire mensuel janvier 2026"
- Date : Date picker (défaut aujourd'hui)
- Emplacement : Dropdown | Tous
- Catégorie : Dropdown | Toutes
- Checkbox : "Bloquer mouvements pendant comptage"
- Bouton : "Lancer"

---

#### Inventaire en cours

**Tableau comptage** :

**Colonnes** :
1. Checkbox (si partiel)
2. Image
3. SKU
4. Nom
5. Stock système (attendu)
6. **Stock physique** (INPUT à remplir)
7. **Écart** (calculé auto, +/- coloré)
8. Actions (Valider | Ajuster)

**Barre progression** :
- "24 / 156 comptés (15%)"
- Barre teal

**Actions** :
- "Enregistrer brouillon"
- "Finaliser inventaire" (après 100%)

---

#### Ajustement écarts

**Modale** :
- Produit : Nom + Image
- Stock système : "20"
- Stock compté : "17"
- Écart : "-3"
- **Raison** (required) : Dropdown (Casse, Vol, Erreur) + Textarea
- Bouton : "Confirmer ajustement"

**Résultat** :
- Mouvement créé (type ADJUSTMENT)
- Stock mis à jour
- Log audit

---

#### Historique inventaires

**Cards inventaires passés** :
- Nom + Date
- Produits comptés : "156/156"
- Écarts : "12"
- Valeur écarts : "-35 000 FCFA"
- Statut : Badge "Finalisé"
- Réalisé par : Nom
- Actions : Rapport PDF | Comparer

---

## 🛒 PAGE 5 : COMMANDES LUNETTERIE

**URL** : `/admin/lunetterie/commandes`

### Onglets (6 tabs avec badges)

1. **Toutes** (247)
2. **Devis** (12)
3. **Confirmées** (8)
4. **En production** (15)
5. **Prêtes** (5)
6. **Livrées** (207)

---

### Filtres & Recherche

- Recherche : "Commande, patient, numéro..."
- Date range
- Statut (si "Toutes")
- Paiement : Payé | Impayé | Partiel
- Montant : Range slider
- Tri : Date ↓ | Montant | Patient

---

### Liste commandes (Cards expandables)

**Header card (collapsed)** :
- Badge statut (couleur)
- N° : "ORD-2026-00042"
- Patient : Avatar + Nom
- Date : "02/01/2026"
- Montant : **85 000 FCFA** (bold)
- Paiement : Badge vert/rouge
- Icône `ChevronDown`

**Contenu card (expanded)** :

**A. Détails**
- Date confirmation : "03/01/2026"
- Créée par : "Marie K."
- Notes
- Ordonnance liée (lien)

**B. Produits**
- Tableau : Produit | Qté | Prix unit. | Total
- Sous-total HT
- Remise
- Total TTC

**C. Specs verres** (si présents)
- OD : Sphère, Cylindre, Axe, Addition
- OG : Idem

**D. Production & Livraison**
- Statut production : Barre 0-100%
- Livraison estimée : "10/01/2026"
- Livraison réelle : (si livrée)
- Retiré par : Patient (checkbox)

**E. Historique statuts**
- Timeline verticale :
  - "Devis créé" - Date (User)
  - "Confirmé" - Date
  - "En production" - Date
  - "Prêt" - Date
  - "Livré" - Date

**Footer (Actions)** :
- Modifier
- Changer statut (dropdown)
- Imprimer bon
- Envoyer SMS
- Annuler (rouge)

**Design** :
- Cards empilées, `space-y-4`
- Hover : Shadow niveau 2

---

### Créer nouvelle commande

**Bouton** : "Nouvelle commande" (top-right)

**Formulaire/Modale (Étapes)** :

**Étape 1 : Patient**
- Recherche autocomplete
- Si absent : "Créer nouveau"
- Affichage : Nom, âge, tél
- Dernière ordonnance : Option "Utiliser"

**Étape 2 : Produits**
- Catalogue filtrable simplifié
- Clic : Ajoute panier
- Panier sidebar :
  - Liste produits
  - Qté (input)
  - Prix unit./total
  - Icône `Trash` : Retirer
- Total temps réel

**Étape 3 : Customisation verres**
- Formulaire specs OD/OG :
  - Sphère, Cylindre, Axe, Addition (inputs)
- Option : "Importer depuis ordonnance"

**Étape 4 : Tarification**
- Sous-total HT
- Remise : Type (% | fixe) + Valeur + Raison
- Total TTC (auto)

**Étape 5 : Paiement**
- Radio : Immédiat (Espèces/Carte/Mobile) | Différé | Assurance

**Étape 6 : Finalisation**
- Notes : Textarea
- Livraison souhaitée : Date picker
- Statut initial : Radio (Devis | Confirmer)

**Boutons** :
- "Enregistrer devis"
- "Confirmer commande"
- "Annuler"

---

## 📦 PAGE 6 : FOURNISSEURS

**URL** : `/admin/lunetterie/fournisseurs`

### Onglets (3 tabs)

1. **Fournisseurs** (liste)
2. **Bons de commande** (PO)
3. **Réceptions** (marchandises)

---

### Tab 1 : Fournisseurs

#### Liste (Cards ou tableau)

**Card fournisseur** :
- Logo ou initiales
- Nom : "Essilor France"
- Code : "SUPP-001"
- Contact : Nom + Tél + Email (cliquables)
- Adresse
- Conditions paiement : "30 jours"
- Délai livraison : "15 jours"
- Rating : ⭐⭐⭐⭐⭐
- Badge : "Actif" (vert) | "Inactif"
- Stats :
  - Total commandes : "24"
  - Total dépensé : "1 250 000 FCFA"
- Actions : Voir | Modifier | Créer PO | Désactiver

**Bouton** : "Ajouter fournisseur"

---

#### Formulaire fournisseur

**Champs** :
- Nom (required)
- Code (auto ou manuel)
- Contact principal (nom, tél, email)
- Adresse
- Conditions paiement
- Délai livraison (jours)
- Site web
- Notes internes
- Rating (1-5 étoiles)
- Statut : Actif/Inactif

---

### Tab 2 : Bons de commande (PO)

#### Filtres
- Fournisseur
- Statut : Brouillon | Envoyé | Confirmé | Reçu | Annulé
- Date range
- Recherche N° PO

#### Tableau PO

**Colonnes** :
1. N° PO : "PO-2026-00005"
2. Date commande
3. Fournisseur
4. Statut (badge)
5. Nb produits
6. Montant HT
7. Montant TTC
8. Livraison prévue
9. Réception réelle
10. Actions (Voir | Modifier | Envoyer | Recevoir | Annuler)

**Bouton** : "Créer bon de commande"

---

#### Créer PO

**Formulaire** :

**Section 1 : Infos**
- Fournisseur (dropdown, required)
- N° PO (auto ou manuel)
- Date commande (picker, défaut aujourd'hui)
- Livraison prévue (picker)
- Notes

**Section 2 : Produits**
- Recherche autocomplete
- Ajout produit :
  - Produit (dropdown)
  - Qté (input)
  - Prix unit. HT (input, pré-rempli)
  - Total ligne (calculé)
- Liste dynamique :
  - Tableau produits
  - Modifier qté/prix
  - Supprimer ligne
- Sous-total HT
- TVA
- Total TTC

**Boutons** :
- "Enregistrer brouillon"
- "Envoyer au fournisseur" (génère PDF + email)
- "Annuler"

---

### Tab 3 : Réceptions

#### Liste réceptions

**Tableau** :
1. N° réception : "REC-2026-00001"
2. Date
3. PO lié : "PO-2026-00005" (cliquable)
4. Fournisseur
5. Nb produits
6. **Conformité** : Badge "Conforme" (vert) | "Non-conforme" (rouge)
7. Reçu par (user)
8. Actions (Voir | Modifier si <7j)

**Bouton** : "Enregistrer réception"

---

#### Enregistrer réception

**Formulaire** :

**Section 1 : Infos**
- PO (dropdown) : Sélectionne PO à recevoir
- Date réception (picker)
- N° réception (auto)

**Section 2 : Produits reçus**
- Tableau :

| Produit | Qté commandée | **Qté reçue** (input) | Conforme? (checkbox) | Commentaire |
|---------|---------------|-----------------------|----------------------|-------------|
| Nom + SKU | 20 | INPUT | CHECKBOX | TEXTAREA |

- Alerte si qté reçue > commandée

**Section 3 : Conformité**
- Checkbox : "Livraison conforme"
- Si non :
  - Textarea : "Description problèmes"
  - Checkbox : "Créer réclamation"

**Boutons** :
- "Valider réception" (primaire)
  - Crée mouvements stock (ENTRY)
  - MAJ statut PO
  - Notification si non-conformité
- "Annuler"

**Après validation** :
- Confirmation succès
- Stock mis à jour auto
- Email confirmation fournisseur
- Ticket si problème

---

## 📊 PAGE 7 : STATISTIQUES LUNETTERIE

**URL** : `/admin/lunetterie/statistiques`

### Structure

#### Sélecteur période

- Dropdown : Aujourd'hui | Semaine | Mois (défaut) | 3 mois | Année | Personnalisé
- Bouton : "Exporter rapport" (PDF)

---

#### KPI Globaux (4 cards)

**Card 1 : CA**
- Chiffre : **850 000 FCFA** (ce mois)
- Comparaison : "+15% vs dernier"
- Sparkline évolution

**Card 2 : Ventes**
- Chiffre : **23 ventes**
- Panier moyen : "36 956 FCFA"
- Comparaison : "+8%"

**Card 3 : Marge**
- Chiffre : **48%**
- Marge brute : "408 000 FCFA"
- Comparaison : "-2%"

**Card 4 : Rotation stock**
- Chiffre : **3.2** fois/mois
- Note : "Renouvelé tous les 9j"
- Comparaison : "+0.5"

---

#### Graphiques (2 colonnes)

**Graphique 1 : Évolution CA (Ligne)**
- Période : 12 mois
- Lignes : CA | Objectif | Année N-1
- Zoom possible

**Graphique 2 : Ventes par catégorie (Donut)**
- Segments :
  - Montures adultes : 45%
  - Verres progressifs : 30%
  - Montures enfants : 15%
  - Accessoires : 10%
- Total centre
- Clic : Drill-down

---

#### Top Produits (2 colonnes)

**Colonne 1 : Best-Sellers**
- Top 10 produits
- Tableau : Rank | Produit | Ventes | Revenus
- Badges 🥇🥈🥉 pour top 3

**Colonne 2 : Marges élevées**
- Top 10 rentables
- Tableau similaire + colonne Marge %

---

#### Analyse Stock (2 colonnes)

**Graphique 1 : Valeur stock (Barre horizontale)**
- Par catégorie
- Total affiché

**Graphique 2 : Produits lents (Tableau)**
- Critère : Aucune vente 90+ jours
- Colonnes : Produit | Dernière vente | Jours | Stock | Valeur | Action
- Suggestion : "Promotion"

---

#### Performance Fournisseurs

**Tableau** :
- Colonnes : Fournisseur | Nb commandes | Total | Délai moyen | Conformité % | Rating
- Tri : Total décroissant
- Clic ligne : Fiche fournisseur

---

#### Insights IA (Card)

**Recommandations auto** :
- Icône `Lightbulb` (orange)
- Liste insights :
  - 💡 "Montures enfants +25% en janvier. Stock +20%"
  - 💡 "5 produits sans vente 120j. Promo -20%"
  - 💡 "Essilor 98% conformité. Excellente fiabilité"
  - 💡 "Marge 48% > moyenne secteur 42%"
- Bouton : "Appliquer recommandations"

**Design** :
- Background dégradé teal/5 → orange/5
- Border-left orange 4px
- Grain

---

## ✅ CRITÈRES ACCEPTATION (Partie Admin)

### Fonctionnel
- [ ] Dashboard : KPI temps réel + graphiques
- [ ] Catalogue : CRUD produits complet
- [ ] Upload multi-images (drag & drop)
- [ ] Gestion stock : Inventaire, mouvements, alertes
- [ ] Inventaire physique : Comptage + ajustements
- [ ] Commandes : Workflow devis → livraison
- [ ] Réservation stock auto lors commande
- [ ] Fournisseurs : CRUD + bons commande
- [ ] Réceptions marchandises : MAJ stock auto
- [ ] Statistiques : Graphiques précis + export
- [ ] Mode hors-ligne PWA fonctionnel (CORRIGÉ: implémenté comme prioritaire)
- [ ] Données synchronisées en mode offline

### Technique
- [ ] API endpoints complets
- [ ] Permissions RBAC (admin uniquement)
- [ ] Validations backend (SKU unique, prix >0)
- [ ] Calculs auto (marge, stock disponible, totaux)
- [ ] Génération PDF (factures, bons commande)
- [ ] Export CSV/Excel statistiques
- [ ] Upload images optimisé (S3/Cloudinary)

### Design
- [ ] Charte VIDA respectée
- [ ] Cards uniformes
- [ ] Badges statuts clairs
- [ ] Grilles responsives
- [ ] Graphiques lisibles (Recharts)

### Performance
- [ ] Dashboard charge < 2s
- [ ] Catalogue 247 produits < 1s
- [ ] Upload images < 3s

---

**Document créé le** : 05 janvier 2026  
**Version** : 2.0  
**Statut** : Partie 1/2 - Back-office Admin  
**Suite** : Partie 2 (Interface Patient + Technique)