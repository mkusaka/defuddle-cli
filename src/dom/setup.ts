import { DOMWindow } from 'jsdom';
import { setupDocumentMethods, setupWindowMethods } from './document.js';

// Type for DOM interface setup functions
export type SetupFunction = (window: DOMWindow) => void;

// Setup basic window properties
export const setupBasicWindow: SetupFunction = (window) => {
	if (!window.innerWidth) {
		Object.defineProperty(window, 'innerWidth', { value: 1024 });
	}
	if (!window.innerHeight) {
		Object.defineProperty(window, 'innerHeight', { value: 768 });
	}
	if (!window.devicePixelRatio) {
		Object.defineProperty(window, 'devicePixelRatio', { value: 1 });
	}
};

// Setup CSS interfaces
export const setupCSSInterfaces: SetupFunction = (window) => {
	if (!window.CSSRule) {
		window.CSSRule = (globalThis as any).CSSRule as any;
	}
	if (!window.CSSMediaRule) {
		window.CSSMediaRule = (globalThis as any).CSSMediaRule as any;
	}
	if (!window.CSSStyleSheet) {
		window.CSSStyleSheet = (globalThis as any).CSSStyleSheet as any;
	}
};

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

// Setup HTML and SVG interfaces
export const setupHTMLAndSVG: SetupFunction = (window) => {
	if (!window.HTMLImageElement) {
		window.HTMLImageElement = (globalThis as any).HTMLImageElement as any;
	}
	if (!window.SVGElement) {
		window.SVGElement = (globalThis as any).SVGElement as any;
	}
	if (!window.HTMLAnchorElement) {
		window.HTMLAnchorElement = (globalThis as any).HTMLAnchorElement as any;
	}
};

// Setup screen object
export const setupScreen: SetupFunction = (window) => {
	if (!window.screen) {
		Object.defineProperty(window, 'screen', {
			value: {
				width: 1024,
				height: 768,
				availWidth: 1024,
				availHeight: 768,
				colorDepth: 24,
				pixelDepth: 24,
				orientation: {
					type: 'landscape-primary',
					angle: 0
				}
			}
		});
	}
};

// Setup storage objects
export const setupStorage: SetupFunction = (window) => {
	const createStorage = () => {
		const storage = {
			length: 0,
			getItem: () => null,
			setItem: () => {},
			removeItem: () => {},
			clear: () => {},
			key: () => null
		};

		// Make the storage object non-extensible
		Object.preventExtensions(storage);
		return storage;
	};

	try {
		// Create storage objects
		const localStorage = createStorage();
		const sessionStorage = createStorage();

		// Define properties with more permissive attributes
		Object.defineProperties(window, {
			localStorage: {
				value: localStorage,
				writable: true,
				configurable: true
			},
			sessionStorage: {
				value: sessionStorage,
				writable: true,
				configurable: true
			}
		});
	} catch (error) {
		// Log the error but don't throw
		console.warn('Warning: Could not set up storage objects:', error instanceof Error ? error.message : 'Unknown error');
	}
};

// Setup animation frame methods
export const setupAnimationFrame: SetupFunction = (window) => {
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
			return setTimeout(callback, 0) as unknown as number;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = (handle: number): void => {
			clearTimeout(handle as unknown as number);
		};
	}
};

// Setup DOM methods
export const setupDOMMethods: SetupFunction = (window) => {
	if (!window.Document.prototype.getElementsByClassName) {
		window.Document.prototype.getElementsByClassName = function(classNames: string): HTMLCollectionOf<Element> {
			const elements = this.querySelectorAll('.' + classNames);
			const collection = new HTMLCollection();
			elements.forEach((el, i) => {
				collection[i] = el;
			});
			return collection;
		};
	}
};

// Setup Node methods
export const setupNodeMethods: SetupFunction = (window) => {
	if (!window.Node.prototype.contains) {
		window.Node.prototype.contains = function(node: Node): boolean {
			let current: Node | null = node;
			while (current) {
				if (current === this) return true;
				current = current.parentNode;
			}
			return false;
		};
	}
};

// Setup Element methods
export const setupElementMethods: SetupFunction = (window) => {
	if (!window.Element.prototype.getBoundingClientRect) {
		window.Element.prototype.getBoundingClientRect = function(): DOMRect {
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
		};
	}
};

// Main setup function that orchestrates all the individual setups
export const setupDOMInterfaces = (window: DOMWindow): void => {
	const setupFunctions: [string, SetupFunction][] = [
		['basic window', setupBasicWindow],
		['CSS interfaces', setupCSSInterfaces],
		['HTML and SVG interfaces', setupHTMLAndSVG],
		['screen object', setupScreen],
		['storage objects', setupStorage],
		['animation frame methods', setupAnimationFrame],
		['DOM methods', setupDOMMethods],
		['Node methods', setupNodeMethods],
		['Element methods', setupElementMethods],
		['Document methods', setupDocumentMethods],
		['Window methods', setupWindowMethods]
	];

	try {
		for (const [name, setup] of setupFunctions) {
			try {
				setup(window);
			} catch (error) {
				console.warn(`Warning: Could not set up ${name}:`, error instanceof Error ? error.message : 'Unknown error');
			}
		}
	} catch (error) {
		console.error('Error in setupDOMInterfaces:', error instanceof Error ? error.message : 'Unknown error');
		// Don't throw the error, just log it
	}
}; 