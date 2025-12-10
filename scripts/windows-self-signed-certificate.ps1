# ==========================================================
# Loadmill Signing Script (Self-signed, Test Only)
# ==========================================================

# --------------------------
# CONFIGURATION
# --------------------------
$env:LOADMILL_DIR = "C:\Users\Gilad\AppData\Local\desktop_app\app-3.8.2"
# Path to signtool.exe from Windows SDK
$signtool = "C:\Program Files (x86)\Windows
Kits\10\bin\10.0.19041.0\x64\signtool.exe"

Write-Host "=== Loadmill folder path ===" -ForegroundColor Yellow
Write-Host $env:LOADMILL_DIR
Write-Host "`n=== Signtool path ===" -ForegroundColor Yellow
Write-Host $signtool

# --------------------------
# STEP 1: Create self-signed certificate
# --------------------------
Write-Host "`n=== STEP 1: Creating temporary self-signed certificate ==="
-ForegroundColor Cyan
try {
    $cert = New-SelfSignedCertificate `
        -Type CodeSigningCert `
        -Subject "CN=Loadmill Test Cert" `
        -CertStoreLocation "Cert:\localMachine\My" `
        -KeyExportPolicy Exportable `
        -KeyLength 2048 `
        -HashAlgorithm SHA256

    Write-Host "Certificate created successfully." -ForegroundColor Green
    Write-Host "Thumbprint: $($cert.Thumbprint)"

    # Store the thumbprint for later use
    $thumbprint = $cert.Thumbprint
} catch {
    Write-Host "ERROR: Failed to create self-signed certificate."
-ForegroundColor Red
    Write-Host $_
    exit
}

# --------------------------
# STEP 1.1: Add cert to trust store (silently)
# --------------------------
Write-Host "`n=== STEP 1.1: Adding certificate to Trusted Root (silent)
===" -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal]
[Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "WARNING: Not running as Administrator. Certificate
installation may prompt for confirmation." -ForegroundColor Yellow
    Write-Host "For silent installation, run PowerShell as Administrator."
-ForegroundColor Yellow
}

try {
    # Get the certificate by thumbprint
    Write-Host "Looking for temporary certificate with thumbprint:
$thumbprint"
    $cert = Get-ChildItem "Cert:\localMachine\My\$thumbprint" -ErrorAction
Stop

    Write-Host "Certificate found: $($cert.Subject)"

    # Add to Trusted Root store (localMachine scope, no prompt)
    Write-Host "Adding certificate to Trusted Root store..."
    $rootStore = New-Object
System.Security.Cryptography.X509Certificates.X509Store("Root",
"localMachine")
    $rootStore.Open("ReadWrite")
    $rootStore.Add($cert)
    $rootStore.Close()
    Write-Host "Added to Root store successfully." -ForegroundColor Green

    # Add to Trusted Publishers store
    Write-Host "Adding certificate to Trusted Publishers store..."
    $pubStore = New-Object
System.Security.Cryptography.X509Certificates.X509Store("TrustedPublisher",
"localMachine")
    $pubStore.Open("ReadWrite")
    $pubStore.Add($cert)
    $pubStore.Close()
    Write-Host "Added to TrustedPublisher store successfully."
-ForegroundColor Green

    Write-Host "Certificate installation completed without prompts."
-ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to add certificate to trust stores."
-ForegroundColor Red
    Write-Host $_.Exception.Message
}

# --------------------------
# STEP 2: Sign all .exe and .dll files
# --------------------------
Write-Host "`n=== STEP 2: Signing all .exe and .dll files ==="
-ForegroundColor Cyan
$filesToSign = Get-ChildItem $env:LOADMILL_DIR -Recurse -File -Include
*.exe, *.dll

Write-Host "Found $($filesToSign.Count) files to sign."

foreach ($file in $filesToSign) {
    Write-Host "Signing file: $($file.FullName)"
    try {
        $signArgs = @(
            "sign",
            "/fd", "SHA256",
            "/sm",
            "/s", "My",
            "/sha1", $cert.Thumbprint,
            $file.FullName
        )
        & $signtool $signArgs
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Signed successfully: $($file.Name)"
-ForegroundColor Green
        } else {
            Write-Host "WARNING: signtool exited with code $LASTEXITCODE
for $($file.Name)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "ERROR signing file: $($file.FullName)" -ForegroundColor
Red
        Write-Host $_
    }
}

# --------------------------
# STEP 3: Verify all files using signtool
# --------------------------
Write-Host "`n=== STEP 3: Verifying with signtool ===" -ForegroundColor Cyan
$signtoolFailures = @()

foreach ($file in $filesToSign) {
    Write-Host "Verifying file: $($file.FullName)" -ForegroundColor Yellow
    try {
        & $signtool verify /pa $file.FullName
        if ($LASTEXITCODE -ne 0) {
            Write-Host "signtool verification FAILED for $($file.Name)"
-ForegroundColor Red
            $signtoolFailures += $file.FullName
        } else {
            Write-Host "Verified successfully: $($file.Name)"
-ForegroundColor Green
        }
    } catch {
        Write-Host "ERROR verifying file: $($file.FullName)"
-ForegroundColor Red
        Write-Host $_
        $signtoolFailures += $file.FullName
    }
}

# --------------------------
# STEP 4: Verify all files using Get-AuthenticodeSignature
# --------------------------
Write-Host "`n=== STEP 4: Verifying with Get-AuthenticodeSignature ==="
-ForegroundColor Cyan
$verificationResults = @()

foreach ($file in $filesToSign) {
    Write-Host "Checking signature status for: $($file.FullName)"
-ForegroundColor Yellow
    try {
        $sig = Get-AuthenticodeSignature $file.FullName
        $verificationResults += [PSCustomObject]@{
            File   = $file.FullName
            Status = $sig.Status
        }
    } catch {
        Write-Host "ERROR reading signature: $($file.FullName)"
-ForegroundColor Red
        $verificationResults += [PSCustomObject]@{
            File   = $file.FullName
            Status = "Error"
        }
    }
}

# --------------------------
# STEP 5: Print summary of any failures
# --------------------------
Write-Host "`n=== Signature Verification Summary ===" -ForegroundColor Cyan

# Files failed signtool
if ($signtoolFailures.Count -gt 0) {
    Write-Host "`nFiles failed signtool verification:" -ForegroundColor Red
    $signtoolFailures | ForEach-Object { Write-Host $_ -ForegroundColor Red
}
} else {
    Write-Host "All files passed signtool verification." -ForegroundColor
Green
}

# Files failed PS verification
$psFailures = $verificationResults | Where-Object { $_.Status -ne 'Valid' }
if ($psFailures.Count -gt 0) {
    Write-Host "`nFiles failed Get-AuthenticodeSignature verification:"
-ForegroundColor Red
    $psFailures | Format-Table -AutoSize
} else {
    Write-Host "All files passed Get-AuthenticodeSignature verification."
-ForegroundColor Green
}

# --------------------------
# STEP 6: Cleanup self-signed certificate
# --------------------------
Write-Host "`n=== STEP 6: Cleaning up temporary certificate ==="
-ForegroundColor Cyan
try {
    # Remove from Personal store
    Remove-Item "Cert:\localMachine\My\$($cert.Thumbprint)" -ErrorAction
SilentlyContinue

    # Remove from Root store
    $rootStore = New-Object
System.Security.Cryptography.X509Certificates.X509Store("Root",
"localMachine")
    $rootStore.Open("ReadWrite")
    $certs = $rootStore.Certificates | Where-Object { $_.Thumbprint -eq
$cert.Thumbprint }
    foreach ($c in $certs) { $rootStore.Remove($c) }
    $rootStore.Close()

    # Remove from TrustedPublisher store
    $pubStore = New-Object
System.Security.Cryptography.X509Certificates.X509Store("TrustedPublisher",
"localMachine")
    $pubStore.Open("ReadWrite")
    $certs = $pubStore.Certificates | Where-Object { $_.Thumbprint -eq
$cert.Thumbprint }
    foreach ($c in $certs) { $pubStore.Remove($c) }
    $pubStore.Close()

    Write-Host "Temporary certificate removed from all stores
successfully." -ForegroundColor Green
} catch {
    Write-Host "WARNING: Failed to remove certificate." -ForegroundColor Red
    Write-Host $_
}

Write-Host "`n=== Script finished ===" -ForegroundColor Green