$ErrorActionPreference = 'Stop'
$repo = 'B-Divyesh/sf-sideload-readiness'
$release = Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest"
$asset = $release.assets | Where-Object { $_.name -eq 'sideload-readiness-windows-x86_64.zip' } | Select-Object -First 1
if (-not $asset) { throw 'Downloads are being published. Open the GitHub release page later.' }
$sums = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS' } | Select-Object -First 1
if (-not $sums) { throw 'No checksums were published. Nothing was installed.' }
$temp = Join-Path ([System.IO.Path]::GetTempPath()) ('sideload-readiness-' + [guid]::NewGuid())
New-Item -ItemType Directory -Path $temp | Out-Null
try {
  $archive = Join-Path $temp $asset.name; $sumFile = Join-Path $temp 'SHA256SUMS'
  Invoke-WebRequest $asset.browser_download_url -OutFile $archive
  Invoke-WebRequest $sums.browser_download_url -OutFile $sumFile
  $expected = ((Get-Content $sumFile) | Where-Object { $_ -match [regex]::Escape($asset.name) } | Select-Object -First 1).Split()[0]
  if (-not $expected) { throw 'No checksum was published for this Windows download.' }
  $actual = (Get-FileHash $archive -Algorithm SHA256).Hash.ToLower()
  if ($actual -ne $expected.ToLower()) { throw 'Checksum did not match. Nothing was installed.' }
  Expand-Archive $archive -DestinationPath $temp -Force
  $installDir = Join-Path $env:LOCALAPPDATA 'SideloadReadiness\bin'; New-Item -ItemType Directory -Force -Path $installDir | Out-Null
  Copy-Item (Join-Path $temp 'sideload-readiness.exe') (Join-Path $installDir 'sideload-readiness.exe') -Force
  Write-Output "Installed sideload-readiness to $installDir (SHA-256 verified). Add it to PATH, then run: sideload-readiness demo"
} finally { Remove-Item -Recurse -Force $temp }
