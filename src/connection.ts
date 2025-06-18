import { createPool } from 'mysql'
import { loadDbCredentials } from './credentials'
import type { DbConnection, DbCredentials } from './types'


function createConnectionPoolPerSubdomain() {
    const resultMap = new Map<string, ReturnType<typeof createPoolForCredentials>>()
    const credentialList = loadDbCredentials()
    for (const credentials of credentialList) {
        const pool = createPoolForCredentials(credentials)
        resultMap.set(credentials.subdomain, pool)
    }
    return resultMap
}


function createPoolForCredentials(credentials: DbCredentials) {
    const { database, host, password, user } = credentials
    return createPool({
        database, host, password, user,
        connectionLimit: process.env.DB_POOL_CONNECTION_LIMIT ? parseInt(process.env.DB_POOL_CONNECTION_LIMIT) : 5, // Adjust based on workload
        queueLimit: 100000,    // Limit queued requests
        acquireTimeout: 10000, // Wait time for acquiring a connection
        waitForConnections: true, // Enable queuing 
        charset: 'utf8mb4'
    })
}

export const subdomainPoolMap = createConnectionPoolPerSubdomain()


export function releaseDbConnectionSafe(dbConnection: DbConnection | null | undefined) {
    if (!dbConnection || dbConnection?.state === 'disconnected')
        return
    try {
        dbConnection.release();
    } catch (_) {
        // ignore
    }
}