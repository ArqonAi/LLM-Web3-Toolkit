import { NextRequest, NextResponse } from 'next/server';
import { openAIFunctions } from '@arqon/web3-functions/openai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/ArqonAi/LLM-Web3-Toolkit',
        'X-Title': 'LLM-Web3-Toolkit Example',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a Web3 assistant that can help users interact with blockchain. You have access to wallet functions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        functions: openAIFunctions,
        function_call: 'auto',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;

    if (message.function_call) {
      return NextResponse.json({
        response: `Function call detected: ${message.function_call.name}\nArguments: ${message.function_call.arguments}\n\nIn production, this would execute the Web3 function and return results.`,
        functionCall: message.function_call,
      });
    }

    return NextResponse.json({
      response: message.content,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
