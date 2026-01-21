'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export interface HCaptchaRef {
  resetCaptcha: () => void;
  execute: () => void;
}

const HCaptchaComponent = forwardRef<HCaptchaRef, HCaptchaComponentProps>(
  ({ onVerify, onError, onExpire }, ref) => {
    const captchaRef = useRef<HCaptcha>(null);
    const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';

    useImperativeHandle(ref, () => ({
      resetCaptcha: () => {
        captchaRef.current?.resetCaptcha();
      },
      execute: () => {
        captchaRef.current?.execute();
      },
    }));

    if (!siteKey) {
      console.warn('NEXT_PUBLIC_HCAPTCHA_SITE_KEY not configured');
      return null;
    }

    return (
      <div className="flex justify-center my-4">
        <HCaptcha
          ref={captchaRef}
          sitekey={siteKey}
          onVerify={onVerify}
          onError={onError}
          onExpire={onExpire}
          theme="light"
          size="normal"
        />
      </div>
    );
  }
);

HCaptchaComponent.displayName = 'HCaptchaComponent';

export default HCaptchaComponent;
