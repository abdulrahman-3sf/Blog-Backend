import * as fs from 'fs';
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/openapi.json', JSON.stringify(document, null, 2));