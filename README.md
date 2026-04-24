# envsnap

> CLI tool to snapshot, diff, and restore environment variable sets across projects

## Installation

```bash
npm install -g envsnap
```

## Usage

```bash
# Save a snapshot of your current environment
envsnap save my-snapshot

# List all saved snapshots
envsnap list

# Diff two snapshots
envsnap diff my-snapshot production-snapshot

# Restore a snapshot
envsnap restore my-snapshot
```

Snapshots are stored locally in `~/.envsnap/` and can be scoped per project using the `--project` flag:

```bash
envsnap save staging --project my-app
envsnap restore staging --project my-app
```

## Configuration

`envsnap` reads from a `.envsnaprc` file in your project root or home directory for default settings such as storage path and ignored keys.

```json
{
  "storagePath": "~/.envsnap",
  "ignore": ["AWS_SECRET_ACCESS_KEY", "PRIVATE_KEY"]
}
```

## Requirements

- Node.js >= 16
- TypeScript >= 5.0 (for contributors)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)