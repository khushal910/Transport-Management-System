import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDeletedEmployees, sendEmployeeEmail } from '@/api/auth';

const buildSuccessResponse = (data: unknown = {}) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  text: async () =>
    JSON.stringify({
      success: true,
      message: 'ok',
      data,
    }),
});

describe('employee auth api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(buildSuccessResponse()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('builds deleted employees query params correctly', async () => {
    await getDeletedEmployees({ page: 2, limit: 15, search: 'sarah' });

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [requestUrl, requestOptions] = fetchMock.mock.calls[0];
    expect(requestUrl).toContain('/api/auth/employees/deleted?page=2&limit=15&search=sarah');
    expect(requestOptions.credentials).toBe('include');
  });

  it('sends manager email payload with post request', async () => {
    const payload = {
      recipientUserId: '507f1f77bcf86cd799439011',
      subject: 'Shift update',
      message: 'Please report 15 minutes early for route handoff.',
    };

    await sendEmployeeEmail(payload);

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    const [, requestOptions] = fetchMock.mock.calls[0];

    expect(requestOptions.method).toBe('POST');
    expect(JSON.parse(requestOptions.body as string)).toEqual(payload);
  });
});
