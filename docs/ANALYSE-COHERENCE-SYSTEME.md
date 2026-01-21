# 🔍 ANALYSE DE COHÉRENCE DU SYSTÈME VIDA
## Analyse Critique Complète - Expert Informatique de Gestion & Ophtalmologie

**Date d'analyse** : 1 février 2026  
**Analyste** : Expert en informatique de gestion médicale & ophtalmologie  
**Version du système** : 1.1.0  
**Objectif** : Identifier les incohérences, problèmes potentiels et manques pour une plateforme complète et professionnelle

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble de l'analyse](#1-vue-densemble-de-lanalyse)
2. [Workflow médical actuel vs idéal](#2-workflow-médical-actuel-vs-idéal)
3. [Analyse des modèles de données](#3-analyse-des-modèles-de-données)
4. [Incohérences critiques identifiées](#4-incohérences-critiques-identifiées)
5. [Fonctionnalités manquantes essentielles](#5-fonctionnalités-manquantes-essentielles)
6. [Problèmes de cohérence métier](#6-problèmes-de-cohérence-métier)
7. [Recommandations d'architecture](#7-recommandations-darchitecture)
8. [Plan de refactoring](#8-plan-de-refactoring)
9. [Nouveaux modèles proposés](#9-nouveaux-modèles-proposés)
10. [Conclusion et priorisation](#10-conclusion-et-priorisation)

---

## 1. VUE D'ENSEMBLE DE L'ANALYSE

### 1.1 Contexte

Le système VIDA est actuellement en phase 2 de développement (85% complété). La page Patients vient d'être finalisée à 100% avec :
- Gestion des informations personnelles
- Dossier médical de base (MedicalRecord)
- Rendez-vous (Appointment)
- Documents (PatientDocument)
- Notes internes (PatientNote)

### 1.2 Méthodologie d'analyse

Cette analyse est réalisée selon 3 axes :

1. **Axe Informatique de Gestion** :
   - Cohérence des modèles de données
   - Relations entre entités
   - Intégrité référentielle
   - Workflow applicatif
   - Architecture logicielle

2. **Axe Ophtalmologie Médicale** :
   - Workflow clinique réel
   - Données médicales nécessaires
   - Examens ophtalmologiques standards
   - Prescriptions spécifiques
   - Suivi patient
   - Conformité médicale

3. **Axe UX/Métier** :
   - Expérience utilisateur (médecin, admin, patient)
   - Efficacité opérationnelle
   - Complétude fonctionnelle
   - Valeur ajoutée pour la clinique



### 1.3 Résumé Exécutif

**🔴 PROBLÈMES CRITIQUES IDENTIFIÉS** :

1. **Logique d'enregistrement patient incorrecte** : Actuellement, un utilisateur peut s'inscrire directement comme patient. **ERREUR** : Un patient ne devient patient qu'après sa première consultation.

2. **Workflow médical incomplet** : Le système gère les RDV et les patients, mais il manque le cœur du métier médical (Consultation, Examen, Diagnostic, Prescription, Suivi)

3. **Rupture de continuité** : Aucun lien entre un RDV et ce qui se passe pendant/après (consultation, examens, prescriptions)

4. **Dossier médical insuffisant** : Le modèle `MedicalRecord` est trop basique et ne reflète pas la réalité d'un dossier ophtalmologique

5. **Absence de gestion des pathologies** : Pas de modélisation des pathologies ophtalmologiques spécifiques (cataracte, glaucome, DMLA, etc.)

6. **Pas de suivi de traitement** : Impossible de suivre l'évolution d'un traitement dans le temps

7. **Examens ophtalmologiques manquants** : Pas de gestion des examens spécifiques (OCT, champ visuel, angiographie, etc.)

8. **Prescriptions non structurées** : Pas de modèle pour les prescriptions de lunettes, lentilles, médicaments

9. **Facturation déconnectée** : Pas de lien entre les actes médicaux et la facturation

**🟡 PROBLÈMES MOYENS** :

- Gestion des stocks non liée aux prescriptions
- Pas de gestion des salles d'examen
- Pas de planning médecin
- Pas de gestion des urgences
- Pas de téléconsultation

**🟢 POINTS FORTS ACTUELS** :

- ✅ Authentification et sécurité robustes
- ✅ Gestion des RDV bidirectionnelle complète
- ✅ Interface admin moderne et professionnelle
- ✅ Notifications en temps réel
- ✅ Traçabilité des modifications
- ✅ Architecture technique solide

---

## 2. WORKFLOW MÉDICAL ACTUEL VS IDÉAL

### 2.1 Workflow Actuel (Incorrect)

```
┌─────────────┐
│ Utilisateur │
│  s'inscrit  │ ❌ ERREUR : Peut s'inscrire directement
└──────┬──────┘
       │
       v
┌─────────────┐
│  Prend RDV  │
└──────┬──────┘
       │
       v
┌─────────────┐
│ RDV confirmé│
└──────┬──────┘
       │
       v
   ❌ RUPTURE ❌
   (Que se passe-t-il après ?)
```

**Problèmes** :
1. Un utilisateur peut s'inscrire directement comme "patient" sans jamais avoir consulté
2. Le système s'arrête au RDV. Il n'y a aucune continuité vers la consultation médicale
3. Pas de distinction entre "demandeur de RDV" et "patient"



### 2.2 Workflow Idéal (Complet et Correct)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW MÉDICAL COMPLET ET CORRECT                       │
└─────────────────────────────────────────────────────────────────────────────┘

1. DEMANDE DE RENDEZ-VOUS (Site web ou Présentiel)
   ┌─────────────┐
   │ Utilisateur │ → Remplit formulaire RDV (nom, prénom, email, téléphone, motif)
   │ demande RDV │ → ✅ Compte PROVISOIRE créé automatiquement
   └──────┬──────┘ → ✅ Code d'accès généré (pour suivre sa demande)
          │         → ✅ Email avec code d'accès envoyé
          │         → ⚠️ BLOQUÉ : Ne peut faire qu'UNE SEULE demande jusqu'à réponse
          │
          v
2. VÉRIFICATION DE DEMANDE (Nouveau workflow)
   ┌─────────────┐
   │ Utilisateur │ → Clique sur "Vérifier ma demande" (au lieu de "S'inscrire")
   │  vérifie    │ → Modal centré : Nom + Prénom + Code d'accès
   └──────┬──────┘ → Authentification
          │         → Redirection vers page état RDV
          │         → Peut voir : Statut, Propositions, Modifications, Annulation
          v
3. TRAITEMENT DEMANDE PAR ADMIN
   ┌─────────────┐
   │    Admin    │ → Confirme/Refuse/Propose autre date
   └──────┬──────┘ → Notification utilisateur
          │         → ✅ Déblocage : Peut refaire une demande si refusé
          v
4. RDV CONFIRMÉ
   ┌─────────────┐
   │ RDV confirmé│ → Date/Heure fixées
   └──────┬──────┘ → Utilisateur notifié
          │         → ⚠️ Statut : "Demandeur de RDV" (PAS ENCORE PATIENT)
          v
5. ARRIVÉE À LA CLINIQUE
   ┌─────────────┐
   │   Accueil   │ → Vérification identité
   └──────┬──────┘ → Vérification RDV
          │         → Préparation dossier
          v
6. CONSULTATION MÉDICALE ✅ POINT CLÉ
   ┌─────────────┐
   │ Consultation│ → 🔑 CRÉATION DU COMPTE PATIENT (si 1ère consultation)
   └──────┬──────┘ → 🔑 OU AJOUT CONSULTATION (si patient existant)
          │         → Anamnèse (interrogatoire)
          │         → Motif de consultation
          │         → Symptômes
          │         → Antécédents
          v
7. EXAMENS OPHTALMOLOGIQUES
   ┌─────────────┐
   │   Examens   │ → Acuité visuelle
   └──────┬──────┘ → Réfraction
          │         → Tension oculaire
          │         → Fond d'œil
          │         → OCT, Champ visuel, etc.
          v
8. DIAGNOSTIC
   ┌─────────────┐
   │  Diagnostic │ → Pathologie identifiée
   └──────┬──────┘ → Sévérité
          │         → CIM-10 (code diagnostic)
          v
9. PRESCRIPTION
   ┌─────────────┐
   │ Prescription│ → Médicaments
   └──────┬──────┘ → Lunettes/Lentilles
          │         → Examens complémentaires
          │         → Chirurgie
          v
10. PLAN DE TRAITEMENT
   ┌─────────────┐
   │ Traitement  │ → Protocole de soins
   └──────┬──────┘ → Durée
          │         → Objectifs
          v
11. SUIVI
   ┌─────────────┐
   │    Suivi    │ → RDV de contrôle
   └──────┬──────┘ → Évolution
          │         → Ajustements
          v
12. FACTURATION
   ┌─────────────┐
   │ Facturation │ → Actes médicaux
   └──────┬──────┘ → Médicaments
          │         → Examens
          v
13. CLÔTURE
   ┌─────────────┐
   │   Clôture   │ → Compte-rendu
   └─────────────┘ → Archivage
                    → Statistiques
```

**🔑 RÈGLES FONDAMENTALES** :

1. **Pas de patient sans consultation** : On ne devient patient qu'après la première consultation
2. **Compte provisoire pour RDV** : Permet de suivre sa demande avec code d'accès
3. **Une seule demande à la fois** : Évite le spam, force à attendre la réponse
4. **Vérification au lieu d'inscription** : Bouton "Vérifier ma demande" remplace "S'inscrire"
5. **Création automatique** : Le compte patient se crée automatiquement lors de la consultation
6. **Page Patients = Lecture seule** : On ne peut pas créer un patient manuellement depuis cette page



---

## 3. ANALYSE DES MODÈLES DE DONNÉES

### 3.1 Modèles Existants

#### 3.1.1 Modèle `User` (Patient)

**Champs actuels** :
```python
- email, phone, role
- first_name, last_name
- date_of_birth, gender
- address
- emergency_contact, emergency_phone
- avatar
```

**✅ Points forts** :
- Informations de base complètes
- Contact d'urgence présent
- Gestion des rôles (patient, staff, doctor, admin)

**❌ Manques critiques** :
- ❌ **ERREUR CONCEPTUELLE** : Pas de distinction entre "demandeur de RDV" et "patient"
- ❌ **Pas de code d'accès** : Pour vérifier l'état de sa demande de RDV
- ❌ **Pas de statut de compte** : Provisoire (demandeur RDV) vs Patient (a consulté)
- ❌ **Pas de limitation RDV** : Peut faire plusieurs demandes simultanées
- Pas de numéro de dossier médical unique
- Pas d'informations d'assurance/mutuelle
- Pas de médecin traitant référent
- Pas de statut patient (actif, inactif, décédé)
- Pas de profession (utile pour certaines pathologies)
- Pas de lieu de naissance (statistiques épidémiologiques)

#### 3.1.2 Modèle `MedicalRecord` (Dossier Médical)

**Champs actuels** :
```python
- blood_group
- allergies (TextField)
- medical_history (TextField)
- chronic_conditions (TextField)
- current_treatments (TextField)
- vision_left, vision_right (CharField)
- intraocular_pressure_left, intraocular_pressure_right
- medical_notes (TextField)
```

**✅ Points forts** :
- Informations de base présentes
- Données ophtalmologiques basiques

**❌ Manques critiques** :
1. **Données non structurées** : Tout est en TextField, impossible de faire des requêtes ou statistiques
2. **Pas de réfraction** : Sphère, cylindre, axe, addition (essentiel en ophtalmo)
3. **Pas de pathologies structurées** : Impossible de savoir combien de patients ont un glaucome
4. **Pas d'historique** : Les données sont écrasées à chaque modification
5. **Pas de lien avec les consultations** : Ces données viennent d'où ? Quand ont-elles été mesurées ?
6. **Pas de dominance oculaire**
7. **Pas de distance interpupillaire** (essentiel pour lunettes)
8. **Pas de kératométrie** (courbure cornéenne)
9. **Pas de pachymétrie** (épaisseur cornéenne)



#### 3.1.3 Modèle `Appointment` (Rendez-vous)

**Champs actuels** :
```python
- patient, date, time
- consultation_type (generale, specialisee, suivi, urgence)
- reason, status
- notes_patient, notes_staff
- rejection_reason, admin_message, patient_message
- proposed_date, proposed_time
- created_by, last_modified_by
- confirmed_at, cancelled_at, responded_at
```

**✅ Points forts** :
- Gestion bidirectionnelle complète
- Traçabilité excellente
- Workflow de modification robuste
- Historique complet (AppointmentHistory)

**❌ Manques critiques** :
1. **Pas de lien avec la consultation** : Que se passe-t-il après le RDV ?
2. **Pas de médecin assigné** : Quel médecin va voir le patient ?
3. **Pas de salle d'examen** : Où se déroule le RDV ?
4. **Pas de durée estimée** : Tous les RDV durent 30 min ?
5. **Pas de priorité** : Urgence vs consultation normale
6. **Pas de statut "En cours"** : Le patient est-il arrivé ? En salle d'attente ?
7. **Pas de lien avec la facturation** : Combien coûte ce RDV ?

#### 3.1.4 Modèle `PatientNote` (Notes)

**✅ Points forts** :
- Système de notes fonctionnel
- Auteur tracé
- Importance marquable

**❌ Manques** :
- Pas de catégorie (administrative, médicale, financière)
- Pas de visibilité (privée, partagée)
- Pas de tags

#### 3.1.5 Modèle `PatientDocument` (Documents)

**✅ Points forts** :
- Upload fonctionnel
- Catégorisation basique
- Métadonnées présentes

**❌ Manques** :
- Pas de lien avec une consultation spécifique
- Pas de lien avec un examen spécifique
- Pas de version (si document modifié)
- Pas de signature électronique
- Pas de date de validité (pour ordonnances)



### 3.2 Schéma Relationnel Actuel

```
┌──────────────┐
│     User     │
│  (Patient)   │
└──────┬───────┘
       │
       │ 1:1
       v
┌──────────────┐
│ MedicalRecord│  ❌ Données non structurées
└──────────────┘  ❌ Pas d'historique
       
       │ 1:N
       v
┌──────────────┐
│ Appointment  │  ❌ Pas de lien avec consultation
└──────────────┘  ❌ Pas de médecin assigné
       
       │ 1:N
       v
┌──────────────┐
│ PatientNote  │  ✅ OK
└──────────────┘
       
       │ 1:N
       v
┌──────────────┐
│PatientDocument│ ❌ Pas de lien avec consultation
└──────────────┘

❌ MANQUANTS :
- Consultation
- Examen
- Diagnostic
- Prescription
- Traitement
- Pathologie
- Acte médical
- Facture
```

**Constat** : Le schéma actuel est **incomplet** et ne permet pas de gérer le workflow médical complet.

---

## 4. INCOHÉRENCES CRITIQUES IDENTIFIÉES

### 4.0 Incohérence #0 : Logique d'enregistrement patient incorrecte ⚠️ PRIORITÉ ABSOLUE

**Problème actuel** :
- Un utilisateur peut s'inscrire directement sur le site et devenir "patient"
- **❌ ERREUR CONCEPTUELLE** : On ne devient patient qu'après avoir consulté

**Vision correcte** :

#### Étape 1 : Demande de RDV (Site web ou Présentiel)
```
Utilisateur remplit formulaire RDV :
- Nom, Prénom
- Email, Téléphone
- Motif de consultation

→ ✅ Compte PROVISOIRE créé automatiquement
→ ✅ Code d'accès généré (ex: "VIDA-2026-001234")
→ ✅ Email envoyé avec code d'accès
→ ✅ Statut : "appointment_requester" (demandeur de RDV)
→ ⚠️ BLOQUÉ : Ne peut faire qu'UNE SEULE demande jusqu'à réponse admin
```

#### Étape 2 : Vérification de demande (Nouveau workflow)
```
Au lieu de "S'inscrire" ou "Créer un compte" :
→ Bouton "Vérifier ma demande"
→ Modal centré apparaît :
   - Champ : Nom
   - Champ : Prénom
   - Champ : Code d'accès
   - Bouton : Vérifier

→ Authentification avec code d'accès
→ Redirection vers page état RDV
→ Peut voir :
   - Statut de sa demande (En attente, Confirmé, Refusé, Proposition)
   - Propositions de l'admin
   - Modifier sa demande (si autorisé)
   - Annuler sa demande
```

#### Étape 3 : Traitement par Admin
```
Admin traite la demande :
- Confirme → RDV confirmé, utilisateur notifié
- Refuse → Utilisateur notifié, ✅ DÉBLOQUÉ (peut refaire une demande)
- Propose autre date → Utilisateur notifié, peut accepter/refuser

Si confirmé :
→ Statut reste "appointment_requester"
→ ⚠️ PAS ENCORE PATIENT
```

#### Étape 4 : Consultation (CRÉATION DU PATIENT)
```
Utilisateur vient à la clinique pour son RDV :

→ Médecin ouvre le dossier du RDV
→ Clique sur "Démarrer consultation"
→ 🔑 SYSTÈME VÉRIFIE :
   - Si c'est la 1ère consultation de cet utilisateur :
     ✅ Création automatique du compte PATIENT
     ✅ Statut change : "appointment_requester" → "patient"
     ✅ Création du MedicalRecord
     ✅ Numéro de dossier médical généré
     ✅ Email de bienvenue envoyé
   
   - Si l'utilisateur a déjà consulté :
     ✅ Consultation ajoutée au compte patient existant
     ✅ Pas de duplication

→ Médecin peut maintenant remplir la consultation
```

**Impact** :
- ✅ Logique métier correcte : Patient = A consulté
- ✅ Pas de comptes patients vides
- ✅ Traçabilité complète
- ✅ Évite le spam de demandes RDV
- ✅ Expérience utilisateur claire

**Solution technique** :

```python
class User(AbstractUser):
    class Role(models.TextChoices):
        APPOINTMENT_REQUESTER = 'appointment_requester', _('Demandeur de RDV')
        PATIENT = 'patient', _('Patient')
        STAFF = 'staff', _('Personnel')
        DOCTOR = 'doctor', _('Médecin')
        ADMIN = 'admin', _('Administrateur')
    
    role = models.CharField(
        max_length=30,  # Augmenté pour "appointment_requester"
        choices=Role.choices,
        default=Role.APPOINTMENT_REQUESTER  # Par défaut : demandeur
    )
    
    # NOUVEAU : Code d'accès pour vérifier sa demande
    access_code = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        verbose_name='Code d\'accès',
        help_text='Code pour vérifier l\'état de sa demande de RDV'
    )
    
    # NOUVEAU : Limitation des demandes RDV
    can_request_appointment = models.BooleanField(
        default=True,
        verbose_name='Peut demander un RDV',
        help_text='False si une demande est en attente'
    )
    
    # NOUVEAU : Date de première consultation (devient patient)
    first_consultation_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Date de première consultation'
    )
    
    @property
    def is_patient(self):
        return self.role == self.Role.PATIENT
    
    @property
    def is_appointment_requester(self):
        return self.role == self.Role.APPOINTMENT_REQUESTER
    
    def generate_access_code(self):
        """Génère un code d'accès unique"""
        import random
        import string
        year = timezone.now().year
        random_part = ''.join(random.choices(string.digits, k=6))
        self.access_code = f"VIDA-{year}-{random_part}"
        return self.access_code
    
    def promote_to_patient(self):
        """Transforme un demandeur en patient (lors de la 1ère consultation)"""
        if self.role == self.Role.APPOINTMENT_REQUESTER:
            self.role = self.Role.PATIENT
            self.first_consultation_date = timezone.now().date()
            self.save()
            # Créer le dossier médical
            MedicalRecord.objects.get_or_create(patient=self)
            # Envoyer email de bienvenue
            send_welcome_patient_email(self)


# Signal automatique lors de la création d'une consultation
@receiver(post_save, sender=Consultation)
def create_patient_on_first_consultation(sender, instance, created, **kwargs):
    """Crée automatiquement le compte patient lors de la 1ère consultation"""
    if created:
        user = instance.patient
        if user.role == User.Role.APPOINTMENT_REQUESTER:
            user.promote_to_patient()


# Signal pour bloquer les demandes RDV multiples
@receiver(post_save, sender=Appointment)
def block_multiple_appointments(sender, instance, created, **kwargs):
    """Bloque les nouvelles demandes RDV si une est en attente"""
    if created and instance.status == Appointment.Status.PENDING:
        user = instance.patient
        if user:
            user.can_request_appointment = False
            user.save()


@receiver(post_save, sender=Appointment)
def unblock_appointments_on_response(sender, instance, created, **kwargs):
    """Débloque les demandes RDV après réponse admin"""
    if not created and instance.status in [
        Appointment.Status.CONFIRMED,
        Appointment.Status.REJECTED,
        Appointment.Status.CANCELLED
    ]:
        user = instance.patient
        if user:
            user.can_request_appointment = True
            user.save()
```

**Modifications Frontend** :

1. **Supprimer le bouton "S'inscrire"** du site vitrine
2. **Ajouter le bouton "Vérifier ma demande"** dans le dropdown compte
3. **Créer le modal de vérification** :
```tsx
// components/VerifyAppointmentModal.tsx
interface VerifyAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VerifyAppointmentModal({ isOpen, onClose }: VerifyAppointmentModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    access_code: ''
  });
  
  const handleVerify = async () => {
    // API call : POST /auth/verify-appointment/
    // Si succès : Redirection vers page état RDV
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Vérifier ma demande de rendez-vous</h2>
      <Input label="Prénom" value={formData.first_name} onChange={...} />
      <Input label="Nom" value={formData.last_name} onChange={...} />
      <Input label="Code d'accès" value={formData.access_code} onChange={...} />
      <Button onClick={handleVerify}>Vérifier</Button>
    </Modal>
  );
}
```

4. **Modifier le formulaire de RDV** :
   - Générer automatiquement le code d'accès
   - Envoyer l'email avec le code
   - Bloquer `can_request_appointment`

5. **Page Patients (Admin)** :
   - ❌ Supprimer le bouton "Créer un patient"
   - ✅ Afficher uniquement les vrais patients (role='patient')
   - ✅ Filtrer les demandeurs de RDV (role='appointment_requester')

**Priorité** : 🔴 CRITIQUE - À implémenter AVANT toute autre fonctionnalité

---

### 4.1 Incohérence #1 : Rupture de continuité RDV → Consultation

**Problème** :
- Un patient prend un RDV
- Le RDV est confirmé
- Le patient vient à la clinique
- **❌ Et après ? Aucun moyen d'enregistrer ce qui s'est passé pendant la consultation**

**Impact** :
- Impossible de savoir ce qui a été fait pendant le RDV
- Impossible de facturer les actes réalisés
- Impossible de suivre l'évolution du patient
- Perte de données médicales critiques

**Solution** :
- Créer un modèle `Consultation` lié au `Appointment`
- Enregistrer : anamnèse, examen clinique, diagnostic, prescription



### 4.2 Incohérence #2 : Dossier médical statique vs dynamique

**Problème** :
- Le `MedicalRecord` contient des champs comme `vision_left`, `intraocular_pressure_left`
- Ces valeurs changent à chaque consultation
- **❌ Mais il n'y a qu'une seule valeur stockée, pas d'historique**

**Exemple concret** :
```
Consultation 1 (01/01/2026) : Pression OG = 15 mmHg
Consultation 2 (01/02/2026) : Pression OG = 18 mmHg ⚠️ Augmentation !
Consultation 3 (01/03/2026) : Pression OG = 22 mmHg 🔴 Glaucome ?

❌ Problème : On ne voit que la dernière valeur (22 mmHg)
❌ On ne peut pas tracer l'évolution
❌ On ne peut pas détecter les tendances
```

**Impact** :
- Impossible de suivre l'évolution d'une pathologie
- Impossible de détecter une aggravation
- Perte d'informations médicales critiques
- Risque médico-légal

**Solution** :
- Créer un modèle `Examination` lié à une `Consultation`
- Chaque examen enregistre les valeurs à un instant T
- Possibilité de tracer l'évolution dans le temps

### 4.3 Incohérence #3 : Pathologies non structurées

**Problème** :
- Le champ `chronic_conditions` est un TextField libre
- **❌ Impossible de faire des statistiques** : "Combien de patients ont un glaucome ?"
- **❌ Impossible de filtrer** : "Tous les patients diabétiques"
- **❌ Pas de code CIM-10** : Standard international de classification des maladies

**Exemple concret** :
```
Patient A : chronic_conditions = "Glaucome, diabète"
Patient B : chronic_conditions = "glaucome type 2, Diabète de type 2"
Patient C : chronic_conditions = "GPAO (glaucome primitif à angle ouvert)"

❌ Impossible de savoir combien ont un glaucome
❌ Impossible de faire des requêtes SQL
❌ Pas de standardisation
```

**Impact** :
- Pas de statistiques épidémiologiques
- Pas de suivi de cohorte
- Pas de recherche clinique possible
- Pas de rapports d'activité fiables

**Solution** :
- Créer un modèle `Pathology` avec code CIM-10
- Créer un modèle `PatientPathology` (relation N:N avec historique)
- Enregistrer : date de diagnostic, sévérité, statut (actif, guéri, en rémission)



### 4.4 Incohérence #4 : Prescriptions inexistantes

**Problème** :
- Aucun modèle pour gérer les prescriptions
- **❌ Pas de prescription de médicaments**
- **❌ Pas de prescription de lunettes/lentilles**
- **❌ Pas de prescription d'examens complémentaires**

**Exemple concret** :
```
Médecin diagnostique un glaucome
→ Prescrit des collyres (Timolol 0.5%, 2x/jour)
→ Prescrit un OCT de contrôle dans 3 mois
→ Prescrit des lunettes (correction myopie)

❌ Aucun moyen d'enregistrer ces prescriptions
❌ Aucun moyen de suivre l'observance
❌ Aucun moyen de renouveler une ordonnance
❌ Aucun lien avec la facturation
❌ Aucun lien avec le stock (médicaments)
```

**Impact** :
- Perte d'informations médicales critiques
- Impossible de suivre les traitements
- Impossible de détecter les interactions médicamenteuses
- Risque médico-légal (pas de preuve de prescription)
- Pas de gestion du stock

**Solution** :
- Créer un modèle `Prescription` lié à une `Consultation`
- Créer un modèle `PrescriptionItem` (médicament, lunettes, examen)
- Créer un modèle `Medication` (base de données médicaments)
- Créer un modèle `GlassesPrescription` (sphère, cylindre, axe, addition)

### 4.5 Incohérence #5 : Examens ophtalmologiques manquants

**Problème** :
- Seuls 2 examens sont enregistrés : acuité visuelle et pression intraoculaire
- **❌ Manquent tous les examens spécifiques à l'ophtalmologie**

**Examens manquants essentiels** :
1. **Réfraction** : Sphère, cylindre, axe, addition (pour lunettes)
2. **Fond d'œil** : État de la rétine, nerf optique, vaisseaux
3. **OCT** (Tomographie par Cohérence Optique) : Imagerie rétine/nerf optique
4. **Champ visuel** : Détection glaucome, pathologies neurologiques
5. **Angiographie** : Circulation rétinienne
6. **Topographie cornéenne** : Courbure cornée (kératocône, chirurgie)
7. **Pachymétrie** : Épaisseur cornéenne (glaucome)
8. **Biométrie** : Mesures pour chirurgie cataracte
9. **Test de Schirmer** : Sécheresse oculaire
10. **Gonioscopy** : Angle irido-cornéen (glaucome)

**Impact** :
- Impossible d'enregistrer les résultats d'examens
- Impossible de suivre l'évolution
- Impossible de comparer avec examens précédents
- Perte de données médicales critiques

**Solution** :
- Créer un modèle `Examination` générique
- Créer des modèles spécifiques : `RefractionExam`, `OCTExam`, `VisualFieldExam`, etc.
- Stocker les images/fichiers associés
- Permettre la comparaison dans le temps



### 4.6 Incohérence #6 : Facturation déconnectée du médical

**Problème** :
- Le module de facturation est planifié mais **pas de lien avec les actes médicaux**
- **❌ Comment facturer une consultation si on ne sait pas ce qui a été fait ?**

**Exemple concret** :
```
Patient vient pour consultation
→ Consultation générale : 15 000 FCFA
→ + OCT : 25 000 FCFA
→ + Champ visuel : 20 000 FCFA
→ + Prescription lunettes : 5 000 FCFA
Total : 65 000 FCFA

❌ Aucun moyen de lier ces actes à la consultation
❌ Aucun moyen de générer une facture automatiquement
❌ Facturation manuelle = erreurs + perte de temps
```

**Impact** :
- Facturation manuelle chronophage
- Risque d'oubli d'actes (perte de revenus)
- Pas de statistiques de revenus par acte
- Pas de suivi de rentabilité

**Solution** :
- Créer un modèle `MedicalAct` (nomenclature des actes)
- Créer un modèle `ConsultationAct` (actes réalisés pendant consultation)
- Lier automatiquement à la facturation
- Génération automatique de facture

### 4.7 Incohérence #7 : Pas de suivi de traitement

**Problème** :
- Un traitement est prescrit (ex: collyres pour glaucome)
- **❌ Aucun moyen de suivre si le patient prend bien son traitement**
- **❌ Aucun moyen de suivre l'efficacité du traitement**

**Exemple concret** :
```
01/01/2026 : Diagnostic glaucome, prescription Timolol
01/02/2026 : RDV de contrôle
→ Pression oculaire toujours élevée
→ ❌ Le patient prend-il bien son traitement ?
→ ❌ Faut-il changer de traitement ?
→ ❌ Aucune donnée pour décider
```

**Impact** :
- Impossible de suivre l'observance
- Impossible d'évaluer l'efficacité
- Décisions médicales sans données
- Risque de complications

**Solution** :
- Créer un modèle `TreatmentPlan` (plan de traitement)
- Créer un modèle `TreatmentFollowUp` (suivi du traitement)
- Enregistrer : observance, effets secondaires, efficacité
- Alertes si pas de suivi



---

## 5. FONCTIONNALITÉS MANQUANTES ESSENTIELLES

### 5.1 Gestion des Consultations

**Statut** : ❌ Totalement absent

**Fonctionnalités nécessaires** :
1. **Création consultation** :
   - Lien avec RDV
   - Médecin consultant
   - Date/heure début et fin
   - Salle d'examen

2. **Anamnèse** (Interrogatoire) :
   - Motif de consultation
   - Symptômes actuels
   - Durée des symptômes
   - Facteurs déclenchants
   - Traitements déjà essayés

3. **Examen clinique** :
   - Inspection externe
   - Motilité oculaire
   - Réflexes pupillaires
   - Annexes (paupières, conjonctive)

4. **Examens complémentaires** :
   - Liste des examens réalisés
   - Résultats
   - Images/fichiers

5. **Diagnostic** :
   - Pathologie(s) identifiée(s)
   - Code CIM-10
   - Sévérité
   - Œil concerné (OD, OG, les deux)

6. **Prescription** :
   - Médicaments
   - Lunettes/lentilles
   - Examens complémentaires
   - Chirurgie

7. **Plan de traitement** :
   - Objectifs thérapeutiques
   - Durée estimée
   - RDV de suivi

8. **Compte-rendu** :
   - Résumé de la consultation
   - Recommandations
   - Export PDF

**Priorité** : 🔴 CRITIQUE



### 5.2 Gestion des Examens Ophtalmologiques

**Statut** : ❌ Totalement absent (sauf 2 valeurs basiques)

**Examens à implémenter** :

#### 5.2.1 Réfraction (Essentiel)
```python
- Œil droit/gauche
- Sphère (dioptries)
- Cylindre (dioptries)
- Axe (degrés)
- Addition (pour presbytie)
- Acuité visuelle avec correction
- Acuité visuelle sans correction
- Distance de travail
```

#### 5.2.2 Pression Intraoculaire (Déjà présent mais à améliorer)
```python
- Œil droit/gauche
- Valeur (mmHg)
- Méthode (Goldman, air pulsé, iCare)
- Heure de mesure (important pour glaucome)
- Pachymétrie associée (épaisseur cornée)
```

#### 5.2.3 Fond d'Œil
```python
- Œil droit/gauche
- Papille optique (normal, excavé, pâle)
- Rapport cup/disc (glaucome)
- Macula (normal, œdème, DMLA)
- Vaisseaux (normal, tortueux, hémorragies)
- Rétine périphérique
- Photos/images
```

#### 5.2.4 OCT (Tomographie)
```python
- Œil droit/gauche
- Type (maculaire, papillaire, cornéen)
- Épaisseur rétinienne centrale
- Volume maculaire
- Épaisseur RNFL (fibres nerveuses)
- Images/fichiers DICOM
- Comparaison avec examens précédents
```

#### 5.2.5 Champ Visuel
```python
- Œil droit/gauche
- Type (central 30-2, 24-2, périphérique)
- Appareil (Humphrey, Octopus)
- MD (Mean Deviation)
- PSD (Pattern Standard Deviation)
- VFI (Visual Field Index)
- Fichier résultat
- Comparaison progression
```

#### 5.2.6 Topographie Cornéenne
```python
- Œil droit/gauche
- Kératométrie (K1, K2, axe)
- Astigmatisme cornéen
- Pachymétrie (épaisseur)
- Carte topographique
- Détection kératocône
```

#### 5.2.7 Biométrie (Chirurgie Cataracte)
```python
- Œil droit/gauche
- Longueur axiale
- Profondeur chambre antérieure
- Kératométrie
- Calcul implant (formule SRK/T, Haigis, etc.)
- Puissance implant recommandée
```

**Priorité** : 🔴 CRITIQUE



### 5.3 Gestion des Pathologies Ophtalmologiques

**Statut** : ❌ Totalement absent

**Pathologies fréquentes à gérer** :

#### 5.3.1 Pathologies du Segment Antérieur
- **Cataracte** : Type (nucléaire, corticale, sous-capsulaire), stade, œil
- **Glaucome** : Type (angle ouvert, angle fermé, secondaire), stade, pression cible
- **Kératocône** : Stade (Amsler), topographie
- **Sécheresse oculaire** : Sévérité, test de Schirmer, BUT
- **Conjonctivite** : Type (virale, bactérienne, allergique)
- **Ptérygion** : Taille, progression

#### 5.3.2 Pathologies du Segment Postérieur
- **DMLA** (Dégénérescence Maculaire) : Type (sèche, humide), stade, acuité
- **Rétinopathie diabétique** : Stade (non proliférante, proliférante), œdème maculaire
- **Décollement de rétine** : Type, localisation, urgence
- **Occlusion vasculaire** : Artère/veine, centrale/branche
- **Uvéite** : Type, localisation, cause

#### 5.3.3 Pathologies Réfractives
- **Myopie** : Degré, progression, risque complications
- **Hypermétropie** : Degré, accommodation
- **Astigmatisme** : Degré, axe, régulier/irrégulier
- **Presbytie** : Addition nécessaire

#### 5.3.4 Autres
- **Strabisme** : Type, angle de déviation
- **Amblyopie** : Œil concerné, cause, traitement
- **Neuropathie optique** : Cause, évolution

**Modèle proposé** :
```python
class Pathology:
    code_cim10 = CharField()  # Ex: H40.1 (Glaucome)
    name = CharField()
    category = CharField()  # Segment antérieur, postérieur, etc.
    description = TextField()

class PatientPathology:
    patient = ForeignKey(User)
    pathology = ForeignKey(Pathology)
    eye = CharField()  # OD, OG, Both
    diagnosed_date = DateField()
    diagnosed_by = ForeignKey(User)  # Médecin
    severity = CharField()  # Léger, Modéré, Sévère
    status = CharField()  # Actif, Guéri, En rémission, Stable
    notes = TextField()
    consultation = ForeignKey(Consultation)  # Lien avec consultation
```

**Priorité** : 🔴 CRITIQUE



### 5.4 Gestion des Prescriptions

**Statut** : ❌ Totalement absent

#### 5.4.1 Prescriptions Médicamenteuses

**Fonctionnalités nécessaires** :
```python
class Medication:
    name = CharField()  # Ex: Timolol
    active_substance = CharField()
    form = CharField()  # Collyre, comprimé, pommade
    dosage = CharField()  # 0.5%, 10mg, etc.
    manufacturer = CharField()
    price = DecimalField()
    in_stock = BooleanField()

class Prescription:
    consultation = ForeignKey(Consultation)
    patient = ForeignKey(User)
    doctor = ForeignKey(User)
    date = DateTimeField()
    valid_until = DateField()  # Durée de validité
    status = CharField()  # Active, Expirée, Renouvelée

class PrescriptionItem:
    prescription = ForeignKey(Prescription)
    medication = ForeignKey(Medication)
    dosage = CharField()  # "1 goutte"
    frequency = CharField()  # "2 fois par jour"
    duration = CharField()  # "30 jours"
    eye = CharField()  # OD, OG, Both
    instructions = TextField()  # "Matin et soir"
    quantity = IntegerField()  # Nombre de flacons
```

**Fonctionnalités** :
- Recherche médicament dans base de données
- Vérification interactions médicamenteuses
- Vérification allergies patient
- Génération ordonnance PDF
- Envoi par email
- Renouvellement automatique
- Historique des prescriptions

**Priorité** : 🔴 CRITIQUE

#### 5.4.2 Prescriptions Optiques (Lunettes/Lentilles)

**Fonctionnalités nécessaires** :
```python
class GlassesPrescription:
    consultation = ForeignKey(Consultation)
    patient = ForeignKey(User)
    doctor = ForeignKey(User)
    date = DateTimeField()
    valid_until = DateField()  # 1 an généralement
    
    # Œil droit
    od_sphere = DecimalField()
    od_cylinder = DecimalField()
    od_axis = IntegerField()
    od_addition = DecimalField()  # Presbytie
    od_prism = CharField()
    
    # Œil gauche
    og_sphere = DecimalField()
    og_cylinder = DecimalField()
    og_axis = IntegerField()
    og_addition = DecimalField()
    og_prism = CharField()
    
    # Autres
    interpupillary_distance = DecimalField()  # Distance interpupillaire
    lens_type = CharField()  # Unifocal, Bifocal, Progressif
    lens_material = CharField()  # Organique, Minéral
    coating = CharField()  # Anti-reflet, Anti-rayures, Photochromique
    frame_type = CharField()  # Cerclée, Percée, Nylor
    
    notes = TextField()
```

**Fonctionnalités** :
- Génération ordonnance lunettes PDF
- Envoi chez opticien partenaire
- Suivi commande
- Historique corrections

**Priorité** : 🔴 CRITIQUE



### 5.5 Gestion du Planning Médecin

**Statut** : ❌ Totalement absent

**Problème actuel** :
- Les RDV sont pris sans savoir quel médecin est disponible
- Pas de gestion des absences
- Pas de gestion des salles d'examen
- Pas de gestion des urgences

**Fonctionnalités nécessaires** :
```python
class Doctor:
    user = OneToOneField(User)
    specialization = CharField()  # Ophtalmologue, Orthoptiste
    license_number = CharField()  # Numéro d'ordre
    consultation_duration = IntegerField()  # Durée moyenne consultation
    max_patients_per_day = IntegerField()
    
class DoctorSchedule:
    doctor = ForeignKey(Doctor)
    day_of_week = IntegerField()  # 0=Lundi, 6=Dimanche
    start_time = TimeField()
    end_time = TimeField()
    is_active = BooleanField()
    
class DoctorAbsence:
    doctor = ForeignKey(Doctor)
    start_date = DateField()
    end_date = DateField()
    reason = CharField()  # Congé, Formation, Maladie
    replacement_doctor = ForeignKey(Doctor, null=True)
    
class ExaminationRoom:
    name = CharField()  # "Salle 1", "Salle OCT"
    equipment = TextField()  # Liste équipements
    is_available = BooleanField()
```

**Fonctionnalités** :
- Calendrier médecin avec disponibilités
- Assignation automatique médecin lors RDV
- Gestion des absences
- Gestion des remplacements
- Gestion des salles d'examen
- Statistiques par médecin

**Priorité** : 🟡 HAUTE

### 5.6 Gestion des Urgences

**Statut** : ❌ Totalement absent

**Problème actuel** :
- Pas de gestion des urgences ophtalmologiques
- Pas de priorisation des RDV

**Urgences ophtalmologiques courantes** :
- Traumatisme oculaire
- Baisse brutale de vision
- Douleur oculaire intense
- Corps étranger
- Brûlure chimique
- Décollement de rétine
- Glaucome aigu

**Fonctionnalités nécessaires** :
```python
class EmergencyConsultation:
    patient = ForeignKey(User)
    arrival_time = DateTimeField()
    triage_level = CharField()  # Urgent, Très urgent, Vital
    chief_complaint = TextField()
    vital_signs = JSONField()  # Tension, pouls, etc.
    assigned_doctor = ForeignKey(Doctor)
    consultation = ForeignKey(Consultation, null=True)
    status = CharField()  # En attente, En cours, Terminé
```

**Fonctionnalités** :
- Triage des urgences
- File d'attente prioritaire
- Notification médecin de garde
- Protocoles d'urgence
- Statistiques urgences

**Priorité** : 🟡 HAUTE



---

## 6. PROBLÈMES DE COHÉRENCE MÉTIER

### 6.1 Workflow Incomplet

**Problème** : Le système gère le "avant" (RDV) mais pas le "pendant" (consultation) ni le "après" (suivi).

**Impact sur l'utilisateur** :
- **Médecin** : Doit utiliser un autre système (papier, Excel) pour enregistrer les consultations
- **Admin** : Ne peut pas facturer automatiquement
- **Patient** : Ne peut pas consulter son historique médical complet

**Solution** : Implémenter le workflow complet (voir section 2.2)

### 6.2 Données Médicales Non Exploitables

**Problème** : Les données médicales sont stockées en texte libre (TextField), impossible de faire des requêtes ou statistiques.

**Exemples concrets** :

❌ **Impossible** :
- "Combien de patients ont un glaucome ?"
- "Quel est l'âge moyen des patients diabétiques ?"
- "Combien d'OCT ont été réalisés ce mois-ci ?"
- "Quel est le taux de réussite de la chirurgie de cataracte ?"

✅ **Possible avec données structurées** :
```sql
-- Nombre de patients avec glaucome
SELECT COUNT(*) FROM patient_pathology 
WHERE pathology_id = (SELECT id FROM pathology WHERE code_cim10 = 'H40.1')
AND status = 'active';

-- Âge moyen des diabétiques
SELECT AVG(EXTRACT(YEAR FROM AGE(date_of_birth))) 
FROM users u
JOIN patient_pathology pp ON u.id = pp.patient_id
WHERE pp.pathology_id = (SELECT id FROM pathology WHERE code_cim10 = 'E11');

-- Nombre d'OCT ce mois
SELECT COUNT(*) FROM examination 
WHERE exam_type = 'OCT' 
AND date >= DATE_TRUNC('month', CURRENT_DATE);
```

**Solution** : Structurer toutes les données médicales avec des modèles dédiés.



### 6.3 Absence de Traçabilité Médicale

**Problème** : Impossible de savoir qui a fait quoi, quand, et pourquoi.

**Exemples de questions sans réponse** :
- Qui a diagnostiqué ce glaucome ?
- Quand cette prescription a-t-elle été faite ?
- Pourquoi ce traitement a-t-il été changé ?
- Quelle était la pression oculaire il y a 6 mois ?

**Impact médico-légal** :
- En cas de litige, pas de preuve de ce qui a été fait
- Pas de traçabilité des décisions médicales
- Risque juridique pour la clinique

**Solution** :
- Lier toutes les données à une consultation
- Enregistrer l'auteur de chaque action
- Historiser toutes les modifications
- Générer des comptes-rendus horodatés

### 6.4 Facturation Manuelle = Erreurs + Perte de Temps

**Problème actuel** :
1. Patient vient en consultation
2. Médecin réalise des actes (consultation + examens)
3. **❌ Admin doit créer manuellement la facture**
4. Risque d'oubli d'actes
5. Perte de temps
6. Erreurs de calcul

**Workflow idéal** :
1. Patient vient en consultation
2. Médecin réalise des actes (enregistrés dans le système)
3. **✅ Facture générée automatiquement**
4. Admin valide et encaisse
5. Statistiques automatiques

**Solution** :
```python
class MedicalAct:
    code = CharField()  # Code nomenclature
    name = CharField()
    category = CharField()
    price = DecimalField()
    duration = IntegerField()  # Durée en minutes
    
class ConsultationAct:
    consultation = ForeignKey(Consultation)
    medical_act = ForeignKey(MedicalAct)
    quantity = IntegerField()
    price = DecimalField()  # Prix au moment de l'acte
    performed_by = ForeignKey(User)  # Médecin
    
class Invoice:
    patient = ForeignKey(User)
    consultation = ForeignKey(Consultation)
    date = DateTimeField()
    total_amount = DecimalField()
    paid_amount = DecimalField()
    status = CharField()  # Impayée, Payée, Partielle
    payment_method = CharField()
    
    def generate_from_consultation(self, consultation):
        # Génération automatique depuis les actes
        acts = ConsultationAct.objects.filter(consultation=consultation)
        self.total_amount = sum(act.price * act.quantity for act in acts)
```

**Priorité** : 🔴 CRITIQUE



### 6.5 Gestion du Stock Déconnectée

**Problème** :
- Module de stock planifié mais **pas de lien avec les prescriptions**
- Impossible de savoir si un médicament est disponible avant de prescrire
- Pas de déduction automatique du stock

**Workflow actuel (problématique)** :
```
Médecin prescrit Timolol
→ ❌ Ne sait pas si disponible en stock
→ Patient va à la pharmacie
→ ❌ Rupture de stock
→ Patient doit revenir
→ Perte de temps + insatisfaction
```

**Workflow idéal** :
```
Médecin prescrit Timolol
→ ✅ Système vérifie stock en temps réel
→ ✅ Si disponible : OK
→ ✅ Si rupture : Alerte + proposition alternative
→ ✅ Déduction automatique du stock
→ ✅ Alerte si seuil bas atteint
```

**Solution** :
```python
class StockItem:
    medication = ForeignKey(Medication)
    quantity = IntegerField()
    unit = CharField()  # Flacon, Boîte, Unité
    expiry_date = DateField()
    batch_number = CharField()
    supplier = ForeignKey(Supplier)
    alert_threshold = IntegerField()
    
class StockMovement:
    stock_item = ForeignKey(StockItem)
    movement_type = CharField()  # Entrée, Sortie, Ajustement
    quantity = IntegerField()
    date = DateTimeField()
    reason = CharField()
    prescription = ForeignKey(PrescriptionItem, null=True)  # Lien !
    user = ForeignKey(User)
    
# Signal automatique
@receiver(post_save, sender=PrescriptionItem)
def deduct_stock(sender, instance, created, **kwargs):
    if created and instance.medication.in_stock:
        StockMovement.objects.create(
            stock_item=instance.medication.stock,
            movement_type='Sortie',
            quantity=instance.quantity,
            reason='Prescription',
            prescription=instance,
            user=instance.prescription.doctor
        )
        # Vérifier seuil d'alerte
        if instance.medication.stock.quantity < instance.medication.stock.alert_threshold:
            send_low_stock_alert(instance.medication)
```

**Priorité** : 🟡 HAUTE



---

## 7. RECOMMANDATIONS D'ARCHITECTURE

### 7.1 Schéma Relationnel Proposé (Complet)

```
┌──────────────┐
│     User     │
│  (Patient)   │
└──────┬───────┘
       │
       │ 1:1
       ├─────────────────────────────────────────────────────────┐
       │                                                           │
       v                                                           v
┌──────────────┐                                          ┌──────────────┐
│ MedicalRecord│ (Données de base)                        │  Insurance   │
└──────┬───────┘                                          └──────────────┘
       │
       │ 1:N
       ├─────────────────────────────────────────────────────────┐
       │                                                           │
       v                                                           v
┌──────────────┐                                          ┌──────────────┐
│ Appointment  │                                          │PatientPathology│
└──────┬───────┘                                          └──────┬───────┘
       │                                                           │
       │ 1:1                                                       │ N:1
       v                                                           v
┌──────────────┐                                          ┌──────────────┐
│ Consultation │ ◄─────────────────────────────────────── │  Pathology   │
└──────┬───────┘                                          └──────────────┘
       │
       │ 1:N
       ├─────────────────────────────────────────────────────────┐
       │                     │                     │               │
       v                     v                     v               v
┌──────────────┐    ┌──────────────┐    ┌──────────────┐  ┌──────────────┐
│  Examination │    │  Diagnosis   │    │ Prescription │  │ConsultationAct│
└──────┬───────┘    └──────────────┘    └──────┬───────┘  └──────┬───────┘
       │                                         │                  │
       │ Polymorphic                             │ 1:N              │ N:1
       ├─────────────────┐                       v                  v
       v                 v              ┌──────────────┐    ┌──────────────┐
┌──────────────┐  ┌──────────────┐    │PrescriptionItem│   │  MedicalAct  │
│RefractionExam│  │   OCTExam    │    └──────┬───────┘    └──────────────┘
└──────────────┘  └──────────────┘           │
                                              │ N:1
                                              v
                                     ┌──────────────┐
                                     │  Medication  │
                                     └──────┬───────┘
                                            │
                                            │ 1:N
                                            v
                                     ┌──────────────┐
                                     │  StockItem   │
                                     └──────┬───────┘
                                            │
                                            │ 1:N
                                            v
                                     ┌──────────────┐
                                     │StockMovement │
                                     └──────────────┘
       
┌──────────────┐
│ Consultation │
└──────┬───────┘
       │ 1:1
       v
┌──────────────┐
│   Invoice    │
└──────┬───────┘
       │ 1:N
       v
┌──────────────┐
│ InvoiceItem  │
└──────────────┘
       │ 1:N
       v
┌──────────────┐
│   Payment    │
└──────────────┘
```

**Légende** :
- 1:1 = Relation un-à-un
- 1:N = Relation un-à-plusieurs
- N:1 = Relation plusieurs-à-un
- N:N = Relation plusieurs-à-plusieurs (via table intermédiaire)



### 7.2 Principes d'Architecture Recommandés

#### 7.2.1 Séparation des Responsabilités

**Principe** : Chaque modèle a une responsabilité unique et bien définie.

**Exemples** :
- `User` : Identité et authentification
- `MedicalRecord` : Données médicales de base (statiques)
- `Consultation` : Événement médical ponctuel
- `Examination` : Résultat d'un examen spécifique
- `Prescription` : Ordonnance médicale
- `Invoice` : Facturation

**❌ À éviter** :
- Mélanger données médicales et administratives dans un seul modèle
- Stocker des données temporelles (qui changent) dans un modèle statique

#### 7.2.2 Historisation Systématique

**Principe** : Toutes les données médicales doivent être historisées.

**Pourquoi** :
- Traçabilité médico-légale
- Suivi de l'évolution
- Détection de tendances
- Recherche clinique

**Comment** :
```python
# ❌ Mauvais : Écrase les données
class MedicalRecord:
    intraocular_pressure_left = DecimalField()  # Une seule valeur

# ✅ Bon : Historise les données
class IntraocularPressureExam:
    consultation = ForeignKey(Consultation)
    eye = CharField()  # OD, OG
    pressure = DecimalField()
    method = CharField()
    date = DateTimeField()
    measured_by = ForeignKey(User)
```

#### 7.2.3 Polymorphisme pour les Examens

**Principe** : Utiliser l'héritage pour les différents types d'examens.

**Pourquoi** :
- Chaque examen a des champs spécifiques
- Évite les tables avec beaucoup de champs NULL
- Facilite l'ajout de nouveaux types d'examens

**Comment** :
```python
class Examination(models.Model):
    """Classe de base pour tous les examens"""
    consultation = ForeignKey(Consultation)
    exam_type = CharField()
    date = DateTimeField()
    performed_by = ForeignKey(User)
    notes = TextField()
    
    class Meta:
        abstract = False  # Table commune

class RefractionExam(Examination):
    """Examen de réfraction"""
    eye = CharField()
    sphere = DecimalField()
    cylinder = DecimalField()
    axis = IntegerField()
    addition = DecimalField()
    visual_acuity = CharField()

class OCTExam(Examination):
    """Examen OCT"""
    eye = CharField()
    oct_type = CharField()  # Maculaire, Papillaire
    central_thickness = DecimalField()
    rnfl_thickness = DecimalField()
    image_file = FileField()
```



#### 7.2.4 Intégrité Référentielle

**Principe** : Utiliser les contraintes de base de données pour garantir la cohérence.

**Exemples** :
```python
class Consultation(models.Model):
    appointment = OneToOneField(
        Appointment, 
        on_delete=models.PROTECT  # ❌ Ne pas supprimer RDV si consultation existe
    )
    patient = ForeignKey(
        User, 
        on_delete=models.PROTECT  # ❌ Ne pas supprimer patient si consultations
    )
    doctor = ForeignKey(
        User, 
        on_delete=models.SET_NULL,  # ✅ Garder consultation si médecin supprimé
        null=True
    )

class Prescription(models.Model):
    consultation = ForeignKey(
        Consultation, 
        on_delete=models.CASCADE  # ✅ Supprimer prescriptions si consultation supprimée
    )
```

**Règles** :
- `PROTECT` : Empêche la suppression si des objets liés existent (données critiques)
- `CASCADE` : Supprime en cascade (données dépendantes)
- `SET_NULL` : Met à NULL (données de référence)
- `SET_DEFAULT` : Met une valeur par défaut

#### 7.2.5 Validation Métier

**Principe** : Valider les données au niveau du modèle, pas seulement au niveau du formulaire.

**Exemples** :
```python
class Consultation(models.Model):
    start_time = DateTimeField()
    end_time = DateTimeField()
    
    def clean(self):
        # Validation : fin après début
        if self.end_time <= self.start_time:
            raise ValidationError("La fin doit être après le début")
        
        # Validation : durée raisonnable
        duration = (self.end_time - self.start_time).total_seconds() / 60
        if duration > 180:  # 3 heures
            raise ValidationError("Durée trop longue")
    
    def save(self, *args, **kwargs):
        self.full_clean()  # Appelle clean()
        super().save(*args, **kwargs)

class IntraocularPressureExam(models.Model):
    pressure = DecimalField()
    
    def clean(self):
        # Validation : pression dans plage normale
        if self.pressure < 5 or self.pressure > 50:
            raise ValidationError("Pression hors plage normale (5-50 mmHg)")
```

#### 7.2.6 Signals pour Automatisation

**Principe** : Utiliser les signals Django pour automatiser les actions.

**Exemples** :
```python
# Création automatique du dossier médical
@receiver(post_save, sender=User)
def create_medical_record(sender, instance, created, **kwargs):
    if created and instance.is_patient:
        MedicalRecord.objects.create(patient=instance)

# Génération automatique de facture
@receiver(post_save, sender=Consultation)
def generate_invoice(sender, instance, created, **kwargs):
    if created:
        Invoice.objects.create(
            consultation=instance,
            patient=instance.patient,
            date=instance.start_time
        )

# Déduction automatique du stock
@receiver(post_save, sender=PrescriptionItem)
def deduct_stock(sender, instance, created, **kwargs):
    if created and instance.medication.in_stock:
        instance.medication.stock.quantity -= instance.quantity
        instance.medication.stock.save()
```



---

## 8. PLAN DE REFACTORING

### 8.1 Stratégie de Migration

**Objectif** : Passer du système actuel (incomplet) au système complet sans casser l'existant.

**Approche recommandée** : Migration progressive par phases.

#### Phase 1 : Préparation (1 semaine)
- ✅ Analyse complète (ce document)
- ✅ Validation avec l'équipe
- ✅ Priorisation des fonctionnalités
- ✅ Création des maquettes UI

#### Phase 2 : Modèles de Base (2 semaines)
**Objectif** : Créer les modèles essentiels sans casser l'existant

**Modèles à créer** :
1. `Consultation` (lien avec Appointment)
2. `Diagnosis` (diagnostic)
3. `Pathology` (base de données pathologies)
4. `PatientPathology` (pathologies du patient)
5. `MedicalAct` (nomenclature des actes)
6. `ConsultationAct` (actes réalisés)

**Migrations** :
```python
# Migration 1 : Créer les nouveaux modèles
python manage.py makemigrations
python manage.py migrate

# Migration 2 : Migrer les données existantes
# Exemple : Créer des pathologies depuis chronic_conditions
def migrate_chronic_conditions(apps, schema_editor):
    User = apps.get_model('users', 'User')
    MedicalRecord = apps.get_model('users', 'MedicalRecord')
    Pathology = apps.get_model('medical', 'Pathology')
    PatientPathology = apps.get_model('medical', 'PatientPathology')
    
    for record in MedicalRecord.objects.all():
        if record.chronic_conditions:
            # Parser le texte et créer des pathologies
            # (logique à adapter selon le format)
            pass
```

**Tests** :
- Tests unitaires pour chaque modèle
- Tests d'intégration
- Tests de migration de données



#### Phase 3 : Examens Ophtalmologiques (2 semaines)
**Objectif** : Implémenter les examens structurés

**Modèles à créer** :
1. `Examination` (classe de base)
2. `RefractionExam`
3. `IntraocularPressureExam`
4. `FundusExam` (fond d'œil)
5. `OCTExam`
6. `VisualFieldExam`

**Migration des données** :
```python
# Migrer vision_left/right vers RefractionExam
# Migrer intraocular_pressure vers IntraocularPressureExam
```

**UI** :
- Formulaires d'examen par type
- Affichage historique des examens
- Graphiques d'évolution

#### Phase 4 : Prescriptions (2 semaines)
**Objectif** : Gérer les prescriptions médicamenteuses et optiques

**Modèles à créer** :
1. `Medication` (base de données médicaments)
2. `Prescription`
3. `PrescriptionItem`
4. `GlassesPrescription`
5. `ContactLensPrescription`

**Fonctionnalités** :
- Recherche médicament
- Vérification interactions
- Génération ordonnance PDF
- Envoi par email

**UI** :
- Formulaire de prescription
- Historique des prescriptions
- Renouvellement

#### Phase 5 : Facturation Automatique (1 semaine)
**Objectif** : Lier les actes médicaux à la facturation

**Modèles à créer** :
1. `Invoice`
2. `InvoiceItem`
3. `Payment`

**Fonctionnalités** :
- Génération automatique depuis consultation
- Gestion des paiements
- Reçus PDF
- Statistiques financières

**UI** :
- Facture automatique
- Encaissement
- Historique paiements

#### Phase 6 : Planning Médecin (1 semaine)
**Objectif** : Gérer les disponibilités et absences

**Modèles à créer** :
1. `Doctor`
2. `DoctorSchedule`
3. `DoctorAbsence`
4. `ExaminationRoom`

**Fonctionnalités** :
- Calendrier médecin
- Gestion absences
- Assignation automatique RDV

**UI** :
- Planning médecin
- Gestion absences
- Vue salles d'examen

#### Phase 7 : Suivi de Traitement (1 semaine)
**Objectif** : Suivre l'évolution des traitements

**Modèles à créer** :
1. `TreatmentPlan`
2. `TreatmentFollowUp`

**Fonctionnalités** :
- Plan de traitement
- Suivi observance
- Alertes RDV de contrôle

**UI** :
- Formulaire plan de traitement
- Timeline de suivi
- Alertes



### 8.2 Gestion de la Rétrocompatibilité

**Principe** : Ne pas casser l'existant pendant la migration.

**Stratégie** :
1. **Garder les anciens champs** : Ne pas supprimer `MedicalRecord.vision_left` immédiatement
2. **Double écriture** : Écrire dans l'ancien ET le nouveau système pendant la transition
3. **Migration progressive** : Migrer les données petit à petit
4. **Tests de non-régression** : Vérifier que l'existant fonctionne toujours

**Exemple** :
```python
class MedicalRecord(models.Model):
    # Anciens champs (DEPRECATED)
    vision_left = CharField(blank=True)  # ⚠️ DEPRECATED : Utiliser RefractionExam
    vision_right = CharField(blank=True)  # ⚠️ DEPRECATED
    
    # Méthode de compatibilité
    @property
    def latest_vision_left(self):
        """Retourne la dernière acuité visuelle OG"""
        latest_exam = RefractionExam.objects.filter(
            consultation__patient=self.patient,
            eye='OG'
        ).order_by('-date').first()
        
        if latest_exam:
            return latest_exam.visual_acuity
        return self.vision_left  # Fallback sur ancienne valeur
```

### 8.3 Plan de Dépréciation

**Objectif** : Supprimer progressivement les anciens champs.

**Timeline** :
- **Mois 1-2** : Création nouveaux modèles + double écriture
- **Mois 3** : Migration des données + tests
- **Mois 4** : Marquage DEPRECATED des anciens champs
- **Mois 5** : Avertissements si utilisation anciens champs
- **Mois 6** : Suppression des anciens champs

**Communication** :
```python
import warnings

class MedicalRecord(models.Model):
    @property
    def vision_left(self):
        warnings.warn(
            "MedicalRecord.vision_left is deprecated. Use RefractionExam instead.",
            DeprecationWarning,
            stacklevel=2
        )
        return self._vision_left
```

---

## 9. NOUVEAUX MODÈLES PROPOSÉS

### 9.1 Modèle `Consultation`

**Rôle** : Enregistrer une consultation médicale complète.

```python
class Consultation(models.Model):
    """Consultation médicale"""
    
    # Relations
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.PROTECT,
        related_name='consultation',
        verbose_name='Rendez-vous'
    )
    patient = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='consultations',
        verbose_name='Patient'
    )
    doctor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='consultations_performed',
        verbose_name='Médecin'
    )
    examination_room = models.ForeignKey(
        'ExaminationRoom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Salle d\'examen'
    )
    
    # Timing
    start_time = models.DateTimeField(verbose_name='Début')
    end_time = models.DateTimeField(null=True, blank=True, verbose_name='Fin')
    
    # Anamnèse (Interrogatoire)
    chief_complaint = models.TextField(verbose_name='Motif de consultation')
    history_of_present_illness = models.TextField(
        blank=True,
        verbose_name='Histoire de la maladie actuelle'
    )
    symptoms = models.TextField(blank=True, verbose_name='Symptômes')
    symptom_duration = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Durée des symptômes'
    )
    
    # Examen clinique
    general_examination = models.TextField(
        blank=True,
        verbose_name='Examen général'
    )
    external_examination = models.TextField(
        blank=True,
        verbose_name='Examen externe'
    )
    
    # Conclusion
    summary = models.TextField(blank=True, verbose_name='Résumé')
    recommendations = models.TextField(blank=True, verbose_name='Recommandations')
    follow_up_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Date de suivi'
    )
    
    # Statut
    status = models.CharField(
        max_length=20,
        choices=[
            ('in_progress', 'En cours'),
            ('completed', 'Terminée'),
            ('cancelled', 'Annulée'),
        ],
        default='in_progress',
        verbose_name='Statut'
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Consultation'
        verbose_name_plural = 'Consultations'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['patient', '-start_time']),
            models.Index(fields=['doctor', '-start_time']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Consultation {self.patient.get_full_name()} - {self.start_time.date()}"
    
    @property
    def duration(self):
        """Durée de la consultation en minutes"""
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds() / 60
        return None
    
    def clean(self):
        # Validation : fin après début
        if self.end_time and self.end_time <= self.start_time:
            raise ValidationError("La fin doit être après le début")
        
        # Validation : patient = patient du RDV
        if self.appointment.patient != self.patient:
            raise ValidationError("Le patient doit correspondre au RDV")
```



### 9.2 Modèle `Pathology` et `PatientPathology`

**Rôle** : Gérer les pathologies de manière structurée.

```python
class Pathology(models.Model):
    """Base de données des pathologies ophtalmologiques"""
    
    code_cim10 = models.CharField(
        max_length=10,
        unique=True,
        verbose_name='Code CIM-10'
    )
    name = models.CharField(max_length=200, verbose_name='Nom')
    category = models.CharField(
        max_length=50,
        choices=[
            ('refractive', 'Troubles réfractifs'),
            ('anterior_segment', 'Segment antérieur'),
            ('posterior_segment', 'Segment postérieur'),
            ('glaucoma', 'Glaucome'),
            ('cataract', 'Cataracte'),
            ('retina', 'Rétine'),
            ('cornea', 'Cornée'),
            ('optic_nerve', 'Nerf optique'),
            ('other', 'Autre'),
        ],
        verbose_name='Catégorie'
    )
    description = models.TextField(blank=True, verbose_name='Description')
    is_chronic = models.BooleanField(default=False, verbose_name='Chronique')
    
    class Meta:
        verbose_name = 'Pathologie'
        verbose_name_plural = 'Pathologies'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.code_cim10} - {self.name}"


class PatientPathology(models.Model):
    """Pathologies d'un patient"""
    
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='pathologies',
        verbose_name='Patient'
    )
    pathology = models.ForeignKey(
        Pathology,
        on_delete=models.PROTECT,
        verbose_name='Pathologie'
    )
    
    # Détails
    eye = models.CharField(
        max_length=10,
        choices=[
            ('OD', 'Œil droit'),
            ('OG', 'Œil gauche'),
            ('Both', 'Les deux yeux'),
        ],
        verbose_name='Œil concerné'
    )
    severity = models.CharField(
        max_length=20,
        choices=[
            ('mild', 'Léger'),
            ('moderate', 'Modéré'),
            ('severe', 'Sévère'),
        ],
        blank=True,
        verbose_name='Sévérité'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Actif'),
            ('stable', 'Stable'),
            ('improving', 'En amélioration'),
            ('worsening', 'En aggravation'),
            ('resolved', 'Résolu'),
            ('remission', 'En rémission'),
        ],
        default='active',
        verbose_name='Statut'
    )
    
    # Dates
    diagnosed_date = models.DateField(verbose_name='Date de diagnostic')
    resolved_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Date de résolution'
    )
    
    # Traçabilité
    diagnosed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='diagnosed_pathologies',
        verbose_name='Diagnostiqué par'
    )
    consultation = models.ForeignKey(
        'Consultation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Consultation de diagnostic'
    )
    
    # Notes
    notes = models.TextField(blank=True, verbose_name='Notes')
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Pathologie patient'
        verbose_name_plural = 'Pathologies patients'
        ordering = ['-diagnosed_date']
        unique_together = ['patient', 'pathology', 'eye']
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['pathology', 'status']),
        ]
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.pathology.name} ({self.eye})"
```



### 9.3 Modèle `Examination` (Polymorphique)

**Rôle** : Classe de base pour tous les examens ophtalmologiques.

```python
class Examination(models.Model):
    """Classe de base pour tous les examens"""
    
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='examinations',
        verbose_name='Consultation'
    )
    exam_type = models.CharField(
        max_length=50,
        choices=[
            ('refraction', 'Réfraction'),
            ('iop', 'Pression intraoculaire'),
            ('fundus', 'Fond d\'œil'),
            ('oct', 'OCT'),
            ('visual_field', 'Champ visuel'),
            ('topography', 'Topographie cornéenne'),
            ('biometry', 'Biométrie'),
            ('angiography', 'Angiographie'),
            ('other', 'Autre'),
        ],
        verbose_name='Type d\'examen'
    )
    date = models.DateTimeField(auto_now_add=True, verbose_name='Date')
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Réalisé par'
    )
    notes = models.TextField(blank=True, verbose_name='Notes')
    
    class Meta:
        verbose_name = 'Examen'
        verbose_name_plural = 'Examens'
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.get_exam_type_display()} - {self.date.date()}"


class RefractionExam(models.Model):
    """Examen de réfraction"""
    
    examination = models.OneToOneField(
        Examination,
        on_delete=models.CASCADE,
        related_name='refraction_data'
    )
    eye = models.CharField(
        max_length=2,
        choices=[('OD', 'Œil droit'), ('OG', 'Œil gauche')],
        verbose_name='Œil'
    )
    
    # Réfraction
    sphere = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        verbose_name='Sphère (dioptries)'
    )
    cylinder = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
        verbose_name='Cylindre (dioptries)'
    )
    axis = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='Axe (degrés)'
    )
    addition = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Addition (presbytie)'
    )
    
    # Acuité visuelle
    visual_acuity_uncorrected = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Acuité sans correction'
    )
    visual_acuity_corrected = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Acuité avec correction'
    )
    
    class Meta:
        verbose_name = 'Examen de réfraction'
        verbose_name_plural = 'Examens de réfraction'
    
    def __str__(self):
        return f"Réfraction {self.eye} - Sphère {self.sphere}"


class IntraocularPressureExam(models.Model):
    """Examen de pression intraoculaire"""
    
    examination = models.OneToOneField(
        Examination,
        on_delete=models.CASCADE,
        related_name='iop_data'
    )
    eye = models.CharField(
        max_length=2,
        choices=[('OD', 'Œil droit'), ('OG', 'Œil gauche')],
        verbose_name='Œil'
    )
    pressure = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        verbose_name='Pression (mmHg)'
    )
    method = models.CharField(
        max_length=50,
        choices=[
            ('goldman', 'Goldman'),
            ('air_puff', 'Air pulsé'),
            ('icare', 'iCare'),
            ('tonopen', 'Tonopen'),
        ],
        verbose_name='Méthode'
    )
    time_of_day = models.TimeField(
        null=True,
        blank=True,
        verbose_name='Heure de mesure'
    )
    pachymetry = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='Pachymétrie (µm)'
    )
    
    class Meta:
        verbose_name = 'Examen de pression intraoculaire'
        verbose_name_plural = 'Examens de pression intraoculaire'
    
    def __str__(self):
        return f"PIO {self.eye} - {self.pressure} mmHg"
```



### 9.4 Modèle `Prescription`

**Rôle** : Gérer les prescriptions médicamenteuses et optiques.

```python
class Medication(models.Model):
    """Base de données des médicaments"""
    
    name = models.CharField(max_length=200, verbose_name='Nom commercial')
    active_substance = models.CharField(
        max_length=200,
        verbose_name='Substance active'
    )
    form = models.CharField(
        max_length=50,
        choices=[
            ('eye_drops', 'Collyre'),
            ('ointment', 'Pommade ophtalmique'),
            ('tablet', 'Comprimé'),
            ('capsule', 'Gélule'),
            ('injection', 'Injectable'),
        ],
        verbose_name='Forme'
    )
    dosage = models.CharField(max_length=50, verbose_name='Dosage')
    manufacturer = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Fabricant'
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Prix (FCFA)'
    )
    requires_prescription = models.BooleanField(
        default=True,
        verbose_name='Nécessite ordonnance'
    )
    
    class Meta:
        verbose_name = 'Médicament'
        verbose_name_plural = 'Médicaments'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} {self.dosage}"


class Prescription(models.Model):
    """Ordonnance médicale"""
    
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='prescriptions',
        verbose_name='Consultation'
    )
    patient = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='prescriptions',
        verbose_name='Patient'
    )
    doctor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='prescriptions_written',
        verbose_name='Médecin prescripteur'
    )
    
    date = models.DateTimeField(auto_now_add=True, verbose_name='Date')
    valid_until = models.DateField(verbose_name='Valide jusqu\'au')
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('expired', 'Expirée'),
            ('renewed', 'Renouvelée'),
            ('cancelled', 'Annulée'),
        ],
        default='active',
        verbose_name='Statut'
    )
    
    notes = models.TextField(blank=True, verbose_name='Notes')
    
    class Meta:
        verbose_name = 'Prescription'
        verbose_name_plural = 'Prescriptions'
        ordering = ['-date']
    
    def __str__(self):
        return f"Prescription {self.patient.get_full_name()} - {self.date.date()}"


class PrescriptionItem(models.Model):
    """Ligne de prescription (médicament)"""
    
    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Prescription'
    )
    medication = models.ForeignKey(
        Medication,
        on_delete=models.PROTECT,
        verbose_name='Médicament'
    )
    
    dosage = models.CharField(
        max_length=100,
        verbose_name='Posologie',
        help_text='Ex: 1 goutte'
    )
    frequency = models.CharField(
        max_length=100,
        verbose_name='Fréquence',
        help_text='Ex: 2 fois par jour'
    )
    duration = models.CharField(
        max_length=100,
        verbose_name='Durée',
        help_text='Ex: 30 jours'
    )
    eye = models.CharField(
        max_length=10,
        choices=[
            ('OD', 'Œil droit'),
            ('OG', 'Œil gauche'),
            ('Both', 'Les deux yeux'),
            ('N/A', 'Non applicable'),
        ],
        default='Both',
        verbose_name='Œil concerné'
    )
    instructions = models.TextField(
        blank=True,
        verbose_name='Instructions',
        help_text='Ex: Matin et soir, après les repas'
    )
    quantity = models.IntegerField(
        default=1,
        verbose_name='Quantité',
        help_text='Nombre de flacons/boîtes'
    )
    
    class Meta:
        verbose_name = 'Ligne de prescription'
        verbose_name_plural = 'Lignes de prescription'
    
    def __str__(self):
        return f"{self.medication.name} - {self.dosage} {self.frequency}"
```



### 9.5 Modèle `GlassesPrescription`

**Rôle** : Gérer les prescriptions de lunettes.

```python
class GlassesPrescription(models.Model):
    """Prescription de lunettes"""
    
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='glasses_prescriptions',
        verbose_name='Consultation'
    )
    patient = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='glasses_prescriptions',
        verbose_name='Patient'
    )
    doctor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Médecin prescripteur'
    )
    
    date = models.DateTimeField(auto_now_add=True, verbose_name='Date')
    valid_until = models.DateField(verbose_name='Valide jusqu\'au')
    
    # Œil droit
    od_sphere = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        verbose_name='OD Sphère'
    )
    od_cylinder = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
        verbose_name='OD Cylindre'
    )
    od_axis = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='OD Axe'
    )
    od_addition = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='OD Addition'
    )
    od_prism = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='OD Prisme'
    )
    
    # Œil gauche
    og_sphere = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        verbose_name='OG Sphère'
    )
    og_cylinder = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
        verbose_name='OG Cylindre'
    )
    og_axis = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='OG Axe'
    )
    og_addition = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='OG Addition'
    )
    og_prism = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='OG Prisme'
    )
    
    # Autres paramètres
    interpupillary_distance = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        verbose_name='Distance interpupillaire (mm)'
    )
    lens_type = models.CharField(
        max_length=50,
        choices=[
            ('single_vision', 'Unifocal'),
            ('bifocal', 'Bifocal'),
            ('progressive', 'Progressif'),
        ],
        verbose_name='Type de verre'
    )
    lens_material = models.CharField(
        max_length=50,
        choices=[
            ('organic', 'Organique'),
            ('mineral', 'Minéral'),
            ('polycarbonate', 'Polycarbonate'),
        ],
        blank=True,
        verbose_name='Matériau'
    )
    coating = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Traitements',
        help_text='Ex: Anti-reflet, Anti-rayures, Photochromique'
    )
    
    notes = models.TextField(blank=True, verbose_name='Notes')
    
    # Statut
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('expired', 'Expirée'),
            ('fulfilled', 'Réalisée'),
        ],
        default='active',
        verbose_name='Statut'
    )
    
    class Meta:
        verbose_name = 'Prescription de lunettes'
        verbose_name_plural = 'Prescriptions de lunettes'
        ordering = ['-date']
    
    def __str__(self):
        return f"Lunettes {self.patient.get_full_name()} - {self.date.date()}"
```



### 9.6 Modèle `Invoice` (Facturation)

**Rôle** : Lier les actes médicaux à la facturation.

```python
class MedicalAct(models.Model):
    """Nomenclature des actes médicaux"""
    
    code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Code'
    )
    name = models.CharField(max_length=200, verbose_name='Nom')
    category = models.CharField(
        max_length=50,
        choices=[
            ('consultation', 'Consultation'),
            ('examination', 'Examen'),
            ('surgery', 'Chirurgie'),
            ('procedure', 'Acte technique'),
            ('other', 'Autre'),
        ],
        verbose_name='Catégorie'
    )
    description = models.TextField(blank=True, verbose_name='Description')
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Prix (FCFA)'
    )
    duration = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='Durée estimée (minutes)'
    )
    
    class Meta:
        verbose_name = 'Acte médical'
        verbose_name_plural = 'Actes médicaux'
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class ConsultationAct(models.Model):
    """Actes réalisés pendant une consultation"""
    
    consultation = models.ForeignKey(
        Consultation,
        on_delete=models.CASCADE,
        related_name='acts',
        verbose_name='Consultation'
    )
    medical_act = models.ForeignKey(
        MedicalAct,
        on_delete=models.PROTECT,
        verbose_name='Acte médical'
    )
    quantity = models.IntegerField(default=1, verbose_name='Quantité')
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Prix unitaire (FCFA)'
    )
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Réalisé par'
    )
    notes = models.TextField(blank=True, verbose_name='Notes')
    
    class Meta:
        verbose_name = 'Acte de consultation'
        verbose_name_plural = 'Actes de consultation'
    
    def __str__(self):
        return f"{self.medical_act.name} x{self.quantity}"
    
    @property
    def total_price(self):
        return self.price * self.quantity


class Invoice(models.Model):
    """Facture"""
    
    consultation = models.OneToOneField(
        Consultation,
        on_delete=models.PROTECT,
        related_name='invoice',
        verbose_name='Consultation'
    )
    patient = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='invoices',
        verbose_name='Patient'
    )
    
    invoice_number = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Numéro de facture'
    )
    date = models.DateTimeField(auto_now_add=True, verbose_name='Date')
    due_date = models.DateField(verbose_name='Date d\'échéance')
    
    # Montants
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Sous-total (FCFA)'
    )
    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='Remise (FCFA)'
    )
    tax = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='Taxe (FCFA)'
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Montant total (FCFA)'
    )
    paid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='Montant payé (FCFA)'
    )
    
    # Statut
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Brouillon'),
            ('issued', 'Émise'),
            ('partial', 'Partiellement payée'),
            ('paid', 'Payée'),
            ('cancelled', 'Annulée'),
        ],
        default='draft',
        verbose_name='Statut'
    )
    
    notes = models.TextField(blank=True, verbose_name='Notes')
    
    class Meta:
        verbose_name = 'Facture'
        verbose_name_plural = 'Factures'
        ordering = ['-date']
    
    def __str__(self):
        return f"Facture {self.invoice_number} - {self.patient.get_full_name()}"
    
    @property
    def balance(self):
        """Solde restant à payer"""
        return self.total_amount - self.paid_amount
    
    def generate_from_consultation(self):
        """Génère la facture depuis les actes de consultation"""
        acts = self.consultation.acts.all()
        self.subtotal = sum(act.total_price for act in acts)
        self.total_amount = self.subtotal - self.discount + self.tax
        self.save()


class Payment(models.Model):
    """Paiement"""
    
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.PROTECT,
        related_name='payments',
        verbose_name='Facture'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Montant (FCFA)'
    )
    date = models.DateTimeField(auto_now_add=True, verbose_name='Date')
    payment_method = models.CharField(
        max_length=50,
        choices=[
            ('cash', 'Espèces'),
            ('card', 'Carte bancaire'),
            ('mobile_money', 'Mobile Money'),
            ('check', 'Chèque'),
            ('transfer', 'Virement'),
        ],
        verbose_name='Mode de paiement'
    )
    reference = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Référence'
    )
    received_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Reçu par'
    )
    notes = models.TextField(blank=True, verbose_name='Notes')
    
    class Meta:
        verbose_name = 'Paiement'
        verbose_name_plural = 'Paiements'
        ordering = ['-date']
    
    def __str__(self):
        return f"Paiement {self.amount} FCFA - {self.date.date()}"
```



---

## 10. CONCLUSION ET PRIORISATION

### 10.1 Synthèse de l'Analyse

**État actuel** : Le système VIDA est **incomplet** pour une gestion complète de clinique ophtalmologique.

**Points critiques** :
1. ❌ **Workflow médical incomplet** : Pas de gestion des consultations
2. ❌ **Données non structurées** : Impossible de faire des statistiques
3. ❌ **Pas de prescriptions** : Fonctionnalité essentielle manquante
4. ❌ **Examens insuffisants** : Seulement 2 examens basiques
5. ❌ **Facturation déconnectée** : Pas de lien avec les actes médicaux

**Impact** :
- Système utilisable pour la prise de RDV uniquement
- Médecins doivent utiliser un autre système pour les consultations
- Perte de données médicales critiques
- Pas de statistiques exploitables
- Facturation manuelle chronophage

### 10.2 Priorisation des Développements

#### 🔴 PRIORITÉ ABSOLUE - PHASE 0 : Correction Logique Patient (1 semaine)

**⚠️ À IMPLÉMENTER AVANT TOUTE AUTRE FONCTIONNALITÉ**

**Objectif** : Corriger la logique d'enregistrement patient selon la vision métier correcte.

**Tâches Backend (Django)** :

1. **Modifier le modèle User** (1 jour)
   - [ ] Ajouter le rôle `APPOINTMENT_REQUESTER` dans `Role.choices`
   - [ ] Ajouter le champ `access_code` (CharField, unique, max_length=20)
   - [ ] Ajouter le champ `can_request_appointment` (BooleanField, default=True)
   - [ ] Ajouter le champ `first_consultation_date` (DateField, null=True)
   - [ ] Créer la méthode `generate_access_code()`
   - [ ] Créer la méthode `promote_to_patient()`
   - [ ] Modifier `@property is_patient` pour vérifier `role == 'patient'`
   - [ ] Ajouter `@property is_appointment_requester`
   - [ ] Créer la migration

2. **Créer les signals automatiques** (1 jour)
   - [ ] Signal `create_patient_on_first_consultation` : Transforme demandeur → patient lors de la 1ère consultation
   - [ ] Signal `block_multiple_appointments` : Bloque `can_request_appointment` si demande en attente
   - [ ] Signal `unblock_appointments_on_response` : Débloque après réponse admin
   - [ ] Signal `generate_access_code_on_appointment` : Génère code d'accès automatiquement

3. **Créer l'endpoint de vérification** (1 jour)
   - [ ] Créer `POST /auth/verify-appointment/`
   - [ ] Paramètres : `first_name`, `last_name`, `access_code`
   - [ ] Validation : Vérifier que les 3 champs correspondent
   - [ ] Retour : Token JWT + informations RDV
   - [ ] Créer le serializer `VerifyAppointmentSerializer`

4. **Modifier l'endpoint de création RDV** (0.5 jour)
   - [ ] Générer automatiquement le code d'accès
   - [ ] Créer le compte avec `role='appointment_requester'`
   - [ ] Envoyer l'email avec le code d'accès
   - [ ] Bloquer `can_request_appointment = False`

5. **Modifier l'endpoint de liste patients** (0.5 jour)
   - [ ] Filtrer uniquement `role='patient'`
   - [ ] Exclure les `appointment_requester`
   - [ ] Ajouter un endpoint séparé pour les demandeurs : `GET /auth/appointment-requesters/`

6. **Créer l'email avec code d'accès** (0.5 jour)
   - [ ] Template HTML : `appointment_request_confirmation.html`
   - [ ] Contenu : Code d'accès en gros, instructions pour vérifier
   - [ ] Tâche Celery : `send_appointment_request_email`

**Tâches Frontend (React/Next.js)** :

7. **Supprimer l'inscription publique** (0.5 jour)
   - [ ] Supprimer le bouton "S'inscrire" du header
   - [ ] Supprimer la page `/signup`
   - [ ] Supprimer le formulaire d'inscription

8. **Créer le bouton "Vérifier ma demande"** (0.5 jour)
   - [ ] Ajouter dans le dropdown "Mon Compte"
   - [ ] Remplacer "S'inscrire" par "Vérifier ma demande"
   - [ ] Ouvrir le modal de vérification

9. **Créer le modal de vérification** (1 jour)
   - [ ] Créer `components/VerifyAppointmentModal.tsx`
   - [ ] Formulaire : Prénom, Nom, Code d'accès
   - [ ] Validation Zod
   - [ ] Appel API `POST /auth/verify-appointment/`
   - [ ] Gestion des erreurs (code incorrect, etc.)
   - [ ] Redirection vers page état RDV après succès

10. **Créer la page état RDV** (1 jour)
    - [ ] Créer `app/my-appointment/page.tsx`
    - [ ] Afficher : Statut, Date/Heure, Motif, Type
    - [ ] Afficher les propositions de l'admin
    - [ ] Boutons : Accepter proposition, Refuser, Annuler
    - [ ] Timeline des modifications
    - [ ] Design cohérent avec le reste du site

11. **Modifier le formulaire de RDV** (0.5 jour)
    - [ ] Vérifier `can_request_appointment` avant d'afficher le formulaire
    - [ ] Si `false` : Afficher message "Vous avez déjà une demande en attente"
    - [ ] Après soumission : Afficher le code d'accès généré
    - [ ] Message : "Notez bien votre code d'accès : VIDA-2026-XXXXXX"

12. **Modifier la page Patients (Admin)** (0.5 jour)
    - [ ] Supprimer le bouton "Créer un patient"
    - [ ] Filtrer uniquement `role='patient'`
    - [ ] Ajouter un onglet "Demandeurs de RDV" (optionnel)
    - [ ] Message : "Les patients sont créés automatiquement lors de leur première consultation"

**Tests** :

13. **Tests Backend** (0.5 jour)
    - [ ] Test : Création compte avec `role='appointment_requester'`
    - [ ] Test : Génération code d'accès unique
    - [ ] Test : Blocage demandes multiples
    - [ ] Test : Déblocage après réponse admin
    - [ ] Test : Promotion demandeur → patient lors consultation
    - [ ] Test : Vérification avec code d'accès

14. **Tests Frontend** (0.5 jour)
    - [ ] Test : Modal de vérification
    - [ ] Test : Affichage page état RDV
    - [ ] Test : Blocage formulaire RDV si demande en attente
    - [ ] Test : Suppression inscription publique

**Documentation** :

15. **Mise à jour documentation** (0.5 jour)
    - [ ] Documenter le nouveau workflow
    - [ ] Documenter l'API de vérification
    - [ ] Mettre à jour les diagrammes
    - [ ] Créer un guide utilisateur "Comment vérifier ma demande"

**Estimation totale** : 5 jours (1 semaine)

**Critères de validation** :
- ✅ Impossible de s'inscrire directement comme patient
- ✅ Code d'accès généré automatiquement à chaque demande RDV
- ✅ Une seule demande RDV à la fois
- ✅ Modal de vérification fonctionnel
- ✅ Page état RDV accessible avec code d'accès
- ✅ Compte patient créé automatiquement lors de la 1ère consultation
- ✅ Page Patients n'affiche que les vrais patients
- ✅ 0 erreur TypeScript
- ✅ Tous les tests passent

---

#### 🔴 PRIORITÉ CRITIQUE (Phase 3A - 4 semaines)

**⚠️ À IMPLÉMENTER APRÈS LA PHASE 0**

**Objectif** : Rendre le système utilisable pour le workflow médical complet.

1. **Consultations** (1 semaine)
   - Modèle `Consultation`
   - Lien avec `Appointment`
   - Formulaire de consultation
   - Anamnèse et examen clinique

2. **Examens de base** (1 semaine)
   - Modèle `Examination`
   - `RefractionExam`
   - `IntraocularPressureExam`
   - Formulaires d'examen
   - Historique des examens

3. **Pathologies** (1 semaine)
   - Modèle `Pathology`
   - Modèle `PatientPathology`
   - Base de données pathologies CIM-10
   - Gestion des diagnostics

4. **Prescriptions médicamenteuses** (1 semaine)
   - Modèle `Medication`
   - Modèle `Prescription` et `PrescriptionItem`
   - Formulaire de prescription
   - Génération ordonnance PDF

**Résultat attendu** : Workflow médical complet fonctionnel.



#### 🟡 PRIORITÉ HAUTE (Phase 3B - 3 semaines)

**Objectif** : Compléter les fonctionnalités essentielles.

5. **Facturation automatique** (1 semaine)
   - Modèle `MedicalAct`
   - Modèle `ConsultationAct`
   - Modèle `Invoice` et `Payment`
   - Génération automatique depuis consultation
   - Gestion des paiements

6. **Prescriptions optiques** (1 semaine)
   - Modèle `GlassesPrescription`
   - Formulaire de prescription lunettes
   - Génération ordonnance PDF
   - Historique des corrections

7. **Examens avancés** (1 semaine)
   - `OCTExam`
   - `VisualFieldExam`
   - `FundusExam`
   - Upload d'images/fichiers
   - Comparaison dans le temps

**Résultat attendu** : Système complet pour gestion quotidienne.

#### 🟢 PRIORITÉ MOYENNE (Phase 3C - 2 semaines)

**Objectif** : Optimiser l'expérience utilisateur.

8. **Planning médecin** (1 semaine)
   - Modèle `Doctor`
   - Modèle `DoctorSchedule` et `DoctorAbsence`
   - Calendrier médecin
   - Assignation automatique RDV

9. **Gestion du stock** (1 semaine)
   - Lien stock ↔ prescriptions
   - Déduction automatique
   - Alertes rupture de stock

**Résultat attendu** : Système optimisé et automatisé.

#### 🔵 PRIORITÉ BASSE (Phase 4 - 2 semaines)

**Objectif** : Fonctionnalités avancées.

10. **Suivi de traitement**
    - Modèle `TreatmentPlan`
    - Modèle `TreatmentFollowUp`
    - Alertes RDV de contrôle

11. **Urgences**
    - Modèle `EmergencyConsultation`
    - Triage
    - File d'attente prioritaire

12. **Statistiques avancées**
    - Rapports épidémiologiques
    - Analyse de cohorte
    - Tableaux de bord personnalisés

**Résultat attendu** : Système complet et professionnel.



### 10.3 Estimation Globale

**Temps de développement total** : 12 semaines (3 mois)

**Répartition** :
- **Phase 0 (Correction logique patient)** : 1 semaine ⚠️ OBLIGATOIRE EN PREMIER
- Phase 3A (Critique) : 4 semaines
- Phase 3B (Haute) : 3 semaines
- Phase 3C (Moyenne) : 2 semaines
- Phase 4 (Basse) : 2 semaines

**Ressources nécessaires** :
- 1 développeur backend (Django)
- 1 développeur frontend (React/Next.js)
- 1 expert médical (validation workflow)
- 1 testeur

**Budget estimé** :
- Développement : 12 semaines × 2 développeurs = 24 semaines-homme
- Tests : 2 semaines
- Documentation : 1 semaine
- **Total : 27 semaines-homme**

### 10.4 Recommandations Finales

#### Pour l'équipe de développement :

1. **⚠️ PHASE 0 EN PREMIER - NON NÉGOCIABLE** : Corriger la logique d'enregistrement patient AVANT toute autre fonctionnalité. C'est la base du système.

2. **Ne pas continuer sans ces fonctionnalités** : Le système actuel est incomplet et ne peut pas être utilisé en production pour une vraie clinique.

3. **Prioriser la Phase 3A après Phase 0** : C'est le minimum vital pour avoir un système utilisable.

4. **Structurer les données** : Arrêter d'utiliser des TextField pour les données médicales. Tout doit être structuré.

5. **Penser workflow complet** : Chaque fonctionnalité doit s'intégrer dans le workflow médical global.

6. **Historiser systématiquement** : Toutes les données médicales doivent être historisées avec date et auteur.

7. **Respecter les règles métier** :
   - ✅ Patient = A consulté (pas avant)
   - ✅ Une seule demande RDV à la fois
   - ✅ Code d'accès pour vérifier sa demande
   - ✅ Pas de création manuelle de patient
   - ✅ Création automatique lors de la consultation

#### Pour la clinique :

1. **Valider le workflow** : Faire valider le workflow proposé par les médecins utilisateurs.

2. **Former les utilisateurs** : Prévoir une formation complète sur le nouveau système.

3. **Migration progressive** : Ne pas basculer brutalement, faire une période de transition.

4. **Feedback continu** : Recueillir les retours des utilisateurs et ajuster.

5. **Communiquer le changement** : Expliquer aux patients le nouveau système de vérification avec code d'accès.

### 10.5 Risques Identifiés

**Risques techniques** :
- Complexité de la migration des données existantes
- Performance avec volumétrie importante
- Intégration avec équipements médicaux (OCT, champ visuel)

**Risques métier** :
- Résistance au changement des utilisateurs
- Courbe d'apprentissage
- Temps de saisie plus long au début

**Risques projet** :
- Délais de développement
- Budget
- Disponibilité des ressources

**Mitigation** :
- Tests approfondis avant déploiement
- Formation complète des utilisateurs
- Support technique dédié
- Migration progressive
- Feedback continu

---

## 📊 ANNEXES

### A. Glossaire Ophtalmologique

- **Acuité visuelle** : Capacité à distinguer les détails fins
- **CIM-10** : Classification Internationale des Maladies (10e révision)
- **DMLA** : Dégénérescence Maculaire Liée à l'Âge
- **Fond d'œil** : Examen de la rétine et du nerf optique
- **Glaucome** : Maladie du nerf optique souvent liée à une pression intraoculaire élevée
- **OCT** : Tomographie par Cohérence Optique (imagerie rétinienne)
- **Réfraction** : Mesure de la correction optique nécessaire
- **RNFL** : Retinal Nerve Fiber Layer (couche de fibres nerveuses rétiniennes)

### B. Codes CIM-10 Fréquents en Ophtalmologie

- **H40** : Glaucome
  - H40.1 : Glaucome primitif à angle ouvert
  - H40.2 : Glaucome primitif à angle fermé
- **H25** : Cataracte sénile
- **H35.3** : Dégénérescence maculaire
- **H52** : Troubles de la réfraction
  - H52.0 : Hypermétropie
  - H52.1 : Myopie
  - H52.2 : Astigmatisme
  - H52.4 : Presbytie
- **H10** : Conjonctivite
- **H16** : Kératite

### C. Nomenclature des Actes (Exemples)

| Code | Acte | Prix (FCFA) |
|------|------|-------------|
| CONS-01 | Consultation générale | 15 000 |
| CONS-02 | Consultation spécialisée | 25 000 |
| EXAM-01 | Réfraction | 5 000 |
| EXAM-02 | Fond d'œil | 10 000 |
| EXAM-03 | OCT maculaire | 25 000 |
| EXAM-04 | Champ visuel | 20 000 |
| EXAM-05 | Topographie cornéenne | 15 000 |
| CHIR-01 | Chirurgie cataracte | 250 000 |
| CHIR-02 | Laser YAG | 50 000 |

---

**Document créé le** : 1 février 2026  
**Auteur** : Expert en informatique de gestion médicale & ophtalmologie  
**Version** : 2.0 (Mise à jour avec correction logique patient)  
**Statut** : Analyse complète terminée et validée

**Prochaine étape** : Démarrage OBLIGATOIRE Phase 0 (Correction logique patient) avant toute autre fonctionnalité

---

## 📌 RÈGLES À RESPECTER OBLIGATOIREMENT PAR L'AGENT IA

### 🔴 RÈGLES CRITIQUES - NON NÉGOCIABLES

1. **PHASE 0 EN PREMIER** : Implémenter la correction de la logique patient AVANT toute autre fonctionnalité. Aucune exception.

2. **PAS DE PATIENT SANS CONSULTATION** : Un utilisateur ne devient patient qu'après sa première consultation. Jamais avant.

3. **CODE D'ACCÈS OBLIGATOIRE** : Chaque demande de RDV génère automatiquement un code d'accès unique.

4. **UNE SEULE DEMANDE À LA FOIS** : Un utilisateur ne peut faire qu'une seule demande de RDV jusqu'à réponse de l'admin.

5. **PAS D'INSCRIPTION PUBLIQUE** : Supprimer complètement la possibilité de s'inscrire directement comme patient.

6. **CRÉATION AUTOMATIQUE** : Le compte patient se crée automatiquement lors de la première consultation via signal Django.

7. **PAGE PATIENTS = LECTURE SEULE** : Impossible de créer manuellement un patient depuis la page Patients admin.

### 🟡 RÈGLES IMPORTANTES

8. **WORKFLOW COMPLET** : Toujours penser au workflow complet : RDV → Consultation → Examen → Diagnostic → Prescription → Suivi.

9. **DONNÉES STRUCTURÉES** : Ne jamais utiliser TextField pour des données médicales. Toujours créer des modèles dédiés.

10. **HISTORISATION** : Toutes les données médicales doivent être historisées avec date, auteur, et lien vers la consultation.

11. **INTÉGRITÉ RÉFÉRENTIELLE** : Utiliser les bonnes contraintes (PROTECT, CASCADE, SET_NULL) selon le contexte.

12. **VALIDATION MÉTIER** : Valider les données au niveau du modèle avec `clean()`, pas seulement au niveau du formulaire.

13. **SIGNALS AUTOMATIQUES** : Utiliser les signals Django pour automatiser les actions (création patient, déduction stock, etc.).

### 🟢 RÈGLES DE QUALITÉ

14. **TESTS OBLIGATOIRES** : Chaque fonctionnalité doit avoir des tests unitaires et d'intégration.

15. **DOCUMENTATION** : Documenter chaque nouveau modèle, endpoint, et workflow.

16. **0 ERREUR TYPESCRIPT** : Le code frontend doit compiler sans erreur.

17. **COHÉRENCE UI/UX** : Respecter le design system VIDA (couleurs, animations, glassmorphism).

18. **PERFORMANCE** : Optimiser les requêtes SQL (select_related, prefetch_related, indexes).

19. **SÉCURITÉ** : Valider toutes les entrées, utiliser les permissions Django, protéger les endpoints.

20. **ACCESSIBILITÉ** : Labels ARIA, contraste, navigation clavier.

### 📋 CHECKLIST DE VALIDATION AVANT CHAQUE COMMIT

- [ ] La Phase 0 est-elle terminée ? (Si non, ne rien faire d'autre)
- [ ] Le code respecte-t-il la logique "Patient = A consulté" ?
- [ ] Les données médicales sont-elles structurées (pas de TextField) ?
- [ ] Y a-t-il un lien avec la consultation ?
- [ ] Les données sont-elles historisées ?
- [ ] Les tests passent-ils tous ?
- [ ] La documentation est-elle à jour ?
- [ ] 0 erreur TypeScript ?
- [ ] Les migrations sont-elles créées ?
- [ ] Les signals sont-ils en place ?

### ⚠️ INTERDICTIONS ABSOLUES

- ❌ **INTERDIT** : Créer un patient sans consultation
- ❌ **INTERDIT** : Permettre l'inscription publique comme patient
- ❌ **INTERDIT** : Permettre plusieurs demandes RDV simultanées
- ❌ **INTERDIT** : Utiliser TextField pour des données médicales structurées
- ❌ **INTERDIT** : Créer manuellement un patient depuis la page Patients
- ❌ **INTERDIT** : Commencer une autre phase avant la Phase 0
- ❌ **INTERDIT** : Supprimer les données médicales (toujours archiver)
- ❌ **INTERDIT** : Modifier les données sans traçabilité (auteur, date)

### ✅ ORDRE D'EXÉCUTION OBLIGATOIRE

```
1. PHASE 0 : Correction logique patient (1 semaine)
   ↓
2. Validation Phase 0 (tests + review)
   ↓
3. PHASE 3A : Consultations + Examens + Pathologies + Prescriptions (4 semaines)
   ↓
4. Validation Phase 3A
   ↓
5. PHASE 3B : Facturation + Prescriptions optiques + Examens avancés (3 semaines)
   ↓
6. Validation Phase 3B
   ↓
7. PHASE 3C : Planning médecin + Stock (2 semaines)
   ↓
8. Validation Phase 3C
   ↓
9. PHASE 4 : Suivi + Urgences + Statistiques (2 semaines)
   ↓
10. Validation finale + Déploiement
```

### 🎯 CRITÈRES DE SUCCÈS PHASE 0

La Phase 0 est considérée comme réussie si et seulement si :

1. ✅ Le rôle `APPOINTMENT_REQUESTER` existe et fonctionne
2. ✅ Le champ `access_code` est créé et unique
3. ✅ Le champ `can_request_appointment` bloque correctement
4. ✅ Le signal `create_patient_on_first_consultation` fonctionne
5. ✅ Le signal `block_multiple_appointments` fonctionne
6. ✅ Le signal `unblock_appointments_on_response` fonctionne
7. ✅ L'endpoint `POST /auth/verify-appointment/` fonctionne
8. ✅ Le modal de vérification est fonctionnel
9. ✅ La page état RDV est accessible avec code d'accès
10. ✅ Le bouton "S'inscrire" est supprimé
11. ✅ Le bouton "Vérifier ma demande" est présent
12. ✅ La page Patients n'affiche que les vrais patients
13. ✅ Impossible de créer manuellement un patient
14. ✅ Un compte patient se crée automatiquement lors de la 1ère consultation
15. ✅ Tous les tests passent (backend + frontend)
16. ✅ 0 erreur TypeScript
17. ✅ La documentation est à jour
18. ✅ Les migrations sont appliquées sans erreur

**Si un seul critère n'est pas rempli, la Phase 0 n'est PAS validée.**

---

## 🚀 PRÊT POUR LE DÉVELOPPEMENT

Ce document constitue la base complète pour le développement de la Phase 0 et des phases suivantes. Toutes les spécifications, modèles, et règles sont clairement définis.

**L'agent IA doit suivre ce document à la lettre, sans exception, en commençant OBLIGATOIREMENT par la Phase 0.**

