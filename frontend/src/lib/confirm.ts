type ConfirmOptions = { title?: string; message: string; confirmText?: string; danger?: boolean; };
type ConfirmRequest = ConfirmOptions & { resolve: (val: boolean) => void };

let _listener: ((req: ConfirmRequest) => void) | null = null;

export function confirm(message: string, options?: Omit<ConfirmOptions, 'message'>): Promise<boolean> {
  return new Promise((resolve) => {
    if (!_listener) { resolve(window.confirm(message)); return; }
    _listener({ message, ...options, resolve });
  });
}

export const confirmEvents = {
  subscribe:   (fn: (req: ConfirmRequest) => void) => { _listener = fn; },
  unsubscribe: () => { _listener = null; },
};

export type { ConfirmRequest };
