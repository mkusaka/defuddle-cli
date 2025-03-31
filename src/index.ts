#!/usr/bin/env node

import { Command } from 'commander';
import { JSDOM, VirtualConsole, DOMWindow } from 'jsdom';
import Defuddle from 'defuddle';
import chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createMarkdownContent } from './markdown.js';
import { setupDOMInterfaces } from './dom/setup.js';
import { setupRange } from './dom/range.js';
import { setupDocumentMethods, setupWindowMethods } from './dom/document.js';
import { setupElements } from './dom/elements.js';

interface ParseOptions {
	output?: string;
	markdown?: boolean;
	md?: boolean;
	json?: boolean;
	debug?: boolean;
	property?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a virtual console
const virtualConsole = new VirtualConsole();

// Create a virtual DOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
	virtualConsole,
	runScripts: 'dangerously',
	resources: 'usable',
	pretendToBeVisual: true,
	beforeParse(window: DOMWindow) {
		setupDOMInterfaces(window);
		setupRange(window);
		setupDocumentMethods(window);
		setupWindowMethods(window);
		setupElements(window);
	}
});

// Get the window object
const window = dom.window;

const program = new Command();

program
	.name('defuddle')
	.description('Extract article content from web pages')
	.version('0.1.0');

program
	.command('parse')
	.description('Parse HTML content from a file or URL')
	.argument('<source>', 'HTML file path or URL to parse')
	.option('-o, --output <file>', 'Output file path (default: stdout)')
	.option('-m, --markdown', 'Convert content to markdown format')
	.option('--md', 'Alias for --markdown')
	.option('-j, --json', 'Output as JSON with metadata and content')
	.option('-p, --property <name>', 'Extract a specific property (e.g., title, description, domain)')
	.option('--debug', 'Enable debug mode')
	.action(async (source: string, options: ParseOptions) => {
		try {
			// Handle --md alias
			if (options.md) {
				options.markdown = true;
			}
			let html: string;

			try {
				// Determine if source is a URL or file path
				if (source.startsWith('http://') || source.startsWith('https://')) {
					const response = await fetch(source);
					html = await response.text();
				} else {
					const filePath = resolve(process.cwd(), source);
					html = await readFile(filePath, 'utf-8');
				}

				// Create a new JSDOM instance with the HTML content
				const contentDom = new JSDOM(html, {
					virtualConsole,
					runScripts: 'dangerously',
					resources: 'usable',
					pretendToBeVisual: true,
					url: source.startsWith('http') ? source : undefined,
					beforeParse(window: DOMWindow) {
						try {
							setupDOMInterfaces(window);
							setupRange(window);
							setupDocumentMethods(window);
							setupWindowMethods(window);
							setupElements(window);
						} catch (error) {
							console.error('Error setting up DOM interfaces:', error);
						}
					}
				});

				// Initialize document properties
				const doc = contentDom.window.document;
				
				// Ensure document has required properties
				if (!doc.documentElement) {
					throw new Error('Document has no root element');
				}

				// Set up document properties
				try {
					doc.documentElement.style.cssText = '';
					doc.documentElement.className = '';
				} catch (error) {
					console.warn('Warning: Could not set document element properties:', error);
				}
				
				// Ensure body exists and is properly set up
				if (!doc.body) {
					const body = doc.createElement('body');
					doc.documentElement.appendChild(body);
				}
				try {
					doc.body.style.cssText = '';
					doc.body.className = '';
				} catch (error) {
					console.warn('Warning: Could not set body properties:', error);
				}

				// Set up viewport and ensure head exists
				if (!doc.head) {
					const head = doc.createElement('head');
					doc.documentElement.insertBefore(head, doc.body);
				}

				// Add viewport meta tag
				try {
					const viewport = doc.createElement('meta');
					viewport.setAttribute('name', 'viewport');
					viewport.setAttribute('content', 'width=device-width, initial-scale=1');
					doc.head.appendChild(viewport);
				} catch (error) {
					console.warn('Warning: Could not add viewport meta tag:', error);
				}

				// Add a base style element for mobile styles
				try {
					const style = doc.createElement('style');
					style.textContent = `
						@media (max-width: 768px) {
							body { width: 100%; }
						}
					`;
					doc.head.appendChild(style);
				} catch (error) {
					console.warn('Warning: Could not add style element:', error);
				}

				// Parse content with debug mode if enabled
				try {
					// @ts-ignore - Module interop issue between ES modules and CommonJS
					const defuddle = new Defuddle(doc, { 
						debug: options.debug,
						...(source.startsWith('http') ? { url: source } : {})
					});
					
					const result = await defuddle.parse();

					// If in debug mode, don't show content output
					if (options.debug) {
						process.exit(0);
					}

					// Format output
					let output: string;
					let content: string;
					let contentMarkdown: string | undefined;

					// Convert content to markdown if requested
					if (options.markdown || options.json) {
						contentMarkdown = createMarkdownContent(result.content, source);
					}

					// Format the response based on options
					if (options.property) {
						// Extract specific property
						const property = options.property.toLowerCase();
						if (property in result) {
							output = result[property as keyof typeof result]?.toString() || '';
						} else {
							console.error(chalk.red(`Error: Property "${property}" not found in response`));
							process.exit(1);
						}
					} else if (options.json) {
						const jsonObj: any = { 
							content: result.content,
							title: result.title,
							description: result.description,
							domain: result.domain,
							favicon: result.favicon,
							image: result.image,
							parseTime: result.parseTime,
							published: result.published,
							author: result.author,
							site: result.site,
							schemaOrgData: result.schemaOrgData,
							wordCount: result.wordCount
						};

						// Only include markdown content if markdown flag is set
						if (options.markdown) {
							jsonObj.contentMarkdown = contentMarkdown;
						}

						output = JSON.stringify(jsonObj, null, 2)
							.replace(/"([^"]+)":/g, chalk.cyan('"$1":'))
							.replace(/: "([^"]+)"/g, chalk.yellow(': "$1"'))
							.replace(/: (\d+)/g, chalk.yellow(': $1'))
							.replace(/: (true|false|null)/g, chalk.magenta(': $1'));
					} else {
						output = options.markdown ? contentMarkdown! : result.content;
					}

					// Handle output
					if (options.output) {
						const outputPath = resolve(process.cwd(), options.output);
						await writeFile(outputPath, output, 'utf-8');
						console.log(chalk.green(`Output written to ${options.output}`));
					} else {
						console.log(output);
					}

					// Clean up JSDOM resources
					contentDom.window.close();
					dom.window.close();
					
					process.exit(0);
				} catch (error) {
					console.error(chalk.red('Error during parsing:'), error);
					process.exit(1);
				}
			} catch (error) {
				console.error(chalk.red('Error loading content:'), error instanceof Error ? error.message : 'Unknown error occurred');
				process.exit(1);
			}

		} catch (error) {
			console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
			process.exit(1);
		}
	});

program.parse(); 