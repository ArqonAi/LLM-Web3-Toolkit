/**
 * Tron Chain Definitions
 */

export interface TronChain {
  id: string;
  name: string;
  network: 'mainnet' | 'shasta' | 'nile';
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: { http: string[] };
    public: { http: string[] };
  };
  blockExplorers?: {
    default: { name: string; url: string };
  };
  testnet?: boolean;
}

/**
 * Tron Mainnet
 */
export const tron: TronChain = {
  id: 'tron:mainnet',
  name: 'Tron',
  network: 'mainnet',
  nativeCurrency: {
    name: 'Tronix',
    symbol: 'TRX',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://api.trongrid.io'],
    },
    public: {
      http: [
        'https://api.trongrid.io',
        'https://api.tronstack.io',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tronscan',
      url: 'https://tronscan.org',
    },
  },
  testnet: false,
};

/**
 * Tron Shasta Testnet
 */
export const tronShasta: TronChain = {
  id: 'tron:shasta',
  name: 'Tron Shasta',
  network: 'shasta',
  nativeCurrency: {
    name: 'Tronix',
    symbol: 'TRX',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://api.shasta.trongrid.io'],
    },
    public: {
      http: ['https://api.shasta.trongrid.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tronscan',
      url: 'https://shasta.tronscan.org',
    },
  },
  testnet: true,
};

/**
 * Tron Nile Testnet
 */
export const tronNile: TronChain = {
  id: 'tron:nile',
  name: 'Tron Nile',
  network: 'nile',
  nativeCurrency: {
    name: 'Tronix',
    symbol: 'TRX',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://api.nileex.io'],
    },
    public: {
      http: ['https://api.nileex.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tronscan',
      url: 'https://nile.tronscan.org',
    },
  },
  testnet: true,
};

/**
 * All Tron chains
 */
export const allTronChains: TronChain[] = [
  tron,
  tronShasta,
  tronNile,
];
