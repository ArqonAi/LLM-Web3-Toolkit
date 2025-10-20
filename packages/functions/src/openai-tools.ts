/**
 * OpenAI Tools Format (v1.1+ API)
 * 
 * For use with OpenRouter and newer OpenAI API endpoints.
 * Uses "tools" instead of "functions" parameter.
 */

import * as funcs from './openai';

export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

// Convert function format to tool format
function functionToTool(func: typeof funcs.getWalletAddress): OpenAITool {
  return {
    type: 'function',
    function: {
      name: func.name,
      description: func.description,
      parameters: func.parameters,
    },
  };
}

export const getWalletAddress: OpenAITool = functionToTool(funcs.getWalletAddress);
export const getBalance: OpenAITool = functionToTool(funcs.getBalance);
export const getTokenBalance: OpenAITool = functionToTool(funcs.getTokenBalance);
export const sendNative: OpenAITool = functionToTool(funcs.sendNative);
export const sendToken: OpenAITool = functionToTool(funcs.sendToken);
export const estimateGas: OpenAITool = functionToTool(funcs.estimateGas);
export const validateAddress: OpenAITool = functionToTool(funcs.validateAddress);
export const switchChain: OpenAITool = functionToTool(funcs.switchChain);
export const getGasPrice: OpenAITool = functionToTool(funcs.getGasPrice);
export const resolveENS: OpenAITool = functionToTool(funcs.resolveENS);
export const lookupENS: OpenAITool = functionToTool(funcs.lookupENS);

/**
 * All Web3 tools for OpenAI/OpenRouter (tools format)
 */
export const openAITools: OpenAITool[] = [
  getWalletAddress,
  getBalance,
  getTokenBalance,
  sendNative,
  sendToken,
  estimateGas,
  validateAddress,
  switchChain,
  getGasPrice,
  resolveENS,
  lookupENS,
];

/**
 * Read-only tools (no user approval required)
 */
export const readOnlyTools: OpenAITool[] = [
  getWalletAddress,
  getBalance,
  getTokenBalance,
  validateAddress,
  getGasPrice,
  resolveENS,
  lookupENS,
];

/**
 * Write tools (require user approval)
 */
export const writeTools: OpenAITool[] = [
  sendNative,
  sendToken,
  switchChain,
];
