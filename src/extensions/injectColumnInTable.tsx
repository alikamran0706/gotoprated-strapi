const FIELD_NAMES = ['url', 'url_1', 'url_2', 'website'];

function patchCellsForFields() {
  const urlRegex = /(https?:\/\/[^\s]+)/i;

  const interval = setInterval(() => {
    const cells = document.querySelectorAll('td');
    let patchedAny = false;

    cells.forEach((cell) => {
      const span = cell.querySelector('span');
      if (!span) return;

      const text = span.textContent || '';
      if (urlRegex.test(text) && !span.querySelector('a')) {
        const match = text.match(urlRegex);
        if (!match) return;

        const url = match[0];
        span.textContent = ''; // clear

        // Create container span (inline-flex)
        const container = document.createElement('span');
        container.style.display = 'inline-flex';
        container.style.alignItems = 'center';
        container.style.maxWidth = '100%';

        // Icon first (before text)
        const icon = document.createElement('span');
        icon.textContent = '🔗';
        icon.style.marginRight = '4px';
        icon.style.color = '#1e90ff';
        icon.style.flexShrink = '0';

        // Link
        const a = document.createElement('a');
        a.href = url;
        a.textContent = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.color = '#1e90ff';
        a.style.whiteSpace = 'nowrap';
        a.style.textOverflow = 'ellipsis';
        a.style.overflow = 'hidden';
        a.style.display = 'inline-block';
        a.style.maxWidth = '150px'; // or some max width

        a.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        container.appendChild(icon);
        container.appendChild(a);
        span.appendChild(container);

        patchedAny = true;
      }
    });

    if (patchedAny) {
      clearInterval(interval);
    }
  }, 300);
}

function cleanMetadatas(metadatas: any) {
  if (!metadatas) return {};
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(metadatas)) {
    const val = metadatas[key];
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

const injectColumnInTable = ({ displayedHeaders, layout }: any) => {
  const fieldsFound = FIELD_NAMES.some((field) =>
    layout.layout.find((f: any) => f.name === field)
  );

  if (!fieldsFound) {
    return { displayedHeaders, layout };
  }

  // Patch the table cells in the DOM with updated text & color
  patchCellsForFields();

  // Clean metadatas as before
  const normalizedHeaders = displayedHeaders.map((hdr: any) => ({
    ...hdr,
    metadatas: cleanMetadatas(hdr.metadatas),
  }));

  return { displayedHeaders: normalizedHeaders, layout };
};

export default injectColumnInTable;
