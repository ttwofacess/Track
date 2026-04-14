// Donation modal logic
export function initDonationModal() {
    const donateButton = document.getElementById('donateButton');
    const modal = document.getElementById('donateModal');
    const closeButton = document.querySelector('.close-button');

    if (donateButton && modal && closeButton) {
        // Open modal
        donateButton.onclick = () => { modal.style.display = 'block'; };

        // Close with × button
        closeButton.onclick = () => { modal.style.display = 'none'; };

        // Close when clicking outside the content
        window.addEventListener('click', (event) => {
            if (event.target === modal) modal.style.display = 'none';
        });
    }
}

// Copy crypto address to clipboard
export function initCopyButtons() {
    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const input = event.target
                .previousElementSibling   // .crypto-info
                .querySelector('input');

            if (input) {
                input.select();
                input.setSelectionRange(0, 99999); // For mobile

                try {
                    navigator.clipboard.writeText(input.value).then(() => {
                        const originalText = button.textContent;
                        button.textContent = '¡Copiado!';
                        button.style.backgroundColor = 'var(--success)';
                        setTimeout(() => {
                            button.textContent = originalText;
                            button.style.backgroundColor = '';
                        }, 2000);
                    });
                } catch (err) {
                    // Fallback for older browsers
                    document.execCommand('copy');
                    const originalText = button.textContent;
                    button.textContent = '¡Copiado!';
                    setTimeout(() => { button.textContent = originalText; }, 2000);
                }
            }
        });
    });
}
