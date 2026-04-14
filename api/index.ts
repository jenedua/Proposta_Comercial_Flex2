import 'dotenv/config';
import type {Request, Response} from 'express';
import {createApp} from '../server/app';

const app = createApp();

type RequestWithRouting = Request & {
  query?: Record<string, unknown>;
  url: string;
};

function toSearchParams(query: Record<string, unknown>) {
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

function parseRequestUrl(request: RequestWithRouting) {
  return new URL(request.url || '/api', 'http://localhost');
}

function readPathSegment(request: RequestWithRouting, requestUrl: URL) {
  const queryPath = request.query?.path;
  if (Array.isArray(queryPath)) {
    return queryPath.map((entry) => String(entry)).join('/');
  }

  if (queryPath != null) {
    return String(queryPath);
  }

  const urlPath = requestUrl.searchParams.getAll('path');
  if (urlPath.length > 0) {
    return urlPath.join('/');
  }

  return '';
}

function readQuery(request: RequestWithRouting, requestUrl: URL) {
  if (request.query) {
    return request.query;
  }

  const query: Record<string, unknown> = {};
  requestUrl.searchParams.forEach((value, key) => {
    if (query[key] === undefined) {
      query[key] = value;
      return;
    }

    const current = query[key];
    query[key] = Array.isArray(current) ? [...current, value] : [String(current), value];
  });

  return query;
}

export default function handler(req: Request, res: Response) {
  const request = req as RequestWithRouting;
  const requestUrl = parseRequestUrl(request);
  const query = readQuery(request, requestUrl);
  const normalizedPath = readPathSegment(request, requestUrl);
  const pathname = normalizedPath ? `/api/${normalizedPath}` : '/api';
  const nextUrl = `${pathname}${toSearchParams(query)}`;

  try {
    request.url = nextUrl;
  } catch {
    Object.defineProperty(request, 'url', {
      value: nextUrl,
      configurable: true,
      writable: true,
    });
  }

  return app(request, res);
}
