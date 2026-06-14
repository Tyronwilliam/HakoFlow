import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (voir .env.local) — " +
      "le schéma OpenAPI complet n'est accessible qu'avec la clé secrète.",
  );
}

const response = await fetch(`${url}/rest/v1/`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "application/openapi+json",
  },
});

if (!response.ok) {
  throw new Error(
    `Echec de récupération du schéma OpenAPI: ${response.status} ${response.statusText}`,
  );
}

const spec = await response.json();

const outDir = path.join(__dirname, "../docs/api");
mkdirSync(outDir, { recursive: true });

const outFile = path.join(outDir, "openapi.json");
writeFileSync(outFile, JSON.stringify(spec, null, 2));

console.log(`Schéma OpenAPI écrit dans ${path.relative(process.cwd(), outFile)}`);
