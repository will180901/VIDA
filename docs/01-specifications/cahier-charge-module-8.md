# 📋 CAHIER DES CHARGES - CENTRE MÉDICAL VIDA
## Module 8 : Paiements - VIDA Pay

---

## 🎯 OBJECTIF DU MODULE

Créer un système de paiement complet et sécurisé permettant :
- **Paiement en ligne** : Consultations, lunetterie, services additionnels
- **Mobile Money** : Intégration MTN MoMo et Airtel Money (marchés locaux)
- **Carte bancaire** : Stripe pour paiements internationaux
- **Wallet VIDA** : Compte virtuel patient pour paiements rapides
- **Abonnements** : Forfaits mensuels/annuels pour services récurrents
- **Facturation** : Génération automatique, suivi des impayés

**Priorités** :
- **Sécurité** : PCI DSS, encryption, conformité financière
- **Expérience** : Paiement en 1 clic, processus simplifié
- **Local** : Mobile Money dominant (MTN, Airtel) au Congo
- **Flexibilité** : Paiements fractionnés, reports, remboursements

---

## 🔐 ARCHITECTURE SÉCURITÉ PAIEMENT

### Standards & Conformité

**PCI DSS Niveau 1** (Plus strict) :
- Tokenisation des cartes (pas de stockage direct)
- Encryption AES-256 pour données sensibles
- Audit annuel PCI DSS
- Journals de sécurité (logs) non modifiables

**RGPD & Données Financières** :
- Minimisation : Stockage minimum données
- Chiffrement E2E pour transactions
- Droit à l'oubli : Anonymisation (pas suppression totale pour conformité légale)
- Consentement explicite pour stockage données cartes

### Infrastructure de Sécurité

**Services externes** :
- Stripe : Cartes bancaires (PCI DSS compliant)
- MTN MoMo API : Mobile Money local
- Airtel Money API : Alternative Mobile Money
- 2Checkout : Paiements internationaux alternatif

**Architecture interne** :
- API Gateway avec rate limiting strict (5 tentatives/15 min)
- Microservice dédié : `payments-service`
- Database séparée pour données financières
- Audit trail : Toutes les transactions loguées immuablement

---

## 💳 FONCTIONNALITÉS PRINCIPALES

### 1. Paiement en Ligne

**Intégration Stripe** :
- Elements UI : Formulaire carte sécurisé (iframe)
- Checkout Session : Page paiement Stripe (option)
- 3D Secure 2.0 : Authentification renforcée
- Webhooks : Réception événements (paiement réussi/échoué)

**Support cartes** :
- Visa, Mastercard (débit/crédit)
- Cartes locales (si supportées)
- Apple Pay, Google Pay (si disponible au Congo)

**Codes** :
```python
# Vue Django pour création Checkout Session
def create_checkout_session(request):
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price_data': {
                'currency': 'xof',  # ou 'cdf' pour FCFA
                'product_data': {'name': 'Consultation'},
                'unit_amount': 10000,  # 100.00 FCFA (centimes)
            },
            'quantity': 1,
        }],
        mode='payment',
        success_url='https://vida.com/success',
        cancel_url='https://vida.com/cancel',
        customer_email=request.user.email,
    )
    return JsonResponse({'id': session.id})
```

---

### 2. Mobile Money (Prioritaire au Congo)

**MTN Mobile Money Congo** :
- API officielle MTN MoMo
- Statut : `sandbox` → `production`
- Commission : 1.5% (typique au Congo)
- Délai : Instantané
- Limites : Selon réglementation locale

**Airtel Money Congo** :
- API Airtel Money
- Alternative à MTN
- Commission : 1.7%
- Support multi-devise (CDF, XOF)

**Flux Mobile Money** :
1. Patient sélectionne "Payer par Mobile Money"
2. Saisit numéro de téléphone
3. Système génère requête de paiement
4. Client reçoit SMS pour confirmer
5. Confirmation → Mise à jour statut commande
6. Webhook pour suivi en temps réel

**API Endpoints MTN MoMo** :
```
POST   /api/payments/mtn/request/      # Initier paiement
GET    /api/payments/mtn/status/{id}/  # Vérifier statut
POST   /api/payments/mtn/webhook/      # Callback serveur-à-serveur
```

---

### 3. Wallet VIDA

**Compte virtuel patient** :
- Solde en FCFA (ou devise locale)
- Approvisionnement : Carte, Mobile Money, espèces
- Paiement : 1 clic pour consultations/réachats
- Historique complet des transactions
- Recharge par QR Code (futur)

**Architecture Wallet** :
```python
class Wallet(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=12, decimal_places=2)  # FCFA
    currency = models.CharField(max_length=3, default='CDF')  # ou 'XOF'
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
class WalletTransaction(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=20)  # 'credit', 'debit'
    reference = models.CharField(max_length=100)  # N° transaction extérieure
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending')  # pending, completed, failed
```

**Fonctionnalités** :
- Recharge automatique (si solde < seuil)
- Paiement automatique factures
- Transfert entre patients (famille)
- Historique exportable (CSV/PDF)

---

### 4. Paiements Fractionnés

**Échéancier** :
- Jusqu'à 3 échéances possibles
- Minimum 30% d'acompte
- Intérêts : 0% (service patient)
- Rappels automatiques avant échéance

**Workflow** :
1. Patient accepte devis avec échéancier
2. Système crée transactions planifiées
3. Rappels SMS/Email avant échéance
4. Tentatives de paiement automatiques
5. Gestion impayés (dossier bloqué)

---

## 💰 TYPES DE PAIEMENTS

### Consultations Médicales
- Première consultation : 10 000 FCFA
- Suivi : 8 000 FCFA
- Urgence : 15 000 FCFA
- Téléconsultation : 7 000 FCFA

### Lunetterie
- Monture seule : Variable (20 000 - 100 000 FCFA)
- Monture + verres : Montant + specs
- Verres progressifs : +30 000 FCFA
- Traitements spéciaux : +5 000-15 000 FCFA

### Services Additionnels
- Téléconsultation : 7 000 FCFA
- Résultats d'examens en ligne : 2 000 FCFA
- Téléconsultation + résultats : 8 000 FCFA
- Abonnement mensuel (accès illimité) : 50 000 FCFA

### Abonnements
- VIDA Basic (1 mois) : 50 000 FCFA
  - 3 consultations
  - Accès résultats en ligne
  - Téléconsultation illimitée
- VIDA Premium (1 an) : 500 000 FCFA (15% réduction)
  - Consultations illimitées
  - Lunettes annuelles (-10%)
  - Priorité de rendez-vous
  - Programme fidélité accéléré

---

## 📱 INTERFACE UTILISATEUR

### Page Paiement (Côté Patient)

**Étapes du processus** :
1. **Récapitulatif** : Détail facture (consultation + produits)
2. **Moyens de paiement** : Carte | Mobile Money | Wallet | Espèces
3. **Sécurité** : Confirmation OTP pour montants > 50 000 FCFA
4. **Confirmation** : Récapitulatif + bouton "Payer"

**Design** :
- Progress bar 4 étapes
- Montant total bien visible (grand chiffre)
- Moyens de paiement en cards cliquables
- Informations de sécurité (bouclier, cryptage)

---

### Page Historique Paiements

**Tableau transactions** :
- Date | Montant | Méthode | Statut | Détails | Reçu

**Filtres** :
- Période : Aujourd'hui | Cette semaine | Ce mois
- Méthode : Carte | Mobile Money | Wallet
- Statut : Réussi | Échoué | En attente

**Fonctionnalités** :
- Télécharger reçu (PDF)
- Signaler problème
- Contacter support

---

### Page Wallet

**Solde actuel** (grand chiffre, couleur verte)
- Bouton "Recharger" (primaire)
- Bouton "Historique" (secondaire)

**Dernières transactions** (5 dernières) :
- Date | Description | Montant | Solde après

**Recharge rapide** :
- Montant prédéfini : 10K, 20K, 50K, 100K
- Montant personnalisé
- Méthode : Carte ou Mobile Money

---

## 📊 BACKOFFICE ADMIN

### Dashboard Paiements

**KPI principaux** (4 cards) :
1. **CA du jour** : 450 000 FCFA
2. **Transactions** : 24 (ce jour)
3. **Taux de succès** : 98.5%
4. **Impayés** : 2 (15 000 FCFA)

**Graphiques** :
- Évolution CA (ligne, 30 derniers jours)
- Répartition paiements (donut : Carte, Mobile, Wallet)
- Méthodes par mois (barres groupées)

---

### Gestion Transactions

**Liste complète** :
- Filtres : Date, Méthode, Statut, Montant, Patient
- Export CSV/Excel
- Recherche par référence

**Détail transaction** :
- Informations complètes
- Statut détaillé
- Logs techniques
- Bouton "Remboursement"

---

### Gestion Impayés

**Liste clients** :
- Montant dû
- Date échéance
- Historique contacts
- Statut de recouvrement

**Actions** :
- Générer relance
- Bloquer accès
- Planifier rappel
- Marquer comme "litige"

---

## 🔌 API ENDPOINTS

### Paiements (Tous utilisateurs)

```
POST   /api/payments/initiate/           # Initier paiement (carte/MM)
GET    /api/payments/{id}/status/        # Vérifier statut
POST   /api/payments/webhook/            # Callback externe
GET    /api/payments/history/            # Historique utilisateur
GET    /api/payments/receipt/{id}/       # Télécharger reçu (PDF)
```

### Wallet (Patient uniquement)

```
GET    /api/wallet/balance/              # Solde actuel
POST   /api/wallet/recharge/             # Recharger (carte/MM)
GET    /api/wallet/transactions/         # Historique wallet
POST   /api/wallet/transactions/{id}/cancel/  # Annuler transaction
```

### Admin (Admin uniquement)

```
GET    /api/admin/payments/              # Liste complète
GET    /api/admin/payments/stats/        # KPI & graphiques
POST   /api/admin/payments/{id}/refund/  # Remboursement
GET    /api/admin/payments/overdue/      # Impayés
POST   /api/admin/payments/overdue/{id}/action/  # Action impayé
```

---

## 🧪 TESTS

### Tests Unitaires

**Backend (Pytest)** :
- Validation données paiement (numéro carte, téléphone)
- Calculs montants (taxes, réductions)
- Génération références uniques
- Tokenisation cartes
- Calcul échéances fractionnées

**Frontend (Jest)** :
- Formulaire paiement (validation)
- Sélection méthode
- Calculs en temps réel
- Affichage erreurs

### Tests API

**Scénarios critiques** :
- Paiement carte réussi
- Paiement carte refusé
- Paiement Mobile Money (simulation)
- Remboursement partiel
- Création wallet
- Recharge wallet
- Paiement avec wallet

### Tests E2E

**Playwright** :
1. **Parcours paiement complet** : Patient → Paiement → Confirmation
2. **Mobile Money** : Initiation → Confirmation externe → Validation
3. **Wallet** : Recharge → Paiement → Vérification solde
4. **Échéances** : Création → Échéance 1 → Échéance 2

---

## ✅ CRITÈRES D'ACCEPTATION

### Fonctionnel
- [ ] Paiement carte bancaire fonctionnel (Stripe)
- [ ] Paiement Mobile Money (MTN MoMo, Airtel Money)
- [ ] Wallet VIDA : Création, recharge, paiement
- [ ] Historique transactions complet
- [ ] Paiements fractionnés avec rappels
- [ ] Remboursements (partiels/total)
- [ ] Génération reçus PDF
- [ ] Gestion impayés

### Sécurité
- [ ] PCI DSS Level 1 compliant
- [ ] Tokenisation cartes (pas de stockage)
- [ ] Encryption AES-256 pour données sensibles
- [ ] Rate limiting strict (5 tentatives/15 min)
- [ ] Journaux immuables des transactions
- [ ] Validation entrées (prévention injection)

### Performance
- [ ] Page paiement charge < 2s
- [ ] Transaction aboutissement < 5s
- [ ] Dashboard admin charge < 3s
- [ ] API < 500ms (P95)
- [ ] Lighthouse Score > 90/100

### UX
- [ ] Processus paiement < 3 étapes
- [ ] Interface claire, sécurisante
- [ ] Messages d'erreur explicites
- [ ] Feedback visuel (chargement, succès, erreur)
- [ ] Responsive mobile + desktop

### Conformité
- [ ] RGPD : Consentement stockage données
- [ ] Journalisation complète des transactions
- [ ] Accès restreint aux données sensibles
- [ ] Export données utilisateur (RGPD)
- [ ] Documentation API complète

---

## 🚀 DÉPLOIEMENT

### Environnements

**Sandbox** :
- API keys sandbox pour tests
- MTN MoMo sandbox
- Stripe test mode
- Base de données séparée

**Production** :
- API keys live
- Limitation stricte des IP
- Monitoring transactions en temps réel
- Alertes sécurité (fraude potentielle)

### Surveillance

**Métriques suivies** :
- Taux de succès des paiements
- Temps de traitement moyen
- Erreurs fréquentes
- Volume transactionnel
- Anomalies de sécurité

**Alertes** :
- Taux d'échec > 5%
- Transaction suspecte (montant élevé)
- Trop de tentatives échouées
- Erreur API externe

---

**Document créé le** : 07 janvier 2026  
**Version** : 1.0  
**Statut** : En attente de validation  
**Auteur** : Équipe projet VIDA