# Conventions de Code - VIDA

## Python (Backend)

### Style

- Suivre **PEP 8**
- Longueur de ligne maximale : **100 caractères**
- Utiliser **Black** pour le formatage
- Type hints obligatoires pour les fonctions publiques

### Structure d'un Fichier

```python
"""
Module docstring court et descriptif.
"""

# Imports standard library
from typing import Any

# Imports tiers
from django.db import models

# Imports locaux
from .autre_module import ClasseExemple


class MaModel(models.Model):
    """
    Description de la classe.
    """
    
    # Champs
    nom = models.CharField(max_length=100)
    date_creation = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Mon Modèle"
        ordering = ['-date_creation']
    
    def __str__(self):
        return self.nom
    
    def methode_instance(self) -> bool:
        """Description de la méthode."""
        return True
    
    @classmethod
    def methode_classe(cls) -> list:
        """Description de la méthode de classe."""
        return []
    
    @staticmethod
    def methode_statique(data: dict) -> Any:
        """Description de la méthode statique."""
        return data
```

### Nommer les Fichiers

| Type | Convention | Exemple |
|------|------------|---------|
| Modèles | snake_case | `mon_model.py` |
| Vues | snake_case | `mes_vues.py` |
| Serializers | snake_case | `mon_serializer.py` |
| URLs | snake_case | `urls.py` |

### Structure d'une App

```
apps/ma_app/
├── __init__.py
├── apps.py
├── models.py
├── views.py
├── urls.py
├── serializers.py
├── permissions.py
├── validators.py
├── admin.py
├── signals.py
├── tasks.py
├── emails.py
├── tests.py
└── migrations/
    └── __init__.py
```

## TypeScript/JavaScript (Frontend)

### Style

- Suivre **ESLint** et **Prettier**
- Point-virgule **obligatoire**
- Guillemets **simples** pour les strings
- **PascalCase** pour les composants React
- **camelCase** pour les variables et fonctions

### Composants React

```tsx
// Bon
interface Props {
  title: string;
  onClick: () => void;
}

export const Button: React.FC<Props> = ({ title, onClick }) => {
  return (
    <button onClick={onClick}>
      {title}
    </button>
  );
};

// Mauvais
const button = (props) => {
  return <button>{props.title}</button>;
};
```

### Hooks Personnalisés

```ts
// Bon
export const useFetchData = (url: string) => {
  const [data, setData] = useState<DataType | null>(null);
  
  useEffect(() => {
    // Fetch logic
  }, [url]);
  
  return { data };
};

// Mauvais - nom qui ne respecte pas la convention
const useData = (url: string) => { /* ... */ };
```

### Imports

```tsx
// Imports externes (ordre alphabétique)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Imports internes
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
```

## Nommer les Variables

| Type | Convention | Exemple |
|------|------------|---------|
| Constantes | UPPER_SNAKE_CASE | `MAX_ITEMS = 10` |
| Variables | camelCase | `userName = "Jean"` |
| Fonctions | camelCase | `getUserData()` |
| Classes | PascalCase | `UserService` |
| Composants | PascalCase | `UserProfile` |

## Comments

```python
# Mauvais - commentaire inutile
i = i + 1  # Incrémenter i

# Bon - commentaire explicatif
i = i + 1  # Compteur de tentatives pour éviter le spam
```
