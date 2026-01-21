# Script de nettoyage LOCAL pour projets Python + Node.js
# Compatible Windows 10/11 - Nettoyage UNIQUEMENT dans le dossier du projet
# À placer à la racine du projet à nettoyer et exécuter

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Nettoyage Local - Projet Fullstack"

# Variables pour le suivi des suppressions
$deletionLog = @{
    VirtualEnv = @()
    PycacheDir = @()
    CompiledFiles = @()
    Databases = @()
    NodeModules = @()
    PackageCache = @()
    TempFiles = @()
    BuildDirs = @()
    LockFiles = @()
    MigrationsDirs = @()
    CoverageFiles = @()
}

$totalSize = 0
$totalItems = 0
$errors = @()
$processedPaths = @()

# Fonction pour calculer la taille d'un dossier
function Get-FolderSize {
    param([string]$Path)
    try {
        if (-not (Test-Path $Path)) {
            return 0
        }
        $size = (Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        if ($null -eq $size) {
            return 0
        }
        return [math]::Round($size / 1MB, 2)
    } catch {
        return 0
    }
}

# Fonction pour obtenir la taille d'un fichier
function Get-FileSize {
    param([string]$Path)
    try {
        if (Test-Path $Path) {
            $size = (Get-Item $Path).Length
            return [math]::Round($size / 1MB, 2)
        }
        return 0
    } catch {
        return 0
    }
}

# Fonction pour supprimer en toute sécurité
function Remove-SafeItem {
    param(
        [string]$Path,
        [string]$Type = "Item"
    )
    
    # Vérifier qu'on ne sort pas du dossier du projet
    $rootPath = Get-Location
    if (-not $Path.StartsWith($rootPath)) {
        $script:errors += "SECURITE: Tentative de suppression hors du projet: $Path"
        return $false
    }
    
    try {
        if (Test-Path $Path) {
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
            return $true
        }
        return $false
    } catch {
        $script:errors += "Erreur ($Type): $Path - $($_.Exception.Message)"
        return $false
    }
}

# Fonction pour afficher l'en-tête
function Show-Header {
    Clear-Host
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "  NETTOYAGE LOCAL - PROJET FULLSTACK" -ForegroundColor Cyan
    Write-Host "  Recherche recursive dans le projet" -ForegroundColor Yellow
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
}

# Fonction pour afficher une barre de progression
function Show-Progress {
    param(
        [int]$Current,
        [int]$Total,
        [string]$Activity
    )
    $percent = [math]::Round(($Current / $Total) * 100)
    Write-Progress -Activity $Activity -Status "$percent% Complete" -PercentComplete $percent
}

# Fonction pour afficher le rapport final
function Show-Report {
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "  RAPPORT DE NETTOYAGE LOCAL" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""

    $sections = @(
        @{Name = "ENVIRONNEMENTS VIRTUELS PYTHON"; Data = $deletionLog.VirtualEnv; ShowSize = $true},
        @{Name = "DOSSIERS __pycache__"; Data = $deletionLog.PycacheDir; CountOnly = $true},
        @{Name = "FICHIERS PYTHON COMPILES (.pyc, .pyo)"; Data = $deletionLog.CompiledFiles; CountOnly = $true},
        @{Name = "BASES DE DONNEES SQLite"; Data = $deletionLog.Databases; ShowSize = $true},
        @{Name = "DOSSIERS MIGRATIONS"; Data = $deletionLog.MigrationsDirs; ShowSize = $true},
        @{Name = "DOSSIERS node_modules"; Data = $deletionLog.NodeModules; ShowSize = $true},
        @{Name = "CACHE PACKAGES (.vite, .next, .cache, .turbo)"; Data = $deletionLog.PackageCache; ShowSize = $true},
        @{Name = "DOSSIERS BUILD (dist, build, out)"; Data = $deletionLog.BuildDirs; ShowSize = $true},
        @{Name = "FICHIERS DE COUVERTURE"; Data = $deletionLog.CoverageFiles; ShowSize = $true},
        @{Name = "FICHIERS TEMPORAIRES"; Data = $deletionLog.TempFiles; CountOnly = $true},
        @{Name = "FICHIERS DE VERROUILLAGE"; Data = $deletionLog.LockFiles; CountOnly = $true}
    )

    foreach ($section in $sections) {
        if ($section.Data.Count -gt 0) {
            Write-Host "[$($section.Name)]" -ForegroundColor Yellow
            
            if ($section.CountOnly) {
                Write-Host "  $($section.Data.Count) element(s) supprime(s)" -ForegroundColor White
            } elseif ($section.ShowSize) {
                foreach ($item in $section.Data) {
                    $relativePath = $item.Path.Replace($rootPath, ".")
                    Write-Host "  - $relativePath" -ForegroundColor White
                    Write-Host "    Taille: $($item.Size) MB" -ForegroundColor DarkGray
                }
            } else {
                foreach ($item in $section.Data) {
                    $relativePath = $item.Replace($rootPath, ".")
                    Write-Host "  - $relativePath" -ForegroundColor White
                }
            }
            Write-Host ""
        }
    }

    # Afficher les erreurs si présentes
    if ($script:errors.Count -gt 0) {
        Write-Host "[ERREURS RENCONTREES]" -ForegroundColor Red
        $errorCount = [math]::Min($script:errors.Count, 10)
        for ($i = 0; $i -lt $errorCount; $i++) {
            Write-Host "  ! $($script:errors[$i])" -ForegroundColor Red
        }
        if ($script:errors.Count -gt 10) {
            Write-Host "  ... et $($script:errors.Count - 10) autre(s) erreur(s)" -ForegroundColor Red
        }
        Write-Host ""
    }

    # Résumé
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "  TOTAL: $totalItems elements supprimes" -ForegroundColor White
    Write-Host "  ESPACE LIBERE: $([math]::Round($totalSize, 2)) MB" -ForegroundColor White
    if ($script:errors.Count -gt 0) {
        Write-Host "  ERREURS: $($script:errors.Count)" -ForegroundColor Red
    }
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "COMMANDES DE REINSTALLATION :" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Python (selon votre gestionnaire) :" -ForegroundColor White
    Write-Host "  - uv: uv venv && uv sync" -ForegroundColor Gray
    Write-Host "  - pip: python -m venv venv && .\venv\Scripts\activate && pip install -r requirements.txt" -ForegroundColor Gray
    Write-Host "  - poetry: poetry install" -ForegroundColor Gray
    Write-Host "  - pipenv: pipenv install" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Node.js (selon votre gestionnaire) :" -ForegroundColor White
    Write-Host "  - pnpm: pnpm install" -ForegroundColor Gray
    Write-Host "  - npm: npm install" -ForegroundColor Gray
    Write-Host "  - yarn: yarn install" -ForegroundColor Gray
    Write-Host ""
}

try {
    $startTime = Get-Date
    Show-Header

    $rootPath = Get-Location
    Write-Host "Racine du projet: $rootPath" -ForegroundColor Cyan
    Write-Host "Analyse recursive en cours..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ATTENTION: Nettoyage UNIQUEMENT dans ce dossier et ses sous-dossiers" -ForegroundColor Magenta
    Write-Host ""

    $stepNumber = 1
    $totalSteps = 11

    # 1. ENVIRONNEMENTS VIRTUELS PYTHON
    Write-Host "[$stepNumber/$totalSteps] Recherche des environnements virtuels Python..." -ForegroundColor Yellow
    $venvNames = @('venv', '.venv', 'env', '.env', 'virtualenv', '.virtualenv')
    $venvDirs = @()
    
    foreach ($venvName in $venvNames) {
        $found = Get-ChildItem -Path $rootPath -Recurse -Directory -Filter $venvName -ErrorAction SilentlyContinue | Where-Object {
            $scriptsPath = Join-Path $_.FullName "Scripts\python.exe"
            $binPath = Join-Path $_.FullName "bin\python"
            $pyvenvCfg = Join-Path $_.FullName "pyvenv.cfg"
            
            ((Test-Path $scriptsPath) -or (Test-Path $binPath) -or (Test-Path $pyvenvCfg))
        }
        if ($found) {
            $venvDirs += $found
        }
    }
    
    $counter = 0
    foreach ($dir in $venvDirs) {
        $counter++
        Show-Progress -Current $counter -Total $venvDirs.Count -Activity "Suppression des environnements virtuels"
        $size = Get-FolderSize -Path $dir.FullName
        if (Remove-SafeItem -Path $dir.FullName -Type "Environnement virtuel") {
            $deletionLog.VirtualEnv += @{ Path = $dir.FullName; Size = $size }
            $totalSize += $size
            $totalItems++
        }
    }
    Write-Progress -Activity "Suppression des environnements virtuels" -Completed
    Write-Host "  Trouve et supprime: $($venvDirs.Count) environnement(s)" -ForegroundColor Green
    $stepNumber++

    # 2. DOSSIERS __pycache__
    Write-Host "[$stepNumber/$totalSteps] Recherche des dossiers __pycache__..." -ForegroundColor Yellow
    $pycacheDirs = Get-ChildItem -Path $rootPath -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue
    
    $counter = 0
    foreach ($dir in $pycacheDirs) {
        $counter++
        if ($counter % 10 -eq 0) {
            Show-Progress -Current $counter -Total $pycacheDirs.Count -Activity "Suppression des __pycache__"
        }
        if (Remove-SafeItem -Path $dir.FullName -Type "__pycache__") {
            $deletionLog.PycacheDir += $dir.FullName
            $totalItems++
        }
    }
    Write-Progress -Activity "Suppression des __pycache__" -Completed
    Write-Host "  Trouve et supprime: $($pycacheDirs.Count) dossier(s)" -ForegroundColor Green
    $stepNumber++

    # 3. FICHIERS .pyc ET .pyo
    Write-Host "[$stepNumber/$totalSteps] Recherche des fichiers Python compiles..." -ForegroundColor Yellow
    $compiledFiles = Get-ChildItem -Path $rootPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object { 
        $_.Extension -in @('.pyc', '.pyo')
    }
    
    foreach ($file in $compiledFiles) {
        if (Remove-SafeItem -Path $file.FullName -Type "Fichier compilé") {
            $deletionLog.CompiledFiles += $file.FullName
            $totalItems++
        }
    }
    Write-Host "  Trouve et supprime: $($compiledFiles.Count) fichier(s)" -ForegroundColor Green
    $stepNumber++

    # 4. BASES DE DONNEES SQLite
    Write-Host "[$stepNumber/$totalSteps] Recherche des bases de donnees SQLite..." -ForegroundColor Yellow
    $dbFiles = Get-ChildItem -Path $rootPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object { 
        $_.Extension -in @('.sqlite3', '.db', '.sqlite') -and $_.Name -ne 'db.sqlite3.example'
    }
    
    foreach ($db in $dbFiles) {
        $size = Get-FileSize -Path $db.FullName
        if (Remove-SafeItem -Path $db.FullName -Type "Base de données") {
            $deletionLog.Databases += @{ Path = $db.FullName; Size = $size }
            $totalSize += $size
            $totalItems++
        }
    }
    Write-Host "  Trouve et supprime: $($dbFiles.Count) base(s) de donnees" -ForegroundColor Green
    $stepNumber++

    # 5. DOSSIERS MIGRATIONS (Django/Flask)
    Write-Host "[$stepNumber/$totalSteps] Recherche des dossiers migrations..." -ForegroundColor Yellow
    $migrationsDirs = Get-ChildItem -Path $rootPath -Recurse -Directory -Filter "migrations" -ErrorAction SilentlyContinue | Where-Object {
        # Vérifier que c'est bien un dossier de migrations Django/Flask
        $hasInit = Test-Path (Join-Path $_.FullName "__init__.py")
        $hasMigrations = (Get-ChildItem -Path $_.FullName -Filter "*.py" -ErrorAction SilentlyContinue).Count -gt 1
        $hasInit -and $hasMigrations
    }
    
    foreach ($dir in $migrationsDirs) {
        $size = Get-FolderSize -Path $dir.FullName
        if (Remove-SafeItem -Path $dir.FullName -Type "Migrations") {
            $deletionLog.MigrationsDirs += @{ Path = $dir.FullName; Size = $size }
            $totalSize += $size
            $totalItems++
        }
    }
    Write-Host "  Trouve et supprime: $($migrationsDirs.Count) dossier(s)" -ForegroundColor Green
    $stepNumber++

    # 6. DOSSIERS node_modules
    Write-Host "[$stepNumber/$totalSteps] Recherche des dossiers node_modules..." -ForegroundColor Yellow
    $nodeModules = Get-ChildItem -Path $rootPath -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue
    
    $counter = 0
    foreach ($dir in $nodeModules) {
        $counter++
        Show-Progress -Current $counter -Total $nodeModules.Count -Activity "Suppression des node_modules"
        $size = Get-FolderSize -Path $dir.FullName
        if (Remove-SafeItem -Path $dir.FullName -Type "node_modules") {
            $deletionLog.NodeModules += @{ Path = $dir.FullName; Size = $size }
            $totalSize += $size
            $totalItems++
        }
    }
    Write-Progress -Activity "Suppression des node_modules" -Completed
    Write-Host "  Trouve et supprime: $($nodeModules.Count) dossier(s)" -ForegroundColor Green
    $stepNumber++

    # 7. CACHE PACKAGES (.vite, .next, .cache, .turbo)
    Write-Host "[$stepNumber/$totalSteps] Recherche des caches de packages..." -ForegroundColor Yellow
    $cacheNames = @('.vite', '.next', '.nuxt', '.cache', '.turbo', '.parcel-cache', '.webpack', '.vercel', '.pnpm-store')
    $cacheDirs = @()
    
    foreach ($cacheName in $cacheNames) {
        $found = Get-ChildItem -Path $rootPath -Recurse -Directory -Filter $cacheName -ErrorAction SilentlyContinue
        if ($found) {
            $cacheDirs += $found
        }
    }
    
    foreach ($dir in $cacheDirs) {
        $size = Get-FolderSize -Path $dir.FullName
        if (Remove-SafeItem -Path $dir.FullName -Type "Cache") {
            $deletionLog.PackageCache += @{ Path = $dir.FullName; Size = $size }
            $totalSize += $size
            $totalItems++
        }
    }
    Write-Host "  Trouve et supprime: $($cacheDirs.Count) cache(s)" -ForegroundColor Green
    $stepNumber++

    # 8. DOSSIERS BUILD (dist, build, out)
    Write-Host "[$stepNumber/$totalSteps] Recherche des dossiers de build..." -ForegroundColor Yellow
    $buildNames = @('dist', 'build', 'out', '.output')
    $distDirs = @()
    
    foreach ($buildName in $buildNames) {
        $found = Get-ChildItem -Path $rootPath -Recurse -Directory -Filter $buildName -ErrorAction SilentlyContinue | Where-Object {
            $parentPath = Split-Path -Parent $_.FullName
            $parentName = Split-Path -Leaf $parentPath
            # Ne pas supprimer si dans src, source, app, lib, components, pages
            $parentName -notin @('src', 'source', 'app', 'lib', 'components', 'pages', 'styles', 'assets')
        }
        if ($found) {
            $distDirs += $found
        }
    }
    
    foreach ($dir in $distDirs) {
        $size = Get-FolderSize -Path $dir.FullName
        if (Remove-SafeItem -Path $dir.FullName -Type "Build") {
            $deletionLog.BuildDirs += @{ Path = $dir.FullName; Size = $size }
            $totalSize += $size
            $totalItems++
        }
    }
    Write-Host "  Trouve et supprime: $($distDirs.Count) dossier(s)" -ForegroundColor Green
    $stepNumber++

    # 9. FICHIERS DE COUVERTURE (.coverage, htmlcov, .nyc_output)
    Write-Host "[$stepNumber/$totalSteps] Recherche des fichiers de couverture..." -ForegroundColor Yellow
    $coverageItems = @()
    
    # Fichiers .coverage
    $coverageFiles = Get-ChildItem -Path $rootPath -Recurse -File -Filter ".coverage*" -ErrorAction SilentlyContinue
    $coverageItems += $coverageFiles
    
    # Dossiers htmlcov, .nyc_output, coverage
    $coverageDirNames = @('htmlcov', '.nyc_output', 'coverage', '.pytest_cache')
    foreach ($dirName in $coverageDirNames) {
        $found = Get-ChildItem -Path $rootPath -Recurse -Directory -Filter $dirName -ErrorAction SilentlyContinue
        if ($found) {
            $coverageItems += $found
        }
    }
    
    foreach ($item in $coverageItems) {
        $size = if ($item.PSIsContainer) { Get-FolderSize -Path $item.FullName } else { Get-FileSize -Path $item.FullName }
        if (Remove-SafeItem -Path $item.FullName -Type "Couverture") {
            $deletionLog.CoverageFiles += @{ Path = $item.FullName; Size = $size }
            $totalSize += $size
            $totalItems++
        }
    }
    Write-Host "  Trouve et supprime: $($coverageItems.Count) element(s)" -ForegroundColor Green
    $stepNumber++

    # 10. FICHIERS TEMPORAIRES
    Write-Host "[$stepNumber/$totalSteps] Recherche des fichiers temporaires..." -ForegroundColor Yellow
    $tempPatterns = @('npm-debug.log*', 'yarn-error.log*', 'pnpm-debug.log*', 'Thumbs.db', 'ehthumbs*.db', '.DS_Store', '*.tmp', '*.temp', '*.log', 'next-env.d.ts', '*.tsbuildinfo')
    $tempFiles = @()
    
    foreach ($pattern in $tempPatterns) {
        $found = Get-ChildItem -Path $rootPath -Recurse -File -Filter $pattern -ErrorAction SilentlyContinue | Where-Object {
            # Exclure les logs dans des dossiers logs/ officiels si nécessaire
            $_.Directory.Name -notin @('logs', 'log')
        }
        if ($found) {
            $tempFiles += $found
        }
    }
    
    foreach ($file in $tempFiles) {
        if (Remove-SafeItem -Path $file.FullName -Type "Fichier temporaire") {
            $deletionLog.TempFiles += $file.FullName
            $totalItems++
        }
    }
    Write-Host "  Trouve et supprime: $($tempFiles.Count) fichier(s)" -ForegroundColor Green
    $stepNumber++

    # 11. FICHIERS DE VERROUILLAGE
    Write-Host "[$stepNumber/$totalSteps] Recherche des fichiers de verrouillage..." -ForegroundColor Yellow
    $lockPatterns = @('package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'poetry.lock', 'Pipfile.lock', 'uv.lock')
    $lockFiles = @()
    
    foreach ($lockPattern in $lockPatterns) {
        $found = Get-ChildItem -Path $rootPath -Recurse -File -Filter $lockPattern -ErrorAction SilentlyContinue
        if ($found) {
            $lockFiles += $found
        }
    }
    
    foreach ($file in $lockFiles) {
        if (Remove-SafeItem -Path $file.FullName -Type "Fichier de verrouillage") {
            $deletionLog.LockFiles += $file.FullName
            $totalItems++
        }
    }
    Write-Host "  Trouve et supprime: $($lockFiles.Count) fichier(s)" -ForegroundColor Green

    # Afficher le rapport
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host ""
    Write-Host "Duree du nettoyage: $([math]::Round($duration.TotalSeconds, 2)) secondes" -ForegroundColor Cyan
    
    Show-Report

} catch {
    Write-Host ""
    Write-Host "ERREUR CRITIQUE:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Pile d'erreur:" -ForegroundColor Yellow
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Nettoyage termine." -ForegroundColor Green
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")