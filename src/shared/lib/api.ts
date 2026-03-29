export async function readApiError(response: Response, fallback: string) {
  const text = await response.text();

  if (!text) {
    return fallback;
  }

  try {
    const data = JSON.parse(text) as {error?: string};
    return data.error || fallback;
  } catch {
    return text;
  }
}

export function getRequestErrorMessage(error: unknown, fallback?: string) {
  const defaultMessage =
    fallback ||
    'Nao foi possivel conectar ao servidor. Confirme se o PostgreSQL do Docker esta ativo e se voce iniciou o projeto com npm run dev.';

  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return defaultMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return defaultMessage;
}
