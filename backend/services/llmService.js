import fetch from 'node-fetch';

/**
 * LLMService provides optional large-language model responses for the chatbot.
 * It reads configuration from environment variables and gracefully falls back
 * if no provider/key is configured.
 *
 * Env variables:
 * - LLM_PROVIDER=openai (or leave unset to disable)
 * - LLM_MODEL=gpt-4o-mini (default)
 * - OPENAI_API_KEY=... (required for openai)
 */
class LLMService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'none';
    this.model = process.env.LLM_MODEL || 'gpt-4o-mini';
    this.openaiKey = process.env.OPENAI_API_KEY;
  }

  isEnabled() {
    if (this.provider === 'openai') {
      return !!this.openaiKey;
    }
    return false;
  }

  /**
   * Generate an answer using the configured LLM provider.
   * options may include: systemPrompt, context (object), history (array)
   */
  async generateAnswer(message, options = {}) {
    if (!this.isEnabled()) {
      return null;
    }

    const systemPrompt = options.systemPrompt ||
      'You are FarmNex AI, a professional assistant focused on Sri Lankan agriculture. '
      + 'Provide practical, safe, and culturally appropriate guidance. If helpful, summarize next steps.';

    const contextBlocks = this._formatContext(options.context || {});
    const history = (options.history || []).slice(-8).map(h => ({
      role: h.type === 'user' ? 'user' : 'assistant',
      content: h.message?.toString().slice(0, 2000) || ''
    }));

    if (this.provider === 'openai') {
      return await this._openaiChat({ message, systemPrompt, contextBlocks, history });
    }

    return null;
  }

  _formatContext(ctx) {
    try {
      const pruned = { ...ctx };
      // Limit large arrays to keep prompt size reasonable
      for (const k of Object.keys(pruned)) {
        const v = pruned[k];
        if (Array.isArray(v)) {
          pruned[k] = v.slice(0, 5);
        } else if (typeof v === 'string' && v.length > 1000) {
          pruned[k] = v.slice(0, 1000);
        }
      }
      return JSON.stringify(pruned).slice(0, 4000);
    } catch {
      return '';
    }
  }

  async _openaiChat({ message, systemPrompt, contextBlocks, history }) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const body = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(contextBlocks ? [{ role: 'system', content: `Context: ${contextBlocks}` }] : []),
        ...history,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 400,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiKey}`,
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`LLM provider error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return {
      response: text,
      raw: data,
    };
  }
}

export default LLMService;