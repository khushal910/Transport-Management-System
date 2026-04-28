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

const renderPage = (initialPath: string, email?: string) => {
  if (email) {
    sessionStorage.setItem('password-reset-email', email);
  }

  const [pathname, search = ''] = initialPath.split('?');

  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname,
          search: search ? `?${search}` : '',
          state: email ? { email } : undefined,
        },
      ]}
    >
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
    sessionStorage.clear();
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

  it('keeps the user on the OTP step when the reset code is invalid', async () => {
    vi.mocked(verifyPasswordResetOTP).mockRejectedValueOnce(new Error('Invalid password reset code'));

    renderPage('/reset-password', 'driver@company.com');

    fireEvent.change(screen.getByLabelText(/Reset code/i), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Verify code/i }));

    await waitFor(() => {
      expect(verifyPasswordResetOTP).toHaveBeenCalledWith({
        email: 'driver@company.com',
        otp: '123456',
      });
    });

    expect(screen.getByText(/Enter reset code/i)).toBeInTheDocument();
    expect(screen.queryByText(/Create new password/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Invalid password reset code/i)).toBeInTheDocument();
  });
});
