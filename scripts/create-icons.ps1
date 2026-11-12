$ErrorActionPreference = 'Stop'
& node (Join-Path $PSScriptRoot 'create-book-icons.cjs')
if ($LASTEXITCODE -ne 0) { throw 'Book icon generation failed.' }
