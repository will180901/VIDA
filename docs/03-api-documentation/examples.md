# 💡 Exemples d'utilisation de l'API - VIDA

Exemples pratiques d'utilisation de l'API avec différents langages et outils.

---

## 📋 Table des matières

1. [Scénario complet : Prise de rendez-vous](#-scénario-complet--prise-de-rendez-vous)
2. [Exemples JavaScript/TypeScript](#-exemples-javascripttypescript)
3. [Exemples Python](#-exemples-python)
4. [Exemples cURL](#-exemples-curl)
5. [Collection Postman](#-collection-postman)

---

## 🎯 Scénario complet : Prise de rendez-vous

### Étape 1 : Récupérer les créneaux disponibles

```bash
GET /api/v1/appointments/slots/?date=2026-02-01
```

**Réponse :**
```json
{
  "date": "2026-02-01",
  "slots": ["08:30", "09:00", "09:30", "10:00", "10:30", ...]
}
```

### Étape 2 : Verrouiller un créneau (10 min)

```bash
POST /api/v1/appointments/lock-slot/
{
  "date": "2026-02-01",
  "time": "10:00"
}
```

**Réponse :**
```json
{
  "message": "Créneau verrouillé",
  "expires_at": "2026-01-24T10:40:00Z"
}
```

### Étape 3 : Créer le rendez-vous

```bash
POST /api/v1/appointments/
{
  "patient_first_name": "Jean",
  "patient_last_name": "Dupont",
  "patient_email": "jean@example.com",
  "patient_phone": "06 123 45 67",
  "date": "2026-02-01",
  "time": "10:00",
  "consultation_type": "generale",
  "reason": "Contrôle de routine"
}
```

**Réponse :**
```json
{
  "id": 123,
  "status": "pending",
  "created_at": "2026-01-24T10:35:00Z"
}
```

✅ **Email de confirmation envoyé automatiquement**

---

## 💻 Exemples JavaScript/TypeScript

### Configuration Axios

```typescript
// lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Important pour les cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour refresh automatique
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await api.post('/auth/refresh/');
        return api.request(error.config);
      } catch {
        window.location.href = '/connexion';
      }
    }
    return Promise.reject(error);
  }
);
```

### Inscription

```typescript
interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone: string;
  captcha: string;
}

async function register(data: RegisterData) {
  try {
    const response = await api.post('/auth/register/', data);
    console.log('Inscription réussie:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erreur:', error.response?.data);
      throw error.response?.data;
    }
    throw error;
  }
}

// Utilisation
await register({
  email: 'patient@example.com',
  password: 'MotDePasse123!Secure',
  password_confirm: 'MotDePasse123!Secure',
  first_name: 'Jean',
  last_name: 'Dupont',
  phone: '06 123 45 67',
  captcha: hcaptchaToken
});
```

### Connexion

```typescript
async function login(email: string, password: string, captcha: string) {
  try {
    const response = await api.post('/auth/login/', {
      email,
      password,
      captcha
    });
    
    // Les cookies sont automatiquement stockés
    console.log('Connecté:', response.data.user);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Identifiants invalides');
      }
      if (error.response?.status === 429) {
        throw new Error('Trop de tentatives. Réessayez dans 15 minutes.');
      }
    }
    throw error;
  }
}
```

### Créer un rendez-vous

```typescript
interface AppointmentData {
  patient_first_name: string;
  patient_last_name: string;
  patient_email: string;
  patient_phone: string;
  date: string;
  time: string;
  consultation_type: 'generale' | 'specialisee';
  reason?: string;
}

async function createAppointment(data: AppointmentData) {
  try {
    const response = await api.post('/appointments/', data);
    console.log('Rendez-vous créé:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errors = error.response?.data;
      console.error('Erreurs de validation:', errors);
      throw errors;
    }
    throw error;
  }
}

// Utilisation
await createAppointment({
  patient_first_name: 'Jean',
  patient_last_name: 'Dupont',
  patient_email: 'jean@example.com',
  patient_phone: '06 123 45 67',
  date: '2026-02-01',
  time: '10:00',
  consultation_type: 'generale',
  reason: 'Contrôle de routine'
});
```

### Hook React avec TanStack Query

```typescript
// hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAvailableSlots(date: string) {
  return useQuery({
    queryKey: ['slots', date],
    queryFn: async () => {
      const response = await api.get(`/appointments/slots/?date=${date}`);
      return response.data;
    },
    enabled: !!date,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AppointmentData) => {
      const response = await api.post('/appointments/', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalider le cache des créneaux
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

// Utilisation dans un composant
function AppointmentForm() {
  const [selectedDate, setSelectedDate] = useState('2026-02-01');
  const { data: slots, isLoading } = useAvailableSlots(selectedDate);
  const createAppointment = useCreateAppointment();
  
  const handleSubmit = async (data: AppointmentData) => {
    try {
      await createAppointment.mutateAsync(data);
      toast.success('Rendez-vous créé !');
    } catch (error) {
      toast.error('Erreur lors de la création');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire */}
    </form>
  );
}
```

---

## 🐍 Exemples Python

### Configuration

```python
import requests
from typing import Dict, Any

class VidaAPI:
    def __init__(self, base_url: str = 'http://localhost:8000/api/v1'):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        return response.json()
    
    def get(self, endpoint: str, **kwargs) -> Dict[str, Any]:
        return self._request('GET', endpoint, **kwargs)
    
    def post(self, endpoint: str, **kwargs) -> Dict[str, Any]:
        return self._request('POST', endpoint, **kwargs)
    
    def patch(self, endpoint: str, **kwargs) -> Dict[str, Any]:
        return self._request('PATCH', endpoint, **kwargs)
    
    def delete(self, endpoint: str, **kwargs) -> Dict[str, Any]:
        return self._request('DELETE', endpoint, **kwargs)

# Initialisation
api = VidaAPI()
```

### Inscription

```python
def register(email: str, password: str, first_name: str, last_name: str, phone: str, captcha: str):
    try:
        response = api.post('/auth/register/', json={
            'email': email,
            'password': password,
            'password_confirm': password,
            'first_name': first_name,
            'last_name': last_name,
            'phone': phone,
            'captcha': captcha
        })
        print(f"Inscription réussie: {response['user']['email']}")
        return response
    except requests.HTTPError as e:
        print(f"Erreur: {e.response.json()}")
        raise

# Utilisation
register(
    email='patient@example.com',
    password='MotDePasse123!Secure',
    first_name='Jean',
    last_name='Dupont',
    phone='06 123 45 67',
    captcha='hcaptcha_token'
)
```

### Connexion

```python
def login(email: str, password: str, captcha: str):
    try:
        response = api.post('/auth/login/', json={
            'email': email,
            'password': password,
            'captcha': captcha
        })
        print(f"Connecté: {response['user']['email']}")
        return response
    except requests.HTTPError as e:
        if e.response.status_code == 401:
            print("Identifiants invalides")
        elif e.response.status_code == 429:
            print("Trop de tentatives. Réessayez dans 15 minutes.")
        raise

# Utilisation
login('patient@example.com', 'MotDePasse123!Secure', 'hcaptcha_token')
```

### Créer un rendez-vous

```python
def create_appointment(
    patient_first_name: str,
    patient_last_name: str,
    patient_email: str,
    patient_phone: str,
    date: str,
    time: str,
    consultation_type: str,
    reason: str = None
):
    try:
        response = api.post('/appointments/', json={
            'patient_first_name': patient_first_name,
            'patient_last_name': patient_last_name,
            'patient_email': patient_email,
            'patient_phone': patient_phone,
            'date': date,
            'time': time,
            'consultation_type': consultation_type,
            'reason': reason
        })
        print(f"Rendez-vous créé: ID {response['id']}")
        return response
    except requests.HTTPError as e:
        print(f"Erreur: {e.response.json()}")
        raise

# Utilisation
create_appointment(
    patient_first_name='Jean',
    patient_last_name='Dupont',
    patient_email='jean@example.com',
    patient_phone='06 123 45 67',
    date='2026-02-01',
    time='10:00',
    consultation_type='generale',
    reason='Contrôle de routine'
)
```

### Récupérer les créneaux disponibles

```python
def get_available_slots(date: str):
    try:
        response = api.get(f'/appointments/slots/?date={date}')
        print(f"Créneaux disponibles pour {date}:")
        for slot in response['slots']:
            print(f"  - {slot}")
        return response
    except requests.HTTPError as e:
        print(f"Erreur: {e.response.json()}")
        raise

# Utilisation
get_available_slots('2026-02-01')
```

---

## 🔧 Exemples cURL

### Inscription

```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "patient@example.com",
    "password": "MotDePasse123!Secure",
    "password_confirm": "MotDePasse123!Secure",
    "first_name": "Jean",
    "last_name": "Dupont",
    "phone": "06 123 45 67",
    "captcha": "hcaptcha_token"
  }'
```

### Connexion

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "patient@example.com",
    "password": "MotDePasse123!Secure",
    "captcha": "hcaptcha_token"
  }'
```

### Créer un rendez-vous (authentifié)

```bash
curl -X POST http://localhost:8000/api/v1/appointments/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "patient_first_name": "Jean",
    "patient_last_name": "Dupont",
    "patient_email": "jean@example.com",
    "patient_phone": "06 123 45 67",
    "date": "2026-02-01",
    "time": "10:00",
    "consultation_type": "generale",
    "reason": "Contrôle de routine"
  }'
```

### Récupérer le profil

```bash
curl -X GET http://localhost:8000/api/v1/auth/profile/ \
  -b cookies.txt
```

### Annuler un rendez-vous

```bash
curl -X POST http://localhost:8000/api/v1/appointments/123/cancel/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "reason": "Empêchement personnel"
  }'
```

### Déconnexion

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout/ \
  -b cookies.txt
```

---

## 📦 Collection Postman

### Importer la collection

1. Télécharger : `docs/postman/VIDA_API.postman_collection.json`
2. Ouvrir Postman
3. Cliquer sur "Import"
4. Sélectionner le fichier JSON

### Variables d'environnement

Créer un environnement avec ces variables :

```json
{
  "base_url": "http://localhost:8000",
  "api_url": "http://localhost:8000/api/v1",
  "access_token": "",
  "refresh_token": "",
  "user_email": "patient@example.com",
  "user_password": "MotDePasse123!Secure"
}
```

### Requêtes disponibles

La collection contient :
- ✅ Authentification (inscription, connexion, profil)
- ✅ Rendez-vous (créer, lister, annuler)
- ✅ Contenu (paramètres, services, horaires)
- ✅ Tests automatiques pour chaque endpoint

---

## 🧪 Tests automatisés

### Script de test complet

```bash
#!/bin/bash
# test_api.sh

API_URL="http://localhost:8000/api/v1"
EMAIL="test_$(date +%s)@example.com"
PASSWORD="TestPassword123!Secure"

echo "1. Inscription..."
curl -X POST "$API_URL/auth/register/" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"password_confirm\": \"$PASSWORD\",
    \"first_name\": \"Test\",
    \"last_name\": \"User\",
    \"phone\": \"06 123 45 67\",
    \"captcha\": \"test\"
  }"

echo "\n2. Récupération du profil..."
curl -X GET "$API_URL/auth/profile/" \
  -b cookies.txt

echo "\n3. Créneaux disponibles..."
curl -X GET "$API_URL/appointments/slots/?date=2026-02-01"

echo "\n4. Création de rendez-vous..."
curl -X POST "$API_URL/appointments/" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "patient_first_name": "Test",
    "patient_last_name": "User",
    "patient_email": "'"$EMAIL"'",
    "patient_phone": "06 123 45 67",
    "date": "2026-02-01",
    "time": "10:00",
    "consultation_type": "generale",
    "reason": "Test"
  }'

echo "\n5. Déconnexion..."
curl -X POST "$API_URL/auth/logout/" \
  -b cookies.txt

echo "\nTests terminés !"
```

---

## 📚 Ressources

- [Documentation API](./README.md)
- [Authentification](./authentication.md)
- [Rendez-vous](./appointments.md)
- [Contenu](./content-management.md)

---

**Exemples documentés ! 💡**
