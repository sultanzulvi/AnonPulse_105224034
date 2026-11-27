import { z } from "zod";

/**
 * Skema validasi ID numerik bulat positif pada path parameter.
 */
export const skemaId = z
  .string()
  .regex(/^[1-9]\d*$/, "ID harus berupa bilangan bulat positif")
  .transform(Number);

/**
 * Helper RFC 9457 (Problem Details for HTTP APIs) untuk respons galat terstruktur.
 */
export function problem(
  status: number,
  title: string,
  extras?: Record<string, unknown>
): Response {
  return Response.json(
    {
      type: "about:blank",
      title,
      status,
      ...extras,
    },
    {
      status,
      headers: {
        "Content-Type": "application/problem+json",
      },
    }
  );
}

/**
 * Helper Problem Details 422 untuk kegagalan validasi skema Zod pada body.
 */
export function problemValidasi(
  error: z.ZodError,
  detail = "Isi permintaan tidak memenuhi aturan validasi."
): Response {
  const flat = z.flattenError(error);
  return problem(422, "Unprocessable Content", {
    detail,
    errors: {
      ...flat.fieldErrors,
      ...(flat.formErrors.length > 0 ? { _form: flat.formErrors } : {}),
    },
  });
}

/**
 * Membaca dan memvalidasi parameter path `id` bilangan bulat positif.
 */
export function bacaId(
  rawId: string
): { ok: true; id: number } | { ok: false; response: Response } {
  const hasil = skemaId.safeParse(rawId);
  if (!hasil.success) {
    return {
      ok: false,
      response: problem(400, "Bad Request", {
        detail: "Parameter path id harus berupa bilangan bulat positif.",
        errors: { id: z.flattenError(hasil.error).formErrors },
      }),
    };
  }
  return { ok: true, id: hasil.data };
}

/**
 * Membaca body JSON dengan aman; mengembalikan 400 Bad Request bila sintaks JSON rusak.
 */
export async function bacaJson(
  request: Request
): Promise<{ ok: true; data: unknown } | { ok: false; response: Response }> {
  try {
    const data: unknown = await request.json();
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return {
        ok: false,
        response: problem(400, "Bad Request", {
          detail: "Body permintaan harus berupa objek JSON.",
        }),
      };
    }
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: problem(400, "Bad Request", {
        detail: "Body permintaan bukan format JSON yang valid.",
      }),
    };
  }
}

