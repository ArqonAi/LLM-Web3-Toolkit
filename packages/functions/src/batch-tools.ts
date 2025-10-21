/**
 * Batch Transaction Tools for OpenAI/OpenRouter (Tools Format)
 */

import * as batchFuncs from './batch-openai';

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

function functionToTool(func: typeof batchFuncs.createBatch): OpenAITool {
  return {
    type: 'function',
    function: {
      name: func.name,
      description: func.description,
      parameters: func.parameters,
    },
  };
}

export const createBatch: OpenAITool = functionToTool(batchFuncs.createBatch);
export const estimateBatchCost: OpenAITool = functionToTool(batchFuncs.estimateBatchCost);

export const batchTools: OpenAITool[] = [
  createBatch,
  estimateBatchCost,
];
