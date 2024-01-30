import { z } from "zod";

const publicEnvSchema = z.object({
  RAINBOW_PROJECT_ID: z.string(),
  BASE_URL: z.string().optional(),
});

type PublicEnv = z.infer<typeof publicEnvSchema>;

export const publicEnv: PublicEnv = {
  RAINBOW_PROJECT_ID:
    process.env.NEXT_PUBLIC_RAINBOW_PROJECT_ID ||
    "966691db73928f3c8a904ea62261b457",
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
};

publicEnvSchema.parse(publicEnv);
