# 🔄 Mises à jour - VIDA

Guide de mise à jour du système.

---

## 📦 Mettre à jour les dépendances

### Backend (Python)

```bash
cd backend
source venv/bin/activate

# Mettre à jour pip
pip install --upgrade pip

# Mettre à jour les dépendances
pip install --upgrade -r requirements.txt

# Vérifier les vulnérabilités
pip-audit
```

### Frontend (Node.js)

```bash
cd frontend

# Mettre à jour pnpm
npm install -g pnpm@latest

# Mettre à jour les dépendances
pnpm update

# Vérifier les vulnérabilités
pnpm audit
```

---

## 🚀 Déployer une mise à jour

```bash
# 1. Backup
./scripts/backup_database.sh

# 2. Pull les changements
git pull origin main

# 3. Mettre à jour les dépendances
cd backend && pip install -r requirements.txt
cd frontend && pnpm install

# 4. Migrations
python manage.py migrate

# 5. Redémarrer les services
sudo systemctl restart vida-backend vida-frontend
```

---

## 📚 Voir aussi

- [Backup & Restore](./backup-restore.md)
- [Troubleshooting](./troubleshooting.md)

---

**Mises à jour documentées ! 🔄**
