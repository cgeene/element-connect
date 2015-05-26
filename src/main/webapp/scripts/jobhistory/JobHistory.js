/**
 * JobHistory factor class as an helper to JobHistory controller.
 *
 *
 * @author Paris
 */

var JobHistory = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,
    _picker: null,

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    }

});


/**
 * JobHistory Factory object creation
 *
 */
(function (){

    var JobHistoryObject = Class.extend({

        instance: new JobHistory(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService','Notifications', 'Picker', function(CloudElementsUtils, ElementsService, Notifications, Picker){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            this.instance._picker = Picker;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('JobHistory',JobHistoryObject);
}());