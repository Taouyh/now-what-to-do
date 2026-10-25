param([string]$GitHubCli,[switch]$Draft)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
if(!$GitHubCli){
  $installedCli=Get-Command gh.exe -ErrorAction SilentlyContinue
  if($installedCli){$GitHubCli=$installedCli.Source}else{$GitHubCli=Join-Path $root '.cache/gh-cli/bin/gh.exe'}
}
if(!(Get-Command $GitHubCli -ErrorAction SilentlyContinue)){throw 'Install GitHub CLI or provide -GitHubCli with its full path.'}
$repo='Taouyh/now-what-to-do'
$version=(Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version
$tag="v$version"
$assets=@(
  (Join-Path $root "dist/windows/Now-What-$version-Windows-x64-Setup.exe"),
  (Join-Path $root "dist/android/Now-What-$version-Android.apk"),
  (Join-Path $root 'dist/SHA256SUMS.txt')
)
$notes=Join-Path $root "docs/releases/$tag.md"
foreach($file in ($assets+@($notes))){if(!(Test-Path -LiteralPath $file)){throw "Missing release file: $file"}}
function Invoke-Gh([string[]]$cliArgs){& $GitHubCli @cliArgs;if($LASTEXITCODE -ne 0){throw 'GitHub command failed. No further release steps were run.'}}
Push-Location $root
$originalToken=$env:GH_TOKEN
try{
  # Reuse the user's existing Git credential only in this process; never persist or print it.
  & $GitHubCli auth status --hostname github.com *> $null
  if($LASTEXITCODE -ne 0 -and !$env:GH_TOKEN -and !$env:GITHUB_TOKEN){
    $credential=("protocol=https`nhost=github.com`n`n" | & git -c credential.interactive=never credential fill 2>$null)
    if($LASTEXITCODE -eq 0){
      $secretLine=$credential | Where-Object { $_.StartsWith('password=') } | Select-Object -First 1
      if($secretLine){$env:GH_TOKEN=$secretLine.Substring(9)}
    }
    $credential=$null;$secretLine=$null
  }
  Invoke-Gh -cliArgs @('auth','status','--hostname','github.com')
  # Tag the exact source commit corresponding to these local builds.
  $sourcePaths=@('.gitignore','LICENSE','README.md','README.zh-CN.md','README.ja.md','about','index.html','app.js','i18n.js','style.css','package.json','package-lock.json','desktop','android','packaging','scripts','tests','docs/installable-builds.md','docs/site-and-readme.md','docs/minimal-ui-validation.md','docs/releases')
  $changes=& git status --porcelain --untracked-files=all -- @sourcePaths
  if($LASTEXITCODE -ne 0 -or $changes){throw 'Commit the release source and documentation before publishing.'}
  $head=(& git rev-parse HEAD).Trim()
  $remote=& git ls-remote origin refs/heads/design/minimal-ui
  if($LASTEXITCODE -ne 0 -or !$remote -or ($remote -split '\s+')[0] -ne $head){throw 'Push this source commit to design/minimal-ui before publishing.'}
  $remoteTags=@(& git ls-remote origin "refs/tags/$tag" "refs/tags/$tag^{}")
  if($LASTEXITCODE -ne 0){throw 'Could not verify the release tag.'}
  if($remoteTags.Count){
    $peeled=@($remoteTags | Where-Object { $_ -match '\^\{\}$' })
    $tagLine=if($peeled.Count){$peeled[0]}else{$remoteTags[0]}
    if(($tagLine -split '\s+')[0] -ne $head){throw 'The existing release tag points to different source. Review it before publishing.'}
  }
  & node tests/package-contents.cjs
  if($LASTEXITCODE -ne 0){throw 'Installer contents do not match the release source.'}
  $checksumPath=$assets[2]
  $expected=@{};foreach($line in Get-Content -LiteralPath $checksumPath){$parts=$line -split '\s+',2;if($parts.Count -eq 2){$expected[$parts[1]]=$parts[0]}}
  foreach($file in $assets[0..1]){if((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected[(Split-Path $file -Leaf)]){throw "Checksum mismatch: $file"}}
  # Never replace a previous release or its assets automatically.
  $existingTags=Invoke-Gh -cliArgs @('api',"repos/$repo/releases?per_page=100",'--jq','.[].tag_name')
  if($existingTags -contains $tag){throw "$tag already exists. Review it before adding or replacing any downloads."}
  Invoke-Gh -cliArgs (@('release','create',$tag,'--repo',$repo,'--target',$head,'--title',"Now What $version",'--notes-file',$notes,'--draft')+$assets)
  if(!$Draft){Invoke-Gh -cliArgs @('release','edit',$tag,'--repo',$repo,'--draft=false','--latest')}
  Invoke-Gh -cliArgs @('release','view',$tag,'--repo',$repo,'--json','url,assets,isDraft,tagName')
}finally{$env:GH_TOKEN=$originalToken;Pop-Location}
