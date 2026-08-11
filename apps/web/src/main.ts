import './styles.css';

import {
  CODE_SUGGESTION_LABELS,
  OPERATION_DEFINITIONS,
  parseAssistantContent,
  type CodeSuggestionMode,
  type Operation,
} from './assistant-ui.js';

interface PublicModel {
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  readonly codeSuggestionMode: CodeSuggestionMode;
}

interface ModelsResponse {
  readonly defaultModelId: string;
  readonly models: readonly PublicModel[];
}

interface AssistantResponse {
  readonly response: string;
  readonly modelId: string;
  readonly codeSuggestionMode: CodeSuggestionMode;
  readonly validation: {
    readonly title: string;
    readonly message: string;
  };
}

interface AssistantErrorResponse {
  readonly code: string;
  readonly message: string;
}

const appElement = document.querySelector<HTMLDivElement>('#app');

if (appElement === null) {
  throw new Error('No se ha encontrado el elemento raíz de ABAPilot.');
}

appElement.innerHTML = `
  <main class="app-shell">
    <header class="app-header">
      <div>
        <p class="app-eyebrow">AI Workspace para SAP ECC</p>
        <h1>ABAPilot</h1>
        <p class="app-subtitle">
          Asistente para consulta, explicación y revisión de código ABAP.
        </p>
      </div>
    </header>

    <section class="workspace" aria-label="Área de trabajo de ABAPilot">
      <div class="workspace-toolbar">
        <div class="model-section">
          <label class="field">
            <span>Modelo</span>
            <select id="model-select" disabled>
              <option>Cargando modelos...</option>
            </select>
          </label>

          <div class="model-details" aria-live="polite">
            <p id="model-description">
              Cargando información del modelo...
            </p>
            <p>
              <strong>Sugerencias de código:</strong>
              <span id="model-code-suggestion">-</span>
            </p>
          </div>

          <button
            id="compare-models-button"
            type="button"
            class="link-button"
            aria-expanded="false"
            aria-controls="model-comparison"
            disabled
          >
            Comparar modelos
          </button>
        </div>

        <div class="operation-selector" aria-label="Operación">
          <button
            type="button"
            class="operation-button is-active"
            data-operation="query"
          >
            Consulta
          </button>

          <button
            type="button"
            class="operation-button"
            data-operation="explain"
          >
            Explicar
          </button>

          <button
            type="button"
            class="operation-button"
            data-operation="review"
          >
            Revisar
          </button>
        </div>
      </div>

      <section
        id="model-comparison"
        class="model-comparison"
        aria-label="Comparación de modelos"
        hidden
      >
        <div class="model-comparison-header">
          <div>
            <h2>Modelos disponibles</h2>
            <p>
              Compara la orientación y capacidad de generación de código
              antes de seleccionar un modelo.
            </p>
          </div>
        </div>

        <div id="model-comparison-list" class="model-comparison-list"></div>
      </section>

      <label class="field">
        <span id="input-label">Consulta</span>
        <textarea
          id="assistant-input"
          rows="10"
          placeholder="Escribe una consulta sobre SAP ECC o desarrollo ABAP..."
        ></textarea>
      </label>

      <label class="field">
        <span>Contexto adicional <small>(opcional)</small></span>
        <textarea
          id="context-input"
          rows="4"
          placeholder="Añade contexto funcional o técnico si es necesario..."
        ></textarea>
      </label>

      <div class="workspace-actions">
        <button
          id="clear-button"
          type="button"
          class="secondary-button"
          disabled
        >
          Limpiar
        </button>

        <button
          id="execute-button"
          type="button"
          class="primary-button"
          disabled
        >
          Ejecutar
        </button>
      </div>

      <section class="result-panel" aria-live="polite">
        <h2>Resultado</h2>

        <aside
          id="validation-notice"
          class="validation-notice"
          role="alert"
          hidden
        >
          <div class="validation-notice-title">
            <span aria-hidden="true">⚠</span>
            <strong id="validation-notice-title"></strong>
          </div>

          <p id="validation-notice-text"></p>
          <p id="response-metadata" class="response-metadata"></p>
        </aside>

        <div class="result-scroll">
          <div id="result-content" class="result-content"></div>
        </div>
      </section>
    </section>
  </main>
`;

const modelSelect = document.querySelector<HTMLSelectElement>('#model-select');
const modelDescription = document.querySelector<HTMLParagraphElement>('#model-description');
const modelCodeSuggestion = document.querySelector<HTMLSpanElement>('#model-code-suggestion');
const compareModelsButton = document.querySelector<HTMLButtonElement>('#compare-models-button');
const modelComparison = document.querySelector<HTMLElement>('#model-comparison');
const modelComparisonList = document.querySelector<HTMLDivElement>('#model-comparison-list');
const assistantInput = document.querySelector<HTMLTextAreaElement>('#assistant-input');
const contextInput = document.querySelector<HTMLTextAreaElement>('#context-input');
const clearButton = document.querySelector<HTMLButtonElement>('#clear-button');
const executeButton = document.querySelector<HTMLButtonElement>('#execute-button');
const inputLabel = document.querySelector<HTMLSpanElement>('#input-label');
const resultContent = document.querySelector<HTMLDivElement>('#result-content');
const validationNotice = document.querySelector<HTMLElement>('#validation-notice');
const validationNoticeTitle = document.querySelector<HTMLElement>('#validation-notice-title');
const validationNoticeText =
  document.querySelector<HTMLParagraphElement>('#validation-notice-text');
const responseMetadata = document.querySelector<HTMLParagraphElement>('#response-metadata');
const operationButtons = document.querySelectorAll<HTMLButtonElement>('.operation-button');

if (
  modelSelect === null ||
  modelDescription === null ||
  modelCodeSuggestion === null ||
  compareModelsButton === null ||
  modelComparison === null ||
  modelComparisonList === null ||
  assistantInput === null ||
  contextInput === null ||
  clearButton === null ||
  executeButton === null ||
  inputLabel === null ||
  resultContent === null ||
  validationNotice === null ||
  validationNoticeTitle === null ||
  validationNoticeText === null ||
  responseMetadata === null
) {
  throw new Error('No se han encontrado los controles principales de ABAPilot.');
}

let selectedOperation: Operation = 'query';
let requestInProgress = false;
let modelsAvailable = false;
let hasCustomResult = false;
let availableModels: readonly PublicModel[] = [];

const appendTextBlock = (content: string): void => {
  const paragraph = document.createElement('p');

  paragraph.className = 'result-text';
  paragraph.textContent = content;

  resultContent.append(paragraph);
};

const appendCodeBlock = (language: string, codeContent: string): void => {
  const container = document.createElement('div');
  const header = document.createElement('div');
  const headerLabel = document.createElement('span');
  const copyButton = document.createElement('button');
  const pre = document.createElement('pre');
  const code = document.createElement('code');

  container.className = 'code-container';
  header.className = 'code-header';
  copyButton.className = 'code-copy-button';
  pre.className = 'code-block';

  const normalizedLanguage = language.trim();
  const normalizedCode = codeContent.trimEnd();

  headerLabel.textContent =
    normalizedLanguage.length > 0 ? `Código · ${normalizedLanguage.toUpperCase()}` : 'Código';

  copyButton.type = 'button';
  copyButton.textContent = 'Copiar';
  copyButton.setAttribute('aria-label', 'Copiar código al portapapeles');

  const copyCode = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(normalizedCode);

      copyButton.textContent = 'Copiado ✓';
      copyButton.disabled = true;

      window.setTimeout((): void => {
        copyButton.textContent = 'Copiar';
        copyButton.disabled = false;
      }, 1500);
    } catch {
      copyButton.textContent = 'Error al copiar';

      window.setTimeout((): void => {
        copyButton.textContent = 'Copiar';
      }, 1500);
    }
  };

  copyButton.addEventListener('click', (): void => {
    void copyCode();
  });

  /*
   * El contenido generado por el LLM se trata siempre como texto no
   * confiable. Nunca se interpreta como HTML ni se ejecuta.
   */
  code.textContent = normalizedCode;

  pre.append(code);
  header.append(headerLabel, copyButton);
  container.append(header, pre);
  resultContent.append(container);
};

const renderAssistantResponse = (content: string): void => {
  resultContent.replaceChildren();

  const segments = parseAssistantContent(content);

  for (const segment of segments) {
    if (segment.type === 'text') {
      appendTextBlock(segment.content);
      continue;
    }

    appendCodeBlock(segment.language, segment.content);
  }

  if (resultContent.childElementCount === 0) {
    appendTextBlock(content);
  }

  hasCustomResult = true;
};

const hideValidationNotice = (): void => {
  validationNotice.hidden = true;
  validationNoticeTitle.textContent = '';
  validationNoticeText.textContent = '';
  responseMetadata.textContent = '';
};

const showValidationNotice = (assistantResponse: AssistantResponse): void => {
  const responseModel = availableModels.find((model) => model.id === assistantResponse.modelId);

  const modelLabel = responseModel?.displayName ?? assistantResponse.modelId;

  const codeSuggestionLabel = CODE_SUGGESTION_LABELS[assistantResponse.codeSuggestionMode];

  validationNoticeTitle.textContent = assistantResponse.validation.title;

  validationNoticeText.textContent = assistantResponse.validation.message;

  responseMetadata.textContent =
    `Modelo utilizado: ${modelLabel}. ` +
    `Sugerencias de código aplicadas: ${codeSuggestionLabel}.`;

  validationNotice.hidden = false;
};

const setResultMessage = (message: string, isCustomResult: boolean): void => {
  resultContent.replaceChildren();

  const paragraph = document.createElement('p');

  paragraph.className = 'result-text';
  paragraph.textContent = message;

  resultContent.append(paragraph);
  hasCustomResult = isCustomResult;
};

const getInitialMessage = (): string => OPERATION_DEFINITIONS[selectedOperation].initialMessage;

const getModelSelectionButtons = (): readonly HTMLButtonElement[] =>
  Array.from(modelComparisonList.querySelectorAll<HTMLButtonElement>('.model-select-button'));

const updateComparisonSelectionState = (): void => {
  const cards = modelComparisonList.querySelectorAll<HTMLElement>('.model-card');

  for (const card of cards) {
    const isSelected = card.dataset.modelId === modelSelect.value;

    card.classList.toggle('is-selected', isSelected);

    if (isSelected) {
      card.setAttribute('aria-current', 'true');
    } else {
      card.removeAttribute('aria-current');
    }
  }
};

const updateInteractionState = (): void => {
  const canExecute =
    modelsAvailable &&
    modelSelect.value.length > 0 &&
    assistantInput.value.trim().length > 0 &&
    !requestInProgress;

  const canClear =
    !requestInProgress &&
    (assistantInput.value.trim().length > 0 ||
      contextInput.value.trim().length > 0 ||
      hasCustomResult);

  executeButton.disabled = !canExecute;
  clearButton.disabled = !canClear;

  modelSelect.disabled = !modelsAvailable || requestInProgress;

  assistantInput.disabled = requestInProgress;
  contextInput.disabled = requestInProgress;

  compareModelsButton.disabled = !modelsAvailable;

  for (const button of operationButtons) {
    button.disabled = requestInProgress;
  }

  for (const button of getModelSelectionButtons()) {
    button.disabled = requestInProgress;
  }
};

const updateModelDetails = (): void => {
  const selectedModel = availableModels.find((model) => model.id === modelSelect.value);

  if (selectedModel === undefined) {
    modelDescription.textContent = 'No hay información disponible para el modelo seleccionado.';
    modelCodeSuggestion.textContent = '-';

    return;
  }

  modelDescription.textContent = selectedModel.description;

  modelCodeSuggestion.textContent = CODE_SUGGESTION_LABELS[selectedModel.codeSuggestionMode];

  updateComparisonSelectionState();
};

const selectModel = (modelId: string): void => {
  if (requestInProgress) {
    return;
  }

  const modelExists = availableModels.some((model) => model.id === modelId);

  if (!modelExists) {
    return;
  }

  modelSelect.value = modelId;

  updateModelDetails();
  updateInteractionState();
};

const renderModelComparison = (): void => {
  modelComparisonList.replaceChildren();

  for (const model of availableModels) {
    const card = document.createElement('article');
    const title = document.createElement('h3');
    const description = document.createElement('p');
    const capability = document.createElement('p');
    const capabilityLabel = document.createElement('strong');
    const selectButton = document.createElement('button');

    card.className = 'model-card';
    card.dataset.modelId = model.id;

    title.textContent = model.displayName;

    description.className = 'model-card-description';
    description.textContent = model.description;

    capability.className = 'model-card-capability';
    capabilityLabel.textContent = 'Sugerencias de código: ';

    capability.append(capabilityLabel, CODE_SUGGESTION_LABELS[model.codeSuggestionMode]);

    selectButton.type = 'button';
    selectButton.className = 'model-select-button';
    selectButton.textContent = 'Seleccionar';

    selectButton.addEventListener('click', (): void => {
      selectModel(model.id);
    });

    card.append(title, description, capability, selectButton);

    modelComparisonList.append(card);
  }

  updateComparisonSelectionState();
};

const toggleModelComparison = (): void => {
  const willOpen = modelComparison.hidden;

  modelComparison.hidden = !willOpen;

  compareModelsButton.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

  compareModelsButton.textContent = willOpen ? 'Ocultar comparación' : 'Comparar modelos';
};

const selectOperation = (operation: Operation): void => {
  selectedOperation = operation;

  const definition = OPERATION_DEFINITIONS[operation];

  inputLabel.textContent = definition.inputLabel;
  assistantInput.placeholder = definition.placeholder;

  hideValidationNotice();
  setResultMessage(definition.initialMessage, false);

  for (const button of operationButtons) {
    const isSelected = button.dataset.operation === operation;

    button.classList.toggle('is-active', isSelected);
  }

  updateInteractionState();
};

const clearWorkspace = (): void => {
  assistantInput.value = '';
  contextInput.value = '';

  hideValidationNotice();
  setResultMessage(getInitialMessage(), false);

  assistantInput.focus();

  updateInteractionState();
};

const loadModels = async (): Promise<void> => {
  try {
    const response = await fetch('/models');

    if (!response.ok) {
      throw new Error(`La API ha respondido con el estado ${response.status}.`);
    }

    const modelsResponse = (await response.json()) as ModelsResponse;

    availableModels = modelsResponse.models;
    modelSelect.innerHTML = '';

    for (const model of availableModels) {
      const option = document.createElement('option');

      option.value = model.id;
      option.textContent = model.displayName;
      option.title = model.description;

      modelSelect.append(option);
    }

    modelSelect.value = modelsResponse.defaultModelId;
    modelsAvailable = true;

    renderModelComparison();
    updateModelDetails();
    updateInteractionState();
  } catch {
    modelsAvailable = false;
    availableModels = [];

    modelSelect.innerHTML = '<option>No se han podido cargar los modelos</option>';

    modelDescription.textContent = 'No se ha podido obtener la información de los modelos.';

    modelCodeSuggestion.textContent = '-';

    modelComparisonList.replaceChildren();
    modelComparison.hidden = true;

    compareModelsButton.setAttribute('aria-expanded', 'false');

    compareModelsButton.textContent = 'Comparar modelos';

    hideValidationNotice();

    setResultMessage(
      'No se ha podido conectar con la API de ABAPilot. Comprueba que el servidor está en ejecución.',
      true,
    );

    updateInteractionState();
  }
};

const executeAssistant = async (): Promise<void> => {
  const input = assistantInput.value.trim();

  if (input.length === 0 || modelSelect.value.length === 0 || !modelsAvailable) {
    return;
  }

  const definition = OPERATION_DEFINITIONS[selectedOperation];

  const context = contextInput.value.trim();

  const requestBody: Record<string, string> = {
    modelId: modelSelect.value,
    [definition.fieldName]: input,
  };

  if (context.length > 0) {
    requestBody.context = context;
  }

  requestInProgress = true;
  executeButton.textContent = 'Ejecutando...';

  hideValidationNotice();

  setResultMessage('Procesando la solicitud...', true);

  updateInteractionState();

  try {
    const response = await fetch(definition.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorResponse = (await response.json()) as AssistantErrorResponse;

      setResultMessage(errorResponse.message || 'No se ha podido completar la operación.', true);

      return;
    }

    const assistantResponse = (await response.json()) as AssistantResponse;

    showValidationNotice(assistantResponse);
    renderAssistantResponse(assistantResponse.response);
  } catch {
    hideValidationNotice();

    setResultMessage(
      'No se ha podido conectar con la API de ABAPilot. Comprueba que el servidor está en ejecución.',
      true,
    );
  } finally {
    requestInProgress = false;
    executeButton.textContent = 'Ejecutar';

    updateInteractionState();
  }
};

for (const button of operationButtons) {
  button.addEventListener('click', (): void => {
    const operation = button.dataset.operation;

    if (operation === 'query' || operation === 'explain' || operation === 'review') {
      selectOperation(operation);
    }
  });
}

assistantInput.addEventListener('input', (): void => {
  updateInteractionState();
});

contextInput.addEventListener('input', (): void => {
  updateInteractionState();
});

modelSelect.addEventListener('change', (): void => {
  updateModelDetails();
  updateInteractionState();
});

compareModelsButton.addEventListener('click', (): void => {
  toggleModelComparison();
});

clearButton.addEventListener('click', (): void => {
  clearWorkspace();
});

executeButton.addEventListener('click', (): void => {
  void executeAssistant();
});

hideValidationNotice();
setResultMessage(getInitialMessage(), false);

await loadModels();
