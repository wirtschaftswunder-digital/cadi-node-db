import type { QueryOptions } from "mysql"
import type { getConnectionForSubdomain } from "."
import type { ZodTypeAny } from "zod"


export interface DbCredentials {
    host: string
    user: string
    password: string
    database: string
    subdomain: string
}


export interface OptionalDbConnection {
    dbConnection?: DbConnection
}


export type QueryDbParams = {
    subdomain: string
    query: SqlQueryInp
} & OptionalDbConnection;


export type SqlQueryInp = QueryOptions | string | { query: string, values: Record<string, any> | any[] }


export type QueryDbParseParams<T extends ZodTypeAny> = QueryDbParams & { schema: T }


export type DbConnection = Awaited<ReturnType<typeof getConnectionForSubdomain>>
