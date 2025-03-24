# Defuddle CLI

Command line interface for [Defuddle](https://github.com/kepano/defuddle). Extract clean HTML or Markdown from pages.

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
- `-m, --markdown, --md`: Convert content to markdown
- `-j, --json`: Output as JSON with both HTML and markdown content
- `--debug`: Enable debug mode
- `-h, --help`: Display help for command

### Examples

Parse a local HTML file (outputs HTML):
```bash
defuddle parse article.html
```

Parse a URL and convert to markdown:
```bash
defuddle parse https://example.com/article --md
```

Parse and get the full JSON response from Defuddle:
```bash
defuddle parse article.html --json
```

Save markdown output to a file:
```bash
defuddle parse article.html --md -o output.md
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
