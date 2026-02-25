interface PaystackPopOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  access_code?: string;
  metadata?: Record<string, unknown>;
  callback?: (response: { reference: string; status: string }) => void;
  onClose?: () => void;
}

interface PaystackPopInstance {
  openIframe: () => void;
}

interface PaystackPopConstructor {
  setup(options: PaystackPopOptions): PaystackPopInstance;
}

declare const PaystackPop: PaystackPopConstructor;

interface Window {
  PaystackPop: PaystackPopConstructor;
}
