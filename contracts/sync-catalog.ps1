# Chạy sau khi cập nhật CSV; JSON là bản sinh ra dùng cho backend.
$ErrorActionPreference = 'Stop'
$catalogSource = Join-Path $PSScriptRoot 'feature_catalog_v0.csv'
$catalogTarget = Join-Path $PSScriptRoot 'feature_catalog_v0.json'
$catalogRows = @(Import-Csv -LiteralPath $catalogSource -Encoding UTF8)
$catalogRows | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $catalogTarget -Encoding utf8
Write-Output ('Synced ' + $catalogRows.Count + ' catalog rows. Run backend tests after changing the contract.')
