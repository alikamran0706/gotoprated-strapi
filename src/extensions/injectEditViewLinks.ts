const URL_FIELDS = ['url', 'url_1', 'url_2', 'website'];

function patchEditViewLabelsWithLinks() {
  const interval = setInterval(() => {
    const inputs = document.querySelectorAll('input[name]');

    let patched = false;

    inputs.forEach((input: HTMLInputElement) => {
      const fieldName = input.getAttribute('name');
      const labelId = input.getAttribute('id');

      if (!fieldName || !labelId) return;

      if (!URL_FIELDS.includes(fieldName)) return;

      const label = document.querySelector(`label[for="${labelId}"]`);
      if (!label || label.querySelector('a')) return;

      const linkIcon = document.createElement('a');
      linkIcon.textContent = ' 🔗';
      linkIcon.style.marginLeft = '8px';
      linkIcon.style.textDecoration = 'none'; 
      linkIcon.style.cursor = 'pointer';
      linkIcon.href = '#';
      linkIcon.title = 'Open link in new tab';
      linkIcon.style.cursor = 'pointer';

      // Dynamically open latest input value when clicked
      linkIcon.addEventListener('click', (e) => {
        e.preventDefault();
        const currentValue = input.value;
        if (currentValue?.startsWith('http')) {
          window.open(currentValue, '_blank', 'noopener');
        }
      });

      label.appendChild(linkIcon);
      patched = true;
    });

    if (patched) {
      console.log('✅ Link icons added to labels');
      clearInterval(interval);
    }
  }, 500);
}

export default patchEditViewLabelsWithLinks;
