$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$cache=Join-Path $root '.cache/webview2'
New-Item -ItemType Directory -Force $cache | Out-Null
$version='1.0.4314.35'
$sdk=Join-Path $cache 'sdk.zip'
$expected='90778deb1b77e36292828b4b5833c9255c27533f40e0ddd55891ae718944edc4'
if(!(Test-Path $sdk)) { Invoke-WebRequest "https://api.nuget.org/v3-flatcontainer/microsoft.web.webview2/$version/microsoft.web.webview2.$version.nupkg" -OutFile $sdk }
if((Get-FileHash $sdk -Algorithm SHA256).Hash -ne $expected){throw 'WebView2 SDK checksum mismatch.'}
Expand-Archive $sdk (Join-Path $cache 'sdk') -Force
$bootstrap=Join-Path $cache 'MicrosoftEdgeWebview2Setup.exe'
if(!(Test-Path $bootstrap)){Invoke-WebRequest 'https://go.microsoft.com/fwlink/p/?LinkId=2124703' -OutFile $bootstrap}
$signature=Get-AuthenticodeSignature $bootstrap
if($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch '^CN=Microsoft Corporation,'){throw 'Invalid Microsoft WebView2 bootstrapper signature.'}
Write-Output "Verified Microsoft WebView2 SDK $version and signed Evergreen bootstrapper."
