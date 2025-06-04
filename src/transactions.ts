import { asyncQueryOnConnection, getConnectionForSubdomain } from ".";
import { releaseDbConnectionSafe } from "./connection";
import type { SqlQueryInp } from "./types";


export async function queryDbTransaction(subdomain: string, queries: SqlQueryInp[]): Promise<any> {
    const connection = await getConnectionForSubdomain(subdomain)
    const results = []
    try {
        connection.beginTransaction()
        for (const query of queries) {
            const currentQueryResult = await asyncQueryOnConnection(query, connection)
            results.push(currentQueryResult)
        }
        connection.commit()
        return results
    } catch (error) {
        await cleanUpFailedTransaction({ connection })
        throw new DbTransactionError(String(error))
    } finally {
        releaseDbConnectionSafe(connection)
    }
}


class DbTransactionError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "DbTransactionError"
    }
}


async function cleanUpFailedTransaction(params: { connection: Awaited<ReturnType<typeof getConnectionForSubdomain>> }) {
    const { connection } = params
    try {
        await connection.rollback()
    } catch (cleanUpError) {
        console.warn("Error cleaning up failed transaction", cleanUpError);
    } finally {
        releaseDbConnectionSafe(connection)
    }
}