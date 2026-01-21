#!/bin/bash
# =============================================================================
# Script de restauration de la base de données PostgreSQL
# =============================================================================

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/vida}"
DB_NAME="${DB_NAME:-vida_production}"
DB_USER="${DB_USER:-vida_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction de logging
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifier les arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Backups disponibles:"
    ls -lh "$BACKUP_DIR"/vida_db_*.sql.gz 2>/dev/null || echo "Aucun backup trouvé"
    exit 1
fi

BACKUP_FILE="$1"

# Vérifier que le fichier existe
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Fichier de backup introuvable: $BACKUP_FILE"
    exit 1
fi

# Vérifier l'intégrité du fichier
echo "Vérification de l'intégrité du fichier..."
if ! gzip -t "$BACKUP_FILE" 2>/dev/null; then
    log_error "Le fichier de backup est corrompu"
    exit 1
fi
log_success "Fichier valide"

# Confirmation
log_warning "ATTENTION: Cette opération va ÉCRASER la base de données actuelle!"
echo "Base de données: $DB_NAME"
echo "Fichier de backup: $BACKUP_FILE"
echo ""
read -p "Êtes-vous sûr de vouloir continuer? (tapez 'OUI' pour confirmer): " CONFIRM

if [ "$CONFIRM" != "OUI" ]; then
    echo "Restauration annulée"
    exit 0
fi

# Créer un backup de sécurité avant restauration
SAFETY_BACKUP="$BACKUP_DIR/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
echo ""
echo "Création d'un backup de sécurité..."
if PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl | gzip > "$SAFETY_BACKUP"; then
    log_success "Backup de sécurité créé: $SAFETY_BACKUP"
else
    log_error "Échec du backup de sécurité"
    exit 1
fi

# Restauration
echo ""
echo "Restauration en cours..."

# Déconnecter tous les utilisateurs
PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
    2>/dev/null

# Supprimer et recréer la base
PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "DROP DATABASE IF EXISTS $DB_NAME;" \
    2>/dev/null

PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" \
    2>/dev/null

# Restaurer le dump
if gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    2>/dev/null; then
    
    log_success "Base de données restaurée avec succès"
    echo ""
    echo "Backup de sécurité conservé: $SAFETY_BACKUP"
    exit 0
else
    log_error "Échec de la restauration"
    echo ""
    log_warning "Tentative de restauration du backup de sécurité..."
    
    # Restaurer le backup de sécurité
    gunzip -c "$SAFETY_BACKUP" | PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        2>/dev/null
    
    log_error "Restauration échouée. Base de données revenue à l'état précédent."
    exit 1
fi
