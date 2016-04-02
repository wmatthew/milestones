"use strict";
requirejs.config({
	paths: {
		lib: 'lib',
		main: '.'
	}
});

requirejs(['lib/date.format', 'lib/pikaday/pikaday'], function() {
	requirejs(['LoadResults']);
});