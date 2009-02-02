// Facebox for Prototype
// based on Facebox by Chris Wanstrath -- http://famspam.com/facebox
// 
// Originally ported to Prototype by Phil Burrows - http://blog.philburrows.com
// 
// This version will include animation and templates for Rails, released as a plugin or gem somewhere down the track.
// 
// Usage:
// Copy facebox.js into public/javascripts/
// Copy images to public/images/
// 
// This Prototype version is setup to automatically run when the window's load event is fired (see last three lines of this file),
// so usage is as easy as adding rel="facebox" to any link you want to use Facebox.


var Facebox = Class.create({
	initialize	: function(extra_set){
		this.settings = {
			loading_image	: '/images/facebox/loading.gif',
			close_image		: '/images/facebox/closelabel.gif',
			image_types		: new RegExp('\.' + ['png', 'jpg', 'jpeg', 'gif'].join('|') + '$', 'i'),
			inited				: true,	
			facebox_html	: '\
	  <div id="facebox" style="display:none;"> \
	    <div class="popup"> \
	      <table> \
	        <tbody> \
	          <tr> \
	            <td class="tl"/><td class="b"/><td class="tr"/> \
	          </tr> \
	          <tr> \
	            <td class="b"/> \
	            <td class="body"> \
	              <div class="content"> \
	              </div> \
	              <div class="footer"> \
	                <a href="#" class="close"> \
	                  <img src="/images/facebox/closelabel.gif" title="close" class="close_image" /> \
	                </a> \
	              </div> \
	            </td> \
	            <td class="b"/> \
	          </tr> \
	          <tr> \
	            <td class="bl"/><td class="b"/><td class="br"/> \
	          </tr> \
	        </tbody> \
	      </table> \
	    </div> \
	  </div>'
		};
		if (extra_set) Object.extend(this.settings, extra_set);
		$$('body').first().insert({bottom: this.settings.facebox_html});
		
		this.preload = [ new Image(), new Image() ];
		this.preload[0].src = this.settings.close_image;
		this.preload[1].src = this.settings.loading_image;
		
		f = this;
		$$('#facebox .b:first, #facebox .bl, #facebox .br, #facebox .tl, #facebox .tr').each(function(elem){
			f.preload.push(new Image());
			f.preload.slice(-1).src = elem.getStyle('background-image').replace(/url\((.+)\)/, '$1');
		});
		
		// this.keyPressListener = this.watchKeyPress().bindAsEventListener(this);
		
		this.watchClickEvents();
		fb = this;
		Event.observe($$('#facebox .close').first(), 'click', function(e){
			Event.stop(e);
			fb.close()
		});
		Event.observe($$('#facebox .close_image').first(), 'click', function(e){
			Event.stop(e);
			fb.close()
		});
	},
	
	// watchKeyPress	: function(e){
	// 	// not sure if the call to this will work here
	// 	if (e.keyCode == 27) this.close();
	// },
	
	watchClickEvents	: function(e){
		var f = this;
		$$('a[rel=facebox]').each(function(elem,i){
			Event.observe(elem, 'click', function(e){
				// console.log("here's what f is :: "+ f);
				Event.stop(e);
				f.click_handler(elem, e);
			});
		});
		
	},
	
	loading	: function() {
		if ($$('#facebox .loading').length == 1) return true;
		
		contentWrapper = $$('#facebox .content').first();
		contentWrapper.childElements().each(function(elem, i){
			elem.remove();
		});
		contentWrapper.insert({bottom: '<div class="loading"><img src="'+this.settings.loading_image+'"/></div>'});
		var pageScroll = document.viewport.getScrollOffsets();
		$('facebox').setStyle({
			'top': pageScroll.top + (document.viewport.getHeight() / 10) + 'px',
			'left': pageScroll.left + 'px'
		});
		
		Event.observe(document, 'keypress', this.keyPressListener);
	},
	
	reveal	: function(data, klass){
		this.loading();
		box = $('facebox');
		if(!box.visible()) box.show();
		
		contentWrapper = $$('#facebox .content').first();
		if (klass) contentWrapper.addClassName(klass);
		contentWrapper.insert({bottom: data});
		load = $$('#facebox .loading').first();
		if(load) load.remove();
		$$('#facebox .body').first().childElements().each(function(elem,i){
			elem.show();
		});
		Event.observe(document, 'keypress', this.keyPressListener);
	},
	
	close		: function(){
		$('facebox').hide();
	},
	
	click_handler	: function(elem, e){
		this.loading();
		Event.stop(e);
		
		// support for rel="facebox[.inline_popup]" syntax, to add a class
		var klass = elem.rel.match(/facebox\[\.(\w+)\]/);
		if (klass) klass = klass[1];
		
		// div
		$('facebox').show();
		
		if (elem.href.match(/#/)){
			var url				= window.location.href.split('#')[0];
			var target		= elem.href.replace(url+'#','');
			// var data			= $$(target).first();
			var d			= $(target);
			// create a new element so as to not delete the original on close()
			var data = new Element(d.tagName);
			data.innerHTML = d.innerHTML;
			this.reveal(data, klass);
		} else if (elem.href.match(this.settings.image_types)) {
			var image = new Image();
			fb = this;
			image.onload = function() {
				fb.reveal('<div class="image"><img src="' + image.src + '" /></div>', klass)
			}
			image.src = elem.href;
		} else {
			// Ajax
			var fb = this;
			url = elem.href;
			new Ajax.Request(url, {
				method		: 'get',
				onFailure	: function(transport){
					fb.reveal(transport.responseText, klass);
				},
				onSuccess	: function(transport){
					fb.reveal(transport.responseText, klass);
				}
			});
			
		}
	}
});

var facebox;
Event.observe(window, 'load', function(e){
	facebox = new Facebox();
});