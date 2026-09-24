# Run this once as Administrator to allow the phone to reach the Sahal API.
# Right-click PowerShell -> Run as administrator, then:
#   cd D:\Github\SahelApp
#   powershell -ExecutionPolicy Bypass -File .\scripts\allow-backend-firewall.ps1

$port = 4000
$name = 'Sahal Backend 4000'

netsh advfirewall firewall delete rule name="$name" | Out-Null
netsh advfirewall firewall add rule name="$name" dir=in action=allow protocol=TCP localport=$port profile=any
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: inbound TCP $port allowed (rule: $name)"
    netsh advfirewall firewall show rule name="$name"
} else {
    Write-Host "FAILED: run this script from an elevated (Administrator) PowerShell."
    exit 1
}
