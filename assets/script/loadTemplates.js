// assets/script/loadTemplates.js

// Hàm tải template từ URL và chèn vào một phần tử có ID cho trước
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

document.addEventListener('DOMContentLoaded', () => {
    // Sửa đường dẫn template để tương đối với vị trí của loadTemplates.js
    loadTemplate('\assets\templates\header.html', 'header-placeholder');
    loadTemplate('\assets\templates\footer.html', 'footer-placeholder');
});