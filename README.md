# Defuddle CLI

Command line interface for [Defuddle](https://github.com/kepano/defuddle) - extract article content from web pages.

## Installation

```bash
npm install -g @defuddle/cli
```

## Usage

```bash
defuddle parse <source> [options]
```

### Arguments

- `source`: HTML file path or URL to parse

### Options

- `-o, --output <file>`: Output file path (default: stdout)
- `-f, --format <format>`: Output format (html, json) (default: "html")
- `--debug`: Enable debug mode
- `-h, --help`: Display help for command

### Examples

Parse a local HTML file:
```bash
defuddle parse article.html
```

Parse a URL and save as JSON:
```bash
defuddle parse https://example.com/article -o output.json -f json
```

Parse with debug mode:
```bash
defuddle parse article.html --debug
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev
```

## License

MIT 