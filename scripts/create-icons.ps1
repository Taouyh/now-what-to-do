$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$output = Join-Path $root 'packaging'
New-Item -ItemType Directory -Path $output -Force | Out-Null
$bitmap = New-Object Drawing.Bitmap 256,256
$g = [Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([Drawing.Color]::FromArgb(91,102,80))
$brush = New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(255,254,248))
$points = [Drawing.PointF[]]@([Drawing.PointF]::new(102,70),[Drawing.PointF]::new(102,186),[Drawing.PointF]::new(183,128))
$g.FillPolygon($brush,$points)
$png = Join-Path $output 'icon.png'
$bitmap.Save($png,[Drawing.Imaging.ImageFormat]::Png)
$bytes = [IO.File]::ReadAllBytes($png)
$stream = [IO.File]::Create((Join-Path $output 'icon.ico'))
$writer = [IO.BinaryWriter]::new($stream)
$writer.Write([UInt16]0);$writer.Write([UInt16]1);$writer.Write([UInt16]1)
$writer.Write([byte]0);$writer.Write([byte]0);$writer.Write([byte]0);$writer.Write([byte]0)
$writer.Write([UInt16]1);$writer.Write([UInt16]32);$writer.Write([UInt32]$bytes.Length);$writer.Write([UInt32]22);$writer.Write($bytes)
$writer.Dispose();$g.Dispose();$brush.Dispose();$bitmap.Dispose()
