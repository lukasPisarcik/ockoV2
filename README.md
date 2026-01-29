# Ocko v2

A score tracking helper for the Ocko dice game - modernized version with new features.

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (runes)
- **Runtime**: Bun
- **Database**: Convex
- **Components**: shadcn-svelte
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **Logging**: Pino

## Features

- Create games with custom bank and players
- Quick value adjustments (+1, -1, +5, -5)
- Manual score editing by clicking on the value
- Game history
- Statistics and charts (cumulative results, win/loss ratio)
- Internationalization (English & Slovak)
- Dark/Light/System theme support
- Multi-device sync (Convex - coming soon)

## Getting Started

### Requirements

- [Bun](https://bun.sh/) >= 1.0

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

The app runs at `http://localhost:41902`

### Other Commands

```bash
# Type check
bun run check

# Format code
bun run format

# Build for production
bun run build
```

## Project Structure

```
src/
├── lib/
│   ├── schemas/           # Zod schemas
│   ├── stores/            # Svelte 5 class-based stores
│   ├── components/        # Svelte components
│   │   └── ui/            # shadcn-svelte UI components
│   ├── i18n/              # Internationalization
│   ├── server/            # Server-only code
│   └── utils/             # Utility functions
├── routes/
│   ├── +layout.svelte     # Main layout with navigation
│   ├── +page.svelte       # Home page
│   ├── game/              # Game page
│   ├── history/           # Game history
│   ├── stats/             # Statistics
│   └── about/             # About page
└── convex/
    ├── schema.ts          # Convex schema
    ├── games.ts           # Game mutations/queries
    ├── players.ts         # Player mutations/queries
    └── users.ts           # User mutations/queries
```

## Conventions

The project follows conventions defined in `.cursor/rules/`:

- Zod validation with `safeParse`
- Svelte 5 class-based stores with `$state` rune
- Structured logging with `initId`
- Barrel files for exports
- `$lib` alias for imports

## Author

Lukas Pisarcik

## License

All rights reserved.
