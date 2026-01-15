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

    if (!modal) return; // Exit if no modal on this page

    // Open Modal Function
    function openModal(featureKey) {
        featureInput.value = featureKey;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    // Close Modal Function
    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        form.reset();
    }

    lockedCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const feature = card.getAttribute('data-feature');
            openModal(feature);
        });

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

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.');
            closeModal();
        });
    }
});
