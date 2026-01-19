/**
 * Locked Features Logic
 * Handles interaction with locked content cards and modal forms.
 */

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('lockedModal');
    const closeBtn = document.querySelector('.modal-close');
    const form = document.getElementById('requestForm');
    const featureInput = document.getElementById('featureInput');
    const lockedCards = document.querySelectorAll('.hero-card.is-locked');

    // Open Modal Function
    function openModal(featureKey) {
        featureInput.value = featureKey;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Close Modal Function
    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        form.reset();
    }

    // 1. Intercept clicks on locked cards
    lockedCards.forEach(card => {
        // We need to attach the listener to the card (parent) because
        // the flip animation might mean clicks happen on inner elements.
        // But since it's an <a> tag replaced by <div> or <a> with preventDefault,
        // let's ensure we handle it correctly.

        card.addEventListener('click', (e) => {
            // EXCEPTION: If the card points to matrix.html, let app.js handle it (redirect to login)
            if (card.getAttribute('href')?.includes('matrix.html')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            const feature = card.getAttribute('data-feature');
            openModal(feature);
        });

        // Also prevent clicks on the 'Leave Request' button from bubbling up weirdly 
        // if they were inside a link, but here they trigger the same action.
        const ctaBtn = card.querySelector('.card-cta-locked');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const feature = card.getAttribute('data-feature');
                openModal(feature);
            });
        }
    });

    // 2. Close Modal Listeners
    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    // 3. Handle Form Submission (Stub)
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = new FormData(form);
        const feature = data.get('feature');
        const name = data.get('name');

        // Stub: Log or Alert
        console.log(`[STUB] Request submitted for feature: ${feature}`);
        console.log(`User: ${name}`);

        alert('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.');

        closeModal();
    });
});
