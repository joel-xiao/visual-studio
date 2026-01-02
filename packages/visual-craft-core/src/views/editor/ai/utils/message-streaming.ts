import type { IChatMessage } from '../types';
import { inferCodeLanguage, isLikelyCodeOutput, stripMarkdownCodeFences } from './json-utils';

export function getStreamingCodePresentation(message: IChatMessage) {
  const content = message.content || '';
  const isStreamingCode =
    message.type === 'agent-thought' &&
    !message.data &&
    isLikelyCodeOutput(content);

  return {
    isStreamingCode,
    language: isStreamingCode ? inferCodeLanguage(content) : 'json',
    code: isStreamingCode ? stripMarkdownCodeFences(content) : content
  };
}
