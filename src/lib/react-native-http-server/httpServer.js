/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 * @providesModule react-native-http-server
 */
'use strict';

import { NativeEventEmitter } from 'react-native';
import { NativeModules } from 'react-native';

const Server = NativeModules.HttpServer;
const { HTTP_SERVER_RESPONSE_RECEIVED } = Server.getConstants();
const serverEvent = new NativeEventEmitter(Server);

export default {
  start: async (port, serviceName, callback) => {
    if (port === 80) {
      throw 'Invalid server port specified. Port 80 is reserved.';
    }

    const result = await Server.start(port, serviceName);

    serverEvent.addListener(HTTP_SERVER_RESPONSE_RECEIVED, request => {
      callback(request, {
        send: (status, contentType, content) => {
          Server.respond(request.requestId, status, contentType, content);
        },
        sendFile: path => Server.responseFile(request.requestId, path),
      });
    });
    return result;
  },

  stop: async () => {
    await Server.stop();
    serverEvent.removeAllListeners(HTTP_SERVER_RESPONSE_RECEIVED);
  },

  respond: (requestId, code, type, body) => {
    Server.respond(requestId, code, type, body);
  },

  responseFile: (requestId, path) => {
    Server.responseFile(requestId, path);
  },
};
