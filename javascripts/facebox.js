// 
//  Facebox
//  
//  Created by Ivan Vanderbyl on 2009-02-02.
// 

var	facebox = function(link) {
	new Facebox(link);
};

var Facebox = Class.create({
	settings: {
		opacity      		: 0.3,
    overlay      		: true,
    loadingImage 		: '/images/facebox/loading.gif',
    closeImage   		: '/images/facebox/closelabel.gif',
    imageTypes   		: [ 'png', 'jpg', 'jpeg', 'gif' ],
		panelOpacity 		: 1.0,
		bindToEscapeKey	: true,
		bindOverlayClick: true,
		faceboxHtml  		: '\
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
	},
	
	initialize: function(link){
		this.contentEl = null;
		this.loading();
	},
	
	loading: function() {
		this.init();
		if ($$('#facebox .loading').length == 1) return true;
		
		this.showOverlay()
		
		this.contentEl = $$('#facebox .content').first();
		this.contentEl.childElements().each(function(elem, i){
			elem.remove();
		});
		
		$$('#facebox .body').first().childElements().invoke("hide");
		
		this.contentEl.insert({bottom: '<div class="loading"><img src="'+this.settings.loadingImage+'"/></div>'});
		
		var pageScroll = this.getPageScroll();
		$('facebox').show();
		$('facebox').setStyle({
			'top': pageScroll[1] + (this.getPageHeight() / 10) + 'px',
			'left': ((document.viewport.getWidth() / 2) - $$('#facebox table')[0].getWidth()/2)+"px"
		})
		
		
		this.reveal("Hello World");
	},
	
	// called one time to setup facebox on this page
	init: function(settings) {
		if (this.settings.inited) return true
		else this.settings.inited = true
		
		var imageTypes = this.settings.imageTypes.join('|')
		this.settings.imageTypesRegexp = new RegExp('\.' + imageTypes + '$', 'i')

		$$('body').first().insert({bottom: this.settings.faceboxHtml});
		
		this.preload = [ new Image(), new Image() ];
		this.preload[0].src = this.settings.closeImage;
		this.preload[1].src = this.settings.loadingImage;
		
		f = this;
		$$('#facebox .b:first, #facebox .bl, #facebox .br, #facebox .tl, #facebox .tr').each(function(elem){
			f.preload.push(new Image());
			f.preload.slice(-1).src = elem.getStyle('background-image').replace(/url\((.+)\)/, '$1');
		});
		
		Event.observe($$('#facebox .close').first(), 'click', function(e){
			Event.stop(e);
			f.close()
		});
		Event.observe($$('#facebox .close_image').first(), 'click', function(e){
			Event.stop(e);
			f.close()
		});
		
		if (this.settings.bindToEscapeKey) document.observe('keydown', this.handleKeyPress.bindAsEventListener(this));
	},
	
	handleKeyPress: function(e){
		if (e.keyCode == 27) this.close();
	},
	
	reveal: function(data, klass){
		document.fire('beforeReveal.facebox', this)
		
		if (klass) this.contentEl.addClassName(klass);
		this.contentEl.innerHTML = data;
		
		if ($$('#facebox .loading').length == 1) $$('#facebox .loading')[0].remove();
		
		$$('#facebox .body').first().childElements().each(function(elem,i){
			elem.appear({duration: 0.1});
		});
		
		$('facebox').setStyle({
			'left': ((document.viewport.getWidth() / 2) - $$('#facebox table')[0].getWidth()/2)+"px"
		})
		
		$(document).observe('keydown.facebox', function(e) {
      if (e.keyCode == 27) this.close()
      return true
    })
		
		
		// contentWrapper = $$('#facebox .content').first();
		// if (klass) contentWrapper.addClassName(klass);
		// contentWrapper.insert({bottom: data});
		// load = $$('#facebox .loading').first();
		// if(load) load.remove();
		// $$('#facebox .body').first().childElements().each(function(elem,i){
		// 	elem.show();
		// });
		// Event.observe(document, 'keypress', this.keyPressListener);
	},
	
	getPageScroll: function() {
    var xScroll, yScroll;
    if (self.pageYOffset) {
      yScroll = self.pageYOffset;
      xScroll = self.pageXOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
      yScroll = document.documentElement.scrollTop;
      xScroll = document.documentElement.scrollLeft;
    } else if (document.body) {// all other Explorers
      yScroll = document.body.scrollTop;
      xScroll = document.body.scrollLeft;	
    }
    return new Array(xScroll,yScroll) 
  },
	
	getPageHeight: function() {
    var windowHeight
    if (self.innerHeight) {	// all except Explorer
      windowHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
      windowHeight = document.documentElement.clientHeight;
    } else if (document.body) { // other Explorers
      windowHeight = document.body.clientHeight;
    }	
    return windowHeight
  },
	
	showOverlay: function(){
		if (this.skipOverlay()) return
		
		if ($('facebox_overlay') == null) 
      $$('body').first().insert({bottom: '<div id="facebox_overlay" class="facebox_hide"></div>'});
	
		var overlay = $('facebox_overlay').hide().addClassName("facebox_overlayBG").removeClassName("facebox_hide").setStyle("opacity: 0.3");
		overlay.appear({ to: this.settings.opacity, from: 0, duration: 0.2 });
		
		if (this.settings.bindOverlayClick) overlay.observe('click', this.close.bindAsEventListener(this));

    return false;
	},
	
	hideOverlay: function(){
		if (this.skipOverlay()) return
		
		$('facebox_overlay').fade({duration: 0.2, afterFinish: function(effect) {
			effect.element.removeClassName("facebox_overlayBG").addClassName("facebox_hide").remove();
		}})
		
		return false
	},
	
	close: function(e){
		bind = this
		$$('#facebox')[0].fade({duration: 0.2, afterFinish: function(effect) {
      effect.element.className = null;
			effect.element.addClassName('content');
      bind.hideOverlay()
    }})
	},
	
	skipOverlay: function(){
    return this.settings.overlay == false || this.settings.opacity === null
  }
	
});


Event.observe(window, 'load', function(e){
	$$('a[rel*=facebox]').each(function(link) {	
		link.observe('click', function(evnt) {
			Event.stop(evnt);
			facebox(link);
		});
	});
});