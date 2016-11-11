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

    // Base grade for model components that can persist and retrieve their
    // models to PouchDB
    //
    // This is a higher-level grade than the PouchDB datasource that makes
    // some further assumptions about desired behaviour, including:
    // - the automatic generation of timestamp-based IDs for persisted models
    fluid.defaults("floe.dashboard.pouchPersisted", {
        gradeNames: ["floe.dashboard.eventInTimeAware"],
        components: {
            dataSource: {
                type: "gpii.dataSource.pouchDB",
                options: {
                    dbOptions: "{pouchPersisted}.options.dbOptions",
                    dbViews: [{}],
                    requestUrl: "/%entryId",
                    termMap: {
                        "entryId": "noencode:%_id"
                    },
                    writable: true
                }
            }
        },
        events: {
            // Event signature is the retrieved doc
            "onPouchDocRetrieved": null,
            // Event signature is the set request response
            "onPouchDocStored": null,
            // Event signature is the delete request response
            "onPouchDocDeleted": null,
            // Event signature for errors should include the error structure
            // returned by floe.dashboard.pouchPersisted.makeErrorStructure
            // (a basic message + the Pouch error structure)
            "onPouchError": null
        },
        listeners: {
            "onCreate.setPouchId": {
                funcName: "{that}.setPouchId",
                args: "{that}"
            }
        },
        dbOptions: {
            // name: "test",
        },
        // Implementing grades can use these invokers in combinations with
        // events and listeners to store, retrieve and delete model as
        // appropriate
        invokers: {
            // Implementing grades or instances that want a different ID
            // strategy should override this invoker
            "setPouchId": {
                funcName: "floe.dashboard.pouchPersisted.setPouchIdToCurrentTime",
                args: "{that}"
            },
            "get": {
                funcName: "floe.dashboard.pouchPersisted.get",
                args: ["{that}", "{arguments}.0"]
            },
            "set": {
                funcName: "floe.dashboard.pouchPersisted.set",
                args: "{that}"
            },
            "del": {
                funcName: "floe.dashboard.pouchPersisted.del",
                args: "{that}"
            },
            "persist": {
                funcName: "floe.dashboard.pouchPersisted.persist",
                args: "{that}"
            }
        }
    });

    // Sets the ID to to "created" timestamp to make filtering
    // by time easier
    // Interested listeners should listen for a model change event to
    // "_id"
    floe.dashboard.pouchPersisted.setPouchIdToCurrentTime = function (that) {
        that.applier.change("_id", that.model.timeEvents.created);
    };

    // Sets the ID to a string
    // Interested listeners should listen for a model change event to
    // "_id"
    floe.dashboard.pouchPersisted.setPouchIdToString = function (that, idString) {
        that.applier.change("_id", idString);
    };

    // Convenience function for listeners that runs both "set" (for datasource
    // persistence) and floe.dashboard.eventInTimeAware.setModifiedTimeStamp
    // (for updating the modified timestamp)
    // This allows model listeners to be created to listen to consequential
    // model changes, update the modification time, and persist the modified
    // model to the datasource simply by invoking this function
    floe.dashboard.pouchPersisted.persist = function (that) {
        that.setModifiedTimeStamp();
        that.set();
    };

    floe.dashboard.pouchPersisted.makeErrorStructure = function (message, pouchError) {
        return {message: message, pouchError: pouchError};
    };

    // Tries to get the stored version of the document
    // Fires the document as argument to the retrieved event when retrieved
    // Fires an undefined if a matching document is not found
    //
    // retrievalOptions allows passing in the options documented at
    // https://pouchdb.com/api.html#fetch_document

    floe.dashboard.pouchPersisted.get = function (that, retrievalOptions) {
        retrievalOptions = retrievalOptions || {};
        var docId = that.model._id;

        return that.dataSource.get({"_id": docId}, retrievalOptions).then(function (retrievedDoc) {
            that.events.onPouchDocRetrieved.fire(retrievedDoc);
        }, function (getErr) {
            var errorMessage = floe.dashboard.pouchPersisted.makeErrorStructure("GET failed", getErr);
            fluid.log(fluid.logLevel.IMPORTANT, errorMessage);
            that.events.onPouchError.fire(errorMessage);
        });
    };

    // Creates or updates the persisted model
    floe.dashboard.pouchPersisted.set = function (that) {
        var doc = fluid.copy(that.model);
        var docId = that.model._id;
        return that.dataSource.set({"_id": docId}, doc, {}).then(function (result) {
            that.events.onPouchDocStored.fire(result);
        }, function (setErr) {
            var errorMessage = floe.dashboard.pouchPersisted.makeErrorStructure("SET failed", setErr);
            fluid.log(fluid.logLevel.IMPORTANT, errorMessage);
            that.events.onPouchError.fire(errorMessage);
        });
    };

    // Delete the persisted document
    // TODO: this needs an actual functional implementation
    floe.dashboard.pouchPersisted.del = function (that) {
        var docId = that.model._id;
        // "delete" by setting to blank
        return that.dataSource.set({"_id": docId}, {}, {}).then(function (result) {
            that.events.onPouchDocDeleted.fire(result);
        }, function (setErr) {
            var errorMessage = floe.dashboard.pouchPersisted.makeErrorStructure("SET to {} (delete) failed", setErr);
            fluid.log(fluid.logLevel.IMPORTANT, errorMessage);
            that.events.onPouchError.fire(errorMessage);
        });
    };

})(jQuery, fluid);
