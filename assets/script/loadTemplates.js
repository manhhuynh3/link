// assets/script/loadTemplates.js

// Function to load a template from a URL and insert it into an element with a given ID
export function loadTemplate(url, elementId) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load template from ${url}`);
            }
            return response.text();
        })
        .then(html => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
            } else {
                console.error(`Element with ID '${elementId}' not found.`);
            }
        })
        .catch(error => {
            console.error(`Error loading template ${url}:`, error);
        });
}

// Function to load all necessary templates (header and footer)
export async function loadAllTemplates() {
    try {
        // Correcting template paths to be relative to the root, using forward slashes
        await loadTemplate('/assets/templates/header.html', 'header-placeholder');
        await loadTemplate('/assets/templates/footer.html', 'footer-placeholder');
    } catch (error) {
        console.error('Error loading all templates:', error);
    }
}

// Execute loadAllTemplates when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadAllTemplates().catch(error => {
        console.error('Error in DOMContentLoaded template loading:', error);
    });
});
