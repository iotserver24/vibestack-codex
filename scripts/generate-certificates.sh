#!/bin/bash

# CodeX Self-Signed Certificate Generation Script
# This script generates self-signed certificates for code signing

set -e

echo "🔐 Generating CodeX Self-Signed Certificates..."

# Create certificates directory
mkdir -p certificates

# Generate CA (Certificate Authority)
echo "📜 Generating Certificate Authority..."
openssl req -x509 -newkey rsa:4096 -keyout certificates/ca-key.pem -out certificates/ca-cert.pem -days 3650 -nodes -subj "/C=IN/ST=Karnataka/L=Bangalore/O=CodeX/OU=Development/CN=CodeX CA"

# Generate Code Signing Certificate for Windows
echo "🪟 Generating Windows Code Signing Certificate..."
openssl req -newkey rsa:2048 -keyout certificates/codex-windows-key.pem -out certificates/codex-windows-req.pem -nodes -subj "/C=IN/ST=Karnataka/L=Bangalore/O=CodeX/OU=Development/CN=CodeX Windows Code Signing"
openssl x509 -req -in certificates/codex-windows-req.pem -CA certificates/ca-cert.pem -CAkey certificates/ca-key.pem -CAcreateserial -out certificates/codex-windows-cert.pem -days 3650 -extensions v3_req -extfile <(echo -e "[v3_req]\nkeyUsage=digitalSignature\nextendedKeyUsage=codeSigning")

# Convert to PFX format for Windows
echo "🔄 Converting to PFX format..."
openssl pkcs12 -export -out certificates/codex-windows.pfx -inkey certificates/codex-windows-key.pem -in certificates/codex-windows-cert.pem -certfile certificates/ca-cert.pem -passout pass:codex123

# Generate Certificate for macOS
echo "🍎 Generating macOS Certificate..."
openssl req -newkey rsa:2048 -keyout certificates/codex-macos-key.pem -out certificates/codex-macos-req.pem -nodes -subj "/C=IN/ST=Karnataka/L=Bangalore/O=CodeX/OU=Development/CN=CodeX macOS Code Signing"
openssl x509 -req -in certificates/codex-macos-req.pem -CA certificates/ca-cert.pem -CAkey certificates/ca-key.pem -CAcreateserial -out certificates/codex-macos-cert.pem -days 3650 -extensions v3_req -extfile <(echo -e "[v3_req]\nkeyUsage=digitalSignature\nextendedKeyUsage=codeSigning")

# Generate Certificate for Linux
echo "🐧 Generating Linux Certificate..."
openssl req -newkey rsa:2048 -keyout certificates/codex-linux-key.pem -out certificates/codex-linux-req.pem -nodes -subj "/C=IN/ST=Karnataka/L=Bangalore/O=CodeX/OU=Development/CN=CodeX Linux Code Signing"
openssl x509 -req -in certificates/codex-linux-req.pem -CA certificates/ca-cert.pem -CAkey certificates/ca-key.pem -CAcreateserial -out certificates/codex-linux-cert.pem -days 3650 -extensions v3_req -extfile <(echo -e "[v3_req]\nkeyUsage=digitalSignature\nextendedKeyUsage=codeSigning")

# Get SHA1 hash for Windows signing
echo "🔍 Getting SHA1 hash for Windows signing..."
SHA1_HASH=$(openssl x509 -in certificates/codex-windows-cert.pem -noout -fingerprint -sha1 | sed 's/://g' | sed 's/SHA1 Fingerprint=//')

echo "✅ Certificates generated successfully!"
echo ""
echo "📋 Certificate Information:"
echo "   Windows PFX: certificates/codex-windows.pfx"
echo "   Windows SHA1: $SHA1_HASH"
echo "   macOS Cert: certificates/codex-macos-cert.pem"
echo "   macOS Key: certificates/codex-macos-key.pem"
echo "   Linux Cert: certificates/codex-linux-cert.pem"
echo "   Linux Key: certificates/codex-linux-key.pem"
echo ""
echo "🔧 Next steps:"
echo "   1. Add these to your GitHub Secrets:"
echo "      - SM_CODE_SIGNING_CERT_SHA1_HASH: $SHA1_HASH"
echo "      - WINDOWS_PFX_PASSWORD: codex123"
echo "   2. Update your forge.config.ts to use these certificates"
echo "   3. For macOS, you'll need to import the certificate into Keychain"
echo ""
echo "⚠️  Note: These are self-signed certificates. Users will see security warnings."
echo "   For production, consider getting certificates from a trusted CA." 