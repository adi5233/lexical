import {useState} from 'react';

type LinkEditorPopoverProps = {
  initialUrl: string;
  onApply: (url: string) => void;
  onRemove: () => void;
  onCancel: () => void;
};

export function LinkEditorPopover({
  initialUrl,
  onApply,
  onRemove,
  onCancel,
}: LinkEditorPopoverProps) {
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return;
    }

    onApply(trimmedUrl);
  };

  return (
    <div className="link-popover">
      <input
        type="url"
        value={url}
        onChange={(event) => {
          setUrl(event.target.value);
        }}
        placeholder="https://example.com"
        autoFocus
      />

      <div className="link-popover-actions">
        <button
          type="button"
          onClick={handleSubmit}
          onMouseDown={(event) => {
            /*
             * Prevent the button click from changing
             * the browser/Lexical selection before
             * handleSubmit runs.
             */
            event.preventDefault();
          }}
        >
          Apply
        </button>

        <button
          type="button"
          onClick={onRemove}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
        >
          Remove
        </button>

        <button
          type="button"
          onClick={onCancel}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
