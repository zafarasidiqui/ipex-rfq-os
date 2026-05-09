$base = "H:\IPEX SUPABASE PROJECT\ipex-rfq-os"

# Create directories
New-Item -ItemType Directory -Force -Path "$base\lib" | Out-Null
New-Item -ItemType Directory -Force -Path "$base\components" | Out-Null
New-Item -ItemType Directory -Force -Path "$base\app\login" | Out-Null
New-Item -ItemType Directory -Force -Path "$base\app\dashboard" | Out-Null
New-Item -ItemType Directory -Force -Path "$base\app\dashboard\projects" | Out-Null
New-Item -ItemType Directory -Force -Path "$base\app\dashboard\quotations" | Out-Null
New-Item -ItemType Directory -Force -Path "$base\app\dashboard\companies" | Out-Null
New-Item -ItemType Directory -Force -Path "$base\app\dashboard\products" | Out-Null
New-Item -ItemType Directory -Force -Path "$base\app\dashboard\inbox" | Out-Null

Write-Host "Directories created." -ForegroundColor Green

# Copy all files
$files = @(
    ".env.local",
    "lib\supabase.ts",
    "components\Sidebar.tsx",
    "app\globals.css",
    "app\layout.tsx",
    "app\page.tsx",
    "app\login\page.tsx",
    "app\dashboard\layout.tsx",
    "app\dashboard\page.tsx",
    "app\dashboard\projects\page.tsx",
    "app\dashboard\quotations\page.tsx",
    "app\dashboard\companies\page.tsx",
    "app\dashboard\products\page.tsx",
    "app\dashboard\inbox\page.tsx"
)

$source = "H:\IPEX SUPABASE PROJECT\ipex-rfq-os-files"

foreach ($file in $files) {
    $src = Join-Path $source $file
    $dst = Join-Path $base $file
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "Copied: $file" -ForegroundColor Cyan
    } else {
        Write-Host "MISSING: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "All files deployed." -ForegroundColor Green
