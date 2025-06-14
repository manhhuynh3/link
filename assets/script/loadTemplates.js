// assets/script/loadTemplates.js (PHIÊN BẢN CHÍNH XÁC CẦN SỬ DỤNG)

// Hàm tải template từ URL và chèn vào một phần tử có ID cho trước
export function loadTemplate(url, elementId) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                // Improved error message for clarity
                throw new Error(`Failed to load template from ${url}. HTTP Status: ${response.status} - ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
            } else {
                console.error(`Error: Element with ID '${elementId}' not found in the DOM.`);
                throw new Error(`Placeholder element with ID '${elementId}' not found.`);
            }
        })
        .catch(error => {
            console.error(`Error loading template from ${url}:`, error);
            throw error; // Re-throw the error for higher-level handling
        });
}

// Hàm mới để tải tất cả các template cần thiết
export async function loadAllTemplates() {
    try {
        await Promise.all([
            // Điều chỉnh đường dẫn cho đúng, có thể là tuyệt đối hoặc tương đối với thư mục gốc
            loadTemplate('/assets/templates/header.html', 'header-placeholder'),
            loadTemplate('/assets/templates/footer.html', 'footer-placeholder')
        ]);
        console.log('All templates loaded successfully.');
    } catch (error) {
        console.error('Error: One or more templates failed to load.', error);
        throw error; // Re-throw the error for further handling
    }
}

// *** KHÔNG CÓ BẤT KỲ MÃ NÀO KHÁC Ở ĐÂY ***
// *** ĐẶC BIỆT LÀ KHÔNG CÓ document.addEventListener('DOMContentLoaded', ...) ***