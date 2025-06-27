---
layout: post
title: "Giới thiệu Addon Custom Light cho Blender"
date: 2025-06-26
author: Mạnh Huỳnh
categories: [Share, Tutorial]
tags: [Blender, addon, lighting]
thumbnail: /blog/assets/custom-lights-cover.png.jpg
excerpt: >
  Addon hỗ trợ tạo và quản lý các loại đèn trong Blender...
---

<div class="alert alert-secondary">
<p class="mb-1"><strong>Tên Addon:</strong> Custom Light</p>
<p class="mb-1"><strong>Mô tả:</strong> Bộ công cụ giúp bạn tạo và quản lý ánh sáng tùy chỉnh trong Blender.</p>
<p class="mb-0"><strong>Vị trí:</strong> <code>View3D</code> > <code>Sidebar</code> (Phím <code>N</code>) > Tab "Custom Lights"</p>
</div>



## I. Tổng quan
Chào mọi người! Mình muốn chia sẻ một addon nho nhỏ mà mình tự làm, tên là Custom Lighting. Về cơ bản, nó giúp bạn tạo nhanh các loại đèn đơn giản trong Blender, kết hợp với giao diện quản lý đèn, giúp bạn tiết kiệm chút thời gian cho việc thiết lập ánh sáng.

<div class="text-center my-8">
  <a href="https://manhdesigns.gumroad.com/l/customlights" target="_blank" rel="noopener noreferrer" class="bg-primary-button hover:bg-primary-button text-white hover:text-white px-8 py-4 rounded-lg inline-flex items-center text-lg font-bold shadow-lg transform hover:scale-105 transition-transform duration-300">
    <i class="fa-solid fa-download mr-3"></i> Tải Addon tại Gumroad
  </a>
</div>

### Các tính năng nổi bật:
<div class="alert alert-primary my-4">
  <ul>
    <li><strong>Thêm nhanh:</strong> Đèn cơ bản (Point, Sun, Spot, Area).</li>
    <li><strong>Đèn nâng cao:</strong> Tracker Lights, Gradient Light Plane, Translucent Light Plane, Simple God Rays.</li>
    <li><strong>Chỉnh màu:</strong> Chuyển đổi màu Blackbody.</li>
    <li><strong>Tiện ích:</strong> Track To Selected, Make Emission Mesh.</li>
    <li><strong>Quản lý:</strong> Giao diện tập trung để điều khiển tất cả đèn.</li>
  </ul>
</div>



## II. Bắt đầu nhanh

### 1. Cài đặt
1.  Vào `Edit > Preferences > Add-ons`.
2.  Nhấp `Install`, chọn file `custom_light_1_0_52.zip`, rồi tích chọn để bật addon.

### 2. Vị trí trên giao diện
1.  Trong cửa sổ 3D Viewport, nhấn phím `N` để mở Sidebar.
2.  Tìm và chọn tab "Custom Lights".

<figure class="figure my-4 justify-center items-center mx-auto">
  <img src="/blog/assets/custom-lights-1.png" class="figure-img img-fluid rounded shadow-sm w-full md:w-3/4" alt="Vị trí tab Custom Lights trong Sidebar">
 
</figure>

### 3. Các Panel chính
Addon có 3 panel chính:
*   **Add Base Lights:** Thêm các loại đèn tiêu chuẩn của Blender.
*   **Custom Light:** Thêm các loại đèn và hiệu ứng ánh sáng đặc biệt của addon.
*   **Manage Lights:** Quản lý tập trung tất cả đèn và đối tượng phát sáng trong cảnh.



## III. Các chức năng chính và cách dùng

### 1. Add Base Lights (Thêm đèn cơ bản)
*   **Chức năng:** Tạo đèn Point, Sun, Spot, Area (Rectangle/Ellipse).
*   **Cách dùng:** Đặt con trỏ 3D tại vị trí muốn tạo đèn, nhấp nút tương ứng.
*   **Kết quả:** Đèn mới được tạo và tự động thêm vào scene/collection.
*   **Lưu ý:** Checkbox Auto-create collection khi check sẽ tự động đưa các đèn cùng loại vào cùng một collection.

<figure class="figure my-4">
  <img src="/blog/assets/custom-lights-2.png" class="figure-img img-fluid rounded shadow-sm w-full" alt="Giao diện panel Add Base Lights">

</figure>

### 2. Custom Light (Thêm đèn tùy chỉnh & Công cụ)

#### Tracker Light:
*   **Chức năng:** Tạo hệ thống đèn Area tự động theo dõi đối tượng active.
*   **Cách dùng:** Chọn đối tượng cần theo dõi > Nhấp `Tracker Light` > Cấu hình trong hộp thoại.
*   **Kết quả:** Một Empty làm mục tiêu và các đèn Area theo dõi được tạo.

<div class="ratio ratio-16x9 my-4 shadow-sm rounded w-full md:w-3/4">
  <iframe src="https://www.youtube.com/embed/GZG4OWvXY5c" title="Minh họa Tracker Light" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>


#### Gradient Light Plane:
*   **Chức năng:** Tạo mặt phẳng phát sáng với hiệu ứng gradient (linear/spherical).
*   **Cách dùng:** Đặt con trỏ 3D > Nhấp `Gradient Light Plane` > Cấu hình màu, kích thước, loại gradient.

<div class="ratio ratio-16x9 my-4 shadow-sm rounded w-full md:w-3/4">
  <iframe src="https://www.youtube.com/embed/LRegt5gd8Oo" title="Minh họa Tracker Gradient light" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

#### Translucent Light Plane:
*   **Chức năng:** Tạo mặt phẳng xuyên sáng đặt trước đèn active, dùng cho ánh sáng khuếch tán.
*   **Cách dùng:** Chọn một đèn active > Nhấp `Translucent Light Plane` > Cấu hình màu, khoảng cách.

<div class="ratio ratio-16x9 my-4 shadow-sm rounded w-full md:w-3/4">
  <iframe src="https://www.youtube.com/embed/pFJMLVCnS0k" title="Minh họa Translucent Light Plane" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

#### Simple God Rays:
*   **Chức năng:** Thêm hiệu ứng tia sáng (God Rays) cho đèn Spot active.
*   **Cách dùng:** Chọn đèn active (sẽ chuyển thành Spot) > Nhấp `Simple God Rays` > Cấu hình công suất, nhiễu, màu.
*   **Lưu ý:** Hiệu ứng có sử dụng volume, có thể ảnh hưởng tới hiệu xuất.
<div class="ratio ratio-16x9 my-4 shadow-sm rounded w-full md:w-3/4">
  <iframe src="https://www.youtube.com/embed/FapRB4pZMZA" title="Minh họa Simple God Rays" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

#### Track to Selected:
*   **Chức năng:** Gắn constraint Track To cho các đối tượng được chọn để chúng luôn hướng về đối tượng active.
*   **Cách dùng:** Chọn nhiều đối tượng (đối tượng cuối cùng được chọn là active) > Nhấp `Track to Selected`.
<div class="ratio ratio-16x9 my-4 shadow-sm rounded w-full md:w-3/4">
  <iframe src="https://www.youtube.com/embed/9vQBVdWrV6Q" title="Minh họa Track to selected" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

#### Make Emission Mesh:
*   **Chức năng:** Biến một đối tượng mesh thành nguồn sáng bằng cách thêm shader Emission và đổi tên (tiền tố `L.`).
*   **Cách dùng:** Chọn một đối tượng mesh > Nhấp `Make Emission Mesh`.
<div class="ratio ratio-16x9 my-4 shadow-sm rounded w-full md:w-3/4">
  <iframe src="https://www.youtube.com/embed/oLSIh1F--YM" title="Minh họa Make Emission Mesh" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

#### Input Blackbody color:
*   **Chức năng:** Chuyển đổi màu của đèn hoặc vật liệu phát sáng (Emission) theo nhiệt độ Kelvin.
*   **Cách dùng:** Chọn đèn hoặc mesh phát sáng active > Nhấp `Input Blackbody color` > Chọn nhiệt độ.
*   **Lưu ý:** Hiện tại addon sử dụng chuyển đổi màu sắc trên màu RGB nên có thể không chính xác 100% màu từ node shade Blackbody.
<div class="ratio ratio-16x9 my-4 shadow-sm rounded w-full md:w-3/4">
  <iframe src="https://www.youtube.com/embed/KP7kBxQGIPM" title="Input blackbody color" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

### 3. Manage Lights (Quản lý đèn)
*   **Chức năng:** Xem và điều khiển tất cả đèn/đối tượng phát sáng theo collection.
*   **Tổng quan:** Hiển thị MASTER COLLECTION và các collection con (Point Lights, Tracker Lights, v.v.).

#### Điều khiển:
*   **Thu gọn/Mở rộng:** Nhấp biểu tượng mũi tên cạnh tên collection.
*   **Chọn collection:** Nhấp vào tên collection để chọn tất cả đối tượng trong đó.
*   **Chọn đèn/đối tượng:** Nhấp vào tên từng đối tượng.
*   **Điều chỉnh:** Trực tiếp thay đổi **Color**, **Brightness/Power**, **Size/Shape** (tùy loại đèn/mesh).
*   **Hiển thị:** Bật/tắt hiển thị trong **Viewport**, **Render** và **Camera** (đối với mesh phát sáng).


<div class="ratio ratio-16x9 my-4 shadow-sm rounded w-full md:w-3/4">
  <iframe src="https://www.youtube.com/embed/Yy-FjRBTzUjA" title="Minh họa quản lý đèn" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>



