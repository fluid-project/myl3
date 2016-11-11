/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, floe, jqUnit, gpii */

(function ($, fluid) {

    "use strict";

    fluid.registerNamespace("floe.tests.dashboard");

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponent", {
        gradeNames: ["floe.dashboard.pouchPersisted"],
        model: {
            "persistedValues": {
                "boolean": true,
                "integer": 3,
                "string": "Hello World",
                "decimal": 3.76,
            }
        },
        modelListeners: {
            "persistedValues": {
                func: "{that}.persist",
                excludeSource: "init"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTestEnvironment.base", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            pouchPersistedComponent: {
                type: "floe.tests.dashboard.pouchPersistedComponent",
                createOnEvent: "{pouchPersistedComponentTester}.events.onTestCaseStart"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTestEnvironment.storageTest", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedComponentTestEnvironment.base"],
        components: {
            pouchPersistedComponentTester: {
                type: "floe.tests.dashboard.pouchPersistedTestCaseHolder.storage"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTestEnvironment.deleteTest", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedComponentTestEnvironment.base"],
        components: {
            pouchPersistedComponentTester: {
                type: "floe.tests.dashboard.pouchPersistedTestCaseHolder.delete"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTestEnvironment.errorTest", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedComponentTestEnvironment.base"],
        components: {
            pouchPersistedComponentTester: {
                type: "floe.tests.dashboard.pouchPersistedTestCaseHolder.error"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedTestCaseHolder.storage", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedTestCaseHolder"],
        dbOptions: {
            name: "testStorage"
        },
        modules: [ {
            name: "PouchDB persisted component - storage test cases",
            tests: [{
                expect: 2,
                name: "Test storage",
                sequence: [
                    {
                        func: "{pouchPersistedComponent}.persist"
                    },
                    {
                        listener: "{pouchPersistedComponent}.get",
                        event: "{pouchPersistedComponent}.events.onPouchDocStored"
                    },
                    {
                        listener: "floe.tests.dashboard.testPouchPersistedStorage",
                        event: "{pouchPersistedComponent}.events.onPouchDocRetrieved",
                        args: ["{pouchPersistedComponent}", "{arguments}.0", "Component model and retrieved document are identical, except for _rev"]
                    },
                    {
                        func: "{pouchPersistedComponent}.applier.change",
                        args: ["persistedValues.string", "Hello brave new world."]
                    },
                    {
                        listener: "{pouchPersistedComponent}.get",
                        event: "{pouchPersistedComponent}.events.onPouchDocStored"
                    },
                    {
                        listener: "floe.tests.dashboard.testPouchPersistedStorage",
                        event: "{pouchPersistedComponent}.events.onPouchDocRetrieved",
                        args: ["{pouchPersistedComponent}", "{arguments}.0", "Following an applier.change-based update, model and retrieved document are identical, except for _rev"]
                    }
                ]
            }
            ]
        }]
    });

    floe.tests.dashboard.testPouchPersistedStorage = function (that, retrievedDoc, message) {
        // Remove the _rev on retrievedDoc
        var retrievedDocMinusRev = fluid.censorKeys(retrievedDoc, ["_rev"]);
        jqUnit.assertDeepEq(message, that.model, retrievedDocMinusRev);
    };

    fluid.defaults("floe.tests.dashboard.pouchPersistedTestCaseHolder.delete", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedTestCaseHolder"],
        dbOptions: {
            name: "testDelete"
        },
        modules: [ {
            name: "PouchDB persisted component - delete test cases",
            tests: [{
                expect: 1,
                name: "Test delete",
                sequence: [
                    {
                        func: "{pouchPersistedComponent}.persist"
                    },
                    {
                        listener: "{pouchPersistedComponent}.del",
                        event: "{pouchPersistedComponent}.events.onPouchDocStored"
                    },
                    {
                        listener: "floe.tests.dashboard.testPouchPersistedDelete",
                        event: "{pouchPersistedComponent}.events.onPouchDocDeleted",
                        args: ["{pouchPersistedComponent}"]
                    },

                ]
            }
            ]
        }]
    });

    floe.tests.dashboard.testPouchPersistedDelete = function (that) {

        var getPromise = that.get();

        getPromise.then(function () {
            // The promise shouldn't ever be successful in this case;
            // the document will have been deleted
        }, function (error) {
            jqUnit.assertDeepEq("Document not found after delete", floe.tests.dashboard.expectedPouchErrors.deleted404, error);
        });
    };

    floe.tests.dashboard.expectedPouchErrors = {
        "missing404": {
            error: true,
            message: "missing",
            name: "not_found",
            reason:"missing",
            status: 404
        },
        "deleted404": {
            error: true,
            message: "missing",
            name: "not_found",
            reason:"deleted",
            status: 404
        },
        "documentUpdateConflict409": {
            "error": true,
            "message": "Document update conflict",
            "name": "conflict",
            "status": 409
        }
    };

    floe.tests.dashboard.expectedErrors = {
        "getMissing": {
            message: "GET failed",
            pouchError: floe.tests.dashboard.expectedPouchErrors.missing404
        },
        "getDeleted": {
            message: "GET failed",
            pouchError: floe.tests.dashboard.expectedPouchErrors.deleted404
        },
        "setAfterGetDocumentUpdateConflict": {
            message: "SET failed",
            pouchError: floe.tests.dashboard.expectedPouchErrors.documentUpdateConflict409
        },
        "setAfterGet404DocumentUpdateConflict": {
            message: "SET failed",
            pouchError: floe.tests.dashboard.expectedPouchErrors.documentUpdateConflict409
        },
        "getBeforeDeleteMissing": {
            message: "SET to {} (delete) failed",
            pouchError: floe.tests.dashboard.expectedPouchErrors.missing404
        },
        "getBeforeDeleteDeleted": {
            message: "SET to {} (delete) failed",
            pouchError: floe.tests.dashboard.expectedPouchErrors.deleted404
        }
    };

    fluid.defaults("floe.tests.dashboard.pouchPersistedTestCaseHolder.error", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedTestCaseHolder"],
        dbOptions: {
            name: "testError"
        },
        modules: [ {
            name: "PouchDB persisted component - error test cases",
            tests: [{
                expect: 6,
                name: "Test error events",
                sequence: [
                    {
                        funcName: "{pouchPersistedComponent}.get"
                    },
                    {
                        listener: "floe.tests.dashboard.testPouchPersistedError",
                        event: "{pouchPersistedComponent}.events.onPouchError",
                        args: ["{arguments}.0", "Expected GET error message received when a nonexistent _id is requested", "getMissing"]
                    },
                    {
                        funcName: "{pouchPersistedComponent}.del"
                    },
                    {
                        listener: "floe.tests.dashboard.testPouchPersistedError",
                        event: "{pouchPersistedComponent}.events.onPouchError",
                        args: ["{arguments}.0", "Expected GET before DELETE error message received when a nonexistent _id has delete requested", "getBeforeDeleteMissing"]
                    },
                    {
                        funcName: "floe.tests.dashboard.induceSetError",
                        args: ["{pouchPersistedComponent}"]
                    },
                    {
                        listener: "floe.tests.dashboard.testPouchPersistedError",
                        event: "{pouchPersistedComponent}.events.onPouchError",
                        args: ["{arguments}.0", "Expected SET error message received in a document update conflict when creating", "setAfterGet404DocumentUpdateConflict"]
                    },
                    {
                        funcName: "floe.tests.dashboard.induceSetError",
                        args: ["{pouchPersistedComponent}"]
                    },
                    {
                        listener: "floe.tests.dashboard.testPouchPersistedError",
                        event: "{pouchPersistedComponent}.events.onPouchError",
                        args: ["{arguments}.0", "Expected SET error message received in a document update conflict when updating", "setAfterGetDocumentUpdateConflict"]
                    },
                    {
                        funcName: "{pouchPersistedComponent}.persist"
                    },
                    {
                        listener: "{pouchPersistedComponent}.del",
                        event: "{pouchPersistedComponent}.events.onPouchDocStored"
                    },
                    {
                        listener: "{pouchPersistedComponent}.get",
                        event: "{pouchPersistedComponent}.events.onPouchDocDeleted",
                        args: ["{pouchPersistedComponent}"]
                    },
                    {
                        listener: "floe.tests.dashboard.testPouchPersistedError",
                        event: "{pouchPersistedComponent}.events.onPouchError",
                        args: ["{arguments}.0", "Expected GET error message received when a deleted _id is requested", "getDeleted"]
                    }, {
                        funcName: "{pouchPersistedComponent}.del"
                    },
                    {
                        listener: "floe.tests.dashboard.testPouchPersistedError",
                        event: "{pouchPersistedComponent}.events.onPouchError",
                        args: ["{arguments}.0", "Expected GET before DELETE error message received when a deleted _id has delete requested again", "getBeforeDeleteDeleted"]
                    }
                ]
            }
            ]
        }]
    });

    floe.tests.dashboard.testPouchPersistedError = function (getError, message, expected) {
        jqUnit.assertDeepEq(message, floe.tests.dashboard.expectedErrors[expected], getError);
    };

    // Incudes a set error by calling the applier back to back before
    // the promises complete
    floe.tests.dashboard.induceSetError = function (that) {
        that.applier.change("persistedValues.string", "Hello 1");
        that.applier.change("persistedValues.string", "Hello 2");
    };

    $(document).ready(function () {

        gpii.pouch({dbOptions: {
            name: "testStorage"
        }});

        floe.tests.dashboard.pouchPersistedComponentTestEnvironment.storageTest();

        gpii.pouch({dbOptions: {
            name: "testDelete"
        }});

        floe.tests.dashboard.pouchPersistedComponentTestEnvironment.deleteTest();

        gpii.pouch({dbOptions: {
            name: "testError"
        }});

        floe.tests.dashboard.pouchPersistedComponentTestEnvironment.errorTest();
    });

})(jQuery, fluid);
