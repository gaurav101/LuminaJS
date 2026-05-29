import { useCallback, useState } from 'react';

const COPY_FEEDBACK_MS = 1400;

export const useCodeClipboard = () => {
  const [copiedPanel, setCopiedPanel] = useState<string | null>(null);

  const copyCode = useCallback(async (panelId: string, code: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopiedPanel(panelId);
      setTimeout(() => {
        setCopiedPanel((current) => (current === panelId ? null : current));
      }, COPY_FEEDBACK_MS);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, []);

  return { copiedPanel, copyCode };
};
