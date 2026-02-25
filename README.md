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

## Built-in Features

- Auto-refresh every 15 seconds (plus a manual `Refresh now` button).
- CSV export from the Payments Ledger for the active filter (`All`, `Received`, or `Sent`).

## Test Checklist

1. Start with sample data:

```bash
ZBD_WALLET_CONFIG="$PWD/sample-data/config.json" \
ZBD_WALLET_PAYMENTS="$PWD/sample-data/payments.json" \
npm run dev
```

2. Open `http://localhost:3000` and confirm:
   - Header shows `Auto-refresh 15s`.
   - `Last sync` time updates automatically every ~15 seconds.
   - `Refresh now` triggers immediate sync and spin animation.

3. CSV export checks:
   - In Payments Ledger, choose `All` and click `Export CSV`.
   - Repeat for `Received` and `Sent`.
   - Confirm downloaded filenames include the active filter.
   - Open each file and verify row count matches the table filter.

4. Live-balance behavior checks:
   - With invalid/missing `apiKey`, confirm wallet section shows a balance diagnostic.
   - With a valid key in your config, confirm live balance appears and updates on refresh.
