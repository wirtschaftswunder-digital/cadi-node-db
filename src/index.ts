import type { PoolConnection } from "mysql"
import type { QueryDbParams, QueryDbParseParams, SqlQueryInp } from "./types"
import { z, type ZodTypeAny } from "zod"
import { subdomainPoolMap } from "./connection"
import { releaseDbConnectionSafe } from "./connection"
import { schemaAnyArray, validateAndFilter } from "./validation"


export const schemaOkPacket = z.object({
    affectedRows: z.number(),
    insertId: z.number(),
    changedRows: z.number(),
    fieldCount: z.number(),
})


export async function queryDbAndParse<T extends ZodTypeAny>(params: QueryDbParseParams<T>) {
    const res = await queryDb(params)
    return params.schema.parse(res) as z.infer<T>
}


type QueryDbAndFilterParams<T extends ZodTypeAny> = QueryDbParams & { rowSchema: T }

export async function queryDbAndFilter<T extends ZodTypeAny>(params: QueryDbAndFilterParams<T>) {
    const res = await queryDbAndParse({ ...params, schema: schemaAnyArray })
    return validateAndFilter(res, params.rowSchema)
}


export async function queryDb(params: QueryDbParams) {
    const { subdomain, query } = params
    const connection = params.dbConnection ?? await getConnectionForSubdomain(subdomain)
    try {
        return await asyncQueryOnConnection(query, connection)
    } finally {
        releaseDbConnectionSafe(connection)
    }
}


export function getConnectionForSubdomain(subdomain: string): Promise<PoolConnection> {
    const connectionPool = getSubdomainConnectionPool(subdomain)
    return new Promise((resolve, reject) => {
        connectionPool.getConnection((err, connection) => {
            if (err) reject(err)
            else resolve(connection)
        })
    })
}


function getSubdomainConnectionPool(subdomain: string) {
    subdomain = subdomain.toLowerCase()
    const connectionPool = subdomainPoolMap.get(subdomain)
    if (!connectionPool) throw new Error(`No connection pool found for subdomain ${subdomain}`)
    return connectionPool
}


export function asyncQueryOnConnection(query: SqlQueryInp, connection: Awaited<ReturnType<typeof getConnectionForSubdomain>>) {
    return new Promise((resolve, reject) => {
        const callback = (err: unknown, result: unknown) => {
            if (err) {
                console.warn("Error in query", err);
                reject(err)
            }
            else resolve(result)
        }
        if (typeof query === "string")
            connection.query(query, callback)
        else if ("query" in query && "values" in query)
            connection.query(query.query, query.values, callback)
        else
            connection.query(query, callback)
    })
}