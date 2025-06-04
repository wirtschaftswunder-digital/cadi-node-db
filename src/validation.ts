import { type SafeParseReturnType, z } from "zod";


export function validateAndFilter<T extends z.ZodTypeAny>(input: unknown[], schema: T) {
    return input
        .map(item => schema.safeParse(item))
        .filter(item => item.success)
        .map(item => item.data) as z.infer<T>[];
}

export function validateWithErrors<T extends z.ZodTypeAny>(input: unknown[], schema: T) {
    return input.map((item) => {
        return (schema.safeParse(item) as SafeParseReturnType<unknown, z.infer<T>>);
    });
}

export function validateOrThrow<T extends z.ZodTypeAny>(input: unknown[], schema: T) {
    const items = input.map((item) => schema.parse(item));
    return items as z.infer<T>[];
}

export function ensureArraySchema<T extends z.ZodTypeAny>(schema: T) {
    if (schema instanceof z.ZodArray) {
        return schema;
    }
    else {
        return z.array(schema);
    }
}

export const schemaAnyArray = z.array(z.unknown());