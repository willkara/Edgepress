
import { writable } from 'svelte/store';

export const activeHeadingId = writable<string>('');

export function setupHeadingObserver() {
    // Check if running in browser
    if (typeof window === 'undefined') return () => {};

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeHeadingId.set(entry.target.id);
            }
        });
    }, {
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    });

    const headings = document.querySelectorAll('.article-body h2, .article-body h3');
    headings.forEach(h => observer.observe(h));

    return () => observer.disconnect();
}
