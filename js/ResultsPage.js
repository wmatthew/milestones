"use strict";
requirejs.config({
	paths: {
		lib: 'lib',
		main: '.'
	}
});

requirejs(['lib/date.format'], function(x) {
	requirejs(['LoadResults']);
});