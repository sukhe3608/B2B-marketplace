$content = [System.IO.File]::ReadAllText('src/pages/Consumer/ConsumerMessages.jsx')
$openP = ($content.ToCharArray() | Where-Object { $_ -eq '(' }).Count
$closeP = ($content.ToCharArray() | Where-Object { $_ -eq ')' }).Count
$openB = ($content.ToCharArray() | Where-Object { $_ -eq '{' }).Count
$closeB = ($content.ToCharArray() | Where-Object { $_ -eq '}' }).Count
$openK = ($content.ToCharArray() | Where-Object { $_ -eq '[' }).Count
$closeK = ($content.ToCharArray() | Where-Object { $_ -eq ']' }).Count
Write-Host "Parens: $openP open, $closeP close"
Write-Host "Braces: $openB open, $closeB close"
Write-Host "Brackets: $openK open, $closeK close"
