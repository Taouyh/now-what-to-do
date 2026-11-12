$ErrorActionPreference='Stop'
$root=(Get-Location).Path
$out=Join-Path $root $(if($env:NOWWHAT_TEST_OUTPUT){$env:NOWWHAT_TEST_OUTPUT}else{'test-artifacts/native-143'})
$candidate=Join-Path $(if($env:NOWWHAT_CANDIDATE_DIR){$env:NOWWHAT_CANDIDATE_DIR}else{'D:/code/now-what-to-do/dist/native-review-1.4.3-2026-11-12'}) 'windows'
$install=Join-Path $root ('.tmp/independent-install-'+[Guid]::NewGuid().ToString('N'))
function Snapshot {
  $result=@{}
  foreach($key in @('HKCU\Software\NowWhat-WebView2','HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\NowWhat-WebView2','HKCU\Software\Classes\nowwhat')) {
    $result[$key]=((& reg.exe query $key /s 2>$null) -join "`n")
  }
  foreach($shortcut in @((Join-Path ([Environment]::GetFolderPath('Desktop')) 'Now What.lnk'),(Join-Path ([Environment]::GetFolderPath('Programs')) 'Now What.lnk'))) {
    $result[$shortcut]=if(Test-Path $shortcut){@{hash=(Get-FileHash -LiteralPath $shortcut).Hash;time=(Get-Item -LiteralPath $shortcut).LastWriteTimeUtc.Ticks}}else{$null}
  }
  return $result
}
$before=Snapshot
$before | ConvertTo-Json -Depth 12 | Set-Content "$out/installation-before.json"
$env:NOWWHAT_INSTALL_TEST='1'
$p=Start-Process -FilePath "$candidate/Now-What-1.4.3-Windows-x64-Setup.exe" -ArgumentList @('/S',"/D=$install") -WindowStyle Hidden -Wait -PassThru
if($p.ExitCode -ne 0){throw "Installer exit $($p.ExitCode)"}
$payload=Join-Path $candidate 'webview2-unpacked'
$files=@(Get-ChildItem $payload -File -Recurse)
foreach($file in $files){$relative=[IO.Path]::GetRelativePath($payload,$file.FullName);if((Get-FileHash -LiteralPath $file.FullName).Hash -ne (Get-FileHash -LiteralPath (Join-Path $install $relative)).Hash){throw "Payload mismatch $relative"}}
$env:NOWWHAT_NATIVE_DIR=$install
node tests/native-book-smoke.cjs *> "$out/native-smoke.txt"
if($LASTEXITCODE -ne 0){throw 'Native smoke failed'}
$after=Snapshot
$after | ConvertTo-Json -Depth 12 | Set-Content "$out/installation-after.json"
foreach($key in $before.Keys){if(($before[$key]|ConvertTo-Json -Depth 12 -Compress) -ne ($after[$key]|ConvertTo-Json -Depth 12 -Compress)){throw "User registration changed: $key"}}
@{install=$install;exit=$p.ExitCode;payloadFiles=$files.Count;installedFiles=@(Get-ChildItem $install -Recurse -File).Count;registryAndShortcutsUnchanged=$true;hostVersion=(Get-Item "$install/Now What.exe").VersionInfo.FileVersion;installerVersion=(Get-Item "$candidate/Now-What-1.4.3-Windows-x64-Setup.exe").VersionInfo.FileVersion} | ConvertTo-Json | Tee-Object -FilePath "$out/installation.json"
Get-Content "$out/native-smoke.txt"
