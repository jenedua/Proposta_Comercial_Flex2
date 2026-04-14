import 'dotenv/config';
import type {Request, Response} from 'express';
import {createApp} from '../server/app';

const app = createApp();

type RequestWithQuery = Request & {
  query: Record<string, unknown>;
  url: string;
};

function toSearchParams(query: RequestWithQuery['query']) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (key === 'path' || value == null) continue;

    if (Array.isArray(value)) {
      value.forEach((entry) => searchParams.append(key, String(entry)));
      continue;
    }

    searchParams.set(key, String(value));
  }

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : '';
}

export default function handler(req: Request, res: Response) {
  const request = req as RequestWithQuery;
  const path = request.query.path;
  const normalizedPath = Array.isArray(path)
    ? path.map((entry) => String(entry)).join('/')
    : path
      ? String(path)
      : '';
  const pathname = normalizedPath ? `/api/${normalizedPath}` : '/api';

  request.url = `${pathname}${toSearchParams(request.query)}`;

  return app(request, res);
}
