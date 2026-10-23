param([string]$JavaHome, [string]$SdkRoot)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
if (!$JavaHome) {
  $compiler = Get-Command javac.exe -ErrorAction SilentlyContinue
  if ($compiler) { $JavaHome = Split-Path (Split-Path $compiler.Source -Parent) -Parent } else { $JavaHome = $env:JAVA_HOME }
}
if (!$SdkRoot) { $SdkRoot = Join-Path $root '.cache/android-sdk' }
$tools = Join-Path $SdkRoot 'build-tools/35.0.0'
$platform = Join-Path $SdkRoot 'platforms/android-35/android.jar'
if (!(Test-Path $platform) -or !(Test-Path (Join-Path $tools 'aapt2.exe'))) { throw 'Run scripts/setup-android.ps1 first, or provide -SdkRoot with Android 35 and Build Tools 35.0.0.' }
if (!(Test-Path (Join-Path $JavaHome 'bin/javac.exe'))) { throw 'JDK 17 or newer is required. Provide -JavaHome.' }
$env:JAVA_HOME = $JavaHome
$env:PATH = (Join-Path $JavaHome 'bin') + ';' + $env:PATH
$work = Join-Path $root ('android/.build/'+[Guid]::NewGuid().ToString('N'))
$assets = Join-Path $work 'assets'
$generated = Join-Path $work 'generated'
$classes = Join-Path $work 'classes'
$dex = Join-Path $work 'dex'
$out = Join-Path $root 'dist/android'
New-Item -ItemType Directory -Path $work,$assets,$generated,$classes,$dex,$out -Force | Out-Null
foreach ($file in @('app.js','i18n.js','style.css')) { Copy-Item -LiteralPath (Join-Path $root $file) -Destination $assets }
$html = [IO.File]::ReadAllText((Join-Path $root 'index.html')).Replace('<script src="i18n.js','<script src="native-android.js"></script><script src="i18n.js')
[IO.File]::WriteAllText((Join-Path $assets 'index.html'),$html,[Text.UTF8Encoding]::new($false))
Copy-Item -LiteralPath (Join-Path $root 'android/native-android.js') -Destination $assets
function Run-Tool($exe,[string[]]$toolArgs) { & $exe @toolArgs; if ($LASTEXITCODE -ne 0) { throw "Tool failed: $exe ($LASTEXITCODE)" } }
Run-Tool (Join-Path $tools 'aapt2.exe') @('compile','--dir',(Join-Path $root 'android/res'),'-o',(Join-Path $work 'resources.zip'))
Run-Tool (Join-Path $tools 'aapt2.exe') @('link','-o',(Join-Path $work 'resources.apk'),'--manifest',(Join-Path $root 'android/AndroidManifest.xml'),'-I',$platform,'--java',$generated,'-A',$assets,(Join-Path $work 'resources.zip'))
$sources = @(Get-ChildItem (Join-Path $root 'android/src'),$generated -Recurse -File -Filter '*.java' | ForEach-Object {$_.FullName})
$sourceList = Join-Path $work 'sources.txt'
[IO.File]::WriteAllLines($sourceList,($sources | ForEach-Object {'"'+$_.Replace('\','/')+'"'}),[Text.UTF8Encoding]::new($false))
Run-Tool (Join-Path $JavaHome 'bin/javac.exe') @('-J-Duser.language=en','-encoding','UTF-8','--release','8','-classpath',$platform,'-d',$classes,('@'+$sourceList))
Run-Tool (Join-Path $JavaHome 'bin/jar.exe') @('cf',(Join-Path $work 'classes.jar'),'-C',$classes,'.')
Run-Tool (Join-Path $JavaHome 'bin/java.exe') @('-cp',(Join-Path $tools 'lib/d8.jar'),'com.android.tools.r8.D8','--lib',$platform,'--min-api','24','--output',$dex,(Join-Path $work 'classes.jar'))
$unsigned = Join-Path $work 'unsigned.apk'
Copy-Item -LiteralPath (Join-Path $work 'resources.apk') -Destination $unsigned
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::Open($unsigned,[IO.Compression.ZipArchiveMode]::Update)
try { [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,(Join-Path $dex 'classes.dex'),'classes.dex',[IO.Compression.CompressionLevel]::Optimal) | Out-Null } finally { $archive.Dispose() }
$aligned = Join-Path $work 'aligned.apk'
Run-Tool (Join-Path $tools 'zipalign.exe') @('-f','-p','4',$unsigned,$aligned)
$identity = Join-Path $root 'android/.signing'
$keystore = Join-Path $identity 'release.jks'
$credentials = Join-Path $identity 'signing.json'
New-Item -ItemType Directory -Path $identity -Force | Out-Null
if (!(Test-Path $keystore)) {
  if (Test-Path $credentials) { throw 'Signing metadata exists but its keystore is missing. Restore the original keystore to preserve upgrade compatibility.' }
  $random = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($random)
  $password = [Convert]::ToBase64String($random)
  $env:NOWWHAT_KEY_PASSWORD = $password
  Run-Tool (Join-Path $JavaHome 'bin/keytool.exe') @('-genkeypair','-keystore',$keystore,'-storetype','JKS','-alias','nowwhat','-keyalg','RSA','-keysize','3072','-validity','10000','-dname','CN=Now What','-storepass:env','NOWWHAT_KEY_PASSWORD','-keypass:env','NOWWHAT_KEY_PASSWORD')
  [IO.File]::WriteAllText($credentials,(@{password=$password} | ConvertTo-Json),[Text.UTF8Encoding]::new($false))
} else {
  if (!(Test-Path $credentials)) { throw 'Restore signing.json from the original signing identity backup.' }
  $env:NOWWHAT_KEY_PASSWORD = (Get-Content -LiteralPath $credentials -Raw | ConvertFrom-Json).password
}
$version = (Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version
$apk = Join-Path $out "Now-What-$version-Android.apk"
try {
  Run-Tool (Join-Path $JavaHome 'bin/java.exe') @('-jar',(Join-Path $tools 'lib/apksigner.jar'),'sign','--ks',$keystore,'--ks-key-alias','nowwhat','--ks-pass','env:NOWWHAT_KEY_PASSWORD','--key-pass','env:NOWWHAT_KEY_PASSWORD','--out',$apk,$aligned)
  Run-Tool (Join-Path $JavaHome 'bin/java.exe') @('-jar',(Join-Path $tools 'lib/apksigner.jar'),'verify','--verbose','--print-certs',$apk)
} finally { Remove-Item Env:NOWWHAT_KEY_PASSWORD -ErrorAction SilentlyContinue }
Run-Tool (Join-Path $tools 'aapt2.exe') @('dump','badging',$apk)
Write-Output "Android release APK: $apk"
