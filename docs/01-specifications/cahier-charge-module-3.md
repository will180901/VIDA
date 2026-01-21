# 📋 CAHIER DES CHARGES - CENTRE MÉDICAL VIDA
## Module 3 : Système d'Inscription & Authentification

---

## 🎯 OBJECTIF DU MODULE

Créer un système complet et sécurisé permettant aux patients de :
- S'inscrire sur la plateforme
- Se connecter/déconnecter
- Gérer leur profil personnel
- Récupérer leur mot de passe en cas d'oubli
- Valider leur email

**Priorités** :
- **Sécurité maximale** (données de santé sensibles)
- **Simplicité d'usage** (processus fluide, peu de friction)
- **Conformité RGPD** (consentement, droit à l'oubli)

---

## 🏗️ ARCHITECTURE AUTHENTIFICATION

### Stratégie adoptée : JWT (JSON Web Tokens)

**Fonctionnement** :
1. Utilisateur s'inscrit/se connecte
2. Backend génère 2 tokens :
   - **Access Token** : Courte durée (15 minutes), stocké en mémoire frontend
   - **Refresh Token** : Longue durée (30 jours - CORRIGÉ: uniformisé à 30 jours), stocké en cookie HttpOnly
3. Chaque requête API protégée inclut Access Token dans header `Authorization: Bearer <token>`
4. À expiration Access Token, frontend utilise Refresh Token pour en obtenir un nouveau
5. Déconnexion : Invalidation Refresh Token côté backend

**Sécurité renforcée** :
- **Rotation des tokens** : Les Refresh Tokens sont automatiquement renouvelés à chaque utilisation
- **Blacklising** : Les Refresh Tokens sont ajoutés à une liste noire lors de la déconnexion pour empêcher leur réutilisation

**Avantages** :
- Stateless (pas de sessions serveur)
- Scalable (microservices-ready)
- Sécurisé (tokens signés, HttpOnly cookies)

---

## 📝 FLUX D'INSCRIPTION (Sign Up)

### URL
`/inscription` ou `/sign-up`

### Étapes du processus

#### Étape 1 : Formulaire d'inscription

**Champs obligatoires** :

1. **Nom complet**
   - Label : "Nom complet"
   - Placeholder : "Ex: Jean Dupont"
   - Type : `text`
   - Validation :
     - Min 3 caractères
     - Max 100 caractères
     - Pas de chiffres
     - Message erreur : "Le nom doit contenir au moins 3 caractères"

2. **Email**
   - Label : "Adresse email"
   - Placeholder : "votre.email@exemple.com"
   - Type : `email`
   - Validation :
     - Format email valide (regex)
     - Email unique (vérification backend)
     - Message erreur : "Email invalide" ou "Cet email est déjà utilisé"

3. **Téléphone**
   - Label : "Numéro de téléphone"
   - Placeholder : "06 XXX XX XX"
   - Type : `tel`
   - Validation :
     - Format : +242 ou 0 suivi de 9 chiffres
     - Numéro unique (vérification backend)
     - Message erreur : "Numéro invalide"

4. **Date de naissance**
   - Label : "Date de naissance"
   - Type : `date`
   - Validation :
     - Âge minimum : 1 an (bébés acceptés)
     - Âge maximum : 120 ans
     - Format : DD/MM/YYYY
     - Message erreur : "Date invalide"

5. **Genre**
   - Label : "Genre"
   - Type : `radio` ou `select`
   - Options :
     - Homme
     - Femme
     - Autre
   - Validation : Requis

6. **Mot de passe**
   - Label : "Mot de passe"
   - Type : `password`
   - Toggle visibilité : Icône œil (`Eye`/`EyeOff`)
   - Validation :
     - Min 8 caractères
     - Max 128 caractères
     - Au moins 1 majuscule
     - Au moins 1 minuscule
     - Au moins 1 chiffre
     - Au moins 1 caractère spécial (@$!%*?&)
   - Indicateur force : Barre de progression (Faible/Moyen/Fort)
     - Rouge : < 4 critères
     - Orange : 4 critères
     - Vert : 5 critères
   - Message erreur : "Le mot de passe doit contenir..."

7. **Confirmation mot de passe**
   - Label : "Confirmer le mot de passe"
   - Type : `password`
   - Validation :
     - Doit correspondre au champ "Mot de passe"
     - Message erreur : "Les mots de passe ne correspondent pas"

**Champs optionnels** :

8. **Adresse complète**
   - Label : "Adresse (optionnel)"
   - Placeholder : "Quartier, Rue, Numéro"
   - Type : `text`
   - Utilité : Faciliter prise de RDV future

9. **Personne à contacter en cas d'urgence**
   - Label : "Contact d'urgence (optionnel)"
   - Champs :
     - Nom : `text`
     - Relation : `text` (Ex: Conjoint, Parent, Ami)
     - Téléphone : `tel`

**Consentements RGPD** (obligatoires) :

10. **Acceptation CGU**
    - Checkbox : "J'accepte les [Conditions Générales d'Utilisation](#)"
    - Validation : Obligatoire
    - Lien vers CGU dans nouvelle fenêtre

11. **Acceptation Politique Confidentialité**
    - Checkbox : "J'ai lu et j'accepte la [Politique de Confidentialité](#)"
    - Validation : Obligatoire
    - Lien vers politique dans nouvelle fenêtre

12. **Consentement traitement données médicales** (optionnel mais recommandé)
    - Checkbox : "J'accepte que mes données médicales soient traitées par le Centre Médical VIDA pour assurer ma prise en charge"
    - Validation : Recommandé (pop-up explicative si non coché)

13. **Newsletter** (optionnel)
    - Checkbox : "Je souhaite recevoir les actualités et conseils santé de VIDA par email"
    - Pré-coché : NON (RGPD)

**Bouton Submit** :
- Texte : "Créer mon compte"
- Icône : `UserPlus`
- Loading state : Spinner + "Création en cours..."
- Disabled si formulaire invalide

**Lien vers connexion** :
- Texte : "Vous avez déjà un compte ? [Connectez-vous](#)"

---

#### Étape 2 : Validation backend

**Vérifications côté serveur** :
1. Tous les champs requis présents
2. Formats valides (email, téléphone, date)
3. Email unique (query database)
4. Téléphone unique (query database)
5. Mot de passe respecte policy
6. CAPTCHA validé (si implémenté - recommandé contre bots)

**Réponses possibles** :

**Succès (201 Created)** :
```json
{
  "status": "success",
  "message": "Compte créé avec succès",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "email_verification_sent": true
  }
}
```

**Erreur (400 Bad Request)** :
```json
{
  "status": "error",
  "message": "Erreur lors de la création du compte",
  "errors": {
    "email": ["Cet email est déjà utilisé"],
    "phone": ["Ce numéro est déjà enregistré"]
  }
}
```

---

#### Étape 3 : Envoi email de vérification

**Déclenchement** : Immédiatement après création compte

**Contenu email** :
- **Sujet** : "Vérifiez votre adresse email - Centre Médical VIDA"
- **Expéditeur** : "Centre Médical VIDA <no-reply@centremedicalvida.com>"
- **Template HTML** :
  - Logo VIDA
  - Message personnalisé : "Bonjour [Nom],"
  - Texte : "Merci de vous être inscrit sur notre plateforme. Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous."
  - **Bouton CTA** : "Vérifier mon email" → Lien `https://centremedicalvida.com/verify-email?token=<token>`
  - Lien alternatif : Si le bouton ne fonctionne pas, copiez ce lien : [URL]
  - Expiration : "Ce lien expirera dans 24 heures"
  - Footer : Contact, adresse, liens réseaux sociaux

**Token vérification** :
- Généré aléatoirement (UUID ou hash sécurisé)
- Stocké en base avec date expiration (24h)
- Usage unique (invalidé après utilisation)

---

#### Étape 4 : Page de confirmation inscription

**URL** : `/inscription/confirmation`

**Contenu** :
- Illustration : `confirmation.svg` ou `mail_sent.svg` (undraw.co)
- Icône : `CheckCircle` (grande, verte)
- Titre H1 : "Compte créé avec succès !"
- Message :
  - "Bienvenue chez VIDA, [Nom] !"
  - "Un email de vérification a été envoyé à **[email]**"
  - "Veuillez consulter votre boîte de réception et cliquer sur le lien pour activer votre compte."
- **Call-out** :
  - Icône `Info`
  - "Vous n'avez pas reçu l'email ?"
  - Lien : "Renvoyer l'email de vérification"
  - Délai anti-spam : Désactivé 60 secondes après clic
- **Actions** :
  - Bouton primaire : "Retour à l'accueil"
  - Lien secondaire : "Accéder à mon compte" (redirige vers dashboard si connexion auto, sinon vers login)

**Design** :
- Layout : Centré, max-width 600px
- Padding : `py-16 px-6`
- Background : Blanc ou `bg-gray-50`
- Illustration : 250px width

---

#### Étape 5 : Vérification email

**URL** : `/verify-email?token=<token>`

**Flux** :
1. Utilisateur clique lien dans email
2. Frontend extrait token de l'URL
3. Requête API vers backend : `POST /api/auth/verify-email/`
4. Backend valide token :
   - Token existe ?
   - Pas expiré (< 24h) ?
   - Pas déjà utilisé ?
5. Si valide :
   - Marquer email comme vérifié en base (`email_verified: true`)
   - Invalider token
   - Connecter automatiquement l'utilisateur (générer JWT)
6. Redirection vers dashboard patient avec message succès

**Page de succès** :
- Illustration : `confirmed.svg`
- Titre : "Email vérifié avec succès !"
- Message : "Votre compte est maintenant actif. Vous pouvez commencer à prendre rendez-vous."
- Bouton : "Accéder à mon espace patient"

**Page d'erreur** (token invalide/expiré) :
- Illustration : `cancel.svg`
- Titre : "Lien de vérification invalide"
- Message : "Ce lien a expiré ou a déjà été utilisé."
- Bouton : "Demander un nouveau lien"
- Formulaire : Email (pour renvoyer lien)

---

### Design formulaire d'inscription

**Layout** :
- 1 colonne centrée, max-width 500px
- Card blanche, shadow niveau 2, border-radius 4px
- Padding : `p-8`
- Responsive : Full-width mobile (padding `p-4`)

**Inputs** :
- Conformes charte (border-radius 4px)
- Height : 44px (touch-friendly)
- Padding : `px-3 py-2.5`
- Font-size : `text-sm`
- Border : `border-gray-300`
- Focus : Border teal + ring teal/20
- Error state : Border rouge + texte rouge en dessous

**Indicateurs visuels** :
- Champs requis : Astérisque rouge `*` après label
- Validation temps réel (après blur input)
- Icônes état :
  - Valide : `CheckCircle` vert
  - Invalide : `XCircle` rouge
  - En cours : `Loader` (spinner)

**Groupements** :
- Section "Informations personnelles" : Nom, Email, Téléphone, Date naissance, Genre
- Section "Sécurité" : Mot de passe, Confirmation
- Section "Informations complémentaires" (collapsible) : Adresse, Contact urgence
- Section "Consentements" : Checkboxes RGPD

**Progress indicator** (optionnel) :
- Barre horizontale : 4 étapes
  1. Informations personnelles (25%)
  2. Sécurité (50%)
  3. Informations complémentaires (75%)
  4. Consentements (100%)
- Couleur : Teal

---

## 🔐 FLUX DE CONNEXION (Sign In)

### URL
`/connexion` ou `/login`

### Formulaire de connexion

**Champs** :

1. **Email ou Téléphone**
   - Label : "Email ou numéro de téléphone"
   - Placeholder : "email@exemple.com ou 06 XXX XX XX"
   - Type : `text`
   - Validation : Format email OU téléphone valide
   - Icône : `Mail` ou `Phone` (adaptatif selon input)

2. **Mot de passe**
   - Label : "Mot de passe"
   - Type : `password`
   - Toggle visibilité : Icône œil
   - Placeholder : "••••••••"

3. **Se souvenir de moi** (optionnel)
   - Checkbox : "Rester connecté"
   - Fonction : Prolonge durée Refresh Token (90 jours au lieu de 30)

**Lien "Mot de passe oublié"** :
- Texte : "Mot de passe oublié ?"
- Position : Sous champ mot de passe, aligné à droite
- Lien vers : `/mot-de-passe-oublie`

**Bouton Submit** :
- Texte : "Se connecter"
- Icône : `LogIn`
- Loading state : Spinner + "Connexion..."
- Full-width

**Lien vers inscription** :
- Texte : "Pas encore de compte ? [Inscrivez-vous](#)"
- Position : Centré sous le bouton

**Séparateur** (optionnel si connexion sociale implémentée) :
- Ligne horizontale avec texte "OU"

**Connexion sociale** (optionnel, Phase 2) :
- Bouton Google : "Continuer avec Google"
- Bouton Facebook : "Continuer avec Facebook"
- Icons + couleurs marques

---

### Validation backend connexion

**Endpoint** : `POST /api/auth/login/`

**Body** :
```json
{
  "email_or_phone": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": false
}
```

**Vérifications** :
1. Utilisateur existe ? (email OU téléphone)
2. Mot de passe correct ? (hash comparison)
3. Email vérifié ? (si non, erreur spécifique)
4. Compte actif ? (pas suspendu/banni)

**Réponses** :

**Succès (200 OK)** :
```json
{
  "status": "success",
  "message": "Connexion réussie",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "name": "Jean Dupont",
      "email": "jean@example.com",
      "email_verified": true,
      "role": "patient",
      "avatar": "https://..."
    }
  }
}
```
- Frontend stocke Access Token en mémoire (state)
- Refresh Token envoyé en cookie HttpOnly Secure SameSite

**Erreur : Identifiants invalides (401 Unauthorized)** :
```json
{
  "status": "error",
  "message": "Email ou mot de passe incorrect"
}
```
- NE PAS préciser si c'est l'email ou le mot de passe (sécurité)

**Erreur : Email non vérifié (403 Forbidden)** :
```json
{
  "status": "error",
  "message": "Veuillez vérifier votre adresse email avant de vous connecter",
  "action": "resend_verification"
}
```
- Afficher message avec bouton "Renvoyer l'email"

**Erreur : Compte suspendu (403 Forbidden)** :
```json
{
  "status": "error",
  "message": "Votre compte a été suspendu. Contactez-nous pour plus d'informations."
}
```

**Erreur : Trop de tentatives (429 Too Many Requests)** :
```json
{
  "status": "error",
  "message": "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes."
}
```

**Sécurité renforcée** :
- **Rate limiting uniformisé** : Limite de 5 tentatives par 15 minutes (CORRIGÉ: uniformisé à 5/15min au lieu de 5/hour)
- **Suivi des échecs** : Les tentatives échouées sont suivies par IP et par email pour détecter les attaques de force brute
- **Alertes de sécurité** : Un système de détection d'activités suspectes alerte en cas de connexions multiples depuis différentes IP

---

### Redirection après connexion

**Logique** :
1. Utilisateur connecté
2. Vérifier paramètre URL `?redirect=/page-desiree`
3. Si présent : Rediriger vers cette page
4. Sinon : Rediriger vers dashboard patient `/dashboard`

**Exemple** :
- Utilisateur non connecté accède `/rendez-vous`
- Système redirige vers `/login?redirect=/rendez-vous`
- Après connexion → Retour automatique à `/rendez-vous`

---

### Design formulaire de connexion

**Layout** :
- Identique inscription (card centrée, max-width 450px)
- Plus simple (moins de champs)
- Illustration : `login.svg` ou `secure_login.svg` en header

**UX** :
- Focus automatique sur champ email au chargement
- Enter key : Submit formulaire
- Tab navigation fluide

---

## 🔑 RÉCUPÉRATION MOT DE PASSE

### Flux complet

#### Étape 1 : Demande réinitialisation

**URL** : `/mot-de-passe-oublie` ou `/forgot-password`

**Formulaire** :
- Champ unique : **Email**
  - Label : "Adresse email"
  - Placeholder : "votre.email@exemple.com"
  - Validation : Format email valide
- Bouton : "Envoyer le lien de réinitialisation"
- Lien retour : "Retour à la connexion"

**Illustration** : `forgot_password.svg`

**Texte explicatif** :
"Entrez l'adresse email associée à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe."

**Backend** :
- Endpoint : `POST /api/auth/forgot-password/`
- Vérifier email existe
- Générer token réinitialisation (UUID, expiration 1h)
- Envoyer email

**Réponse (toujours 200 OK, même si email inexistant - sécurité)** :
```json
{
  "status": "success",
  "message": "Si cet email existe, vous recevrez un lien de réinitialisation"
}
```
- Ne pas révéler si email existe ou non (prévention énumération)

---

#### Étape 2 : Email réinitialisation

**Contenu** :
- **Sujet** : "Réinitialisation de votre mot de passe - VIDA"
- Message :
  - "Bonjour [Nom],"
  - "Vous avez demandé à réinitialiser votre mot de passe."
  - "Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe."
- **Bouton CTA** : "Réinitialiser mon mot de passe" → Lien avec token
- **Important** :
  - "Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe restera inchangé."
  - "Ce lien expirera dans 1 heure"
- Footer standard

---

#### Étape 3 : Page nouveau mot de passe

**URL** : `/reset-password?token=<token>`

**Formulaire** :
1. **Nouveau mot de passe**
   - Label : "Nouveau mot de passe"
   - Type : `password`
   - Validation : Identique à inscription (8+ chars, majuscule, etc.)
   - Indicateur force

2. **Confirmation nouveau mot de passe**
   - Label : "Confirmer le nouveau mot de passe"
   - Type : `password`
   - Validation : Doit correspondre

**Bouton** : "Réinitialiser mon mot de passe"

**Backend** :
- Endpoint : `POST /api/auth/reset-password/`
- Valider token (existe, pas expiré, pas utilisé)
- Hasher nouveau mot de passe
- Mettre à jour en base
- Invalider token
- **Sécurité** : Déconnecter toutes les sessions actives de cet utilisateur (invalider tous les Refresh Tokens existants)

**Réponse succès** :
- Redirection vers page confirmation
- Message : "Mot de passe modifié avec succès"
- Bouton : "Se connecter avec le nouveau mot de passe"

**Erreur token invalide/expiré** :
- Message : "Ce lien est invalide ou a expiré"
- Bouton : "Demander un nouveau lien"

---

## 🚪 DÉCONNEXION (Logout)

### Flux

**Déclenchement** :
- Clic sur bouton "Déconnexion" dans menu utilisateur
- Ou automatique après X jours d'inactivité

**Actions frontend** :
1. Requête API : `POST /api/auth/logout/` (envoie Refresh Token)
2. Backend invalide le Refresh Token
3. Frontend :
   - Supprime Access Token de la mémoire (state)
   - Supprime cookie Refresh Token
   - Clear localStorage si utilisé
   - Clear contexte utilisateur
4. Redirection : `/` ou `/login`
5. Toast notification : "Vous avez été déconnecté"

**Backend** :
- Ajouter Refresh Token à blacklist (Redis avec TTL = durée restante avant expiration naturelle)
- Réponse : `200 OK`

**Sécurité renforcée** :
- **Journalisation** : Toutes les déconnexions sont enregistrées dans les logs d'audit
- **Invalidate tous les tokens** : Option pour invalider tous les tokens de l'utilisateur sur tous les appareils

---

## 👤 GESTION PROFIL UTILISATEUR

### URL
`/profil` ou `/mon-compte`

### Structure page profil

#### Section 1 : Header profil

**Contenu** :
- Avatar (photo de profil ou initiales dans cercle coloré)
- Nom complet
- Email
- Badge : "Email vérifié" (icône `CheckCircle` verte) ou "Email non vérifié" (icône `AlertCircle` orange avec lien "Vérifier maintenant")
- Bouton : "Modifier" (ouvre modale ou redirect vers formulaire édition)

**Design** :
- Card horizontale
- Avatar : 80px circle, upload possible au clic
- Layout : Flex row (avatar left, infos center, bouton right)

---

#### Section 2 : Informations personnelles (Vue/Édition)

**Mode Vue** :
- Liste en lecture seule :
  - Nom complet
  - Email
  - Téléphone
  - Date de naissance (+ âge calculé)
  - Genre
  - Adresse
  - Contact d'urgence (nom, relation, téléphone)
- Bouton : "Modifier mes informations"

**Mode Édition** :
- Formulaire identique à inscription (pré-rempli)
- Validation en temps réel
- Boutons :
  - "Enregistrer les modifications"
  - "Annuler"

**Backend** :
- Endpoint : `PATCH /api/patients/profile/`
- Validation : Email/téléphone uniques si modifiés
- Si email modifié → Nouveau processus de vérification (envoyer email au nouveau email)

---

#### Section 3 : Sécurité

**Changement mot de passe** :
- Titre : "Modifier mon mot de passe"
- Formulaire :
  1. Mot de passe actuel
  2. Nouveau mot de passe
  3. Confirmation nouveau mot de passe
- Bouton : "Changer le mot de passe"

**Backend** :
- Vérifier mot de passe actuel correct
- Valider nouveau mot de passe (policy)
- Hasher et mettre à jour
- **Sécurité** : Déconnecter autres sessions (optionnel, avec checkbox "Déconnecter les autres appareils")

**Sécurité renforcée** :
- **Invalidate tous les Refresh Tokens** : Lors du changement de mot de passe, tous les tokens de rafraîchissement existants sont invalidés pour des raisons de sécurité
- **Journalisation** : Tous les changements de mot de passe sont enregistrés dans les logs d'audit

**Authentification à deux facteurs (2FA) - Optionnel Phase 2** :
- Toggle : "Activer 2FA"
- Méthodes :
  - SMS (code 6 chiffres)
  - App authentificateur (Google Authenticator, Authy)
- QR code pour setup

---

#### Section 4 : Préférences

**Notifications** :
- Checkboxes :
  - "Rappels de rendez-vous par SMS"
  - "Rappels de rendez-vous par Email"
  - "Newsletters et conseils santé"
  - "Notifications promotions lunetterie"
- Bouton : "Enregistrer les préférences"

**Langue** (si multi-langue implémenté) :
- Dropdown : Français, Lingala, Kikongo
- Change locale app

---

#### Section 5 : Danger Zone

**Supprimer mon compte** :
- Titre rouge : "Zone dangereuse"
- Bouton rouge : "Supprimer définitivement mon compte"
- Modale confirmation :
  - Warning : "Cette action est irréversible"
  - Champ confirmation : "Tapez 'SUPPRIMER' pour confirmer"
  - Bouton final rouge : "Oui, supprimer mon compte"

**Backend** :
- Endpoint : `DELETE /api/patients/profile/`
- **RGPD** : Anonymiser données (pas suppression totale pour historique médical légal)
  - Remplacer nom par "Compte supprimé"
  - Supprimer email, téléphone, adresse
  - Garder ID, consultations anonymisées (obligation légale conservation dossiers médicaux 20 ans)
- Envoyer email confirmation suppression

---

### Design page profil

**Layout** :
- Sidebar navigation (desktop) ou tabs (mobile) :
  - Profil
  - Sécurité
  - Préférences
  - Mes rendez-vous (lien vers autre section)
  - Mes documents (lien vers autre section)
- Contenu principal : Cards par section
- Responsive : Stack vertical mobile

---

## 🔒 SÉCURITÉ & BONNES PRATIQUES

### Stockage mots de passe

**Backend** :
- **Hashing** : Argon2id (recommandé) ou bcrypt
- **Salt** : Aléatoire unique par utilisateur
- **Rounds** : Minimum 10 (bcrypt) ou memory/time cost élevé (Argon2)
- **JAMAIS** stocker mots de passe en clair

**Chiffrement renforcé** :
- **Chiffrement E2E** pour les données médicales sensibles
- **Champs chiffrés** : Utilisation de champs chiffrés pour les données critiques (antécédents médicaux, résultats, etc.)

### Protection contre les attaques

**1. Brute Force / Credential Stuffing** :
- **Rate limiting uniformisé** :
  - Max 5 tentatives de connexion par email en 15 minutes (CORRIGÉ: uniformisé à 5/15min au lieu de 5/hour)
  - Max 3 tentatives mot de passe oublié par email en 1 heure
- **Lockout temporaire** : Bloquer compte 15-30 minutes après X échecs
- **CAPTCHA** : Après 3 tentatives échouées (Google reCAPTCHA v3)
- **Device fingerprinting** : Suivi des appareils connus pour détection des connexions suspectes

**2. Énumération d'utilisateurs** :
- Messages génériques : "Email ou mot de passe incorrect" (pas "Email n'existe pas")
- Réponse identique si email existe ou non lors de récupération mot de passe

**3. Session Hijacking** :
- Tokens JWT signés (HMAC SHA-256 minimum)
- Cookies Refresh Token : `HttpOnly`, `Secure` (HTTPS only), `SameSite=Strict`
- Rotation Refresh Tokens (nouveau token à chaque refresh)

**4. XSS (Cross-Site Scripting)** :
- Sanitization inputs côté backend
- Échappement outputs côté frontend (React le fait automatiquement)
- CSP headers (Content Security Policy)

**5. CSRF (Cross-Site Request Forgery)** :
- Tokens CSRF Django
- Header `X-CSRFToken` dans requêtes

### Audit & Monitoring

**Logs à enregistrer** :
- Tentatives de connexion (succès/échec)
- Changements de mot de passe
- Modifications profil
- Accès aux données médicales sensibles
- Connexions depuis nouveaux appareils/emplacements
- Échecs répétés de connexion (pour détection d'attaques)

**Sécurité renforcée** :
- **Service de sécurité** : Implémentation d'un service de sécurité avancé avec détection d'activités suspectes
- **Empreinte appareil** : Génération d'empreintes uniques pour chaque appareil pour la détection de connexions inhabituelles
- **Alertes de sécurité** : Notifications automatiques en cas de connexion suspecte ou d'activité inhabituelle
- **Journalisation immuable** : Mise en place de logs d'audit avec chaînage cryptographique pour garantir l'intégrité

**Alertes** :
- Connexion depuis nouveau device/localisation
- Changement email
- Suppression compte

### Conformité RGPD

**Consentements** :
- Explicites lors inscription
- Révocables à tout moment (page préférences)
- Tracés en base avec timestamps

**Sécurité et conformité** :
- **Logs d'audit immuables** : Mise en place d'un système de logs d'audit avec chaînage cryptographique (blockchain light) pour garantir l'intégrité
- **Traçabilité** : Qui a consulté quel dossier et quand, avec historique des modifications
- **Protection des données sensibles** : Chiffrement E2E pour les dossiers médicaux critiques

**Droits patients** :
- **Droit d'accès** : Export données perso (JSON/PDF)
- **Droit de rectification** : Édition profil
- **Droit à l'oubli** : Suppression compte
- **Droit à la portabilité** : Export dossier médical complet

---

## 🔄 REFRESH TOKEN FLOW

### Gestion expiration Access Token

**Problème** : Access Token expire après 15 minutes

**Solution** : Interceptor HTTP frontend

```javascript
// Pseudo-code (React)
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      try {
        // Refresh Token est automatiquement envoyé via cookie
        const response = await axios.post('/api/auth/refresh/');
        const newAccessToken = response.data.access_token;
        
        // Mettre à jour Access Token en mémoire
        setAccessToken(newAccessToken);
        
        // Retry requête originale avec nouveau token
        error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axios(error.config);
      } catch (refreshError) {
        // Refresh Token invalide/expiré → Déconnecter
        logout();
        redirect('/login');
      }
    }
    return Promise.reject(error);
  }
);
```

**Backend** :
- Endpoint : `POST /api/auth/refresh/`
- Lit Refresh Token depuis cookie
- Vérifie validité (signature, expiration, pas blacklisté)
- Génère nouveau Access Token (+ optionnel : nouveau Refresh Token)
- Retourne nouveau Access Token

**Sécurité renforcée** :
- **Rotation des Refresh Tokens** : À chaque rafraîchissement, un nouveau Refresh Token est généré et l'ancien est invalidé
- **Journalisation** : Toutes les opérations de rafraîchissement sont enregistrées pour détection d'anomalies
- **Vérification de l'appareil** : Le service vérifie que la demande provient d'un appareil connu

---

## 📱 RESPONSIVE & UX

### Mobile-First

**Spécificités mobile** :
- Formulaires : Input type appropriés (email, tel, date) pour clavier natif
- Touch targets : Min 44x44px (boutons, checkboxes)
- Validation : Messages d'erreur sous les champs (pas tooltip)
- Password visibility toggle : Essentiel sur mobile
- Autofill : Attributs `autocomplete` corrects

### Accessibilité

**WCAG 2.1 AA** :
- Labels explicites : `<label for="email">` associés aux inputs
- Erreurs descriptives : ARIA live regions pour messages dynamiques
- Navigation clavier : Tab order logique
- Contraste : Textes erreurs rouges ≥ 4.5:1
- Screen readers : Annoncer états (loading, erreur, succès)

---

## ✅ CRITÈRES D'ACCEPTATION MODULE 3

Ce module est validé lorsque :
- [ ] Inscription fonctionnelle (validation, RGPD, email confirmation)
- [ ] Connexion sécurisée (JWT, rate limiting)
- [ ] Vérification email implémentée
- [ ] Récupération mot de passe fonctionnelle
- [ ] Profil utilisateur éditable
- [ ] Déconnexion propre (invalidation tokens)
- [ ] Gestion sécurisée mots de passe (hashing, policy forte)
- [ ] Protection contre attaques (brute force, CSRF, XSS)
- [ ] Conformité RGPD (consentements, droits)
- [ ] Responsive mobile/desktop
- [ ] Accessibilité WCAG 2.1 AA
- [ ] Emails transactionnels envoyés (vérification, réinitialisation)
- [ ] Tests unitaires backend (authentification, validation)
- [ ] Tests E2E (inscription → connexion → profil)

---

## 🔄 PROCHAINES ÉTAPES

Une fois Module 3 validé, passage à :
- **Module 4** : Prise de rendez-vous
  - Calendrier disponibilités
  - Sélection créneaux
  - Confirmation RDV
  - Rappels automatiques

---

**Document créé le** : 04 janvier 2026  
**Version** : 1.0  
**Statut** : En attente de validation  
**Auteur** : Équipe projet VIDA