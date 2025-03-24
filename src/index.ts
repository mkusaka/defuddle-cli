#!/usr/bin/env node

import { Command } from 'commander';
import { JSDOM } from 'jsdom';
import { Defuddle } from 'defuddle';
import chalk from 'chalk';
import ora from 'ora';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

interface ParseOptions {
  output?: string;
  format?: 'html' | 'json';
  debug?: boolean;
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
  .option('-f, --format <format>', 'Output format (html, json)', 'html')
  .option('--debug', 'Enable debug mode')
  .action(async (source: string, options: ParseOptions) => {
    try {
      const spinner = ora('Parsing content...').start();
      let html: string;

      // Determine if source is a URL or file path
      if (source.startsWith('http://') || source.startsWith('https://')) {
        const response = await fetch(source);
        html = await response.text();
      } else {
        const filePath = resolve(process.cwd(), source);
        html = await readFile(filePath, 'utf-8');
      }

      // Create virtual DOM
      const dom = new JSDOM(html, {
        url: source.startsWith('http') ? source : undefined,
        runScripts: 'outside-only',
        resources: 'usable'
      });

      // Parse content
      const defuddle = new Defuddle(dom.window.document, { debug: options.debug });
      const result = defuddle.parse();

      spinner.succeed('Content parsed successfully');

      // Format output
      let output: string;
      if (options.format === 'json') {
        output = JSON.stringify(result, null, 2);
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

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error occurred');
      process.exit(1);
    }
  });

program.parse(); 