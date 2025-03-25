import { DOMWindow } from 'jsdom';
import { SetupFunction } from './setup.js';

export const setupDocumentMethods: SetupFunction = (window: DOMWindow) => {
	if (!window.Document.prototype.getSelection) {
		window.Document.prototype.getSelection = function(): Selection | null {
			const selection = {
				anchorNode: null,
				anchorOffset: 0,
				direction: 'forward',
				focusNode: null,
				focusOffset: 0,
				isCollapsed: true,
				rangeCount: 0,
				type: 'None',
				getRangeAt: function() { return new window.Range(); },
				removeAllRanges: function() {},
				addRange: function() {},
				collapse: function() {},
				collapseToEnd: function() {},
				collapseToStart: function() {},
				deleteFromDocument: function() {},
				empty: function() {},
				extend: function() {},
				modify: function() {},
				selectAllChildren: function() {},
				setBaseAndExtent: function() {},
				setPosition: function() {},
				toString: function() { return ''; },
				containsNode: function(node: Node, allowPartialContainment: boolean = false): boolean {
					return false;
				},
				removeRange: function(range: Range): void {}
			} as unknown as Selection;
			return selection;
		};
	}
};

export const setupWindowMethods: SetupFunction = (window: DOMWindow) => {
	if (!window.Window.prototype.getComputedStyle) {
		window.Window.prototype.getComputedStyle = function(elt: Element, pseudoElt?: string | null): CSSStyleDeclaration {
			const style = {
				accentColor: '',
				alignContent: '',
				alignItems: '',
				alignSelf: '',
				getPropertyValue: function(prop: string): string { return ''; }
			} as CSSStyleDeclaration;
			return style;
		};
	}
}; 