# 🧩 Guide des composants - VIDA

Guide complet des composants React du projet.

---

## 📋 Composants UI

### Button

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

<Button variant="primary" size="md">Cliquez ici</Button>
```

### Input

```typescript
<Input
  type="email"
  placeholder="votre@email.com"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Modal

```typescript
<Modal isOpen={isOpen} onClose={onClose}>
  <Modal.Header>Titre</Modal.Header>
  <Modal.Body>Contenu</Modal.Body>
  <Modal.Footer>
    <Button onClick={onClose}>Fermer</Button>
  </Modal.Footer>
</Modal>
```

### HeroSlider

```typescript
<HeroSlider slides={slides} autoPlay={true} interval={8000} />
```

### ServiceCard

```typescript
<ServiceCard
  title="Consultations"
  description="Examens de vue complets"
  image="/images/services/consultation.png"
/>
```

---

## 📚 Voir aussi

- [Architecture frontend](../02-architecture/frontend-architecture.md)
- [Hooks](./hooks.md)
- [Styling](./styling.md)
