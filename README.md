# Defuddle CLI

Command line interface for [Defuddle](https://github.com/kepano/defuddle). Extract clean HTML or Markdown from pages.

## Installation

```bash
npm install -g defuddle-cli
```

## Usage

```bash
defuddle parse <source> [options]
```

```bash
defuddle sitemap <url> [options]
```

### Arguments

- `source`: HTML file path or URL to parse

### Options

- `-o, --output <file>`: Output file path (default: stdout)
- `-m, --markdown, --md`: Convert content to markdown
- `-j, --json`: Output as JSON with both HTML and markdown content
- `-p, --property <name>`: Extract a specific property (e.g., title, description, domain)
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

Extract specific properties:
```bash
# Get just the title
defuddle parse article.html --property title

# Get the description
defuddle parse article.html -p description

# Get the domain
defuddle parse article.html --property domain
```

### Sitemap command

Options:
- `-o, --output <file>`: Output file path (default: stdout)
- `-j, --json`: Output as JSON with URLs and count
- `--debug`: Enable debug mode
- `-h, --help`: Display help for command
- `-l, --rate-limit <number>`: Maximum number of requests per second (0 to disable, default: 1)

Examples:

Extract URLs from a sitemap:
```bash
defuddle sitemap https://example.com/sitemap.xml
```

Save URLs to a file:
```bash
defuddle sitemap https://example.com/sitemap.xml -o urls.txt
```

Get URLs as JSON:
```bash
defuddle sitemap https://example.com/sitemap.xml --json
```

### Sitemap-extract command

Options:
- `--debug`: Enable debug mode
- `--continue`: Continue processing even if an URL fails
- `-r, --retries <number>`: Number of retry attempts for failed URLs (default: 10)
- `-d, --retry-delay <number>`: Initial delay between retries in milliseconds (default: 1000)
- `-l, --rate-limit <number>`: Maximum number of requests per second (0 to disable, default: 1)

Example:
```bash
defuddle sitemap-extract https://example.com/sitemap.xml ./output-dir --rate-limit 2
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
