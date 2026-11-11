# SOHO VAPE POS — HWID License Publishing

Copy `.github/`, `licenses/`, and `scripts/` into the root of `alielhaddad/VAPEPOINT-POS`.
Then add the GitHub Actions secret `LICENSE_SIGNING_PRIVATE_KEY` using the private PEM supplied
separately. See [README-HWID-LICENSING.md](README-HWID-LICENSING.md) for device enrollment,
blocking, expiry, and security instructions.

The committed `licenses/manifest.json` is a valid signed empty registry. The workflow will
regenerate it whenever `licenses/registry.json` changes on `main`.
