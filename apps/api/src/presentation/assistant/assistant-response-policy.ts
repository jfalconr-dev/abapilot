import type { CodeSuggestionMode } from '@abapcompass/core';

const CODE_FENCE = '```';
const FILTERED_CODE_MARKER = '[[ABAPCOMPASS_CODE_BLOCK_FILTERED]]';

export type AssistantResponsePolicyReason = 'CODE_SUGGESTION_NOT_ALLOWED';

export interface AssistantResponsePolicy {
  readonly filtered: boolean;
  readonly reason?: AssistantResponsePolicyReason;
}

export interface AssistantResponsePolicyResult {
  readonly content: string;
  readonly policy: AssistantResponsePolicy;
}

export const applyAssistantResponsePolicy = (
  content: string,
  codeSuggestionMode: CodeSuggestionMode,
): AssistantResponsePolicyResult => {
  if (codeSuggestionMode !== 'none') {
    return {
      content,
      policy: {
        filtered: false,
      },
    };
  }

  const filteredContent = filterFencedCodeBlocks(content);

  if (filteredContent === content) {
    return {
      content,
      policy: {
        filtered: false,
      },
    };
  }

  return {
    content: filteredContent,
    policy: {
      filtered: true,
      reason: 'CODE_SUGGESTION_NOT_ALLOWED',
    },
  };
};

const filterFencedCodeBlocks = (content: string): string => {
  let result = '';
  let currentIndex = 0;

  while (currentIndex < content.length) {
    const openingFenceIndex = content.indexOf(CODE_FENCE, currentIndex);

    if (openingFenceIndex === -1) {
      result += content.slice(currentIndex);
      break;
    }

    const firstNewlineIndex = content.indexOf('\n', openingFenceIndex + CODE_FENCE.length);

    if (firstNewlineIndex === -1) {
      result += content.slice(currentIndex);
      break;
    }

    const closingFenceIndex = content.indexOf(CODE_FENCE, firstNewlineIndex + 1);

    if (closingFenceIndex === -1) {
      result += content.slice(currentIndex);
      break;
    }

    result += content.slice(currentIndex, openingFenceIndex);
    result += FILTERED_CODE_MARKER;

    currentIndex = closingFenceIndex + CODE_FENCE.length;
  }

  return result;
};
