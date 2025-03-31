import { DOMWindow } from 'jsdom';
import { SetupFunction } from './setup.js';

export const setupRange: SetupFunction = (window: DOMWindow) => {
	if (!window.Range) {
		window.Range = class Range {
			static readonly START_TO_START = 0;
			static readonly START_TO_END = 1;
			static readonly END_TO_END = 2;
			static readonly END_TO_START = 3;

			readonly START_TO_START = 0;
			readonly START_TO_END = 1;
			readonly END_TO_END = 2;
			readonly END_TO_START = 3;

			startContainer: Node;
			startOffset: number;
			endContainer: Node;
			endOffset: number;
			collapsed: boolean;
			commonAncestorContainer: Node;

			constructor() {
				this.startContainer = document.documentElement;
				this.startOffset = 0;
				this.endContainer = document.documentElement;
				this.endOffset = 0;
				this.collapsed = true;
				this.commonAncestorContainer = document.documentElement;
			}

			createContextualFragment(fragment: string): DocumentFragment {
				return document.createDocumentFragment();
			}

			detach(): void {}

			cloneContents(): DocumentFragment {
				return document.createDocumentFragment();
			}

			cloneRange(): Range {
				return new Range();
			}

			collapse(toStart: boolean = false): void {}

			compareBoundaryPoints(how: number, sourceRange: Range): number {
				return 0;
			}

			comparePoint(node: Node, offset: number): number {
				return 0;
			}

			deleteContents(): void {}

			extractContents(): DocumentFragment {
				return document.createDocumentFragment();
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

			insertNode(node: Node): void {}

			intersectsNode(node: Node): boolean {
				return false;
			}

			isPointInRange(node: Node, offset: number): boolean {
				return false;
			}

			selectNode(node: Node): void {}

			selectNodeContents(node: Node): void {
				this.startContainer = node;
				this.startOffset = 0;
				this.endContainer = node;
				this.endOffset = node.childNodes.length;
				this.collapsed = false;
			}

			setEnd(node: Node, offset: number): void {}

			setEndAfter(node: Node): void {}

			setEndBefore(node: Node): void {}

			setStart(node: Node, offset: number): void {}

			setStartAfter(node: Node): void {}

			setStartBefore(node: Node): void {}

			surroundContents(newParent: Node): void {}
		};
	}
}; 