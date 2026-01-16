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

    // 3. Handle Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        const formData = new FormData(form);
        const feature = formData.get('feature');
        const name = formData.get('name');
        const contact = formData.get('contact');

        try {
            // Use existing supabaseClient (initialized in app.js)
            if (typeof window.initSupabase === 'function') window.initSupabase();

            const libStatus = typeof window.supabase !== 'undefined' ? 'ok' : 'lib_missing';
            const clientStatus = window.supabaseClient ? 'ok' : 'null';

            if (window.supabaseClient) {
                const { error } = await window.supabaseClient
                    .from('leads')
                    .insert([
                        {
                            feature: feature || 'general',
                            full_name: name,
                            contact_info: contact,
                            status: 'new'
                        }
                    ]);

                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }

                alert('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.');
                closeModal();
            } else {
                throw new Error(`Supabase connection failed (lib:${libStatus}, client:${clientStatus}). Please check your connection and refresh.`);
            }
        } catch (err) {
            console.error('Submission catch:', err);
            alert(`Ошибка: ${err.message || 'Неизвестная ошибка'}. Попробуйте еще раз или напишите в Telegram.`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});
