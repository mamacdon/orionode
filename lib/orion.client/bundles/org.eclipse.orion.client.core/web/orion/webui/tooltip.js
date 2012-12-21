/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*global window define document */

define(['require', 'orion/webui/littlelib'], function(require, lib) {

	/**
	 * Attaches tooltip behavior to a given node.  The tooltip will be assigned class "tooltip" which can be
	 * used to control appearance.  Uses the "CSS Triangle Trick" 
	 * http://css-tricks.com/snippets/css/css-triangle/
	 * for the tooltip shape and CSS transitions for fade in and fade out.
	 *
	 * Clients should destroy the tooltip if removing the node from the document.
	 *
	 * @param {Object} options The options object, which must minimally specify the tooltip dom node
	 * @param options.node The node showing the tooltip.  Required.
	 * @param options.text The text in the tooltip.  Optional.  If not specified, the client is expected to add content
	 * to the tooltip prior to triggering it.
	 * @param options.trigger The event that triggers the tooltip.  Can be one of "click" or "mouseover".  Optional.
	 * Defaults to "mouseover". 
	 * @param options.position An array specifying the preferred positions to try positioning the tooltip.  Positions can be "left", "right", 
	 * "above", or "below".  If no position will fit on the screen, the first position specified is used.  Optional.  Defaults to 
	 * ["right", "above", "below", "left"].
	 * @param options.showDelay Specifies the number of millisecond delay before the tooltip begins to appear.
	 * Optional.  Valid only for "mouseover" trigger.  Defaults to 1000.
	 * @param options.hideDelay Specifies the number of millisecond delay before the tooltip begins to disappear.
	 * Optional.  Defaults to 200.  Valid only for "mouseover" trigger.
	 * @param options.tailSize Specifies the number of pixels to allocate for the tail.  Optional.  Defaults to 10.
	 * @name orion.webui.tooltip.Tooltip
	 *
	 */
	function Tooltip(options) {
		this._init(options);
	}
	Tooltip.prototype = /** @lends orion.webui.tooltip.Tooltip.prototype */ {
			
		_init: function(options) {
			this._node = lib.node(options.node);
			if (!this._node) { throw "no dom node for tooltip found"; } //$NON-NLS-0$
			this._position = options.position || ["right", "above", "below", "left"]; //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
			this._text = options.text;
			this._hideDelay = options.hideDelay || 200;
			this._tailSize = options.tailSize || 10;
			this._trigger = options.trigger || "mouseover"; //$NON-NLS-0$
			
			var self = this;
			// set up events
			if (this._trigger === "click") { //$NON-NLS-0$
				this._showDelay = 0;
				this._node.addEventListener("click", function(event) { //$NON-NLS-0$
					if (event.target === self._node) {
						self.show();
						lib.stop(event);
					}
				}, false);
			} else {
				this._showDelay = options.showDelay || 1000;
				var leave = ["mouseout", "click"];  //$NON-NLS-1$ //$NON-NLS-0$
				this._node.addEventListener("mouseover", function(event) { //$NON-NLS-0$
					if (lib.contains(self._node, event.target)) {
						self.show();
						lib.stop(event);
					}
				}, false);
				
				for (var i=0; i<leave.length; i++) {
					this._node.addEventListener(leave[i], function(event) { //$NON-NLS-0$
						if (lib.contains(self._node, event.target)) {
							self.hide();
						}
					}, false);
				}
			}			
					
		},
		
		_makeTipNode: function() {
			if (!this._tip) {
				this._tip = document.createElement("span"); //$NON-NLS-0$
				this._tip.classList.add("tooltipContainer"); //$NON-NLS-0$
				this._tipInner = document.createElement("span");  //$NON-NLS-0$
				this._tipInner.classList.add("tooltip");  //$NON-NLS-0$
				if (this._text) {
					var textNode = document.createTextNode(this._text);
					this._tipInner.appendChild(textNode);
				}
				this._tip.appendChild(this._tipInner);
				document.body.appendChild(this._tip);
				var self = this;
				lib.addAutoDismiss([this._tip, this._node], function() {self.hide(0);});
			}
			return this._tip;
		},
		
		_positionTip: function(position, force) {
			this._makeTipNode();  // lazy initialize
			if (this._tailBorder) {
				// clear tails because position might have changed
				this._tip.removeChild(this._tailBorder);
				this._tailBorder = null;
				this._tip.removeChild(this._tail);
				this._tail = null;
			}
			// special case for left tooltip to ensure inner span is adjacent to tail.
			if (position === "left") { //$NON-NLS-0$
				this._tipInner.classList.add("left"); //$NON-NLS-0$
			} else {
				this._tipInner.classList.remove("left"); //$NON-NLS-0$
			}

			var rect = lib.bounds(this._node);
			var tipRect = lib.bounds(this._tipInner);
			var top, left;
			
			switch (position) {
				case "above": //$NON-NLS-0$
					top = rect.top - tipRect.height - this._tailSize - 1;
					left = rect.left - this._tailSize;
					break;
				case "below": //$NON-NLS-0$
					top = rect.top + rect.height + this._tailSize + 1;
					left = rect.left - this._tailSize;
					break;
				case "left": //$NON-NLS-0$
					top = rect.top - this._tailSize / 2;
					left = rect.left - tipRect.width - this._tailSize - 1;
					break;
				default:  // right
					top = rect.top - this._tailSize / 2;
					left = rect.left + rect.width + this._tailSize + 1;
					break;
			}
			var totalRect = lib.bounds(document.documentElement);
			if (top + tipRect.height > totalRect.height) {
				if (force) {
					top = totalRect.height - tipRect.height - 1;
				} else {
					return false;
				}
			}
			if (left + tipRect.width > totalRect.width) {
				if (force) {
					left = totalRect.width - tipRect.width - 1;
				} else {
					return false;
				}
			}
			if (left < 0) {
				if (force) {
					left = 4;
				} else {
					return false;
				}
			}
			if (top < 0) {
				if (force) {
					top = 4;
				} else {
					return false;
				}
			}
			this._tailBorder = document.createElement("span"); //$NON-NLS-0$
			this._tailBorder.classList.add("tooltipTailBorderFrom"+position); //$NON-NLS-0$
			this._tail = document.createElement("span"); //$NON-NLS-0$
			this._tail.classList.add("tooltipTailFrom"+position); //$NON-NLS-0$
			if (position === "above" || position === "left") { //$NON-NLS-1$//$NON-NLS-0$
				// tip goes after content
				this._tip.appendChild(this._tailBorder);
				this._tip.appendChild(this._tail);
			} else {
				this._tip.insertBefore(this._tailBorder, this._tipInner);
				this._tip.insertBefore(this._tail, this._tipInner);
			}
			this._tip.style.top = top + "px"; //$NON-NLS-0$
			this._tip.style.left = left + "px"; //$NON-NLS-0$ 
			this._tip.style.width = tipRect.width + "px"; //$NON-NLS-0$ 
			this._tip.style.height = tipRect.height + "px"; //$NON-NLS-0$ 
			return true;
		},
		
		contentContainer: function() {
			this._makeTipNode();
			return this._tipInner;
		},
		
		/**
		 * Show the tooltip.
		 */			
		show: function() {
			if (this._tip && this._tip.classList.contains("tooltipShowing")) { //$NON-NLS-0$
				return;
			}
			var self = this;
			if (this._timeout) {
				window.clearTimeout(this._timeout);
				this._timeout = null;
			}
			this._timeout = window.setTimeout(function() {
				var positioned = false;
				var index = 0;
				while (!positioned && index < self._position.length) {
					positioned = self._positionTip(self._position[index]);
					index++;
				}
				if (!positioned) {
					self._positionTip(self._position[0], true);  // force it in, it doesn't fit anywhere
				}
				self._tip.classList.add("tooltipShowing"); //$NON-NLS-0$
			}, this._showDelay);
		},
		
		/**
		 * Hide the tooltip.
		 */			
		hide: function(hideDelay) {
			if (this._timeout) {
				window.clearTimeout(this._timeout);
				this._timeout = null;
			}
			if (!this._tip || !this._tip.classList.contains("tooltipShowing")) { //$NON-NLS-0$
				return;
			}
			if (hideDelay === undefined) {
				hideDelay = this._hideDelay;
			}
			var self = this;
			this._timeout = window.setTimeout(function() {
				self._tip.classList.remove("tooltipShowing"); //$NON-NLS-0$
			}, hideDelay);
		},
		
		destroy: function() {
			if (this._timeout) {
				window.clearTimeout(this._timeout);
				this._timeout = null;
			}
			if (this._tip) {
				document.body.removeChild(this._tip);
				this._tip = null;
			}
		}
	};
	Tooltip.prototype.constructor = Tooltip;
	//return the module exports
	return {Tooltip: Tooltip};
});