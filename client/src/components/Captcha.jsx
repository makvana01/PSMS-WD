import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

/**
 * CAPTCHA COMPONENT (Captcha.jsx)
 * -------------------------------------------------------------
 * Dynamic visual canvas CAPTCHA generator with noise, distortion,
 * lines, and instant refresh capabilities.
 */
const Captcha = forwardRef(({ value, onChange, error }, ref) => {
  const canvasRef = useRef(null);
  const [captchaText, setCaptchaText] = useState('');
  const [isRotating, setIsRotating] = useState(false);

  // Character set avoiding ambiguous characters (like 0, O, I, 1, l)
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

  const generateRandomCode = (length = 6) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  };

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0f4f8');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 150}, ${Math.random() * 150}, ${Math.random() * 150}, 0.25)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 180}, ${Math.random() * 180}, ${Math.random() * 180}, 0.45)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.stroke();
    }

    // Draw characters with random rotation and colors
    const charWidth = width / (text.length + 1);
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.save();

      // Random color
      const colors = ['#1e293b', '#0f766e', '#1d4ed8', '#7c2d12', '#4338ca', '#047857'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.font = `bold ${Math.floor(20 + Math.random() * 6)}px 'Segoe UI', Roboto, sans-serif`;
      ctx.textBaseline = 'middle';

      // Transform & rotate
      const x = (i + 0.6) * charWidth;
      const y = height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() - 0.5) * 0.4; // -12 to +12 degrees

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    setIsRotating(true);
    const newCode = generateRandomCode(6);
    setCaptchaText(newCode);
    if (onChange) {
      onChange({ target: { value: '' } }); // Clear input on refresh
    }
    setTimeout(() => {
      drawCaptcha(newCode);
      setIsRotating(false);
    }, 100);
  };

  useEffect(() => {
    const code = generateRandomCode(6);
    setCaptchaText(code);
    drawCaptcha(code);
  }, []);

  // Expose verification & refresh functions to parent
  useImperativeHandle(ref, () => ({
    validate: (inputVal) => {
      if (!inputVal) return false;
      return inputVal.trim() === captchaText;
    },
    refresh: refreshCaptcha,
    getCode: () => captchaText
  }));

  return (
    <div className="mb-3">
      <label className="form-label fw-bold small text-secondary d-flex justify-content-between align-items-center">
        <span>Security Verification (CAPTCHA) *</span>
        <span className="badge bg-light text-secondary border font-normal">Case-sensitive</span>
      </label>

      <div className="d-flex align-items-center gap-2 mb-2">
        <div
          className="border rounded-2 overflow-hidden shadow-sm bg-white d-inline-flex align-items-center"
          style={{ height: '44px' }}
        >
          <canvas
            ref={canvasRef}
            width={160}
            height={44}
            style={{ display: 'block', cursor: 'default', userSelect: 'none' }}
            title="CAPTCHA challenge image"
          />
        </div>

        <button
          type="button"
          onClick={refreshCaptcha}
          className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center p-2"
          style={{ height: '44px', width: '44px' }}
          title="Refresh CAPTCHA Code"
        >
          <i className={`bi bi-arrow-clockwise fs-5 ${isRotating ? 'spin-anim' : ''}`}></i>
        </button>
      </div>

      <div className="input-group">
        <span className="input-group-text bg-light">
          <i className="bi bi-shield-check"></i>
        </span>
        <input
          type="text"
          className={`form-control ${error ? 'is-invalid' : ''}`}
          placeholder="Enter the 6-character code shown above"
          value={value}
          onChange={onChange}
          maxLength={6}
          autoComplete="off"
          required
        />
      </div>
      {error && <div className="text-danger small mt-1">{error}</div>}
    </div>
  );
});

export default Captcha;
