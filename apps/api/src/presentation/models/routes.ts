import { ModelCatalog } from '@abapilot/core';
import { Router } from 'express';

const router = Router();
const modelCatalog = new ModelCatalog();

router.get('/', (_request, response): void => {
  const models = modelCatalog.getAll().map((model) => ({
    id: model.id,
    displayName: model.displayName,
    description: model.description,
    codeSuggestionMode: model.codeSuggestionMode,
  }));

  response.status(200).json({
    defaultModelId: modelCatalog.getDefaultModelId(),
    models,
  });
});

export { router as modelsRouter };
