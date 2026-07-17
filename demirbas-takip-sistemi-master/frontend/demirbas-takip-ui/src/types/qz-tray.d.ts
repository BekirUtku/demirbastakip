declare module 'qz-tray' {
  const qz: {
    websocket: {
      connect: (options?: Record<string, unknown>) => Promise<void>;
      disconnect: () => Promise<void>;
      isActive: () => boolean;
    };
    printers: {
      find: (query?: string) => Promise<string | string[]>;
    };
    configs: {
      create: (printer: string, options?: Record<string, unknown>) => unknown;
    };
    print: (config: unknown, data: unknown[]) => Promise<void>;
    security: {
      setCertificatePromise: (fn: (resolve: (cert: string) => void, reject: (err: Error) => void) => void) => void;
      setSignatureAlgorithm: (algorithm: string) => void;
      setSignaturePromise: (fn: (toSign: string) => (resolve: (sig: string) => void, reject: (err: Error) => void) => void) => void;
    };
  };
  export default qz;
}
