param([switch]$UseMirror)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$package = Get-Content (Join-Path $root 'node_modules/electron/package.json') -Raw | ConvertFrom-Json
$version = $package.version
$name = "electron-v$version-win32-x64.zip"
$cache = Join-Path $root '.cache/electron-downloads'
New-Item -ItemType Directory -Path $cache -Force | Out-Null
$zip = Join-Path $cache $name
$expected = (Get-Content (Join-Path $root 'node_modules/electron/checksums.json') -Raw | ConvertFrom-Json).$name
if (!$expected) { throw 'Electron package has no checksum for this platform.' }
if (!(Test-Path $zip) -or (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash -ne $expected) {
  $url = if($UseMirror) { "https://npmmirror.com/mirrors/electron/$version/$name" } else { "https://github.com/electron/electron/releases/download/v$version/$name" }
  & curl.exe --fail --location --silent --show-error --connect-timeout 20 --max-time 600 $url --output $zip
  if ($LASTEXITCODE -ne 0) { throw 'Electron download failed. Retry with -UseMirror if GitHub is unavailable.' }
}
if ((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash -ne $expected) { throw 'Electron SHA-256 mismatch.' }
Expand-Archive -LiteralPath $zip -DestinationPath (Join-Path $root 'node_modules/electron/dist') -Force
[IO.File]::WriteAllText((Join-Path $root 'node_modules/electron/path.txt'),'electron.exe',[Text.UTF8Encoding]::new($false))
Write-Output "Electron $version verified and ready."
