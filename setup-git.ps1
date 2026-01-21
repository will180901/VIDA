# ============================================
# VIDA - Configuration Git Automatique
# ============================================
# Ce script configure Git pour Windows avec les bonnes pratiques

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VIDA - Configuration Git" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Git est installé
try {
    $gitVersion = git --version
    Write-Host "✓ Git détecté: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "  Téléchargez Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Configuration core.autocrlf
Write-Host "Configuration de core.autocrlf..." -ForegroundColor Yellow
$currentAutocrlf = git config --global core.autocrlf

if ($currentAutocrlf -eq "true") {
    Write-Host "✓ core.autocrlf est déjà configuré à 'true'" -ForegroundColor Green
} else {
    git config --global core.autocrlf true
    Write-Host "✓ core.autocrlf configuré à 'true'" -ForegroundColor Green
}

# Vérifier user.name et user.email
Write-Host ""
Write-Host "Vérification de l'identité Git..." -ForegroundColor Yellow

$userName = git config --global user.name
$userEmail = git config --global user.email

if ([string]::IsNullOrWhiteSpace($userName)) {
    Write-Host "⚠ user.name n'est pas configuré" -ForegroundColor Yellow
    $name = Read-Host "Entrez votre nom (ex: Jean Dupont)"
    git config --global user.name "$name"
    Write-Host "✓ user.name configuré: $name" -ForegroundColor Green
} else {
    Write-Host "✓ user.name: $userName" -ForegroundColor Green
}

if ([string]::IsNullOrWhiteSpace($userEmail)) {
    Write-Host "⚠ user.email n'est pas configuré" -ForegroundColor Yellow
    $email = Read-Host "Entrez votre email (ex: jean@example.com)"
    git config --global user.email "$email"
    Write-Host "✓ user.email configuré: $email" -ForegroundColor Green
} else {
    Write-Host "✓ user.email: $userEmail" -ForegroundColor Green
}

# Configuration supplémentaire recommandée
Write-Host ""
Write-Host "Configuration des options recommandées..." -ForegroundColor Yellow

# Activer les couleurs
git config --global color.ui auto
Write-Host "✓ Couleurs activées" -ForegroundColor Green

# Configurer l'éditeur par défaut (VS Code si disponible)
$currentEditor = git config --global core.editor
if ([string]::IsNullOrWhiteSpace($currentEditor)) {
    # Vérifier si VS Code est installé
    if (Get-Command code -ErrorAction SilentlyContinue) {
        git config --global core.editor "code --wait"
        Write-Host "✓ Éditeur configuré: VS Code" -ForegroundColor Green
    } else {
        Write-Host "⚠ Éditeur par défaut non configuré (VS Code non trouvé)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ Éditeur: $currentEditor" -ForegroundColor Green
}

# Configurer le comportement de pull
git config --global pull.rebase false
Write-Host "✓ Pull strategy: merge (par défaut)" -ForegroundColor Green

# Afficher la configuration finale
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration Git Finale" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$config = @{
    "user.name" = git config --global user.name
    "user.email" = git config --global user.email
    "core.autocrlf" = git config --global core.autocrlf
    "core.editor" = git config --global core.editor
    "color.ui" = git config --global color.ui
    "pull.rebase" = git config --global pull.rebase
}

foreach ($key in $config.Keys) {
    $value = $config[$key]
    if ([string]::IsNullOrWhiteSpace($value)) {
        $value = "(non configuré)"
    }
    Write-Host "$key = $value" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Prochaines Étapes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Faire le premier commit:" -ForegroundColor Yellow
Write-Host '   git commit -m "chore: initial commit - VIDA v1.1.0"' -ForegroundColor White
Write-Host ""
Write-Host "2. Normaliser les line endings (optionnel):" -ForegroundColor Yellow
Write-Host "   git add --renormalize ." -ForegroundColor White
Write-Host '   git commit -m "chore: normalize line endings"' -ForegroundColor White
Write-Host ""
Write-Host "3. Ajouter un remote (GitHub/GitLab):" -ForegroundColor Yellow
Write-Host "   git remote add origin <URL>" -ForegroundColor White
Write-Host "   git push -u origin master" -ForegroundColor White
Write-Host ""
Write-Host "✓ Configuration terminée avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "Documentation complète: docs/00-getting-started/GIT-SETUP.md" -ForegroundColor Cyan
Write-Host ""
