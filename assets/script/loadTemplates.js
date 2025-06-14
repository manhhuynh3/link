// assets/script/loadTemplates.js (PHIÊN BẢN CHÍNH XÁC CẦN SỬ DỤNG)

// Hàm tải template từ URL và chèn vào một phần tử có ID cho trước
export function loadTemplate(url, elementId) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                // Thêm thông báo chi tiết hơn cho lỗi 404
                throw new Error(`Failed to load template from ${url}. Status: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
                // console.log(`Template ${url} loaded and inserted into #${elementId}`);
            } else {
                console.error(`Element with ID '${elementId}' not found for template ${url}.`);
                // Ném lỗi để Promise.all trong loadAllTemplates có thể bắt được
                throw new Error(`Placeholder element with ID '${elementId}' not found for template ${url}.`);
            }
        })
        .catch(error => {
            console.error(`Error loading template ${url}:`, error);
            throw error; // Quan trọng: ném lỗi lại để Promise.all có thể bắt được
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
        console.error('Failed to load one or more templates:', error);
        throw error; // Ném lỗi để main.js có thể xử lý
    }
}

// *** KHÔNG CÓ BẤT KỲ MÃ NÀO KHÁC Ở ĐÂY ***
// *** ĐẶC BIỆT LÀ KHÔNG CÓ document.addEventListener('DOMContentLoaded', ...) ***