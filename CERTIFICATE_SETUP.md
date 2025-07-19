# 🔐 CodeX Self-Signed Certificate Setup Guide

This guide will help you set up self-signed certificates for code signing your CodeX application.

## 🚀 Quick Start

### 1. Generate Certificates

**On Windows:**

```bash
scripts/generate-certificates.bat
```

**On macOS/Linux:**

```bash
chmod +x scripts/generate-certificates.sh
./scripts/generate-certificates.sh
```

### 2. Set Up GitHub Secrets

Add these secrets to your GitHub repository:

| Secret Name                      | Value                       | Description                          |
| -------------------------------- | --------------------------- | ------------------------------------ |
| `SM_CODE_SIGNING_CERT_SHA1_HASH` | `[SHA1 from script output]` | SHA1 hash of Windows certificate     |
| `WINDOWS_PFX_PASSWORD`           | `codex123`                  | Password for Windows PFX file        |
| `APPLE_ID`                       | `[your-apple-id]`           | Apple ID for notarization (optional) |
| `APPLE_PASSWORD`                 | `[app-specific-password]`   | App-specific password (optional)     |
| `APPLE_TEAM_ID`                  | `[your-team-id]`            | Apple Developer Team ID (optional)   |

### 3. Import Certificates

#### Windows

The PFX file is automatically used by the build process.

#### macOS

```bash
# Import the certificate into Keychain
sudo security import certificates/codex-macos-cert.pem -k /Library/Keychains/System.keychain -T /usr/bin/codesign

# Import the private key
sudo security import certificates/codex-macos-key.pem -k /Library/Keychains/System.keychain -T /usr/bin/codesign

# Trust the certificate
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain certificates/ca-cert.pem
```

#### Linux

```bash
# Copy certificates to system location
sudo cp certificates/codex-linux-cert.pem /usr/local/share/ca-certificates/
sudo cp certificates/ca-cert.pem /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

## 📋 What Changed

### Build Configuration

- **Removed** `E2E_TEST_BUILD` (test mode)
- **Added** `NODE_ENV=production` for proper production builds
- **Updated** forge config to use self-signed certificates

### Certificate Types Generated

- **Windows**: PFX format with SHA1 signing
- **macOS**: PEM format for code signing
- **Linux**: PEM format for package signing
- **CA**: Certificate Authority for self-signing

## ⚠️ Important Notes

### Security Warnings

- **Self-signed certificates** will show security warnings to users
- Users need to **"Run anyway"** or add security exceptions
- This is normal for self-signed certificates

### Production vs Development

- **Development**: No code signing (faster builds)
- **Production**: Self-signed certificates (reduced warnings)

### Notarization (macOS)

- **Self-signed apps** cannot be notarized by Apple
- Users will see "unidentified developer" warnings
- This is expected behavior for self-signed certificates

## 🔧 Troubleshooting

### Certificate Not Found

```bash
# Check if certificate exists
security find-identity -v -p codesigning
```

### Permission Denied

```bash
# Fix certificate permissions
sudo chmod 644 certificates/*.pem
sudo chmod 600 certificates/*-key.pem
```

### Build Failures

- Ensure all GitHub secrets are set correctly
- Check certificate paths in forge.config.ts
- Verify OpenSSL is installed on your system

## 🎯 Next Steps

1. **Run the certificate generation script**
2. **Add GitHub secrets** with the generated values
3. **Test the build** with the new configuration
4. **Consider upgrading** to trusted CA certificates for production

## 💡 Pro Tips

- **Keep certificates secure** - don't commit them to git
- **Backup certificates** - you'll need them for future builds
- **Monitor expiration** - certificates expire in 10 years
- **Consider trusted CAs** - for better user experience

---

**Need help?** Check the [Electron Forge documentation](https://www.electronforge.io/guides/code-signing) for more details.
