import type { DbCredentials } from "./types"


const ENV_KEY_MAP: Record<keyof DbCredentials, string> = {
    host: 'DB_HOST',
    user: 'DB_USERNAME',
    password: 'DB_PASSWORD',
    database: 'DB_NAME',
    subdomain: 'DB_SUBDOMAIN'
}


// TODO: Remove this function and use the environment variables directly in the code
export const loadUnitTestDbCredentials = (): DbCredentials[] => [{
    database: "jr_local",
    host: "localhost",
    password: "DbDockerUserPw5!",
    user: "docker_user",
    subdomain: "my"
}]


export const loadDbCredentials = (): DbCredentials[] => {
    if (process.env.NODE_ENV === 'test')
        return loadUnitTestDbCredentials()
    return loadProductionCredentials()
}


function loadProductionCredentials(): DbCredentials[] {
    // get number of databases
    const envKeys = Object.values(ENV_KEY_MAP)
    const getEnvValueAsList = (key: string) => (process.env[key] || '').split(',').filter(Boolean)
    const dbCount = getEnvValueAsList(envKeys[0]).length
    if (envKeys.some(key => getEnvValueAsList(key).length !== dbCount)) {
        // log a warning if the number of credentials does not match
        envKeys.forEach(key => {
            const numValues = getEnvValueAsList(key).length
            console.warn(`.env attribute '${key}' has ${numValues} (comma-separated)`)
        })
        throw new Error('Number of database credentials does not match')
    }

    // load credentials for each database
    const credentialsPerDb: DbCredentials[] = []
    for (let i = 0; i < dbCount; i++) {
        const credentials: Partial<DbCredentials> = {}
        for (const key of Object.keys(ENV_KEY_MAP)) {
            const attribute = key as keyof DbCredentials
            const attributeValue = getEnvValueAsList(ENV_KEY_MAP[attribute])[i]
            credentials[key as keyof DbCredentials] = attributeValue
        }
        credentialsPerDb.push(credentials as DbCredentials)
    }

    if (credentialsPerDb.length !== dbCount) throw new Error('Number of databases does not match')
    console.log(`Found ${dbCount} databases in the environment variables`)
    return credentialsPerDb
}