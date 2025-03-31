import { DOMWindow } from 'jsdom';

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

export function setupElements(window: DOMWindow) {
	// Define HTMLElement globally
	(globalThis as any).HTMLElement = window.HTMLElement;

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

	// HTMLSpanElement interface
	(globalThis as any).HTMLSpanElement = class extends (globalThis as any).HTMLElement {
		constructor() {
			super();
		}
	};

	// HTMLDivElement interface
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
}
