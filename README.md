# Agent Wallet Dashboard

Local Next.js dashboard for visualizing an agent host wallet using the same files and field names as `agent-wallet`.

## Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS v4
- shadcn/ui core components (`new-york` style, `neutral` base)

## What It Reads

By default, the dashboard reads:

- `~/.zbd-wallet/config.json`
- `~/.zbd-wallet/payments.json`

These paths can be overridden at runtime:

- `ZBD_WALLET_CONFIG`
- `ZBD_WALLET_PAYMENTS`

Optional live balance call:

- Uses `apiKey` from `config.json`
- Calls `${ZBD_API_BASE_URL:-https://api.zbdpay.com}/v0/wallet`

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Use Sample Data

The repo includes local sample files in `sample-data/`.

```bash
ZBD_WALLET_CONFIG="$PWD/sample-data/config.json" \
ZBD_WALLET_PAYMENTS="$PWD/sample-data/payments.json" \
npm run dev
```

## Notes

- JSON compatibility follows the `agent-wallet` schema (`id`, `type`, `amount_sats`, `status`, `timestamp`, `fee_sats`, `preimage`).
- The dashboard is read-only. It does not mutate wallet files.
