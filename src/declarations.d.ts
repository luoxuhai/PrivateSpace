declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module 'react-native-dynamic-app-icon' {
  interface IRNDynamicAppIcon {
    supportsDynamicAppIcon: () => Promise<boolean>;
    setAppIcon: (name: string | null) => void;
    getIconName: (callback: (result: { iconName: string }) => void) => void;
  }
  const reactNativeDynamicAppIcon: IRNDynamicAppIcon;
  export default reactNativeDynamicAppIcon;
}

declare module 'react-native-ios-popover' {
  export const PopoverView: React.FC;
}

declare module 'react-native-popover-menu' {
  const content: React.FC;
  export default content;
}

declare module 'react-native-quicklook-view' {
  const content: React.FC;
  export default content;
}

// declare module 'react-native-http-server' {
//   interface Request {
//     requestId: string;
//     url: string;
//     type: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'OPTIONS';
//     file?: {
//       fileName: string;
//       mimeType: string;
//       path: string;
//     };
//     headers: {
//       [key: string]: string;
//     };
//     body?: {
//       [key: string]: any;
//     };
//     query: {
//       [key: string]: any;
//     };
//   }

//   interface Response {
//     send: (status: number, contentType?: string, content?: string) => void;
//     sendFile: (path: string, contentType?: string) => void;
//   }

//   interface HttpServer {
//     start: (
//       port: number,
//       serviceName: 'http_service',
//       callback: (request: Request, response: Response) => void,
//     ) => PVoid;
//     stop: () => PVoid;
//     respond: (
//       requestId: string,
//       status: number,
//       contentType?: string,
//       content?: string,
//     ) => void;
//     responseFile: (requestId: string, path: string) => void;
//   }
//   const httpServer: HttpServer;
//   export default httpServer;
// }
