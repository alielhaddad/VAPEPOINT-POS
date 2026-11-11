# SOHO VAPE POS — GitHub HWID Licensing

This folder is designed to be copied into the repository:

`https://github.com/alielhaddad/VAPEPOINT-POS`

The desktop app fetches the public signed manifest from:

`https://raw.githubusercontent.com/alielhaddad/VAPEPOINT-POS/main/licenses/manifest.json`

The default branch must therefore be `main`, and the repository (or at least the manifest URL) must be publicly readable. Do not put customer names, phone numbers, addresses, passwords, or other personal information in this registry. It contains only a license ID, a shop label if desired, a one-way device hash, status, and optional expiry.

## 1. Copy these files into the repository root

- `.github/workflows/publish-license-manifest.yml`
- `licenses/registry.json`
- `scripts/sign-license-manifest.cjs`

## 2. Add the signing private key as a GitHub Actions secret

1. Open the repository on GitHub.
2. Go to **Settings → Secrets and variables → Actions**.
3. Choose **New repository secret**.
4. Name: `LICENSE_SIGNING_PRIVATE_KEY`.
5. Paste the full contents of the separately supplied `LICENSE_SIGNING_PRIVATE_KEY.pem`, including the BEGIN/END lines.
6. Save it.

Never commit the private PEM into the repository, the application, a public issue, or a release. The desktop program contains only the matching public key. GitHub Actions uses the private key to sign the manifest; the app verifies that signature before trusting license entries.

## 3. Add a customer's device code

Open SOHO VAPE POS on the customer's PC. The activation screen shows **DEVICE HWID CODE**. Copy that 64-character hexadecimal code.

Edit `licenses/registry.json`:

```json
{
  "schema": 1,
  "licenses": [
    {
      "licenseId": "SOHO-0001",
      "shopName": "Customer Shop 1",
      "hwidHash": "PASTE_THE_64_CHARACTER_DEVICE_CODE_HERE",
      "status": "active",
      "expiresAt": null
    }
  ]
}
```

Commit and push to `main`. The GitHub Action signs `licenses/manifest.json` automatically. Once the Action succeeds, the customer opens the activation window and presses **Retry License Check**. The signed manifest is publicly readable, but cannot be altered to add fake licenses without the private signing key.

## 4. Block, re-enable, or expire a device

- Block: change its `status` to `blocked`.
- Re-enable: change its `status` to `active`.
- Permanent license: `"expiresAt": null`.
- Time-limited license: `"expiresAt": "2027-12-31"`.

Commit and push. The app applies revocations on the next successful online check. It allows a previously verified signed license to work offline for up to 72 hours after the last successful online check. This avoids locking out a shop during a short Internet outage, but means a newly blocked device may remain usable until the grace period expires if it stays offline.

## 5. GitHub Actions requirements

In **Settings → Actions → General**, allow GitHub Actions to run. The workflow needs `contents: write` to publish `manifest.json`. If the `main` branch has rules that block workflow pushes, allow GitHub Actions to write or adjust the workflow to open a pull request instead.

## 6. Important HWID caveat

The device identifier is based on Windows `MachineGuid` via `node-machine-id`, then SHA-256 hashed and namespaced for SOHO VAPE. It is a Windows-installation identifier, not a motherboard serial. Reinstalling Windows can change it, and cloning a Windows image may copy it. This is suitable for basic single-PC licensing, not high-assurance anti-tamper DRM. A determined person with control of the PC can patch a desktop app. For stronger commercial control, use a dedicated HTTPS license API, short-lived signed leases, server-side account management, code signing, and an auditable activation/deactivation portal.
