'use strict';
var base = module.superModule;

/**
 * Sends the email with password reset instructions
 * @param {string} email - email for password reset
 * @param {Object} resettingCustomer - the customer requesting password reset
 */
function sendPasswordResetEmail(email, resettingCustomer) {
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var Site = require('dw/system/Site');
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');

    var passwordResetToken = getPasswordResetToken(resettingCustomer);
    var url = URLUtils.https('Account-SetNewPassword', 'token', passwordResetToken);
    var objectForEmail = {
            passwordResetToken: passwordResetToken,
            firstName: resettingCustomer.profile.firstName,
            lastName: resettingCustomer.profile.lastName,
            url: url,
            resettingCustomer: resettingCustomer
       };

    var emailObj = {
            to: email,
            subject: Resource.msg('subject.profile.resetpassword.email', 'login', null),
            from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com',
            type: emailHelpers.emailTypes.passwordReset
        };

    emailHelpers.sendEmail(emailObj, 'account/password/passwordResetEmail', objectForEmail);
}

/**
 * Send an email that would notify the user that account was edited
 * @param {obj} profile - object that contains user's profile information.
 */
function sendAccountEditedEmail(profile, type) {
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var Site = require('dw/system/Site');
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var Logger = require('dw/system/Logger');

    Logger.debug("sendAccountEditedEmail: type="+type);
    var userObject = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        url: URLUtils.https('Login-Show')
    };

    var emailObj = {
        to: profile.email,
        subject: Resource.msg('email.subject.account.edited', 'account', null),
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com',
        type: type
    };

    emailHelpers.sendEmail(emailObj, 'account/components/accountEditedEmail', userObject);
}

module.exports = {
    getLoginRedirectURL: base.getLoginRedirectURL,
    sendCreateAccountEmail: base.sendCreateAccountEmail,
    sendPasswordResetEmail: sendPasswordResetEmail,
    sendAccountEditedEmail: sendAccountEditedEmail
};
