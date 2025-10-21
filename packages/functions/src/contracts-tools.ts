/**
 * Smart Contract Tools for OpenAI/OpenRouter (Tools Format)
 * 
 * Compatible with OpenAI v1.1+ and OpenRouter
 */

import * as contractFuncs from './contracts-openai';

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
function functionToTool(func: typeof contractFuncs.readContract): OpenAITool {
  return {
    type: 'function',
    function: {
      name: func.name,
      description: func.description,
      parameters: func.parameters,
    },
  };
}

export const readContract: OpenAITool = functionToTool(contractFuncs.readContract);
export const writeContract: OpenAITool = functionToTool(contractFuncs.writeContract);
export const getContractEvents: OpenAITool = functionToTool(contractFuncs.getContractEvents);
export const deployContract: OpenAITool = functionToTool(contractFuncs.deployContract);
export const encodeFunction: OpenAITool = functionToTool(contractFuncs.encodeFunction);
export const erc20Transfer: OpenAITool = functionToTool(contractFuncs.erc20Transfer);
export const erc20Approve: OpenAITool = functionToTool(contractFuncs.erc20Approve);
export const erc20Allowance: OpenAITool = functionToTool(contractFuncs.erc20Allowance);

/**
 * All contract interaction tools
 */
export const contractTools: OpenAITool[] = [
  readContract,
  writeContract,
  getContractEvents,
  deployContract,
  encodeFunction,
  erc20Transfer,
  erc20Approve,
  erc20Allowance,
];

/**
 * Read-only contract tools
 */
export const readOnlyContractTools: OpenAITool[] = [
  readContract,
  getContractEvents,
  encodeFunction,
  erc20Allowance,
];

/**
 * Write contract tools (require approval)
 */
export const writeContractTools: OpenAITool[] = [
  writeContract,
  deployContract,
  erc20Transfer,
  erc20Approve,
];
