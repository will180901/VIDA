# 🎯 Guide des views - VIDA

Documentation des views Django REST Framework.

---

## 📝 Créer une view

```python
from rest_framework import viewsets
from .models import MyModel
from .serializers import MySerializer

class MyViewSet(viewsets.ModelViewSet):
    queryset = MyModel.objects.all()
    serializer_class = MySerializer
    permission_classes = [IsAuthenticated]
```

---

## 📚 Voir aussi

- [Architecture backend](../02-architecture/backend-architecture.md)
- [Documentation API](../03-api-documentation/README.md)
