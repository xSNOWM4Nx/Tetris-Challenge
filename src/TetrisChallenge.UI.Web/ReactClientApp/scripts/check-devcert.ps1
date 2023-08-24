# Setup base folder
$baseFolder = If ($env:APPDATA -ne "" -and $null -ne $env:APPDATA) {
  "$env:APPDATA\ASP.NET\https"
}
Else {
  "$env:HOME\.aspnet\https"
}

# Setup name for certificate
$certArg = [System.Environment]::GetCommandLineArgs() | ForEach-Object { 
  if ($_ -match '/--name=(?<value>.+)') {
    $matches['value']
  }
}
$certName = If ($certArg) { $certArg } Else { $env:npm_package_name }

If (-not $certName) {
  Write-Host "Invalid certificate name. Run this script in the context of an npm/yarn script or pass --name=<<app>> explicitly"
  Exit -1
}

# Finalize certificate file pathes
$moduleCertFilePath = Join-Path $baseFolder "$certName.pem"
$moduleKeyFilePath = Join-Path $baseFolder "$certName.key"

# Create new certificate if no one exists
If (-not (Test-Path $moduleCertFilePath) -or -not (Test-Path $moduleKeyFilePath)) {
  Start-Process -Wait -NoNewWindow -FilePath "dotnet" -ArgumentList @(
    "dev-certs",
    "https",
    "--export-path",
    $moduleCertFilePath,
    "--format",
    "Pem",
    "--no-password"
  )
  Exit $LASTEXITCODE
};
