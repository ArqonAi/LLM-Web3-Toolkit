/**
 * Solana Chain Definitions
 */

export interface SolanaChain {
  id: string;
  name: string;
  network: 'mainnet-beta' | 'devnet' | 'testnet';
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
 * Solana Mainnet
 */
export const solana: SolanaChain = {
  id: 'solana:mainnet',
  name: 'Solana',
  network: 'mainnet-beta',
  nativeCurrency: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
  },
  rpcUrls: {
    default: {
      http: ['https://api.mainnet-beta.solana.com'],
    },
    public: {
      http: [
        'https://api.mainnet-beta.solana.com',
        'https://solana-api.projectserum.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Solscan',
      url: 'https://solscan.io',
    },
  },
  testnet: false,
};

/**
 * Solana Devnet
 */
export const solanaDevnet: SolanaChain = {
  id: 'solana:devnet',
  name: 'Solana Devnet',
  network: 'devnet',
  nativeCurrency: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
  },
  rpcUrls: {
    default: {
      http: ['https://api.devnet.solana.com'],
    },
    public: {
      http: ['https://api.devnet.solana.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Solscan',
      url: 'https://solscan.io',
    },
  },
  testnet: true,
};

/**
 * Solana Testnet
 */
export const solanaTestnet: SolanaChain = {
  id: 'solana:testnet',
  name: 'Solana Testnet',
  network: 'testnet',
  nativeCurrency: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
  },
  rpcUrls: {
    default: {
      http: ['https://api.testnet.solana.com'],
    },
    public: {
      http: ['https://api.testnet.solana.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Solscan',
      url: 'https://solscan.io',
    },
  },
  testnet: true,
};

/**
 * All Solana chains
 */
export const allSolanaChains: SolanaChain[] = [
  solana,
  solanaDevnet,
  solanaTestnet,
];
