/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, floe */

(function ($, fluid) {

    "use strict";

    fluid.defaults("floe.dashboard.pouchPersistedInlineEdit", {
        gradeNames: ["floe.dashboard.pouchPersisted", "fluid.inlineEdit"],
        invokers: {
            // Override the standard timestamp-based approach to a
            // fixed ID, for sake of this example; this allows us to
            // retrieve the relevant persisted grade without needing
            // functionality for search or filtering
            "setPouchId": {
                funcName: "floe.dashboard.pouchPersisted.setPouchIdToString",
                args: ["{that}", "myFixedId"]
            }
        },
        selectors: {
            storageLog: ".floec-persistedInlineEdit-loggingArea",
            deleteControl: ".floec-persistedInlineEdit-delete"
        },
        dbOptions: {
            "name": "examples"
        },
        listeners: {
            // Try and retrieve the component on creation
            "onCreate.get": {
                funcName: "{that}.get",
                priority: "after:setPouchId",
                args: [{"revs_info": true}]
            },
            "onCreate.bindDeleteClick": {
                priority: "after:setPouchId",
                funcName: "floe.dashboard.pouchPersistedInlineEdit.bindDeleteClick",
                args: ["{that}"]
            },
            // Update the log from retrieval
            "onPouchDocRetrieved.updateLogFromRetrieved": {
                funcName: "floe.dashboard.pouchPersistedInlineEdit.updateLogFromRetrieved",
                args: ["{that}", "{arguments}.0"]
            },
            // Set the model from retrieval
            "onPouchDocRetrieved.setModelFromRetrieved": {
                funcName: "floe.dashboard.pouchPersistedInlineEdit.setModelFromRetrieved",
                args: ["{that}", "{arguments}.0"]
            },
            "onPouchDocStored.updateLogFromStored": {
                funcName: "floe.dashboard.pouchPersistedInlineEdit.updateLogFromStored",
                args: ["{that}", "{arguments}.0"]
            },
            "onPouchDocDeleted.updateLogFromDeleted": {
                funcName: "floe.dashboard.pouchPersistedInlineEdit.updateLogFromDeleted",
                args: ["{that}", "{arguments}.0"]
            },
            "onPouchError.updateLogFromError": {
                funcName: "floe.dashboard.pouchPersistedInlineEdit.updateLogFromError",
                args: ["{that}", "{arguments}.0"]
            },
            // Persists the component when changes are made
            "modelChanged.persist": {
                funcName: "{that}.persist"
            }
        }
    });

    floe.dashboard.pouchPersistedInlineEdit.bindDeleteClick = function (that) {
        var deleteControl = that.locate("deleteControl");
        deleteControl.click( function (e) {
            e.preventDefault();
            that.del();
        });
    };

    floe.dashboard.pouchPersistedInlineEdit.setModelFromRetrieved = function (that, retrieved) {
        if(retrieved) {
            that.applier.change("", retrieved);
            that.refreshView();
        }
    };

    floe.dashboard.pouchPersistedInlineEdit.updateLogFromRetrieved = function (that, retrieved) {
        var logArea = that.locate("storageLog");
        logArea.prepend("<li>Persisted component retrieved:<br /><pre><code>" + JSON.stringify(retrieved, null, 2) + "</code></pre></li>");
    };

    floe.dashboard.pouchPersistedInlineEdit.updateLogFromStored = function (that, storeResponse) {
        var logArea = that.locate("storageLog");
        logArea.prepend("<li>Persisted component stored:<br /><pre><code>" + JSON.stringify(storeResponse, null, 2) + "</code></pre></li>");
    };

    floe.dashboard.pouchPersistedInlineEdit.updateLogFromDeleted = function (that, deleteResponse) {
        var logArea = that.locate("storageLog");
        logArea.prepend("<li>Persisted component deleted:<br /><pre><code>" + JSON.stringify(deleteResponse, null, 2) + "</code></pre></li>");
    };

    floe.dashboard.pouchPersistedInlineEdit.updateLogFromError = function (that, errorResponse) {
        var logArea = that.locate("storageLog");
        logArea.prepend("<li>Get error - probably no stored model available<br /><pre><code>" + JSON.stringify(errorResponse, null, 2) + "</code></pre></li>");
    };

})(jQuery, fluid);
