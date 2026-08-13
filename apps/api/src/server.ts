import { createApp } from './app.js';
import { loadApiPort } from './server-config.js';

const port = loadApiPort();
const app = createApp();

app.listen(port, () => {
  console.log(`ABAPCompass API escuchando en http://localhost:${port}`);
});
