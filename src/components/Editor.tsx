import type React from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  errors?: string[];
}

export default function Editor({ content, onChange, errors = [] }: EditorProps) {
  return (
    <div className="editor">
      <textarea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        spellCheck={false}
      />
      {errors.length > 0 && (
        <pre className="error-box">
          {errors.join('\n')}
        </pre>
      )}
    </div>
  );
}