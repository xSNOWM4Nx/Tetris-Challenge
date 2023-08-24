# Path to script for developer certificate check
$createCertScriptPath = Join-Path $PSScriptRoot "check-devcert.ps1"

# Execute developer certificate check script
Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$createCertScriptPath`"" -Wait

# Extract regular version number
$nbgvData = nbgv get-version --format json
$versionData = $nbgvData | ConvertFrom-Json
$regularVersion = $versionData.SimpleVersion
Write-Host "Regular Verison is: $regularVersion"

# Extract package.json data
$packageData = Get-Content 'package.json' | ConvertFrom-Json
$packageVersion = $packageData.version

# Check for version bump
if ($packageVersion -ne $regularVersion) {
  npm version $regularVersion --git-tag-version=false
}

# Build regular reference
tsc
vite build
