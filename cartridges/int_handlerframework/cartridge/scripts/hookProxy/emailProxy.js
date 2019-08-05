'use strict';

/**
 * @type {dw.system.HookMgr}
 */
var HookMgr = require('dw/system/HookMgr');

/**
 * @type {dw.system.Status}
 */
var Status = require('dw/system/Status');

/**
 * @type {dw.system.Logger}
 */
var Logger = require('dw/system/Logger');

/**
 * @type {SynchronousPromise}
 */
var SynchronousPromise = require('synchronous-promise');


/**
 * Hook proxy to be used with MC Email Connector send action
 * @param args
 * emailObj -> Generic Email Object with Type, this is passed in from SFRA base classes
 * Examples can be 
 * 	emailObj.to,emailObj.subject,emailObj.from,emailObj.type.
 *  emailObj.type example emailHelpers.emailTypes.registration
 * template -> template * For Possible future use *
 * context  -> context contains the actual customer context. 
 * @returns {dw.system.Status}
 * This function is tested and compatible with SFRA Release v3.3.0
 */
function sendEmail(emailObj, template, context) {
	var result;
	var params = new (require('dw/util/HashMap'))();
	var emailData = {};
	params.put('CurrentForms' , session && session.forms);
	params.put('CurrentHttpParameterMap', request && request.httpParameterMap);
	params.put('CurrentCustomer',customer);
	var args = {
	        params: params
    };

   emailData.toEmail = emailObj.to;
   emailData.fromEmail = emailObj.from;
   
   var hookPath = 'app.communication.';
    var hookID = hookPath;
	
    if(emailObj){
    	
      /*registration*/
    	if(emailObj.type === 1){
            hookID += 'account.created';
    	}
    	
      /*passwordReset*/
    	else if (emailObj.type === 2){
    		params.put('CurrentCustomer', context.resettingCustomer);
    		params.put('ResetPasswordToken', context.passwordResetToken)
    		hookID += 'account.passwordReset'; 	
    	}
    	
      /*passwordChanged*/
    	else if (emailObj.type === 3){
    		params.put('CurrentCustomer', context.resettingCustomer);
    		hookID += 'account.passwordChanged';    
    		 
    	}
    	
      /*orderConfirmation*/
    	else if (emailObj.type === 4){
    		hookID += 'order.confirmation';    		
    	}
    	
      /*accountLocked*/
    	else if (emailObj.type === 5){
    		hookID += 'account.lockedOut';    		
    	}
    	
      /*accountEdited*/
    	else if (emailObj.type >= 6){
    		params.put('EmailType', emailObj.type);
    		hookID += 'account.updated';  
    	}
    	else {
            Logger.warn('Mail send hook called, but correct action undetermined, mail not sent as a result.');
        }		
    }
    	    	
    emailData.params = params;
    
    if (hookID !== hookPath && HookMgr.hasHook(hookID)) {
      var promise = SynchronousPromise.unresolved()
            .then(function(data){
                result = data;
            })
            .catch(function(data){
                result = data;
            });
    
            
            HookMgr.callHook(
                hookID,
                hookID.slice(hookID.lastIndexOf('.')+1),
                promise,
                emailData
            );
        
    var success = result && (result.status === 'OK');
    return new Status( success ? Status.OK : Status.ERROR );
  }
}

exports.sendEmail = sendEmail;
