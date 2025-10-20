/**
 * E2E: LLM Function Calling Integration
 */

import { openAIFunctions } from '../../packages/functions/src/openai';
import { anthropicTools } from '../../packages/functions/src/anthropic';

describe('LLM Integration', () => {
  it('validates OpenAI functions', () => {
    expect(openAIFunctions).toHaveLength(11);
    expect(openAIFunctions[0]).toHaveProperty('name');
    expect(openAIFunctions[0]).toHaveProperty('description');
  });

  it('validates Anthropic tools', () => {
    expect(anthropicTools).toHaveLength(11);
    expect(anthropicTools[0]).toHaveProperty('input_schema');
  });
});
