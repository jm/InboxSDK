var NativeGmailNavItemView = require('../views/native-gmail-nav-item-view');
var $ = require('jquery');
var GmailElementGetter = require('../gmail-element-getter');

var waitFor = require('../../../lib/wait-for');

module.exports = function(label){
	return waitFor(function(){
		return $(GmailElementGetter.getLeftNavContainerElement()).find('.aim a[href*=#' + label + ']').length > 0;
	}, 300*1000).then(function(){
		var labelLinkElement = $(GmailElementGetter.getLeftNavContainerElement()).find('.aim a[href*=#' + label + ']');

		var labelElement = labelLinkElement.closest('.aim')[0];

		if(!labelElement){
			throw new Error('native nav item structured weird');
		}

		if(!labelElement.__nativeGmailNavItemView){
			labelElement.__nativeGmailNavItemView = new NativeGmailNavItemView(labelElement);
		}

		return labelElement.__nativeGmailNavItemView;
	}).catch(function(err){
		if(GmailElementGetter.isStandalone()){
			// never resolve
			return new Promise((resolve, reject) => {});
		}

		throw err;
	});
};
