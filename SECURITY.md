# Security Policy

## Supported Versions

Coded is pre-1.0 software. Security fixes target the `main` branch and the live deployment at `https://vrtxomega.github.io/coded/`.

## Reporting a Vulnerability

Do not open public issues for suspected vulnerabilities.

Report security concerns by emailing `VrtxOmega@pm.me` with:

- affected URL, endpoint, or file path
- steps to reproduce
- expected impact
- any logs or proof of concept that can be shared safely

Expected response time is 72 hours. Confirmed issues are prioritized by exploitability, data exposure risk, and deployment impact.

## Secrets

Never commit API keys, GitHub tokens, OAuth client secrets, admin tokens, private keys, production databases, or `.env` files. Backend-only secrets must stay on the API host or in the hosting provider secret store.
