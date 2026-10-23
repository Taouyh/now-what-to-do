param([string]$ToolsArchive,[string]$PlatformArchive)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$cache = Join-Path $root '.cache/android-downloads'
$sdk = Join-Path $root '.cache/android-sdk'
New-Item -ItemType Directory -Path $cache,$sdk -Force | Out-Null
$metadata = Join-Path $cache 'repository2-3.xml'
if (!(Test-Path $metadata)) {
  & curl.exe --fail --location --silent --show-error --retry 2 --connect-timeout 20 --max-time 180 'https://dl.google.com/android/repository/repository2-3.xml' --output $metadata
  if ($LASTEXITCODE -ne 0) { throw 'Cannot download the official Android SDK package list.' }
}
[xml]$repository = Get-Content -LiteralPath $metadata -Raw
function Install-SdkPackage($packageName,$destination,$requiredFile) {
  if (Test-Path (Join-Path $destination $requiredFile)) { Write-Output "Already available: $packageName"; return }
  $package = $repository.SelectNodes("//*[local-name()='remotePackage']") | Where-Object {$_.GetAttribute('path') -eq $packageName} | Select-Object -First 1
  if (!$package) { throw "Official SDK package not found: $packageName" }
  $archive = $package.archives.archive | Where-Object { !$_.('host-os') -or $_.('host-os') -eq 'windows' } | Select-Object -First 1
  $url = [string]$archive.complete.url
  $zip = Join-Path $cache ([IO.Path]::GetFileName($url))
  if($packageName -eq 'build-tools;35.0.0' -and $ToolsArchive){$zip=$ToolsArchive}
  if($packageName -eq 'platforms;android-35' -and $PlatformArchive){$zip=$PlatformArchive}
  $expected = [string]$archive.complete.checksum.InnerText
  $algorithm = if($archive.complete.checksum.type) { [string]$archive.complete.checksum.type } else { 'SHA1' }
  if (!(Test-Path $zip) -or (Get-Item -LiteralPath $zip).Length -ne [long]$archive.complete.size) {
    Write-Output "Downloading $packageName"
    & node (Join-Path $PSScriptRoot 'download-verified.cjs') ('https://dl.google.com/android/repository/'+$url) ([string]$archive.complete.size) $algorithm $expected $zip
    if ($LASTEXITCODE -ne 0) { throw "SDK download failed: $packageName" }
  }
  if ((Get-FileHash -LiteralPath $zip -Algorithm $algorithm).Hash -ne $expected) { throw "SDK checksum mismatch: $packageName" }
  $stage = Join-Path $cache ($packageName.Replace(';','-'))
  Expand-Archive -LiteralPath $zip -DestinationPath $stage -Force
  $match = Get-ChildItem -LiteralPath $stage -Recurse -File -Filter $requiredFile | Select-Object -First 1
  if (!$match) { throw "Missing SDK file: $requiredFile" }
  New-Item -ItemType Directory -Path $destination -Force | Out-Null
  Copy-Item -Path (Join-Path $match.Directory.FullName '*') -Destination $destination -Recurse -Force
  Write-Output "Installed $packageName"
}
Install-SdkPackage 'build-tools;35.0.0' (Join-Path $sdk 'build-tools/35.0.0') 'aapt2.exe'
Install-SdkPackage 'platforms;android-35' (Join-Path $sdk 'platforms/android-35') 'android.jar'
Write-Output "Android SDK ready: $sdk"
