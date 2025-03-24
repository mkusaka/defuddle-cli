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
defuddle parse https://example.com/article --markdown
# or using the short alias
defuddle parse https://example.com/article --md
```

Parse and get both HTML and markdown in JSON:
```bash
defuddle parse article.html -j
# or using the long form
defuddle parse article.html --json
```

Save markdown output to a file:
```bash
defuddle parse article.html --markdown -o output.md
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
