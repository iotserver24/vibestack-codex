@echo off
setlocal enabledelayedexpansion

echo 🔐 Generating CodeX Self-Signed Certificates...

REM Create certificates directory
if not exist certificates mkdir certificates

echo 📜 Generating Certificate Authority...
openssl req -x509 -newkey rsa:4096 -keyout certificates\ca-key.pem -out certificates\ca-cert.pem -days 3650 -nodes -subj "/C=IN/ST=Karnataka/L=Bangalore/O=CodeX/OU=Development/CN=CodeX CA"

echo 🪟 Generating Windows Code Signing Certificate...
openssl req -newkey rsa:2048 -keyout certificates\codex-windows-key.pem -out certificates\codex-windows-req.pem -nodes -subj "/C=IN/ST=Karnataka/L=Bangalore/O=CodeX/OU=Development/CN=CodeX Windows Code Signing"

echo [v3_req] > temp_ext.conf
echo keyUsage=digitalSignature >> temp_ext.conf
echo extendedKeyUsage=codeSigning >> temp_ext.conf

openssl x509 -req -in certificates\codex-windows-req.pem -CA certificates\ca-cert.pem -CAkey certificates\ca-key.pem -CAcreateserial -out certificates\codex-windows-cert.pem -days 3650 -extensions v3_req -extfile temp_ext.conf

echo 🔄 Converting to PFX format...
openssl pkcs12 -export -out certificates\codex-windows.pfx -inkey certificates\codex-windows-key.pem -in certificates\codex-windows-cert.pem -certfile certificates\ca-cert.pem -passout pass:codex123

echo 🔍 Getting SHA1 hash for Windows signing...
for /f "tokens=2 delims==" %%i in ('openssl x509 -in certificates\codex-windows-cert.pem -noout -fingerprint -sha1') do set SHA1_HASH=%%i
set SHA1_HASH=!SHA1_HASH: =!

echo ✅ Certificates generated successfully!
echo.
echo 📋 Certificate Information:
echo    Windows PFX: certificates\codex-windows.pfx
echo    Windows SHA1: !SHA1_HASH!
echo.
echo 🔧 Next steps:
echo    1. Add these to your GitHub Secrets:
echo       - SM_CODE_SIGNING_CERT_SHA1_HASH: !SHA1_HASH!
echo       - WINDOWS_PFX_PASSWORD: codex123
echo    2. Update your forge.config.ts to use these certificates
echo.
echo ⚠️  Note: These are self-signed certificates. Users will see security warnings.
echo    For production, consider getting certificates from a trusted CA.

del temp_ext.conf
pause 