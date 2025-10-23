/**
 * WalletConnect v2 Provider
 * 
 * Enables connection to mobile wallets and multi-chain support
 * including Ethereum, Tron, Solana, and more.
 */

import { Chain, WalletConnection } from './types';

export interface WalletConnectConfig {
  projectId: string; // Get from https://cloud.walletconnect.com
  chains: Chain[];
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export interface WalletConnectSession {
  topic: string;
  pairingTopic?: string;
  relay: { protocol: string };
  expiry: number;
  acknowledged: boolean;
  controller: string;
  namespaces: Record<string, any>;
  requiredNamespaces: Record<string, any>;
  optionalNamespaces?: Record<string, any>;
  sessionProperties?: Record<string, string>;
}

export interface WalletConnectPairing {
  topic: string;
  uri: string;
  qrCodeUri: string;
  expiry: number;
}

/**
 * WalletConnect Provider
 * 
 * Features:
 * - QR code connection
 * - Deep linking
 * - Multi-chain support (EVM, Solana, Tron)
 * - Session management
 * - Mobile wallet support
 */
export class WalletConnectProvider {
  private config: WalletConnectConfig;
  private session: WalletConnectSession | null = null;
  private signClient: any = null; // Will be @walletconnect/sign-client

  constructor(config: WalletConnectConfig) {
    this.config = config;
  }

  /**
   * Initialize WalletConnect client
   */
  async initialize(): Promise<void> {
    // TODO: Initialize @walletconnect/sign-client
    // This requires the WalletConnect SDK to be installed
    throw new Error('WalletConnect SDK not yet integrated. Install @walletconnect/sign-client');
  }

  /**
   * Create connection pairing (generates QR code)
   */
  async createPairing(): Promise<WalletConnectPairing> {
    if (!this.signClient) {
      throw new Error('WalletConnect not initialized');
    }

    // Generate pairing URI
    const { uri, approval } = await this.signClient.connect({
      requiredNamespaces: this.buildNamespaces(),
    });

    if (!uri) {
      throw new Error('Failed to generate pairing URI');
    }

    // Wait for approval in background
    approval().then((session: WalletConnectSession) => {
      this.session = session;
    });

    return {
      topic: '',
      uri,
      qrCodeUri: uri,
      expiry: Date.now() + 300000, // 5 minutes
    };
  }

  /**
   * Connect to wallet via WalletConnect
   */
  async connect(): Promise<WalletConnection> {
    await this.createPairing();

    // In a real implementation, this would wait for user to scan QR
    // and approve the connection on their mobile wallet

    if (!this.session) {
      throw new Error('Connection not approved');
    }

    // Extract account from session
    const accounts = this.getAccountsFromSession(this.session);
    if (accounts.length === 0) {
      throw new Error('No accounts found in session');
    }

    const address = accounts[0];
    const chainId = this.extractChainId(this.session);

    return {
      address,
      chainId,
      provider: 'walletconnect',
      connected: true,
    };
  }

  /**
   * Disconnect session
   */
  async disconnect(): Promise<void> {
    if (!this.signClient || !this.session) {
      return;
    }

    await this.signClient.disconnect({
      topic: this.session.topic,
      reason: {
        code: 6000,
        message: 'User disconnected',
      },
    });

    this.session = null;
  }

  /**
   * Send transaction via WalletConnect
   */
  async sendTransaction(params: {
    from: string;
    to: string;
    value?: string;
    data?: string;
    gas?: string;
  }): Promise<string> {
    if (!this.signClient || !this.session) {
      throw new Error('Not connected');
    }

    const result = await this.signClient.request({
      topic: this.session.topic,
      chainId: `eip155:${this.extractChainId(this.session)}`,
      request: {
        method: 'eth_sendTransaction',
        params: [params],
      },
    });

    return result as string;
  }

  /**
   * Sign message via WalletConnect
   */
  async signMessage(message: string, address: string): Promise<string> {
    if (!this.signClient || !this.session) {
      throw new Error('Not connected');
    }

    const result = await this.signClient.request({
      topic: this.session.topic,
      chainId: `eip155:${this.extractChainId(this.session)}`,
      request: {
        method: 'personal_sign',
        params: [message, address],
      },
    });

    return result as string;
  }

  /**
   * Get active session
   */
  getSession(): WalletConnectSession | null {
    return this.session;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.session !== null;
  }

  /**
   * Build namespaces for multi-chain support
   */
  private buildNamespaces(): Record<string, any> {
    const namespaces: Record<string, any> = {};

    // Group chains by namespace
    const evmChains: number[] = [];
    const solanaChains: string[] = [];
    const tronChains: string[] = [];

    for (const chain of this.config.chains) {
      if (chain.id) {
        evmChains.push(chain.id);
      }
      // TODO: Add Solana and Tron chain detection
    }

    // EVM namespace (Ethereum, Polygon, BSC, etc.)
    if (evmChains.length > 0) {
      namespaces.eip155 = {
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
        ],
        chains: evmChains.map(id => `eip155:${id}`),
        events: ['chainChanged', 'accountsChanged'],
      };
    }

    // Solana namespace
    if (solanaChains.length > 0) {
      namespaces.solana = {
        methods: [
          'solana_signTransaction',
          'solana_signMessage',
        ],
        chains: solanaChains,
        events: [],
      };
    }

    // Tron namespace
    if (tronChains.length > 0) {
      namespaces.tron = {
        methods: [
          'tron_signTransaction',
          'tron_signMessage',
        ],
        chains: tronChains,
        events: [],
      };
    }

    return namespaces;
  }

  /**
   * Extract accounts from session
   */
  private getAccountsFromSession(session: WalletConnectSession): string[] {
    const accounts: string[] = [];

    for (const namespace of Object.values(session.namespaces)) {
      if (namespace.accounts) {
        for (const account of namespace.accounts) {
          // Format: "eip155:1:0x..."
          const address = account.split(':')[2];
          if (address) {
            accounts.push(address);
          }
        }
      }
    }

    return accounts;
  }

  /**
   * Extract chain ID from session
   */
  private extractChainId(session: WalletConnectSession): number {
    const eip155Namespace = session.namespaces.eip155;
    if (!eip155Namespace) {
      return 1; // Default to Ethereum mainnet
    }

    const firstChain = eip155Namespace.chains?.[0];
    if (!firstChain) {
      return 1;
    }

    // Parse "eip155:1" -> 1
    const chainId = parseInt(firstChain.split(':')[1]);
    return isNaN(chainId) ? 1 : chainId;
  }

  /**
   * Generate QR code data URL
   */
  generateQRCode(uri: string): string {
    // In a real implementation, this would use a QR code library
    // For now, return the URI that can be used with any QR library
    return uri;
  }

  /**
   * Get deep link for mobile wallet
   */
  getDeepLink(uri: string, wallet: 'metamask' | 'trust' | 'rainbow' | 'coinbase'): string {
    const encodedUri = encodeURIComponent(uri);

    const deepLinks = {
      metamask: `metamask://wc?uri=${encodedUri}`,
      trust: `trust://wc?uri=${encodedUri}`,
      rainbow: `rainbow://wc?uri=${encodedUri}`,
      coinbase: `cbwallet://wc?uri=${encodedUri}`,
    };

    return deepLinks[wallet];
  }
}

/**
 * Helper: Create WalletConnect provider
 */
export function createWalletConnectProvider(
  config: WalletConnectConfig
): WalletConnectProvider {
  return new WalletConnectProvider(config);
}

/**
 * Helper: Check if WalletConnect is supported
 */
export function isWalletConnectSupported(): boolean {
  // WalletConnect works in all modern browsers
  return typeof window !== 'undefined';
}
