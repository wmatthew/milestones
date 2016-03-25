requirejs.config({
	paths: {
		lib: 'lib'
	}
});

requirejs(['lib/date.format'], function(x) {
	requirejs(['loadResults']);
});