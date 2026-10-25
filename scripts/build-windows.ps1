param([string]$OutputDirectory='dist/windows',[string]$NsisPath)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$version=(Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version
$sdk=Join-Path $root '.cache/webview2/sdk'
$bootstrap=Join-Path $root '.cache/webview2/MicrosoftEdgeWebview2Setup.exe'
if(!(Test-Path "$sdk/build/native/include/WebView2.h")){throw 'Run scripts/setup-webview2.ps1 first.'}
# Import this PowerShell edition's built-in module when launched from PowerShell 7.
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Security/Microsoft.PowerShell.Security.psd1') -ErrorAction Stop
$signature=Get-AuthenticodeSignature $bootstrap
if($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch '^CN=Microsoft Corporation,'){throw 'Invalid Microsoft WebView2 installer signature.'}
if(!$NsisPath){
  $local=Join-Path $root '.cache/nsis/nsis-bundle/windows/makensis.exe'
  if(Test-Path $local){$NsisPath=$local}else{$NsisPath=(Get-Command makensis.exe -ErrorAction Stop).Source}
}
$output=[IO.Path]::GetFullPath((Join-Path $root $OutputDirectory))
$payload=Join-Path $output 'webview2-unpacked'
New-Item -ItemType Directory -Force "$payload/web" | Out-Null
foreach($file in @('index.html','app.js','i18n.js','style.css')){Copy-Item (Join-Path $root $file) "$payload/web/$file" -Force}
Copy-Item "$root/desktop/webview2/native-webview2.js" $payload -Force
Copy-Item "$sdk/LICENSE.txt" "$payload/LICENSE-WebView2.txt" -Force
Copy-Item "$sdk/NOTICE.txt" "$payload/NOTICE-WebView2.txt" -Force
$vswhere=Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
$visualStudio=(& $vswhere -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath)
if(!$visualStudio){throw 'Install Visual Studio Build Tools with Desktop development with C++ and Windows SDK.'}
$build=Join-Path $output 'native-build'
New-Item -ItemType Directory -Force $build | Out-Null
$rc="1 ICON ""$($root.Replace('\','/'))/packaging/icon.ico""`r`n1 VERSIONINFO`r`nFILEVERSION $($version.Replace('.',',')),0`r`nPRODUCTVERSION $($version.Replace('.',',')),0`r`nBEGIN`r`n BLOCK ""StringFileInfo"" BEGIN`r`n BLOCK ""040904b0"" BEGIN`r`n VALUE ""ProductName"", ""Now What""`r`n VALUE ""FileDescription"", ""Now What - native WebView2 host""`r`n VALUE ""FileVersion"", ""$version""`r`n VALUE ""LegalCopyright"", ""MIT - Taouyh""`r`n END`r`n END`r`n BLOCK ""VarFileInfo"" BEGIN`r`n VALUE ""Translation"", 0x409, 1200`r`n END`r`nEND`r`n"
[IO.File]::WriteAllText("$build/app.rc",$rc,[Text.UTF8Encoding]::new($false))
$response=@('/nologo','/std:c++17','/EHsc','/MT','/O1','/utf-8','/DWINVER=0x0A00','/D_WIN32_WINNT=0x0A00',"/I""$sdk\build\native\include""","/Fo""$build\main.obj""","/Fe""$payload\Now What.exe""","""$root\desktop\webview2\main.cpp""",' /link /SUBSYSTEM:WINDOWS',"""$build\app.res""","""$sdk\build\native\x64\WebView2LoaderStatic.lib""",'user32.lib gdi32.lib shell32.lib shlwapi.lib ole32.lib windowsapp.lib comdlg32.lib version.lib advapi32.lib') -join "`r`n"
[IO.File]::WriteAllText("$build/build.rsp",$response,[Text.UTF8Encoding]::new($false))
$batch="@echo off`r`ncall ""$visualStudio\VC\Auxiliary\Build\vcvars64.bat"" >nul`r`nif errorlevel 1 exit /b 1`r`nrc.exe /nologo /fo ""$build\app.res"" ""$build\app.rc""`r`nif errorlevel 1 exit /b 1`r`ncl.exe @""$build\build.rsp""`r`nexit /b %errorlevel%`r`n"
[IO.File]::WriteAllText("$build/compile.cmd",$batch,[Text.UTF8Encoding]::new($false))
& "$build/compile.cmd"
if($LASTEXITCODE -ne 0){throw 'Native Windows compilation failed.'}
$installer=Join-Path $output "Now-What-$version-Windows-x64-Setup.exe"
& $NsisPath /V2 "/DROOT=$root" "/DPAYLOAD=$payload" "/DBOOTSTRAP=$bootstrap" "/DOUTPUT=$installer" "/DVERSION=$version" "$root/packaging/windows-webview2.nsi"
if($LASTEXITCODE -ne 0){throw 'NSIS installer build failed.'}
Write-Output "Built $installer"
