param([switch]$UseMirror,[string]$Prepackaged,[string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
if (!(Test-Path (Join-Path $root 'node_modules/electron/dist/electron.exe'))) { throw 'Run npm ci and scripts/setup-electron.ps1 before building.' }
$env:ELECTRON_BUILDER_CACHE = Join-Path $root '.cache/electron-builder'
$localNsis = Join-Path $root '.cache/nsis/nsis-bundle'
if (Test-Path (Join-Path $localNsis 'makensis.cmd')) {
  $env:ELECTRON_BUILDER_NSIS_DIR = $localNsis
  $env:ELECTRON_BUILDER_NSIS_RESOURCES_DIR = Join-Path $localNsis 'windows'
}
if (Test-Path (Join-Path $root '.cache/rcedit/rcedit-x64.exe')) { $env:ELECTRON_BUILDER_RCEDIT_PATH = Join-Path $root '.cache/rcedit' }
$local7Zip = Get-ChildItem (Join-Path $root '.cache/7zip') -Recurse -File -Filter '7za.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($local7Zip) { $env:ELECTRON_BUILDER_7ZIP_PATH = $local7Zip.FullName }
if ($UseMirror) { $env:ELECTRON_BUILDER_BINARIES_MIRROR = 'https://npmmirror.com/mirrors/electron-builder-binaries/' }
if (!$env:CSC_LINK) { $env:CSC_IDENTITY_AUTO_DISCOVERY = 'false' }
$arguments = @('--win','nsis','--x64')
if ($Prepackaged) { $arguments += @('--prepackaged',$Prepackaged) }
if ($OutputDirectory) { $arguments += @('--config.directories.output',$OutputDirectory) }
Push-Location $root
try { & (Join-Path $root 'node_modules/.bin/electron-builder.cmd') @arguments; if ($LASTEXITCODE -ne 0) { throw 'Windows installer build failed.' } }
finally { Pop-Location }
