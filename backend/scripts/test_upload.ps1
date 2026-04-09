param(
  [Parameter(Mandatory = $true)]
  [string]$ImagePath
)

Invoke-RestMethod \
  -Uri "http://localhost:8000/ocr/upload" \
  -Method Post \
  -Form @{ file = Get-Item $ImagePath }
