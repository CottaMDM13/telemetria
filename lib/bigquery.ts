import { BigQuery } from "@google-cloud/bigquery";

const projectId = process.env.GCP_PROJECT_ID;
const tablePath = process.env.BQ_TABLE_PATH;
const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!projectId) {
  console.warn("[bigquery] GCP_PROJECT_ID is not set");
}
if (!tablePath) {
  console.warn("[bigquery] BQ_TABLE_PATH is not set");
}

const client = new BigQuery({
  projectId,
  credentials: credentialsJson ? JSON.parse(credentialsJson) : undefined,
});

// Retorna custos diários por projeto
export async function getDailyCostsByProject(startDate?: string, endDate?: string) {
  if (!tablePath) throw new Error("BQ_TABLE_PATH not configured");

  const where: string[] = [];
  if (startDate) where.push(`usage_start_time >= TIMESTAMP("${startDate} 00:00:00")`);
  if (endDate) where.push(`usage_start_time <= TIMESTAMP("${endDate} 23:59:59")`);
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const query = `
    SELECT
      DATE(usage_start_time) AS day,
      project.name AS project_name,
      SUM(cost) AS total_cost
    FROM \`${tablePath}\`
    ${whereClause}
    GROUP BY day, project_name
    ORDER BY day ASC;
  `;

  const [rows] = await client.query(query);
  return rows as Array<{ day: string; project_name: string; total_cost: number }>;
}

// Retorna custos por serviço por projeto
export async function getServiceCostsByProject(startDate?: string, endDate?: string) {
  if (!tablePath) throw new Error("BQ_TABLE_PATH not configured");

  const where: string[] = [];
  if (startDate) where.push(`usage_start_time >= TIMESTAMP("${startDate} 00:00:00")`);
  if (endDate) where.push(`usage_start_time <= TIMESTAMP("${endDate} 23:59:59")`);
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const query = `
    SELECT
      project.name AS project_name,
      service.description AS service_name,
      SUM(cost) AS total_cost
    FROM \`${tablePath}\`
    ${whereClause}
    GROUP BY project_name, service_name
    ORDER BY project_name, total_cost DESC;
  `;

  const [rows] = await client.query(query);
  return rows as Array<{ project_name: string; service_name: string; total_cost: number }>;
}
