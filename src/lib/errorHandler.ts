import { isAxiosError } from "axios";

export type BackendValidationErrorIssue = {
  origin?: string;
  code?: string;
  path?: Array<string | number>;
  message: string;
};

export type ParsedApiError = {
  status?: number;
  generalMessage: string | null;
  code: string | null;
  fieldErrors: Record<string, string[]>;
  allMessages: string[];
  isRateLimited: boolean;
};

/**
 * Mem-parse respon galat dari backend Buwuhan.
 * Mampu mengekstrak format string JSON array dari validasi backend (Zod / Valibot):
 * `message: "[{ path: ['email'], message: 'Format email tidak valid' }, ...]"`
 * dan memetakannya ke masing-masing kolom input serta daftar pesan umum.
 *
 * @param error - Objek error yang ditangkap dari try/catch API call
 * @returns Objek ParsedApiError berisi fieldErrors, generalMessage, allMessages, dan status rate limit
 */
export function parseApiError(error: unknown): ParsedApiError {
  const result: ParsedApiError = {
    status: isAxiosError(error) ? error.response?.status : undefined,
    generalMessage: null,
    code: null,
    fieldErrors: {},
    allMessages: [],
    isRateLimited: false,
  };
  if (!isAxiosError(error)) {
    result.generalMessage =
      "Terjadi kendala koneksi ke server. Pastikan backend aktif.";
    result.allMessages.push(result.generalMessage);
    return result;
  }

  // Cek Status 429 Too Many Requests (Rate limit)
  if (error.response?.status === 429) {
    result.isRateLimited = true;
    result.generalMessage =
      "Terlalu banyak percobaan request. Mohon tunggu beberapa saat sebelum mencoba kembali.";
    result.allMessages.push(result.generalMessage);
    return result;
  }

  const responseData = error.response?.data as
    | { message?: unknown; error?: unknown; code?: unknown; details?: unknown }
    | undefined;

  if (typeof responseData?.code === "string") {
    result.code = responseData.code;
  }

  // Kontrak baru backend: details memuat pesan per kolom
  if (Array.isArray(responseData?.details)) {
    for (const item of responseData.details as Array<{
      field?: string;
      message?: string;
    }>) {
      const field = item.field ? String(item.field) : "general";
      const msg = item.message || "Data tidak valid";
      if (!result.fieldErrors[field]) {
        result.fieldErrors[field] = [];
      }
      result.fieldErrors[field].push(msg);
      result.allMessages.push(msg);
    }

    if (typeof responseData?.message === "string") {
      result.generalMessage = responseData.message;
    }

    return result;
  }

  const rawMessage = responseData?.message || responseData?.error;

  if (!rawMessage) {
    result.generalMessage =
      "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.";
    result.allMessages.push(result.generalMessage);
    return result;
  }

  // Jika rawMessage berupa string, periksa apakah itu format JSON array
  if (typeof rawMessage === "string") {
    const trimmed = rawMessage.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed) as BackendValidationErrorIssue[];
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const field = item.path?.[0] ? String(item.path[0]) : "general";
            const msg = item.message || "Data tidak valid";
            if (!result.fieldErrors[field]) {
              result.fieldErrors[field] = [];
            }
            result.fieldErrors[field].push(msg);
            result.allMessages.push(msg);
          }
          return result;
        }
      } catch {
        // Fallback jika JSON.parse gagal
      }
    }

    result.generalMessage = rawMessage;
    result.allMessages.push(rawMessage);
    return result;
  }

  // Jika rawMessage sudah berupa Array objek
  if (Array.isArray(rawMessage)) {
    for (const item of rawMessage as BackendValidationErrorIssue[]) {
      const field = item.path?.[0] ? String(item.path[0]) : "general";
      const msg = item.message || "Data tidak valid";
      if (!result.fieldErrors[field]) {
        result.fieldErrors[field] = [];
      }
      result.fieldErrors[field].push(msg);
      result.allMessages.push(msg);
    }
    return result;
  }

  result.generalMessage = String(rawMessage);
  result.allMessages.push(result.generalMessage);
  return result;
}
