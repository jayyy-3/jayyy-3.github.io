import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import ts from 'typescript';

const rootDir = process.cwd();

function loadProductData() {
  const sourcePath = path.join(rootDir, 'src/data/productData.ts');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourcePath,
  }).outputText;
  const module = { exports: {} };

  vm.runInNewContext(output, { exports: module.exports, module }, { filename: sourcePath });
  return module.exports.products;
}

const products = loadProductData();

// These paths describe the geometry visible in the reviewed renders, not the
// legacy filenames. Rise sits proud of the stone, Flush sits within/level with
// the stone, and + adds a backrest.
const expectedModels = {
  'prime-block': {
    core: ['Core', '/products/primeBlock/core.png'],
    timberRise: ['Timber Rise', '/products/primeBlock/timberRise.png'],
    timberFlush: ['Timber Flush', '/products/primeBlock/timberFlush.png'],
    timberRiseP: ['Timber Rise +', '/products/primeBlock/timberRiseP.png'],
    timberFlushP: ['Timber Flush +', '/products/primeBlock/timberFlushP.png'],
  },
  'prime-lume': {
    core: ['Core', '/products/primeLume/core.png'],
    timberRise: ['Timber Rise', '/products/primeLume/timberRise.png'],
    timberFlush: ['Timber Flush', '/products/primeLume/timberFlush.png'],
    timberRiseP: ['Timber Rise +', '/products/primeLume/timberRiseP.png'],
    timberFlushP: ['Timber Flush +', '/products/primeLume/timberFlushP.png'],
  },
  'terra-line': {
    core: ['Core', '/products/terraLine/core.png'],
    timberRise: ['Timber Rise', '/products/terraLine/timberFlush.png'],
    timberFlush: ['Timber Flush', '/products/terraLine/timberFlushP.png'],
    timberRiseP: ['Timber Rise +', '/products/terraLine/timberRise.png'],
    timberFlushP: ['Timber Flush +', '/products/terraLine/timberRiseP.png'],
  },
  'strata-bench': {
    core: ['Core', '/products/strataBench/core.jpg'],
    timberSpan: ['Timber Span', '/products/strataBench/timberSpan.jpg'],
    timberSpanP: ['Timber Span +', '/products/strataBench/timberSpanP.jpg'],
  },
  'prime-curve': {
    core: ['Core', '/products/primeCurve/core.png'],
    timberRise: ['Timber Rise', '/products/primeCurve/timberRise.png'],
    timberFlush: ['Timber Flush', '/products/primeCurve/timberRiseP.png'],
    timberRiseP: ['Timber Rise +', '/products/primeCurve/timberFlush.png'],
    timberFlushP: ['Timber Flush +', '/products/primeCurve/timberFlushP.png'],
  },
  'terra-arc': {
    core: ['Core', '/products/terraArc/core.png'],
    timberRise: ['Timber Rise', '/products/terraArc/timberFlush.png'],
    timberFlush: ['Timber Flush', '/products/terraArc/timberRise.png'],
    timberRiseP: ['Timber Rise +', '/products/terraArc/timberFlushP.png'],
    timberFlushP: ['Timber Flush +', '/products/terraArc/timberRiseP.png'],
  },
};

function fail(message) {
  console.error(`Product model image mapping check failed: ${message}`);
  process.exitCode = 1;
}

for (const [slug, expected] of Object.entries(expectedModels)) {
  const product = products.find((entry) => entry.slug === slug);

  if (!product) {
    fail(`could not find product ${slug}`);
    continue;
  }

  const actual = Object.fromEntries(
    product.models.map((model) => [model.key, [model.label, model.img]]),
  );

  const expectedKeys = Object.keys(expected);
  const actualKeys = Object.keys(actual);
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    fail(`${slug} model order/keys are ${actualKeys.join(', ')}, expected ${expectedKeys.join(', ')}`);
    continue;
  }

  for (const key of expectedKeys) {
    const [expectedLabel, expectedImage] = expected[key];
    const [actualLabel, actualImage] = actual[key];

    if (actualLabel !== expectedLabel) {
      fail(`${slug}/${key} label is "${actualLabel}", expected "${expectedLabel}"`);
    }
    if (actualImage !== expectedImage) {
      fail(`${slug}/${key} image is "${actualImage}", expected "${expectedImage}"`);
    }

    const assetPath = path.join(rootDir, 'public', expectedImage.replace(/^\//, ''));
    if (!fs.existsSync(assetPath)) {
      fail(`${slug}/${key} expected asset is missing: ${expectedImage}`);
    }
  }

  const imagePaths = Object.values(actual).map(([, image]) => image);
  if (new Set(imagePaths).size !== imagePaths.length) {
    fail(`${slug} reuses one render for multiple model choices`);
  }
}

if (!process.exitCode) {
  console.log('Product model image mapping check passed.');
}
