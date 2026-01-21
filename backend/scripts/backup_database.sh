#!/bin/bash
# =============================================================================
# Script de backup automatique de la base de données PostgreSQL
# =============================================================================

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/vida}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="${DB_NAME:-vida_production}"
DB_USER="${DB_USER:-vida_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Fichiers de backup
BACKUP_FILE="$BACKUP_DIR/vida_db_$TIMESTAMP.sql.gz"
BACKUP_LOG="$BACKUP_DIR/backup.log"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$BACKUP_LOG"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$BACKUP_LOG"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$BACKUP_LOG"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}" | tee -a "$BACKUP_LOG"
}

# Créer le répertoire de backup s'il n'existe pas
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    log "Création du répertoire de backup: $BACKUP_DIR"
fi

# Vérifier que pg_dump est disponible
if ! command -v pg_dump &> /dev/null; then
    log_error "pg_dump n'est pas installé. Installez postgresql-client."
    exit 1
fi

# Début du backup
log "=========================================="
log "Début du backup de la base de données"
log "=========================================="
log "Base de données: $DB_NAME"
log "Hôte: $DB_HOST:$DB_PORT"
log "Utilisateur: $DB_USER"
log "Fichier: $BACKUP_FILE"

# Effectuer le backup
log "Création du dump..."
if PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    --verbose \
    2>> "$BACKUP_LOG" | gzip > "$BACKUP_FILE"; then
    
    # Vérifier la taille du fichier
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_success "Backup créé avec succès: $BACKUP_FILE ($BACKUP_SIZE)"
    
    # Vérifier l'intégrité du fichier gzip
    if gzip -t "$BACKUP_FILE" 2>> "$BACKUP_LOG"; then
        log_success "Intégrité du fichier vérifiée"
    else
        log_error "Le fichier de backup est corrompu"
        exit 1
    fi
else
    log_error "Échec du backup"
    exit 1
fi

# Nettoyer les anciens backups
log "Nettoyage des backups de plus de $RETENTION_DAYS jours..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "vida_db_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED_COUNT" -gt 0 ]; then
    log_success "$DELETED_COUNT ancien(s) backup(s) supprimé(s)"
else
    log "Aucun ancien backup à supprimer"
fi

# Statistiques
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "vida_db_*.sql.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "=========================================="
log "Statistiques:"
log "  - Backups actuels: $TOTAL_BACKUPS"
log "  - Espace utilisé: $TOTAL_SIZE"
log "  - Rétention: $RETENTION_DAYS jours"
log "=========================================="
log_success "Backup terminé avec succès"

# Envoyer une notification (optionnel)
if [ -n "$BACKUP_NOTIFICATION_EMAIL" ]; then
    echo "Backup de la base de données VIDA effectué avec succès le $(date)" | \
    mail -s "✅ Backup VIDA réussi" "$BACKUP_NOTIFICATION_EMAIL"
fi

exit 0
