# 🐳 Déploiement Docker - VIDA

Guide de déploiement avec Docker et Docker Compose.

---

## 🚀 Déploiement rapide

```bash
# Cloner le projet
git clone https://github.com/your-repo/vida.git
cd vida

# Configurer les variables d'environnement
cp backend/.env.example backend/.env.production
cp frontend/.env.example frontend/.env.production
# Éditer les fichiers .env

# Lancer avec Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker-compose logs -f
```

---

## 📋 docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: vida_db
      POSTGRES_USER: vida_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}

  backend:
    build: ./backend
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql://vida_user:${DB_PASSWORD}@db:5432/vida_db
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0

  frontend:
    build: ./frontend
    command: pnpm start
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
```

---

## 📚 Voir aussi

- [Checklist production](./production-checklist.md)
- [Configuration](../01-getting-started/configuration.md)

---

**Docker documenté ! 🐳**
