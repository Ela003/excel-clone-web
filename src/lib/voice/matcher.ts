import type { RowData } from '../../types/sheet';

export type MatchResult =
  | { type: 'found'; row: RowData }
  | { type: 'not-found'; query: string }
  | { type: 'ambiguous'; query: string; candidates: RowData[] };

function rowName(row: RowData): string {
  return (row.cells[0]?.value ?? '').trim();
}

/**
 * Matches a spoken name against the first ("name") column of a sheet's rows.
 * Priority: exact case-insensitive match, then a unique prefix/substring match,
 * then ambiguous (multiple candidates), then not-found.
 */
export function matchRow(query: string, rows: RowData[]): MatchResult {
  const q = query.trim().toLowerCase();
  if (!q) return { type: 'not-found', query };

  const named = rows.filter((r) => rowName(r).length > 0);

  const exact = named.filter((r) => rowName(r).toLowerCase() === q);
  if (exact.length === 1) return { type: 'found', row: exact[0] };
  if (exact.length > 1) return { type: 'ambiguous', query, candidates: exact };

  const partial = named.filter((r) => {
    const name = rowName(r).toLowerCase();
    return name.startsWith(q) || name.includes(q) || q.includes(name);
  });

  if (partial.length === 1) return { type: 'found', row: partial[0] };
  if (partial.length > 1) return { type: 'ambiguous', query, candidates: partial };

  return { type: 'not-found', query };
}
