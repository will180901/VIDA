# 🪝 Hooks personnalisés - VIDA

Documentation des hooks personnalisés.

---

## 🔐 useAuth

```typescript
const { user, isAuthenticated, login, logout, register } = useAuth();
```

## 📅 useAppointments

```typescript
const { data: slots } = useAvailableSlots('2026-02-01');
const createAppointment = useCreateAppointment();
```

## 📝 useContent

```typescript
const { data: settings } = useClinicSettings();
const { data: services } = useMedicalServices();
```

## 🍞 useToast

```typescript
const { toast } = useToast();
toast.success('Succès !');
toast.error('Erreur !');
```

---

## 📚 Voir aussi

- [Architecture frontend](../02-architecture/frontend-architecture.md)
- [State Management](./state-management.md)
