type ToastType = 'success' | 'error' | 'info';
type Listener = (msg: string, type: ToastType) => void;

let _listener: Listener | null = null;

export const toast = {
  success: (msg: string) => _listener?.(msg, 'success'),
  error:   (msg: string) => _listener?.(msg, 'error'),
  info:    (msg: string) => _listener?.(msg, 'info'),
  _subscribe:   (fn: Listener) => { _listener = fn; },
  _unsubscribe: () => { _listener = null; },
};
