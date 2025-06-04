import { expect, test } from "vitest";
import { queryDbAndParse, schemaAnyArray } from ".";


test("Perform simple query using connection pool", { repeats: 12 }, async () => {
    const query = "SELECT * FROM anreden"
    const res = await queryDbAndParse({
        subdomain: "my",
        query,
        schema: schemaAnyArray
    })
    expect(res).toBeDefined()
    expect(res).toBeTruthy()
    expect(Array.isArray(res)).toBeTruthy()
    expect(Array.isArray(res) && res.length).toBeGreaterThan(0)
})