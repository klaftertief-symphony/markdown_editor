;(function($) {
// A markdown editor
$.fn.markdownEditor = function(options) {
	var opts = $.extend({}, $.fn.markdownEditor.defaults, options);

	var markdown = {
		'function-bold': {
			search: /([^\n]+)([\n\s]*)/g,
			replace: "**$1**$2"
		},
		'function-italic': {
			search: /([^\n]+)([\n\s]*)/g,
			replace: "_$1_$2"
		},
		'function-code': {
			search: /(^[\n]+)([\n\s]*)/g,
			replace: "`$1`$2"
		},
		'function-hr': {
			append: "\n***\n"
		},
		'function-ul': { 
			search: /(.+)([\n]?)/g,
			replace: "* $1$2"
		},
		'function-ol': {
			search: /(.+)([\n]?)/g,
			replace: "1. $1$2"
		},
		'function-blockquote': {
			search: /(.+)([\n]?)/g,
			replace: "> $1$2"
		},
		'function-h1': {
			search: /(.+)([\n]?)/g,
			replace: "# $1$2"
		},
		'function-h2': {
			search: /(.+)([\n]?)/g,
			replace: "## $1$2"
		},
		'function-h3': {
			search: /(.+)([\n]?)/g,
			replace: "### $1$2"
		},
		'function-link': {
			exec: function(txt, selText, $textarea) {
				var results = null;
				$.markdownEditor.Dialog.init({
					title: 'Insert Link',
					fields: [
						{
							id: 'text',
							name: 'Link Text',
							type: 'text'
						},
						{
							id:   'href',
							name: 'URL',
							type: 'text'
						}
					],
					OK: function(res) {
						var rep = '';
						if (res['text'] && res['href']){
							rep = '[' + res['text'] + '](' + res['href'] + ')';
						}
						$.markdownEditor.replaceSelection(rep);
					}
				});
			}
		},
		'function-image': {
			exec: function(txt, selText, $textarea) {
				var results = null;
				$.markdownEditor.Dialog.init({
					title: 'Insert Image',
					fields: [
						{
							id: 'url',
							name: 'Image URL',
							type: 'text'
						},
						{
							id: 'alt',
							name: 'Alt Text',
							type: 'text'
						}
					],
					OK: function(res) {
						var rep = '';
						if (res['url'] && res['alt']) {
							rep = '![' + res['alt'] + ']' + '(' + res['url'] + ')';
						}
						$.markdownEditor.replaceSelection(rep);
					}
				});
			}
		}
	};

	return this.each(function() {
		var $this = $(this),
			$field = $this.closest('.field');

		var FunctionBar = {

			init: function() {
				$this.before('\
					<div class="function-bar">\
						<div class="function-buttons">\
							<a href="#" class="function-bold"><span>Bold</span></a>\
							<a href="#" class="function-italic"><span>Italic</span></a>\
							<a href="#" class="function-code"><span>Code</span></a>\
							<span class="function-divider">&nbsp;</span>\
							<a href="#" class="function-ul"><span>Unordered List</span></a>\
							<a href="#" class="function-ol"><span>Ordered List</span></a>\
							<a href="#" class="function-blockquote"><span>Blockquote</span></a>\
							<a href="#" class="function-hr"><span>Horizontal Rule</span></a>\
							<span class="function-divider">&nbsp;</span>\
							<a href="#" class="function-h1"><span>h1</span></a>\
							<a href="#" class="function-h2"><span>h2</span></a>\
							<a href="#" class="function-h3"><span>h3</span></a>\
							<span class="function-divider">&nbsp;</span>\
							<a href="#" class="function-link"><span>Link</span></a>\
							<a href="#" class="function-image"><span>Image</span></a>\
							<span class="function-divider">&nbsp;</span>\
							<a href="#" class="function-help"><span>Help</span></a>\
						</div>\
					</div>\
				');
				
				FunctionBar.activate();
			},

			activate: function() {
				debug('Activating function bar');

				$field.delegate('a', 'click', function(event){
					event.preventDefault();
					var def = markdown[$(this).attr('class')];
					FunctionBar.executeAction(def);
				});
			},

			executeAction: function(definitionObject) {
				// get the selected text from the textarea
				var txt = $this.val(),
					selPos = FunctionBar.getFieldSelectionPosition(),
					selText = FunctionBar.getFieldSelection(),
					repText = selText,
					reselect = true,
					cursor = null;
				
				// execute a replacement function if one exists
				if (definitionObject.exec && typeof definitionObject.exec == 'function'){
					definitionObject.exec(txt, selText, $this);
					return;
				}
				
				// execute a search/replace if they exist
				var searchExp = /([^\n]+)/gi;
				if (definitionObject.search && typeof definitionObject.search == 'object') {
					debug('Replacing search Regex');
					searchExp = null;
					searchExp = new RegExp(definitionObject.search);
					debug(searchExp);
				}
				debug('repText is ' + '"' + repText + '"');
				// replace text
				if (definitionObject.replace && typeof definitionObject.replace == 'string') {
					debug('Running replacement - using ' + definitionObject.replace);
					var rt = definitionObject.replace;
					repText = repText.replace( searchExp, rt );
					// remove backreferences
					repText = repText.replace( /\$[\d]/g, '' );
					
					if (repText === '') {
						debug('Search string is empty');
					
						// find position of $1 - this is where we will place the cursor
						cursor = rt.indexOf('$1');
					
						// we have an empty string, so just remove backreferences
						repText = rt.replace( /\$[\d]/g, '' );
					
						// if the position of $1 doesn't exist, stick the cursor in the middle
						if ( cursor == -1 ) {
							cursor = Math.floor( rt.length / 2 );
						}
					}
				}
				
				// append if necessary
				if (definitionObject.append && typeof definitionObject.append == 'string'){
					if (repText == selText) {
						reselect = false;
					}
					repText += definitionObject.append;
				}
				
				if (repText){
					FunctionBar.replaceFieldSelection(repText, reselect, cursor);
				}
			},

			getFieldSelectionPosition: function() {
				var start = 0, end = 0;
				var el = $this.get(0);

				if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
					start = el.selectionStart;
					end = el.selectionEnd;
				} else {
					var range = document.selection.createRange();
					var stored_range = range.duplicate();
					stored_range.moveToElementText( el );
					stored_range.setEndPoint( 'EndToEnd', range );
					start = stored_range.text.length - range.text.length;
					end = start + range.text.length;
					
					// so, uh, we're close, but we need to search for line breaks and
					// adjust the start/end points accordingly since IE counts them as
					// 2 characters in TextRange.
					var s = start;
					var lb = 0;
					var i;
					debug('IE: start position is currently ' + s);
					for ( i=0; i < s; i++ ) {
						if ( el.value.charAt(i).match(/\r/) ) {
							++lb;
						}
					}
					
					if (lb) {
						debug('IE start: compensating for ' + lb + ' line breaks');
						start = start - lb;
						lb = 0;
					}
					
					var e = end;
					for (i=0; i < e; i++) {
						if (el.value.charAt(i).match(/\r/)) {
							++lb;
						}
					}
					
					if (lb) {
						debug('IE end: compensating for ' + lb + ' line breaks');
						end = end - lb;
					}
				}
			
				return {
					start: start,
					end: end
				};
			},

			getFieldSelection: function() {
				var selStr = '';
				var selPos;

				selPos = FunctionBar.getFieldSelectionPosition();
				selStr = $this.val().substring(selPos.start, selPos.end);
				debug('Selected: ' + selStr + ' (' + selPos.start + ', ' + selPos.end + ')');
				return selStr;
			},

			replaceFieldSelection: function(replaceText, reselect, cursorOffset ) {
				var selPos = FunctionBar.getFieldSelectionPosition();
				var fullStr = $this.val();
				var selectNew = true;
				if (reselect === false) {
					selectNew = false;
				}
				
				var scrollTop = null;
				if ($this[0].scrollTop) {
					scrollTop = $this[0].scrollTop;
				}
				
				$this.val(fullStr.substring(0, selPos.start) + replaceText + fullStr.substring(selPos.end));
				$this[0].focus();
				
				if (selectNew) {
					if ($this[0].setSelectionRange) {
						if (cursorOffset) {
							$this[0].setSelectionRange(selPos.start + cursorOffset, selPos.start + cursorOffset);
						} else {
							$this[0].setSelectionRange(selPos.start, selPos.start + replaceText.length );
						}
					} else if ($this[0].createTextRange) {
						var range = $this[0].createTextRange();
						range.collapse( true );
						if (cursorOffset) {
							range.moveEnd(selPos.start + cursorOffset);
							range.moveStart(selPos.start + cursorOffset);
						} else {
							range.moveEnd( 'character', selPos.start + replaceText.length );
							range.moveStart( 'character', selPos.start );
						}
						range.select();
					}
				}
				
				if (scrollTop) {
					// this jumps sometimes in FF
					$this[0].scrollTop = scrollTop;
				}
			}
		};

		FunctionBar.init();

	});

	// private function for debugging
	function debug($obj) {
		if (window.console && window.console.log) {
			window.console.log($obj);
		}
	}
};

// default options
$.fn.markdownEditor.defaults = {
  
};

$.markdownEditor = function(){
	
};

$.markdownEditor.Dialog = $.GollumDialog;
$.markdownEditor.replaceSelection = function(repText) {
	FunctionBar.replaceFieldSelection($this, repText);
};

})(jQuery);