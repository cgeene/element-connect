/**
 * Jobs factor class as an helper to Jobs controller.
 *
 *
 * @author Paris
 */

var Jobs = Class.extend({
    _elementsService: null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,
    _allElements: null,

    _handleLoadError: function(error) {
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },

    getJobs: function() {
        var me = this;
        return me._elementsService.getJobs().then(
            me._handleGetJobSucceeded.bind(me),
            me._handleGetJobFailed.bind(me));
    },

    _handleGetJobSucceeded: function(result) {
        var me = this;

        //Create a new Json to from the result to support UI
        if(me._cloudElementsUtils.isEmpty(result.data)
            || result.data.length == 0) {
            return null;
        }

        var jobsArray = new Array();
        for(var i in result.data) {
            var res = result.data[i];
            var body = res.data.body;
            body = angular.fromJson(body);

            var jobItem = null;
            for(var j in body) {
                var bodyItem = body[j];
                if(jobItem == null) {
                    var srcElement = me._picker.getSourceElement(bodyItem.elementKey);
                    var targetElement = me._picker.getTargetElement(bodyItem.targetConfiguration.elementKey);
                    jobItem = {
                        source: srcElement.name,
                        sourceKey: srcElement.elementKey,
                        sourceLogo: srcElement.image,
                        target: targetElement.name,
                        targetKey: targetElement.elementKey,
                        targetLogo: targetElement.image,
                        transformations: [],
                        jobId: res.id,
                        scheduleType: res.description,
                        scheduleTypeDetail: '1'
                    };
                }

                jobItem.transformations.push({
                    sourceObject: bodyItem.objectName,
                    targetObject: bodyItem.targetConfiguration.objectName.split('_')[2]
                });
            }

            jobsArray.push(jobItem);
        }

        return jobsArray;
    },

    _handleGetJobFailed: function(result) {
        var me = this;

    },

    getHistory: function(jobId) {
        var me = this;
        return me._elementsService.getHistory(jobId).then(
            me._handleGetHistorySucceeded.bind(me),
            me._handleGetHistoryFailed.bind(me));
    },

    _handleGetHistorySucceeded: function(result) {
        var me = this;

        //Modify the result to add the Element Name and Logo using Picker
        if (!me._cloudElementsUtils.isEmpty(result.data)
            && result.data.length > 0) {

//            for (var i in result.data) {
//                var res = result.data[i];
//                var src = me._allElements[res.sourceElementKey];
//                res['sourceLogo'] = src.image;
//                res['source'] = src.name;
//                var tar = me._allElements[res.targetElementKey];
//                if (!me._cloudElementsUtils.isEmpty(tar)) {
//                    res['targetLogo'] = tar.image;
//                    res['target'] = tar.name;
//                }
//            }

            return result.data;
        }

        return null;
    },

    _handleGetHistoryFailed: function(result) {
        var me = this;

    },

    getJobErrors: function(elementKey, jobId) {
        var me = this;
        var instance = me._picker._elementInstances[elementKey];
        return me._elementsService.getJobErrors(instance, jobId).then(
            me._handleGetJobErrors.bind(me),
            me._handleGetJobErrorsFailed.bind(me));
    },

    _handleGetJobErrors: function(results) {
        var me = this;
        return results.data;
    },

    _handleGetJobErrorsFailed: function(results) {
        var me = this;
    }


});

/**
 * JobHistory Factory object creation
 *
 */
(function() {

    var JobsObject = Class.extend({

        instance: new Jobs(),

        /**
         * Initialize and configure
         */
        $get: ['CloudElementsUtils', 'ElementsService', 'Notifications', 'Picker', function(CloudElementsUtils, ElementsService, Notifications, Picker) {
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._picker = Picker;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Jobs', JobsObject);
}());