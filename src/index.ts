#!/usr/bin/env node

import { Command } from 'commander';
import { JSDOM, VirtualConsole, DOMWindow } from 'jsdom';
import pkg from 'defuddle';
const { Defuddle } = pkg;
import chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createMarkdownContent } from './markdown.js';
import { setupDOMInterfaces } from './dom/interfaces/setup.js';
import { setupRange } from './dom/interfaces/range.js';
import { setupDocumentMethods, setupWindowMethods } from './dom/interfaces/document.js';

interface DOMSettableTokenList {
	length: number;
	value: string;
	add(token: string): void;
	contains(token: string): boolean;
	item(index: number): string | null;
	remove(token: string): void;
	replace(oldToken: string, newToken: string): boolean;
	supports(token: string): boolean;
	toggle(token: string, force?: boolean): boolean;
	[Symbol.iterator](): Iterator<string>;
}

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

// Define CSS interfaces globally first
(globalThis as any).CSSRule = class {
	readonly type: number = 1;
	cssText: string;
	parentRule: any;
	parentStyleSheet: any;

	constructor(type?: number) {
		if (type !== undefined) {
			Object.defineProperty(this, 'type', { value: type });
		}
		this.cssText = '';
		this.parentRule = null;
		this.parentStyleSheet = null;
	}
};

// Static properties
Object.defineProperties((globalThis as any).CSSRule, {
	STYLE_RULE: { value: 1, writable: false },
	CHARSET_RULE: { value: 2, writable: false },
	IMPORT_RULE: { value: 3, writable: false },
	MEDIA_RULE: { value: 4, writable: false },
	FONT_FACE_RULE: { value: 5, writable: false },
	PAGE_RULE: { value: 6, writable: false },
	KEYFRAMES_RULE: { value: 7, writable: false },
	KEYFRAME_RULE: { value: 8, writable: false },
	NAMESPACE_RULE: { value: 10, writable: false },
	COUNTER_STYLE_RULE: { value: 11, writable: false },
	SUPPORTS_RULE: { value: 12, writable: false },
	DOCUMENT_RULE: { value: 13, writable: false },
	FONT_FEATURE_VALUES_RULE: { value: 14, writable: false },
	VIEWPORT_RULE: { value: 15, writable: false },
	REGION_STYLE_RULE: { value: 16, writable: false }
});

(globalThis as any).CSSMediaRule = class extends (globalThis as any).CSSRule {
	media: MediaList;
	cssRules: CSSRuleList;
	conditionText: string = '';
	deleteRule: (index: number) => void = () => {};
	insertRule: (rule: string, index?: number) => number = () => 0;

	constructor() {
		super();
		Object.defineProperty(this, 'type', { value: 4 }); // CSSRule.MEDIA_RULE
		this.media = {
			length: 0,
			mediaText: '',
			item: () => null,
			appendMedium: () => {},
			deleteMedium: () => {},
			toString: () => '',
			[Symbol.iterator]: function*() { yield ''; return undefined; }
		};
		this.cssRules = {
			length: 0,
			item: () => null,
			[Symbol.iterator]: function*() {
				yield new (globalThis as any).CSSRule();
				return undefined;
			}
		};
	}
};

(globalThis as any).CSSStyleSheet = class {
	type: string = 'text/css';
	href: string | null = null;
	ownerNode: Element | ProcessingInstruction | null = null;
	parentStyleSheet: CSSStyleSheet | null = null;
	title: string | null = null;
	media: MediaList;
	disabled: boolean = false;
	cssRules: CSSRuleList;
	ownerRule: CSSRule | null = null;
	rules: CSSRuleList;
	addRule: (selector: string, style: string, index?: number) => number = () => 0;
	removeRule: (index?: number) => void = () => {};
	replace: (text: string) => Promise<CSSStyleSheet> = async () => this as unknown as CSSStyleSheet;
	replaceSync: (text: string) => void = () => {};

	constructor() {
		this.media = {
			length: 0,
			mediaText: '',
			item: () => null,
			appendMedium: () => {},
			deleteMedium: () => {},
			toString: () => '',
			[Symbol.iterator]: function*() { yield ''; return undefined; }
		};
		this.cssRules = {
			length: 0,
			item: () => null,
			[Symbol.iterator]: function*() {
				yield new (globalThis as any).CSSRule();
				return undefined;
			}
		};
		this.rules = this.cssRules;
	}

	insertRule(rule: string, index?: number): number {
		return 0;
	}

	deleteRule(index: number): void {}
};

// Define SVGElement globally
(globalThis as any).SVGElement = class {
	id: string = '';
	className: string = '';
	style: CSSStyleDeclaration = {
		cssText: '',
		length: 0,
		parentRule: null,
		getPropertyPriority: () => '',
		getPropertyValue: () => '',
		item: () => '',
		removeProperty: () => '',
		setProperty: () => '',
		[Symbol.iterator]: function*() { yield ''; return undefined; }
	} as unknown as CSSStyleDeclaration;
	ownerSVGElement: SVGElement | null = null;
	viewportElement: SVGElement | null = null;
	tagName: string = '';
	namespaceURI: string | null = null;
	prefix: string | null = null;
	localName: string = '';
	baseURI: string = '';
	textContent: string | null = '';
	innerHTML: string = '';
	outerHTML: string = '';
	hidden: boolean = false;
	slot: string = '';
	attributes: NamedNodeMap = {
		length: 0,
		getNamedItem: () => null,
		getNamedItemNS: () => null,
		item: () => null,
		removeNamedItem: () => null,
		removeNamedItemNS: () => null,
		setNamedItem: () => null,
		setNamedItemNS: () => null,
		[Symbol.iterator]: function*() { yield null; return undefined; }
	} as unknown as NamedNodeMap;
	childNodes: NodeListOf<ChildNode> = {
		length: 0,
		item: () => null,
		forEach: () => {},
		entries: function*() { yield [0, null]; return undefined; },
		keys: function*() { yield 0; return undefined; },
		values: function*() { yield null; return undefined; },
		[Symbol.iterator]: function*() { yield null; return undefined; }
	} as unknown as NodeListOf<ChildNode>;
	firstChild: ChildNode | null = null;
	lastChild: ChildNode | null = null;
	nextSibling: ChildNode | null = null;
	previousSibling: ChildNode | null = null;
	parentNode: Node & ParentNode | null = null;
	parentElement: HTMLElement | null = null;
	childElementCount: number = 0;
	firstElementChild: Element | null = null;
	lastElementChild: Element | null = null;
	nextElementSibling: Element | null = null;
	previousElementSibling: Element | null = null;
	children: HTMLCollection = {
		length: 0,
		item: () => null,
		namedItem: () => null,
		[Symbol.iterator]: function*() { yield null; return undefined; }
	} as unknown as HTMLCollection;

	constructor() {
		// Initialize any required properties
	}

	getAttribute(name: string): string | null {
		return null;
	}

	getAttributeNS(namespaceURI: string | null, localName: string): string | null {
		return null;
	}

	setAttribute(name: string, value: string): void {}

	setAttributeNS(namespaceURI: string | null, qualifiedName: string, value: string): void {}

	removeAttributeNS(namespaceURI: string | null, localName: string): void {}

	hasAttribute(name: string): boolean {
		return false;
	}

	hasAttributeNS(namespaceURI: string | null, localName: string): boolean {
		return false;
	}

	getBoundingClientRect(): DOMRect {
		return {
			top: 0,
			left: 0,
			bottom: 0,
			right: 0,
			width: 0,
			height: 0,
			x: 0,
			y: 0,
			toJSON: function() { return this; }
		};
	}

	getClientRects(): DOMRectList {
		return {
			length: 0,
			item: function() { return null; },
			[Symbol.iterator]: function*() {}
		} as DOMRectList;
	}

	getElementsByClassName(classNames: string): HTMLCollectionOf<Element> {
		return {
			length: 0,
			item: () => null,
			namedItem: () => null,
			[Symbol.iterator]: function*() { yield null; return undefined; }
		} as HTMLCollectionOf<Element>;
	}

	getElementsByTagName(qualifiedName: string): HTMLCollectionOf<Element> {
		return {
			length: 0,
			item: () => null,
			namedItem: () => null,
			[Symbol.iterator]: function*() { yield null; return undefined; }
		} as HTMLCollectionOf<Element>;
	}

	getElementsByTagNameNS(namespaceURI: string | null, localName: string): HTMLCollectionOf<Element> {
		return {
			length: 0,
			item: () => null,
			namedItem: () => null,
			[Symbol.iterator]: function*() { yield null; return undefined; }
		} as HTMLCollectionOf<Element>;
	}

	querySelector(selectors: string): Element | null {
		return null;
	}

	querySelectorAll(selectors: string): NodeListOf<Element> {
		return {
			length: 0,
			item: () => null,
			forEach: () => {},
			entries: function*() { yield [0, null]; return undefined; },
			keys: function*() { yield 0; return undefined; },
			values: function*() { yield null; return undefined; },
			[Symbol.iterator]: function*() { yield null; return undefined; }
		} as unknown as NodeListOf<Element>;
	}

	matches(selectors: string): boolean {
		return false;
	}

	closest(selectors: string): Element | null {
		return null;
	}

	contains(other: Node | null): boolean {
		return false;
	}

	append(...nodes: (Node | string)[]): void {}

	prepend(...nodes: (Node | string)[]): void {}

	after(...nodes: (Node | string)[]): void {}

	before(...nodes: (Node | string)[]): void {}

	replaceWith(...nodes: (Node | string)[]): void {}

	remove(): void {}

	insertAdjacentElement(where: InsertPosition, element: Element): Element | null {
		return null;
	}

	insertAdjacentText(where: InsertPosition, data: string): void {}

	insertAdjacentHTML(position: InsertPosition, text: string): void {}

	replaceChildren(...nodes: (Node | string)[]): void {}
};

// Define HTMLImageElement globally
(globalThis as any).HTMLImageElement = class {
	alt: string = '';
	src: string = '';
	srcset: string = '';
	sizes: string = '';
	crossOrigin: string | null = null;
	useMap: string = '';
	isMap: boolean = false;
	width: number = 0;
	height: number = 0;
	naturalWidth: number = 0;
	naturalHeight: number = 0;
	complete: boolean = false;
	name: string = '';
	lowsrc: string = '';
	align: string = '';
	hspace: number = 0;
	vspace: number = 0;
	longDesc: string = '';
	border: string = '';
	x: number = 0;
	y: number = 0;
	currentSrc: string = '';
	decoding: 'sync' | 'async' | 'auto' = 'auto';
	fetchPriority: 'high' | 'low' | 'auto' = 'auto';
	loading: 'eager' | 'lazy' = 'eager';
	referrerPolicy: string = '';

	constructor() {
		// Initialize any required properties
	}

	decode(): Promise<void> {
		return Promise.resolve();
	}
};

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
	}
});

// Get the window object
const window = dom.window;

// Add window to global scope
(globalThis as any).window = window;

// Add document to global scope
(globalThis as any).document = window.document;

// Add required DOM interfaces to global scope
(globalThis as any).Element = window.Element;
(globalThis as any).Node = window.Node;
(globalThis as any).NodeFilter = window.NodeFilter;
(globalThis as any).Range = window.Range;
(globalThis as any).DOMParser = window.DOMParser;
(globalThis as any).XMLSerializer = window.XMLSerializer;

// Handle navigator property
if (!globalThis.navigator || Object.getOwnPropertyDescriptor(globalThis, 'navigator')?.configurable) {
	Object.defineProperty(globalThis, 'navigator', {
		value: window.navigator,
		writable: false,
		configurable: true
	});
}

(globalThis as any).HTMLElement = window.HTMLElement;

// Define DOMSettableTokenList
(globalThis as any).DOMSettableTokenList = class {
	length: number = 0;
	value: string = '';
	add(token: string): void {}
	contains(token: string): boolean { return false; }
	item(index: number): string | null { return null; }
	remove(token: string): void {}
	replace(oldToken: string, newToken: string): boolean { return false; }
	supports(token: string): boolean { return false; }
	toggle(token: string, force?: boolean): boolean { return false; }
	[Symbol.iterator](): Iterator<string> {
		return function*() { yield ''; return undefined; }();
	}
};

// Define HTML element types
(globalThis as any).HTMLIFrameElement = class extends (globalThis as any).HTMLElement {
	constructor() {
		super();
	}
	align: string = '';
	allow: string = '';
	allowFullscreen: boolean = false;
	contentDocument: Document | null = null;
	contentWindow: Window | null = null;
	frameBorder: string = '';
	height: string = '';
	longDesc: string = '';
	marginHeight: string = '';
	marginWidth: string = '';
	name: string = '';
	referrerPolicy: string = '';
	sandbox: DOMSettableTokenList = {
		length: 0,
		value: '',
		add: () => {},
		contains: () => false,
		item: () => null,
		remove: () => {},
		replace: () => false,
		supports: () => false,
		toggle: () => false,
		[Symbol.iterator]: function*() { yield ''; return undefined; }
	} as unknown as DOMSettableTokenList;
	scrolling: string = '';
	src: string = '';
	srcdoc: string = '';
	width: string = '';
};

(globalThis as any).HTMLOListElement = class extends (globalThis as any).HTMLElement {
	constructor() {
		super();
	}
	type: string = '';
	compact: boolean = false;
	reversed: boolean = false;
	start: number = 0;
};

(globalThis as any).HTMLUListElement = class extends (globalThis as any).HTMLElement {
	constructor() {
		super();
	}
	type: string = '';
	compact: boolean = false;
};

(globalThis as any).HTMLTableElement = class extends (globalThis as any).HTMLElement {
	constructor() {
		super();
	}
	caption: HTMLTableCaptionElement | null = null;
	tHead: HTMLTableSectionElement | null = null;
	tFoot: HTMLTableSectionElement | null = null;
	tBodies: HTMLCollectionOf<HTMLTableSectionElement> = {
		length: 0,
		item: () => null,
		namedItem: () => null,
		[Symbol.iterator]: function*() { yield null; return undefined; }
	} as HTMLCollectionOf<HTMLTableSectionElement>;
	rows: HTMLCollectionOf<HTMLTableRowElement> = {
		length: 0,
		item: () => null,
		namedItem: () => null,
		[Symbol.iterator]: function*() { yield null; return undefined; }
	} as HTMLCollectionOf<HTMLTableRowElement>;
	align: string = '';
	bgColor: string = '';
	border: string = '';
	cellPadding: string = '';
	cellSpacing: string = '';
	frame: string = '';
	rules: string = '';
	summary: string = '';
	width: string = '';
	createCaption(): HTMLTableCaptionElement {
		return new (globalThis as any).HTMLTableCaptionElement();
	}
	deleteCaption(): void {}
	createTHead(): HTMLTableSectionElement {
		return new (globalThis as any).HTMLTableSectionElement();
	}
	deleteTHead(): void {}
	createTFoot(): HTMLTableSectionElement {
		return new (globalThis as any).HTMLTableSectionElement();
	}
	deleteTFoot(): void {}
	createTBody(): HTMLTableSectionElement {
		return new (globalThis as any).HTMLTableSectionElement();
	}
	insertRow(index?: number): HTMLTableRowElement {
		return new (globalThis as any).HTMLTableRowElement();
	}
	deleteRow(index: number): void {}
};

(globalThis as any).HTMLTableRowElement = class extends (globalThis as any).HTMLElement {
	constructor() {
		super();
	}
	rowIndex: number = 0;
	sectionRowIndex: number = 0;
	cells: HTMLCollectionOf<HTMLTableCellElement> = {
		length: 0,
		item: () => null,
		namedItem: () => null,
		[Symbol.iterator]: function*() { yield null; return undefined; }
	} as HTMLCollectionOf<HTMLTableCellElement>;
	align: string = '';
	bgColor: string = '';
	ch: string = '';
	chOff: string = '';
	vAlign: string = '';
	insertCell(index?: number): HTMLTableCellElement {
		return new (globalThis as any).HTMLTableCellElement();
	}
	deleteCell(index: number): void {}
};

(globalThis as any).HTMLTableCellElement = class extends (globalThis as any).HTMLElement {
	constructor() {
		super();
	}
	colSpan: number = 1;
	rowSpan: number = 1;
	headers: DOMSettableTokenList = {
		length: 0,
		value: '',
		add: () => {},
		contains: () => false,
		item: () => null,
		remove: () => {},
		replace: () => false,
		supports: () => false,
		toggle: () => false,
		[Symbol.iterator]: function*() { yield ''; return undefined; }
	} as unknown as DOMSettableTokenList;
	cellIndex: number = 0;
	scope: string = '';
	abbr: string = '';
	align: string = '';
	axis: string = '';
	bgColor: string = '';
	ch: string = '';
	chOff: string = '';
	height: string = '';
	noWrap: boolean = false;
	vAlign: string = '';
	width: string = '';
};

(globalThis as any).HTMLTableSectionElement = class extends (globalThis as any).HTMLElement {
	constructor() {
		super();
	}
	rows: HTMLCollectionOf<HTMLTableRowElement> = {
		length: 0,
		item: () => null,
		namedItem: () => null,
		[Symbol.iterator]: function*() { yield null; return undefined; }
	} as HTMLCollectionOf<HTMLTableRowElement>;
	align: string = '';
	ch: string = '';
	chOff: string = '';
	vAlign: string = '';
	insertRow(index?: number): HTMLTableRowElement {
		return new (globalThis as any).HTMLTableRowElement();
	}
	deleteRow(index: number): void {}
};

(globalThis as any).HTMLTableCaptionElement = class extends (globalThis as any).HTMLElement {
	constructor() {
		super();
	}
	align: string = '';
};

(globalThis as any).HTMLButtonElement = class extends (globalThis as any).HTMLElement {
	constructor() {
		super();
	}
	disabled: boolean = false;
	form: HTMLFormElement | null = null;
	formAction: string = '';
	formEnctype: string = '';
	formMethod: string = '';
	formNoValidate: boolean = false;
	formTarget: string = '';
	name: string = '';
	type: string = 'submit';
	value: string = '';
	menu: HTMLMenuElement | null = null;
};

// Add HTMLSpanElement interface
(globalThis as any).HTMLSpanElement = class extends (globalThis as any).HTMLElement {
	constructor() {
		super();
	}
};

// Add HTMLDivElement interface
(globalThis as any).HTMLDivElement = class extends (globalThis as any).HTMLElement {
	constructor() {
		super();
	}
	align: string = '';
};

(globalThis as any).HTMLAnchorElement = class extends (globalThis as any).HTMLElement {
	constructor() {
		super();
	}
	href: string = '';
	target: string = '';
	download: string = '';
	ping: string = '';
	rel: string = '';
	relList: DOMSettableTokenList = {
		length: 0,
		value: '',
		add: () => {},
		contains: () => false,
		item: () => null,
		remove: () => {},
		replace: () => false,
		supports: () => false,
		toggle: () => false,
		[Symbol.iterator]: function*() { yield ''; return undefined; }
	} as unknown as DOMSettableTokenList;
	hreflang: string = '';
	type: string = '';
	text: string = '';
	referrerPolicy: string = '';
	origin: string = '';
	protocol: string = '';
	username: string = '';
	password: string = '';
	host: string = '';
	hostname: string = '';
	port: string = '';
	pathname: string = '';
	search: string = '';
	hash: string = '';
};

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
					const defuddle = new Defuddle(doc, { 
						debug: options.debug
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