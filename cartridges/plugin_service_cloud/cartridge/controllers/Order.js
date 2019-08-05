'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('Confirm', function (req, res, next) {
    var OrderMgr = require('dw/order/OrderMgr');
    var order = OrderMgr.getOrder(req.querystring.ID);
    require('dw/system/HookMgr').callHook('app.order.created', 'created', order);

    next();
});

module.exports = server.exports();
