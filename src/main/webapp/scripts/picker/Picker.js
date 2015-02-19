/**
 * Picker factor class as an helper to picker controller.
 *
 *
 * @author Ramana
 */


bulkloader.events.ELEMENT_INSTANCES_LOAD = 'ELEMENT_INSTANCES_LOAD';
bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED = 'NEW_ELEMENT_INSTANCE_CREATED';

namespace('bulkloader.Picker').oauth_elementkey = null;

//TODO Handle this in getting from server ? or BETTER PLACE
namespace('bulkloader.Picker').element_config = {
    'sfdcmarketingcloud': {
        'apiKey': '3MVG9A2kN3Bn17huqpbZ.99EPdg6iSfUR6FDLPLdNNvH7GR4VwtTxeXp5lwZ0d0T2VvCONC9.9IAoK.AhQ1z5',
        'apiSecret': '195234918550961596',
        //'callbackUrl': 'http://localhost:5050/elements/bulkloader/src/main/webapp/callback.html'
        'callbackUrl': 'http://localhost:8080/elements/jsp/home.jsp'
    },
    'hubspot': {
        'apiKey': 'dc24e082-6d21-11e4-8c6e-6d3dcdc61a05',
        //'apiSecret': 'uBdvo1WM2jTu2H33utjDd5v0',
        'callbackUrl': 'http://localhost:5050/elements/bulkloader/src/main/webapp/callback.html'
    },
    'eloqua': {
        'apiKey': '282923532784-mkr3pp81hpg3haqac31ki6fosbs66npk.apps.googleusercontent.com',
        'apiSecret': 'uBdvo1WM2jTu2H33utjDd5v0',
        'callbackUrl': 'http://localhost:5050/elements/bulkloader/src/main/webapp/callback.html'
    },
    'marketo' : {
        'apiKey': '282923532784-mkr3pp81hpg3haqac31ki6fosbs66npk.apps.googleusercontent.com',
        'apiSecret': 'uBdvo1WM2jTu2H33utjDd5v0',
        'callbackUrl': 'http://localhost:5050/elements/bulkloader/src/main/webapp/callback.html'
    }
};

var Picker = Class.extend({
    _elementsService:null,
    _notifications: null,
    _cloudElementsUtils: null,

    selectedElementInstance: null,

    _handleLoadError:function(error){
        //Ignore as these can be ignored or 404's
        console.log('Loading error' + error);
    },


    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    // Load all the instances and from it get the defaultinstance and also set it to _selectedElementInstance
    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------
    /**
     * Start loading element instances
     */
    loadElementInstances:function(){
        var me  = this;

        return me._elementsService.loadElementInstances()
            .then(
            me._handleLoadElementIntanceSuccess.bind(me),
            me._handleLoadError.bind(me) );
    },

    _handleLoadElementIntanceSuccess:function(result){

        //Filtering out only for Marketing
        this._elementInstances = new Object;
        for(var i=0; i <result.data.length; i++){
            var inst = result.data[i];
            if(inst.element.hub == 'marketing') {
                this._elementInstances[inst.element.key] = inst;
            }
        }
        this._notifications.notify(bulkloader.events.ELEMENT_INSTANCES_LOAD);

        return this._elementInstances;
    },

    getOAuthUrl: function(elementKey) {
        var me = this;

        namespace('bulkloader.Picker').oauth_elementkey = elementKey;

        var elementConfigs = bulkloader.Picker.element_config[elementKey];
        return me._elementsService.getOAuthUrl(
                elementKey,
                elementConfigs.apiKey,
                elementConfigs.apiSecret,
                elementConfigs.callbackUrl)
            .then(
            me._handleGetOauthUrl.bind(me),
            me._handleLoadError.bind(me) );
    },

    _handleGetOauthUrl:function(result){
        return result.data.oauthUrl;
    },

    onOauthResponse: function(pagequery) {
        var me = this;

        var pageParameters = me._cloudElementsUtils.getParamsFromURI(pagequery);
        var not_approved= pageParameters.not_approved;

        if(not_approved) {
            // TODO Show that not approved
            return;
        }

        var elementKey  = bulkloader.Picker.oauth_elementkey;
        var elementConfigs = bulkloader.Picker.element_config[elementKey];

        return me._elementsService.createInstance(
                elementKey,
                pageParameters.code,
                elementConfigs.apiKey,
                elementConfigs.apiSecret,
                elementConfigs.callbackUrl)
            .then(
            me._handleOnCreateInstance.bind(me),
            me._handleLoadError.bind(me) );
    },

    _handleOnCreateInstance: function(response) {
        var me = this;

        //Adding the newly created instance to _elementInstances
        me._elementInstances[bulkloader.Picker.oauth_elementkey] = response.data;

        //Notifying for new element instance creation
        me._notifications.notify(bulkloader.events.NEW_ELEMENT_INSTANCES_CREATED);

        return response.data;
    }
});


/**
 * Picker Factory object creation
 *
 */
(function (){

    var PickerObject = Class.extend({

        instance: new Picker(),

        /**
         * Initialize and configure
         */
        $get:['CloudElementsUtils', 'ElementsService','Notifications',function(CloudElementsUtils, ElementsService, Notifications){
            this.instance._cloudElementsUtils = CloudElementsUtils;
            this.instance._elementsService = ElementsService;
            this.instance._notifications = Notifications;
            return this.instance;
        }]
    });

    angular.module('bulkloaderApp')
        .provider('Picker',PickerObject);
}());

Picker.onOauthResponse = function(pagequery) {
    var me = this;
    console.log(pagequery);
    angular.element('body').injector().get('Picker').onOauthResponse(pagequery);
};