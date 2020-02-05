COMPONENT('radiobuttonexpert', function(self, config) {

	var cls = 'ui-radiobuttonexpert';
	var cls2 = '.' + cls;
	var template;
	var recompile = false;
	var selected;
	var reg = /\$(index|path)/g;

	self.nocompile();

	self.configure = function(key, value, init) {

		if (init)
			return;

		switch (key) {
			case 'disabled':
				self.tclass('ui-disabled', value);
				break;
			case 'required':
				self.find(cls2 + '-label').tclass(cls + '-label-required', value);
				break;
			case 'type':
				self.type = config.type;
				break;
			case 'label':
				self.find(cls2 + '-label').html(value);
				break;
			case 'datasource':
				self.datasource(value, self.bind);
				break;
		}

	};

	self.make = function() {
		var builder = [];
		var element = self.find('script');

		if (!element.length)
			return;

		var html = element.html();
		element.remove();
		html = html.replace('>', ' data-value="{{ {0} }}" data-disabled="{{ {1} }}">'.format(config.value || 'id', config.disabledkey || 'disabled'));
		template = Tangular.compile(html);
		recompile = html.COMPILABLE();

		config.label && self.html('<div class="' + cls + '-label{1}">{0}</div>'.format(config.label, config.required ? (' ' + cls + '-label-required') : ''));

		config.datasource && self.reconfigure('datasource:' + config.datasource);
		config.type && (self.type = config.type);
		config.disabled && self.aclass('ui-disabled');

		self.event('click', '[data-value]', function() {
			var el = $(this);
			if (config.disabled || +el.attrd('disabled'))
				return;
			var value = self.parser(el.attrd('value'));
			self.set(value);
			self.change(true);
		});
	};

	self.validate = function(value) {
		return config.disabled || !config.required ? true : !!value;
	};

	self.setter = function(value) {

		selected && selected.rclass('selected');

		if (!value)
			return;

		var el = self.find('[data-value="' + value + '"]');
		if (el) {
			el.aclass('selected');
			selected = el;
		}
	};

	self.bind = function(path, arr) {

		if (!arr)
			arr = EMPTYARRAY;

		var builder = [];
		var propText = config.text || 'name';
		var propValue = config.value || 'id';

		var type = typeof(arr[0]);
		var notObj = type === 'string' || type === 'number';

		for (var i = 0, length = arr.length; i < length; i++) {
			var item = arr[i];
			item.disabled = +item.disabled || 0;
			builder.push(template(item).replace(reg, function(text) {
				return text.substring(0, 2) === '$i' ? i.toString() : self.path + '[' + i + ']';
			}));
		}

		render = builder.join('');
		self.find(cls2 + '-container').remove();
		self.append('<div class="{0}-container{1}">{2}</div>'.format(cls, config.class ? ' ' + config.class : '', render));
		self.refresh();
		recompile && self.compile();
	};
});