var getDevice = require('./getDevice');
var logEvent = require('./logEvent');
var securityImpl = require('./getSecurityImpl');
var oldUpdateDevice = require('./oldUpdateDevice');

function handleUpdate(fromDevice, data, callback){
  callback = callback || function(){};

  data.uuid = data.uuid || fromDevice.uuid;

  getDevice(data.uuid, function(error, device){
    if(error) {
      callback(error);
      return;
    }

    securityImpl.canConfigure(fromDevice, device, data, function(error, permission) {
      if(!permission || error) {
        callback({error: {message: 'unauthorized', code: 401} });
        return;
      }

      delete data.token;
      oldUpdateDevice(device.uuid, data, function(error, results){
        if (results) {
          results.fromUuid = fromDevice.uuid;
          results.from = fromDevice;
        }
        logEvent(401, results);

        try{
          callback(results);
        } catch (e){
          callback({error: {message: 'an error occurred while updating a device', code: 401} });
        }

      });
    });
  });
}

module.exports = handleUpdate;
