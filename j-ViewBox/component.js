COMPONENT('viewbox', 'margin:0;scroll:true;delay:100;scrollbar:0;visibleY:1;height:100;invisible:1', function(self, config, cls) {

	var eld, elb;
	var scrollbar;
	var cls2 = '.' + cls;
	var init = false;

	self.readonly();

	self.init = function() {
		var obj;
		if (W.OP)
			obj = W.OP;
		else
			obj = $(W);

		var resize = function() {
			for (var i = 0; i < M.components.length; i++) {
				var com = M.components[i];
				if (com.name === 'viewbox' && com.dom.offsetParent && com.$ready && !com.$removed)
					com.resize();
			}
		};

		obj.on('resize', function() {
			setTimeout2('viewboxresize', resize, 200);
		});
	};

	self.destroy = function() {
		scrollbar && scrollbar.destroy();
	};

	self.configure = function(key, value, init) {
		switch (key) {
			case 'disabled':
				eld.tclass('hidden', !value);
				break;
			case 'minheight':
			case 'margin':
			case 'marginxs':
			case 'marginsm':
			case 'marginmd':
			case 'marginlg':
				!init && self.resize();
				break;
			case 'selector': // backward compatibility
				config.parent = value;
				self.resize();
				break;
		}
	};

	self.scrollbottom = function(val) {
		if (val == null)
			return elb[0].scrollTop;
		elb[0].scrollTop = (elb[0].scrollHeight - self.dom.clientHeight) - (val || 0);
		return elb[0].scrollTop;
	};

	self.scrolltop = function(val) {
		if (val == null)
			return elb[0].scrollTop;
		elb[0].scrollTop = (val || 0);
		return elb[0].scrollTop;
	};

	self.make = function() {
		if (config.invisible)
			self.aclass('invisible');
		config.scroll && MAIN.version > 17 && self.element.wrapInner('<div class="ui-viewbox-body"></div>');
		self.element.prepend('<div class="ui-viewbox-disabled hidden"></div>');
		eld = self.find('> .{0}-disabled'.format(cls)).eq(0);
		elb = self.find('> .{0}-body'.format(cls)).eq(0);
		self.aclass('{0} {0}-hidden'.format(cls));
		if (config.scroll) {
			if (config.scrollbar) {
				if (MAIN.version > 17) {
					scrollbar = W.SCROLLBAR(self.find(cls2 + '-body'), { visibleY: config.visibleY, visibleX: config.visibleX, orientation: config.visibleX ? null : 'y', parent: self.element });
					self.scrolltop = scrollbar.scrollTop;
					self.scrollbottom = scrollbar.scrollBottom;
				} else
					self.aclass(cls + '-scroll');
			} else {
				self.aclass(cls + '-scroll');
				self.find(cls2 + '-body').aclass('noscrollbar');
			}
		}
		self.resize();
	};

	self.released = function(is) {
		!is && self.resize();
	};

	var css = {};

	self.resize = function(scrolltop) {

		if (self.release())
			return;

		var el = self.parent(config.parent);
		var h = el.height();
		var w = el.width();
		var width = WIDTH();
		var margin = config.margin;
		var responsivemargin = config['margin' + width];

		if (responsivemargin != null)
			margin = responsivemargin;

		if (h === 0 || w === 0) {
			self.$waiting && clearTimeout(self.$waiting);
			self.$waiting = setTimeout(self.resize, 234);
			return;
		}

		h = ((h / 100) * config.height) - margin;

		if (config.minheight && h < config.minheight)
			h = config.minheight;

		css.height = h;
		css.width = self.element.width();
		eld.css(css);

		css.width = null;
		self.css(css);
		elb.length && elb.css(css);
		self.element.SETTER('*', 'resize');
		var c = cls + '-hidden';
		self.hclass(c) && self.rclass(c, 100);
		scrollbar && scrollbar.resize();
		scrolltop && self.scrolltop(0);

		if (!init) {
			self.rclass('invisible', 250);
			init = true;
		}
	};

	self.resizescrollbar = function() {
		scrollbar && scrollbar.resize();
	};

	self.setter = function() {
		setTimeout(self.resize, config.delay, config.scrolltop);
	};
});