# 🔄 Guide des serializers - VIDA

Documentation des serializers DRF.

---

## 📝 Créer un serializer

```python
from rest_framework import serializers
from .models import MyModel

class MySerializer(serializers.ModelSerializer):
    class Meta:
        model = MyModel
        fields = '__all__'
    
    def validate_field(self, value):
        if not value:
            raise serializers.ValidationError("Champ requis")
        return value
```

---

## 📚 Voir aussi

- [Architecture backend](../02-architecture/backend-architecture.md)
