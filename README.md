# Gator

Gator is a command-line RSS feed aggregator written in TypeScript. Register
users, add RSS feeds, follow the ones you like, and let a background process
collect their posts into PostgreSQL so you can browse them from the terminal.

## Requirements

- [Node.js](https://nodejs.org/) (see `.nvmrc` for the version used in development)
- [PostgreSQL](https://www.postgresql.org/) 14 or newer, running and reachable

## Installation

```bash
git clone <this-repo-url> gator
cd gator
npm install
```

## Database setup

1. Create a database:

   ```bash
   createdb gator
   ```

2. Create the config file (next section) with your connection string.
3. Apply the migrations:

   ```bash
   npx drizzle-kit migrate
   ```

## Configuration

Gator reads `~/.gatorconfig.json` (in your home directory). Create it with:

```json
{
  "db_url": "postgres://USER:PASSWORD@localhost:5432/gator?sslmode=disable"
}
```

`current_user_name` is added automatically when you `register` or `login`.
An example is provided in [gatorconfig.json](gatorconfig.json).

## Usage

Run commands with:

```bash
npm start -- <command> [args...]
```

| Command | Description |
| --- | --- |
| `register <name>` | Create a user and log in as them |
| `login <name>` | Switch to an existing user |
| `users` | List all users (the current one is marked) |
| `addfeed <name> <url>` | Add a feed and follow it *(requires login)* |
| `feeds` | List all feeds and who added them |
| `follow <url>` | Follow an existing feed *(requires login)* |
| `following` | List feeds you follow *(requires login)* |
| `unfollow <url>` | Stop following a feed *(requires login)* |
| `agg <interval>` | Continuously fetch feeds, e.g. `agg 1m` |
| `browse [limit]` | Show the latest posts from feeds you follow (default 2) *(requires login)* |
| `reset` | **Delete all users** (and, by cascade, their data) |

### Example session

```bash
npm start -- register alice
npm start -- addfeed "Hacker News" https://hnrss.org/newest
npm start -- addfeed "Lane's Blog" https://www.wagslane.dev/index.xml

# In a second terminal, leave the aggregator running (Ctrl+C to stop):
npm start -- agg 1m

# Back in the first terminal:
npm start -- browse 10
```

### About `agg`

`agg` takes a duration such as `500ms`, `30s`, `1m` or `1h` and fetches one
feed per interval, always the least-recently fetched first. Each request is
logged. To be polite to feed servers the minimum interval is `1s`; prefer
`30s` or more when following many feeds.

Items need only a title and link; missing descriptions and unparseable dates
are stored as empty. Posts are de-duplicated by URL. Only RSS 2.0 feeds are
supported (Atom feeds are not).

## Development

- Schema: [src/lib/db/schema.ts](src/lib/db/schema.ts). After changing it, run
  `npx drizzle-kit generate` and then `npx drizzle-kit migrate`.
- Commands live in [src/commands/](src/commands/); commands that need a
  logged-in user are wrapped with `middlewareLoggedIn` in
  [src/index.ts](src/index.ts).
