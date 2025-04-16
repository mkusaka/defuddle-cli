#!/usr/bin/env node

import { Command } from 'commander';
import { JSDOM } from 'jsdom';
import { Defuddle } from 'defuddle/node';
import chalk from 'chalk';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Sitemapper from 'sitemapper';
import { dump as yamlDump } from 'js-yaml';
import pRetry from 'p-retry';

interface ParseOptions {
	output?: string;
	markdown?: boolean;
	md?: boolean;
	json?: boolean;
	debug?: boolean;
	property?: string;
}

interface SitemapOptions {
	output?: string;
	json?: boolean;
	debug?: boolean;
}

interface SitemapExtractOptions {
	output?: string;
	debug?: boolean;
	continue?: boolean;
	retries?: string;
	retryDelay?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
			let dom: JSDOM;

			try {
				// Determine if source is a URL or file path
				if (source.startsWith('http://') || source.startsWith('https://')) {
					dom = await JSDOM.fromURL(source);
				} else {
					const filePath = resolve(process.cwd(), source);
					dom = await JSDOM.fromFile(filePath);
				}

				// Parse content with debug mode if enabled
				try {
					const result = await Defuddle(dom, source.startsWith('http') ? source : undefined, {
						debug: options.debug,
						markdown: options.markdown
					});

					// If in debug mode, don't show content output
					if (options.debug) {
						process.exit(0);
					}

					// Format output
					let output: string;

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

						output = JSON.stringify(jsonObj, null, 2)
							.replace(/"([^"]+)":/g, chalk.cyan('"$1":'))
							.replace(/: "([^"]+)"/g, chalk.yellow(': "$1"'))
							.replace(/: (\d+)/g, chalk.yellow(': $1'))
							.replace(/: (true|false|null)/g, chalk.magenta(': $1'));
					} else {
						output = result.content;
					}

					// Handle output
					if (options.output) {
						const outputPath = resolve(process.cwd(), options.output);
						await writeFile(outputPath, output, 'utf-8');
						console.log(chalk.green(`Output written to ${options.output}`));
					} else {
						console.log(output);
					}
					
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

program
	.command('sitemap')
	.description('Extract URLs from a sitemap')
	.argument('<url>', 'Sitemap URL to fetch URLs from')
	.option('-o, --output <file>', 'Output file path (default: stdout)')
	.option('-j, --json', 'Output as JSON with URLs')
	.option('--debug', 'Enable debug mode')
	.action(async (url: string, options: SitemapOptions) => {
		try {
			if (options.debug) {
				console.log(chalk.blue('Debug mode enabled'));
				console.log(chalk.blue(`Fetching sitemap from: ${url}`));
			}

			const sitemap = new Sitemapper({});
			
			try {
				const { sites } = await sitemap.fetch(url);
				
				// Format output
				let output: string;
				
				if (options.json) {
					const jsonObj = { 
						sitemapUrl: url,
						urls: sites,
						count: sites.length
					};
					
					output = JSON.stringify(jsonObj, null, 2)
						.replace(/"([^"]+)":/g, chalk.cyan('"$1":'))
						.replace(/: "([^"]+)"/g, chalk.yellow(': "$1"'))
						.replace(/: (\d+)/g, chalk.yellow(': $1'));
				} else {
					// Default text output - one URL per line
					output = sites.join('\n');
				}
				
				// Handle output
				if (options.output) {
					const outputPath = resolve(process.cwd(), options.output);
					await writeFile(outputPath, output, 'utf-8');
					console.log(chalk.green(`Output written to ${options.output}`));
				} else {
					console.log(output);
				}
				
				process.exit(0);
			} catch (error) {
				console.error(chalk.red('Error fetching sitemap:'), error instanceof Error ? error.message : 'Unknown error occurred');
				process.exit(1);
			}
		} catch (error) {
			console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
			process.exit(1);
		}
	});

function urlToFilename(url: string): string {
	const urlObj = new URL(url);
	let filename = urlObj.pathname.replace(/^\//, '').replace(/\//g, '-');
	if (!filename) filename = 'index';
	if (!filename.endsWith('.md')) filename += '.md';
	return filename;
}

program
	.command('sitemap-extract')
	.description('Extract content from URLs in a sitemap and save as markdown files with YAML frontmatter')
	.argument('<url>', 'Sitemap URL to fetch URLs from')
	.argument('<output-dir>', 'Directory to save extracted markdown files')
	.option('--debug', 'Enable debug mode')
	.option('--continue', 'Continue processing even if an URL fails')
	.option('-r, --retries <number>', 'Number of retry attempts for failed URLs', '10')
	.option('-d, --retry-delay <number>', 'Initial delay between retries in milliseconds', '1000')
	.action(async (url: string, outputDir: string, options: SitemapExtractOptions) => {
		try {
			if (options.debug) {
				console.log(chalk.blue('Debug mode enabled'));
				console.log(chalk.blue(`Fetching sitemap from: ${url}`));
			}

			const sitemap = new Sitemapper({});
			
			try {
				const { mkdir } = await import('fs/promises');
				const outputPath = resolve(process.cwd(), outputDir);
				await mkdir(outputPath, { recursive: true });
				
				const { sites } = await sitemap.fetch(url);
				console.log(chalk.green(`Found ${sites.length} URLs in sitemap`));
				
				for (let i = 0; i < sites.length; i++) {
					const siteUrl = sites[i];
					console.log(chalk.blue(`Processing ${i+1}/${sites.length}: ${siteUrl}`));
					
					try {
						await pRetry(async () => {
							console.log(chalk.blue(`Processing URL: ${siteUrl}`));
							
							const dom = await JSDOM.fromURL(siteUrl);
							const result = await Defuddle(dom, siteUrl, {
								debug: options.debug,
								markdown: true
							});
							
							const metadata = {
								title: result.title,
								description: result.description,
								domain: result.domain,
								favicon: result.favicon,
								image: result.image,
								published: result.published,
								author: result.author,
								site: result.site,
								url: siteUrl,
								wordCount: result.wordCount
							};
							
							const yamlFrontmatter = yamlDump(metadata);
							const content = `---\n${yamlFrontmatter}---\n\n${result.content}`;
							
							const filename = urlToFilename(siteUrl);
							const filePath = resolve(outputPath, filename);
							
							await writeFile(filePath, content, 'utf-8');
							console.log(chalk.green(`Saved to ${filePath}`));
						}, {
							retries: parseInt(options.retries || '10'),
							factor: 2, // Exponential factor (2 means delay doubles each time)
							minTimeout: parseInt(options.retryDelay || '1000'), // Initial delay
							maxTimeout: 60000, // Maximum delay of 60 seconds
							onFailedAttempt: error => {
								const retryCount = error.attemptNumber;
								const maxRetries = parseInt(options.retries || '10');
								const nextRetryDelay = Math.min(
									parseInt(options.retryDelay || '1000') * Math.pow(2, retryCount - 1),
									60000
								);
								console.log(chalk.yellow(`Attempt ${retryCount}/${maxRetries} failed for ${siteUrl}: ${error.message}`));
								console.log(chalk.yellow(`Next retry in ${nextRetryDelay}ms with exponential backoff`));
							}
						});
					} catch (error) {
						console.error(chalk.red(`Error processing ${siteUrl} after all retry attempts:`), 
							error instanceof Error ? error.message : 'Unknown error occurred');
						if (!options.continue) {
							console.error(chalk.red('Stopping due to error. Use --continue to process despite errors.'));
							process.exit(1);
						}
					}
				}
				
				console.log(chalk.green(`Completed processing ${sites.length} URLs from sitemap`));
				process.exit(0);
			} catch (error) {
				console.error(chalk.red('Error fetching sitemap:'), error instanceof Error ? error.message : 'Unknown error occurred');
				process.exit(1);
			}
		} catch (error) {
			console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
			process.exit(1);
		}
	});

program.parse();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                