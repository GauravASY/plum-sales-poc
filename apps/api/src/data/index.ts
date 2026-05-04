import path from "node:path";
import url from "node:url";
import { CsvDataSource } from "./csvLoader.js";
import type { DataSource } from "./loader.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Vercel serverless (VERCEL=1), __dirname is the bundle root so the 4-hop
// relative path doesn't work. Fall back to cwd which is /var/task and matches
// the path where includeFiles bundles data/sample.csv.
const DEFAULT_CSV = process.env.VERCEL
  ? path.join(process.cwd(), "data/sample.csv")
  : path.resolve(__dirname, "../../../../data/sample.csv");
const csvPath = process.env.PLUM_CSV_PATH ?? DEFAULT_CSV;

let _dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (_dataSource) return _dataSource;
  const ds = new CsvDataSource(csvPath);
  await ds.load();
  console.log(`[api] loaded ${ds.all().length} profiles from ${csvPath}`);
  _dataSource = ds;
  return _dataSource;
}
