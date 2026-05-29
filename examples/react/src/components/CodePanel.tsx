import { useMemo } from 'react';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';

interface CodePanelProps {
  title: string;
  code: string;
  panelId: string;
  copiedPanel: string | null;
  height: string;
  ariaLabel: string;
  onCopy: (panelId: string, code: string) => void;
}

export const CodePanel = ({
  title,
  code,
  panelId,
  copiedPanel,
  height,
  ariaLabel,
  onCopy,
}: CodePanelProps) => {
  const codeExtensions = useMemo(() => [javascript({ jsx: true })], []);
  const codeEditorSetup = useMemo(
    () => ({
      lineNumbers: true,
      foldGutter: false,
      highlightActiveLine: false,
      highlightActiveLineGutter: false,
    }),
    [],
  );

  return (
    <details className="code-panel">
      <summary className="code-panel-summary">{title}</summary>
      <div className="code-panel-body">
        <div className="code-panel-toolbar">
          <button
            type="button"
            className="code-copy-btn"
            onClick={() => onCopy(panelId, code)}
            aria-label={`Copy ${ariaLabel}`}
          >
            {copiedPanel === panelId ? 'Copied' : 'Copy Code'}
          </button>
        </div>
        <div className="code-block">
          <CodeMirror
            value={code}
            height={height}
            theme={oneDark}
            editable={false}
            extensions={codeExtensions}
            basicSetup={codeEditorSetup}
            className="code-editor"
            aria-label={ariaLabel}
          />
        </div>
      </div>
    </details>
  );
};
