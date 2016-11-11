/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global PouchDB, fluid, floe */

(function ($, fluid) {
    "use strict";

    // Sets up and tears down a test DB for each test case
    fluid.defaults("floe.tests.dashboard.pouchPersistedTestCaseHolder", {
        // Set for individual test case
        // dbOptions: {
        //     name: "testDelete"
        // },
        gradeNames: ["fluid.test.testCaseHolder"],
        listeners: {
            "onCreate.setupPouchTestDB": {
                funcName: "floe.tests.dashboard.pouchPersistedTestCaseHolder.setupPouchTestDB",
                args: ["{that}.options.dbOptions.name", "{that}.options.dbOptions.remoteName"]
            },
            "onDestroy.tearDownPouchTestDB": {
                funcName: "floe.tests.dashboard.pouchPersistedTestCaseHolder.tearDownPouchTestDB",
                args: ["{that}.options.dbOptions.name"]
            }
        }
    });

    // Any necessary setup
    floe.tests.dashboard.pouchPersistedTestCaseHolder.setupPouchTestDB = function () {

    };

    // Any necessary teardown
    floe.tests.dashboard.pouchPersistedTestCaseHolder.tearDownPouchTestDB = function (name) {
        new PouchDB(name).destroy();
    };
})(jQuery, fluid);
