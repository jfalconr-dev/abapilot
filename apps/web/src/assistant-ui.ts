export type Operation = 'query' | 'explain' | 'review';

export type CodeSuggestionMode = 'none' | 'snippets' | 'full';

export interface OperationDefinition {
  readonly endpoint: string;
  readonly fieldName: 'query' | 'code';
  readonly inputLabel: string;
  readonly placeholder: string;
  readonly initialMessage: string;
}

export interface TextContentSegment {
  readonly type: 'text';
  readonly content: string;
}

export interface CodeContentSegment {
  readonly type: 'code';
  readonly language: string;
  readonly content: string;
}

export interface PolicyNoticeSegment {
  readonly type: 'policy-notice';
}

export type AssistantContentSegment = TextContentSegment | CodeContentSegment | PolicyNoticeSegment;

export const OPERATION_DEFINITIONS: Readonly<Record<Operation, OperationDefinition>> = {
  query: {
    endpoint: '/assistant/query',
    fieldName: 'query',
    inputLabel: 'Consulta',
    placeholder: 'Escribe una consulta sobre SAP ECC o desarrollo ABAP...',
    initialMessage: 'Introduce una consulta y pulsa Ejecutar.',
  },
  explain: {
    endpoint: '/assistant/explain',
    fieldName: 'code',
    inputLabel: 'Código ABAP',
    placeholder: 'Pega el código ABAP del que quieres obtener una explicación...',
    initialMessage: 'Introduce código ABAP y pulsa Ejecutar para obtener una explicación.',
  },
  review: {
    endpoint: '/assistant/review',
    fieldName: 'code',
    inputLabel: 'Código ABAP',
    placeholder: 'Pega el código ABAP del que quieres obtener una revisión...',
    initialMessage: 'Introduce código ABAP y pulsa Ejecutar para obtener una revisión.',
  },
};

export const CODE_SUGGESTION_LABELS: Readonly<Record<CodeSuggestionMode, string>> = {
  none: 'No disponibles',
  snippets: 'Fragmentos',
  full: 'Completas',
};

const CODE_FENCE = '```';

export const FILTERED_CODE_MARKER = '[[ABAPILOT_CODE_BLOCK_FILTERED]]';

export const parseAssistantContent = (
  content: string,
  codeFiltered = false,
): readonly AssistantContentSegment[] => {
  const segments = parseCodeContent(content);

  if (!codeFiltered) {
    return segments;
  }

  return splitFilteredCodeMarkers(segments);
};

const parseCodeContent = (content: string): readonly AssistantContentSegment[] => {
  const segments: AssistantContentSegment[] = [];
  let currentIndex = 0;

  while (currentIndex < content.length) {
    const openingFenceIndex = content.indexOf(CODE_FENCE, currentIndex);

    if (openingFenceIndex === -1) {
      appendTextSegment(segments, content.slice(currentIndex));
      break;
    }

    const languageStartIndex = openingFenceIndex + CODE_FENCE.length;
    const firstNewlineIndex = content.indexOf('\n', languageStartIndex);

    if (firstNewlineIndex === -1) {
      appendTextSegment(segments, content.slice(currentIndex));
      break;
    }

    const closingFenceIndex = content.indexOf(CODE_FENCE, firstNewlineIndex + 1);

    if (closingFenceIndex === -1) {
      appendTextSegment(segments, content.slice(currentIndex));
      break;
    }

    appendTextSegment(segments, content.slice(currentIndex, openingFenceIndex));

    const language = content.slice(languageStartIndex, firstNewlineIndex).replace(/\r$/, '').trim();

    const code = content.slice(firstNewlineIndex + 1, closingFenceIndex);

    segments.push({
      type: 'code',
      language,
      content: code.trimEnd(),
    });

    currentIndex = closingFenceIndex + CODE_FENCE.length;
  }

  if (segments.length === 0 && content.length > 0) {
    appendTextSegment(segments, content);
  }

  return segments;
};

const splitFilteredCodeMarkers = (
  segments: readonly AssistantContentSegment[],
): readonly AssistantContentSegment[] => {
  const result: AssistantContentSegment[] = [];

  for (const segment of segments) {
    if (segment.type !== 'text') {
      result.push(segment);
      continue;
    }

    appendTextWithFilteredCodeMarkers(result, segment.content);
  }

  return result;
};

const appendTextWithFilteredCodeMarkers = (
  segments: AssistantContentSegment[],
  content: string,
): void => {
  let currentIndex = 0;

  while (currentIndex < content.length) {
    const markerIndex = content.indexOf(FILTERED_CODE_MARKER, currentIndex);

    if (markerIndex === -1) {
      appendTextSegment(segments, content.slice(currentIndex));
      break;
    }

    appendTextSegment(segments, content.slice(currentIndex, markerIndex));

    segments.push({
      type: 'policy-notice',
    });

    currentIndex = markerIndex + FILTERED_CODE_MARKER.length;
  }
};

const appendTextSegment = (segments: AssistantContentSegment[], content: string): void => {
  const normalizedContent = content.trim();

  if (normalizedContent.length === 0) {
    return;
  }

  segments.push({
    type: 'text',
    content: normalizedContent,
  });
};
