/**
 * Batch Transaction Functions for OpenAI
 */

export interface OpenAIFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const createBatch: OpenAIFunction = {
  name: 'create_batch_transaction',
  description: 'Create a batch of multiple transactions to execute together. Use for sending multiple payments or contract calls efficiently.',
  parameters: {
    type: 'object',
    properties: {
      transactions: {
        type: 'array',
        description: 'Array of transactions to execute',
        items: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient address',
              pattern: '^0x[a-fA-F0-9]{40}$',
            },
            value: {
              type: 'string',
              description: 'Amount to send in ETH (optional)',
            },
            data: {
              type: 'string',
              description: 'Transaction data for contract calls (optional)',
            },
            description: {
              type: 'string',
              description: 'Human-readable description of this transaction',
            },
          },
          required: ['to'],
        },
      },
      atomic: {
        type: 'boolean',
        description: 'If true, all transactions fail if any single one fails. If false, execute sequentially with retries.',
      },
      delayMs: {
        type: 'number',
        description: 'Milliseconds to wait between transactions (for sequential execution)',
      },
    },
    required: ['transactions'],
  },
};

export const estimateBatchCost: OpenAIFunction = {
  name: 'estimate_batch_cost',
  description: 'Estimate the total gas cost for a batch of transactions before executing',
  parameters: {
    type: 'object',
    properties: {
      transactions: {
        type: 'array',
        description: 'Array of transactions to estimate',
        items: {
          type: 'object',
          properties: {
            to: { type: 'string' },
            value: { type: 'string' },
            data: { type: 'string' },
          },
          required: ['to'],
        },
      },
    },
    required: ['transactions'],
  },
};

/**
 * All batch transaction functions
 */
export const batchFunctions: OpenAIFunction[] = [
  createBatch,
  estimateBatchCost,
];
