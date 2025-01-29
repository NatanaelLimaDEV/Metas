import z from "zod";

// Valida DATABASE_URL no arquivo .env
const envSchema = z.object({
    DATABASE_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)