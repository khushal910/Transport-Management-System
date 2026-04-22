import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import { requestPasswordResetOTP, resetPassword, verifyPasswordResetOTP } from '@/api/auth';

vi.mock('@/api/auth', () => ({
  requestPasswordResetOTP: vi.fn(),
  resetPassword: vi.fn(),
  verifyPasswordResetOTP: vi.fn(),
}));

const renderPage = (initialPath: string) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requestPasswordResetOTP).mockResolvedValue({
      success: true,
      message: 'ok',
      data: { message: 'ok' },
    });
    vi.mocked(resetPassword).mockResolvedValue({
      success: true,
      message: 'ok',
      data: { message: 'ok' },
    });
    vi.mocked(verifyPasswordResetOTP).mockResolvedValue({
      success: true,
      message: 'ok',
      data: { message: 'ok' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses token-based reset when valid token exists in URL', async () => {
    const token = 'a'.repeat(64);
    renderPage(`/reset-password?token=${token}`);

    expect(screen.queryByText(/Enter reset code/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/New password/i), {
      target: { value: 'Valid@123' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm password/i), {
      target: { value: 'Valid@123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Reset password/i }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith({
        token,
        password: 'Valid@123',
        passwordConfirm: 'Valid@123',
      });
    });

    expect(verifyPasswordResetOTP).not.toHaveBeenCalled();
  });

  it('shows invalid-link message for malformed token', () => {
    renderPage('/reset-password?token=short');

    expect(screen.getByText('Invalid reset link', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Request new reset link/i })).toBeInTheDocument();
  });
});
