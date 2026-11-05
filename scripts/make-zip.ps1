# Tao file zip nop bai: package.json nam o cap cao nhat, KHONG co node_modules, .next, .git, .env*
# Cach dung:  powershell -ExecutionPolicy Bypass -File scripts/make-zip.ps1 -Code QE200012
# Ket qua:    submit/QE200012.zip  (dat file QE200012.docx vao cung thu muc submit/ roi nop ca thu muc)
param(
    [Parameter(Mandatory = $true)][string]$Code,
    [string]$OutDir
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $OutDir) { $OutDir = Join-Path $root 'submit' }
New-Item -ItemType Directory -Force $OutDir | Out-Null
$zipPath = Join-Path (Resolve-Path $OutDir) "$Code.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# Thu muc / file KHONG dua vao zip
$excludeTop = @('node_modules', '.next', '.git', '.vercel', 'de-bai', 'scripts', 'submit', 'out', 'build', 'coverage')

function Test-Excluded([string]$rel) {
    $parts = $rel -split '/'
    if ($excludeTop -contains $parts[0]) { return $true }
    if ($parts -contains 'node_modules' -or $parts -contains '.next' -or $parts -contains '.git') { return $true }
    $name = $parts[-1]
    if ($name -like '.env*' -and $name -ne '.env.example') { return $true }
    if ($name -like '*.zip' -or $name -like '*.docx' -or $name -like '*.tsbuildinfo') { return $true }
    return $false
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
$count = 0
try {
    Get-ChildItem $root -Recurse -File -Force | ForEach-Object {
        $rel = $_.FullName.Substring($root.Length + 1) -replace '\\', '/'
        if (-not (Test-Excluded $rel)) {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel, 'Optimal') | Out-Null
            $count++
        }
    }
}
finally { $zip.Dispose() }

Write-Host "Da tao: $zipPath ($count files)"
