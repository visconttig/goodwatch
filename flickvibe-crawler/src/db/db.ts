import * as dotenv from 'dotenv'
import { DatabaseError, Pool, QueryResult } from 'pg'
import fs from "fs";

dotenv.config()

export const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASS,
  database: process.env.POSTGRES_DB,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
})

export async function executeSqlFromFile(filename: string): Promise<void> {
  const sql = fs.readFileSync(filename, 'utf8');
  try {
    await pool.query(sql);
  } catch (error) {
    console.error(error)
  }
}

export const upsertData = async (
  tableName: string,
  data: Record<string, unknown>,
  conflictColumns: string[],
  returnColumns: string[]
): Promise<QueryResult | undefined> => {
  const columns = Object.keys(data)
  const columnNames = columns.map((c) => `"${c}"`).join(', ')
  const conflictColumnNames = conflictColumns.map((c) => `"${c}"`).join(', ')
  const returnColumnNames = returnColumns.map((c) => `"${c}"`).join(', ')

  const placeholders = columns.map((_, index) => `$${index + 1}`)

  const setColumns = columns
    .filter((c) => !conflictColumns.includes(c))
    .map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ')
  const conflictClause = setColumns.length > 0 ? `UPDATE SET ${setColumns}` : 'NOTHING'

  const query = `
    INSERT INTO ${tableName} (${columnNames})
    VALUES (${placeholders})
    ON CONFLICT (${conflictColumnNames}) DO ${conflictClause}
    RETURNING ${returnColumnNames}
  `

  try {
    return await pool.query(query, Object.values(data))
  } catch (error) {
    console.error(error)
  }
}

export interface BulkUpsertResult {
  all: Record<string, unknown>[]
  existing: Record<string, unknown>[]
  inserted: Record<string, unknown>[]
}

export const bulkUpsertData = async (
  tableName: string,
  records: Record<string, unknown>[],
  columnTypes: Record<string, string>,
  conflictColumns: string[],
  returnColumns: string[]
): Promise<BulkUpsertResult | undefined> => {
  const rawData = Object.fromEntries(
    Object.keys(records[0]).map((key) => [
      key,
      records.map((record) => record[key as keyof typeof record]),
    ])
  );
  const data = collectUniqueBulkData(rawData, conflictColumns)

  // query parts
  const columns = Object.keys(data)
  const columnNames = columns.map((c) => `"${c}"`).join(', ')
  const conflictColumnNames = conflictColumns.map((c) => `"${c}"`).join(', ')
  const returnColumnNames = returnColumns.map((c) => `"${c}"`).join(', ')
  const groupByColumnNames = columns.filter((column) => {
    const value = data[column][0]
    const dataType = columnTypes[column] || getDataType(value)
    return !['JSON'].includes(dataType)
  }).map((c) => `"${c}"`).join(', ')

  const insertSelectColumns = columns.map((column, index) => {
    const value = data[column][0]
    const dataType = columnTypes[column] || getDataType(value)
    // TODO does not account for objects
    // TODO does not work with feeding values via params
    return ['JSON'].includes(dataType) ? `array_agg(${column}::text)` : `"${column}"`
  })
  const placeholders = columns.map((column, index) => {
    const value = data[column][0]
    const dataType = columnTypes[column] || getDataType(value)
    return `$${index + 1}::${dataType}[]`
  })
  const inConditions = conflictColumns.map((column, index) => {
    const value = data[column][0]
    const dataType = columnTypes[column] || getDataType(value)
    return `"${column}" = ANY($${index + 1}::${dataType}[])`
  })
  const fromWhereClause = `
    FROM unnest(${placeholders}) AS data(${columnNames})
    WHERE (${conflictColumnNames}) NOT IN (SELECT ${conflictColumnNames} FROM ${tableName})
  `

  const setColumns = columns
    .filter((c) => !conflictColumns.includes(c))
    .map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ')
  const conflictClause = setColumns.length > 0 ? `UPDATE SET ${setColumns}` : 'NOTHING'

  // build and run queries
  const selectQuery = `
    SELECT ${returnColumnNames}
    FROM ${tableName}
    WHERE ${inConditions.join(' AND ')}
    ORDER BY ${returnColumnNames}
    FOR UPDATE;
  `

  const upsertQuery = `
    INSERT INTO ${tableName} (${columnNames})
    SELECT ${insertSelectColumns.join(', ')}
    ${fromWhereClause}
    GROUP BY ${groupByColumnNames}
    ON CONFLICT (${conflictColumnNames}) DO ${conflictClause}
    RETURNING ${returnColumnNames}
  `

  const selectParams = conflictColumns.map((column) => data[column])
  const upsertParams = Object.values(data).map((paramList) => {
    return paramList.map((param) => {
      if (typeof param === 'object' && !Array.isArray(param)) {
        return `"${JSON.stringify(param)}"`
      }
      return param
    })
  })
  try {
    const results = await performTransaction([
      { text: selectQuery, params: selectParams },
      { text: upsertQuery, params: upsertParams },
    ])
    const selectResult = results?.[0]
    const upsertResult = results?.[1]

    // return results
    // TODO update would duplicate id's
    const existing = selectResult?.rows || []
    const inserted = upsertResult?.rows || []
    const all = [
      ...existing,
      ...inserted,
    ]

    return {
      all,
      existing,
      inserted,
    }
  } catch (error) {
    throw error
  }
}

type BulkDataObject<T> = {
  [K in keyof T]: (T[K] | null)[];
};

function collectUniqueBulkData<T>(
  data: BulkDataObject<T>,
  uniqueFields: (keyof T)[]
): BulkDataObject<T> {
  const uniqueIndexesMap: { [key: string]: number[] } = {};
  const uniqueKeys: string[] = [];

  // Find indexes of unique values based on uniqueFields
  for (let i = 0; i < data[uniqueFields[0]].length; i++) {
    const uniqueValues = uniqueFields.map((field) => String(data[field][i]));
    const uniqueKey = uniqueValues.join("|");

    if (!uniqueIndexesMap[uniqueKey]) {
      uniqueIndexesMap[uniqueKey] = [];
      uniqueKeys.push(uniqueKey);
    }

    uniqueIndexesMap[uniqueKey].push(i);
  }

  // Filter data based on unique values and the most defined values
  const filteredData: BulkDataObject<T> = {} as BulkDataObject<T>;

  for (const uniqueKey of uniqueKeys) {
    const indexes = uniqueIndexesMap[uniqueKey];
    let mostDefinedIndex = indexes[0];

    for (const index of indexes) {
      for (const field of uniqueFields) {
        if (
          data[field][index] &&
          !data[field][mostDefinedIndex]
        ) {
          mostDefinedIndex = index;
        }
      }
    }

    for (const field in data) {
      filteredData[field] = filteredData[field] || [];
      filteredData[field].push(data[field][mostDefinedIndex]);
    }
  }

  return filteredData;
}

export interface Query {
  text: string
  params?: unknown[]
}

const getDataType = (value: any): string => {
  if (typeof value === 'number') {
    return 'NUMERIC'
  } else if (typeof value === 'boolean') {
    return 'BOOLEAN'
  } else if (typeof value === 'string') {
    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/)) {
      return 'TIMESTAMP'
    }
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return 'TIMESTAMP'
    }
    return 'TEXT'
  } else if (value instanceof Date) {
    return 'TIMESTAMP WITH TIME ZONE'
  } else if (Array.isArray(value)) {
    return 'CSV'
  } else if (typeof value === 'object' && value !== null) {
    return 'JSONB'
  }
  return 'TEXT'
}

export const performTransaction = async (queries: Query[]): Promise<QueryResult[] | undefined> => {
  const maxRetries = 3
  let retries = 0

  while (true) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const results = await Promise.all(queries.map((query) => client.query(query.text, query.params || [])))
      await client.query('COMMIT')
      return results
    } catch (error) {
      await client.query('ROLLBACK')
      if (error instanceof DatabaseError && error.code === '40P01' && retries < maxRetries) {
        const sleepTime = Math.pow(2, retries) * 1000;
        console.warn(`Deadlock detected: retrying after ${sleepTime}ms`);
        await new Promise(resolve => setTimeout(resolve, sleepTime));
        retries++;
      } else {
        throw error;
      }
    } finally {
      client.release()
    }
  }
}
