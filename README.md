# repost-adapter-wilddream

WildDream Repost Adapter for building custom adapters for [`@snowball-bot/repost-adapter`](https://www.npmjs.com/package/@snowball-bot/repost-adapter).

## Quick Start

```bash
# Install dependencies
pnpm install

# Verify everything works
pnpm test
pnpm build
```

## Project structure

```
src/index.ts        — your adapter logic
test/               — unit tests with a mock context
.github/workflows/  — CI and release automation
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Build in watch mode |
| `pnpm build` | Build for production |
| `pnpm test` | Run tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm lint` | Lint source files |
| `pnpm typecheck` | Type-check without emitting |

## Publishing

1. Set `NPM_TOKEN` in your repo secrets (Settings → Secrets → Actions)
2. Update `version` in `package.json`
3. Create and push a tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The release workflow will publish to npm automatically.

## Local development with mock host

You can test your adapter without setting up the core project:

```bash
# Copy env template and fill in any credentials your adapter needs
cp .env.example .env
# Edit .env

# Run the playground (edit `dev/playground.ts` to set test URLs)
pnpm dev:play
```

The mock host in `dev/harness.ts` simulates what the real core does:
it builds an `AdapterContext`, calls `initState`, and triggers your
`onRepostRequest` handler. Use it to quickly iterate before integrating
with a real core deployment.

## Contract reference

See [`@snowball-bot/repost-adapter`](https://www.npmjs.com/package/@snowball-bot/repost-adapter) for the full API reference.

## License

MIT
