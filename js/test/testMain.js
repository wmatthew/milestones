"use strict";
require.config({
    paths: {
        'QUnit': '../node_modules/qunitjs/qunit/qunit',
        'lib': '../lib',
        'main': '..'
    },
    shim: {
       'QUnit': {
           exports: 'QUnit',
           init: function() {
               QUnit.config.autoload = false;
               QUnit.config.autostart = false;
           }
       }
    }
});

// require the unit tests.
require(
    ['QUnit', 'MilestoneTest'],
    function(QUnit, milestoneTest) {
        // run the tests.
        milestoneTest.run();

        // start QUnit.
        QUnit.load();
        QUnit.start();
    }
);

