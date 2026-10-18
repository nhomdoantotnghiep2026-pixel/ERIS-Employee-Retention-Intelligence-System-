import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readConfig } from '../src/config/env.js';
import { createDistanceService } from '../src/modules/distance/distance.service.js';
import { enrichDistanceRows, outputColumns, parseCsv, writeCsv } from '../src/modules/distance/distance-import.js';

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath || resolve(inputPath) === resolve(outputPath)) {
  console.error('Usage: node --env-file=.env scripts/import-distance-csv.js input.csv output.csv');
  process.exitCode = 1;
} else {
  try {
    const rows = parseCsv(await readFile(inputPath, 'utf8'));
    const service = createDistanceService(readConfig().routing);
    const result = await enrichDistanceRows(rows, service);
    await writeFile(outputPath, writeCsv(result, outputColumns), { flag: 'wx' });
    console.info(`Processed ${result.length} rows: ${result.filter(row => row.status === 'READY').length} READY, `
      + `${result.filter(row => row.status === 'REVIEW').length} REVIEW. Output: ${outputPath}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
