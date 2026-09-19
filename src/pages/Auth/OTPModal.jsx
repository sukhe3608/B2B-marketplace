/* ============================================================
   TradeLink — OTP Verification Modal
   6-digit input with auto-advance, resend timer, verification.
   ============================================================ */
import { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import './AuthPages.css';

export default function OTPModal({ onVerify, onClose }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData.length === 6) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsVerifying(true);
    // Simulate verification
    await new Promise((r) => setTimeout(r, 1200));

    // Accept any 6-digit OTP for demo
    setIsVerifying(false);
    onVerify();
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal otp-modal animate-scale-in" id="otp-modal">
        <div className="modal-header">
          <div className="otp-modal-icon">
            <ShieldCheck size={24} />
          </div>
          <button className="btn btn-icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <h3 className="otp-title">Verify your account</h3>
          <p className="otp-subtitle">
            We've sent a 6-digit verification code to your registered contact.
          </p>

          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`otp-input ${error ? 'error' : ''} ${digit ? 'filled' : ''}`}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                id={`otp-input-${i}`}
              />
            ))}
          </div>

          {error && <p className="form-error" style={{ justifyContent: 'center', marginTop: 'var(--space-2)' }}>{error}</p>}

          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={handleVerify}
            disabled={isVerifying || otp.join('').length < 6}
            style={{ marginTop: 'var(--space-6)' }}
            id="otp-verify-btn"
          >
            {isVerifying ? (
              <><span className="btn-spinner"></span> Verifying...</>
            ) : (
              'Verify'
            )}
          </button>

          <div className="otp-resend">
            {resendTimer > 0 ? (
              <span className="text-secondary text-sm">
                Resend code in <strong>{resendTimer}s</strong>
              </span>
            ) : (
              <button className="btn btn-text" onClick={handleResend}>
                Resend Code
              </button>
            )}
          </div>

          <p className="otp-hint text-xs text-tertiary">
            For demo, enter any 6 digits to proceed.
          </p>
        </div>
      </div>
    </div>
  );
}
