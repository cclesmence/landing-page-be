const FORM_SECTIONS = [
  {
    tableName: "ho_so_nguoi_su_dung",
    title: "Hồ sơ người sử dụng",
    fields: [
      { code: "ho_so_nguoi_dung", label: "Độ tuổi, nghề nghiệp", inputType: "textbox", required: true, placeholder: "25, Kỹ sư", order: 1 },
      { code: "email_ho_so", label: "Email", inputType: "textbox email", required: false, placeholder: "email@gmail.com", order: 2 },
      { code: "habits", label: "Thói quen sinh hoạt", inputType: "checkbox", required: false, order: 3, multiSelect: true },
      { code: "hobbies", label: "Sở thích", inputType: "checkbox", required: false, order: 4, multiSelect: true },
    ],
  },
  {
    tableName: "muc_tieu_mong_muon_cua_khach_hang",
    title: "Mục tiêu & mong muốn của khách hàng",
    fields: [
      { code: "motivations", label: "Lý do xây dựng", inputType: "option", required: false, order: 1, multiSelect: false },
      { code: "expectations", label: "Kỳ vọng chính", inputType: "checkbox", required: false, order: 2, multiSelect: true },
      { code: "priorities", label: "Ưu tiên hàng đầu", inputType: "option", required: false, order: 3, multiSelect: false },
    ],
  },
  {
    tableName: "chon_phong_muon_thiet_ke",
    title: "Chọn phòng muốn thiết kế",
    fields: [
      { code: "rooms", label: "Phòng thiết kế", inputType: "checkbox", required: true, order: 1, multiSelect: true },
      { code: "room_requirements", label: "Yêu cầu đặc biệt cho phòng", inputType: "checkbox", required: false, order: 2, multiSelect: true },
    ],
  },
  {
    tableName: "phong_cach_cam_hung_thiet_ke",
    title: "Phong cách & cảm hứng thiết kế",
    fields: [
      { code: "architecture_styles", label: "Kiến trúc thiết kế", inputType: "card checkbox", required: false, order: 1, multiSelect: true },
      { code: "interior_styles", label: "Nội thất thiết kế", inputType: "card checkbox", required: false, order: 2, multiSelect: true },
    ],
  },
  {
    tableName: "colour_combo",
    title: "Colour combo",
    fields: [
      { code: "colour_combos", label: "Colour combo", inputType: "card checkbox", required: false, order: 1, multiSelect: true },
    ],
  },
  {
    tableName: "material",
    title: "Material",
    fields: [
      { code: "materials", label: "Material", inputType: "card checkbox", required: false, order: 1, multiSelect: true },
    ],
  },
  {
    tableName: "khao_sat_them",
    title: "Khảo sát thêm",
    fields: [
      { code: "tong_ngan_sach", label: "Tổng ngân sách dự kiến", inputType: "number", required: false, placeholder: "Ví dụ: 300000000", order: 1 },
      { code: "uu_tien_phan_bo", label: "Ưu tiên phân bổ", inputType: "option", required: false, order: 2, multiSelect: false },
      { code: "muc_hoan_thien", label: "Mức hoàn thiện mong muốn", inputType: "option", required: false, order: 3, multiSelect: false },
      { code: "thoi_gian_hoan_thanh", label: "Thời gian mong muốn hoàn thành", inputType: "textbox", required: false, placeholder: "Ví dụ: 2 tháng", order: 4 },
      { code: "cac_moc_quan_trong", label: "Các mốc quan trọng", inputType: "textbox", required: false, placeholder: "Ví dụ: chốt thiết kế, bắt đầu thi công...", order: 5 },
      { code: "khao_sat_phong_cach", label: "Phong cách mong muốn", inputType: "textarea", required: false, order: 6 },
      { code: "hinh_anh_tham_khao", label: "Hình ảnh tham khảo khách thích", inputType: "textarea", required: false, order: 7 },
      { code: "upload_hinh_anh_tham_khao", label: "Upload ảnh tham khảo", inputType: "upload", required: false, order: 8 },
      { code: "khong_thich_trong_khong_gian", label: "Bạn ghét điều gì trong không gian sống", inputType: "textarea", required: false, order: 9 },
    ],
  },
  {
    tableName: "thong_tin_tong_quan_du_an",
    title: "Thông tin tổng quan dự án",
    fields: [
      { code: "chu_dau_tu", label: "Chủ đầu tư / Đại diện", inputType: "textbox", required: true, placeholder: "Nguyễn Văn A", order: 1 },
      { code: "so_dien_thoai", label: "Số điện thoại", inputType: "textbox phone", required: true, placeholder: "0901 234 567", order: 2 },
      { code: "email_du_an", label: "Email", inputType: "textbox email", required: false, placeholder: "email@gmail.com", order: 3 },
      { code: "dia_diem_xay_dung", label: "Địa điểm xây dựng", inputType: "textbox", required: true, placeholder: "123 Nguyễn Huệ, Quận 1, TP.HCM", order: 4 },
      { code: "dien_tich", label: "Diện tích (m2)", inputType: "number", required: true, placeholder: "65", order: 5 },
      { code: "loai_cong_trinh", label: "Loại công trình", inputType: "select", required: false, order: 6, multiSelect: false },
    ],
  },
];

const OPTION_SEEDS = {
  habits: [
    { value: "doc-sach", label: "Đọc sách" },
    { value: "xem-phim", label: "Xem phim" },
    { value: "tap-gym", label: "Tập gym" },
    { value: "lam-viec-nha", label: "Làm việc tại nhà" },
    { value: "gon-gang", label: "Gọn gàng" },
  ],
  hobbies: [
    { value: "nghe-nhac", label: "Nghe nhạc" },
    { value: "thu-am", label: "Thu âm / nhạc cụ" },
    { value: "gom-su", label: "Làm gốm" },
    { value: "trong-cay", label: "Trồng cây" },
  ],
  motivations: [
    { value: "an-cu", label: "An cư lâu dài" },
    { value: "cho-thue", label: "Tối ưu cho thuê" },
    { value: "dau-tu", label: "Đầu tư gia tăng giá trị" },
  ],
  expectations: [
    { value: "tien-nghi", label: "Tối đa tiện nghi" },
    { value: "toi-uu-luu-tru", label: "Tối ưu lưu trữ" },
    { value: "khoang-xanh", label: "Thêm khoảng xanh" },
    { value: "vat-lieu-xin", label: "Vật liệu cao cấp" },
  ],
  priorities: [
    { value: "thi-cong", label: "Thi công nhanh" },
    { value: "chat-luong", label: "Chất lượng vật liệu" },
    { value: "ngan-sach", label: "Kiểm soát ngân sách" },
    { value: "ca-nhan-hoa", label: "Cá nhân hóa trải nghiệm" },
  ],
  rooms: [
    { value: "phong-khach", label: "Phòng khách", description: "Khu tiếp khách chính", metadata: { icon: "🛋️" } },
    { value: "phong-ngu-master", label: "Phòng ngủ master", metadata: { icon: "🛏️" } },
    { value: "phong-ngu-phu", label: "Phòng ngủ phụ", metadata: { icon: "🛏️" } },
    { value: "bep-ban-an", label: "Bếp + bàn ăn", metadata: { icon: "🍽️" } },
    { value: "phong-lam-viec", label: "Phòng làm việc", metadata: { icon: "💼" } },
    { value: "san-vuon", label: "Ban công / sân vườn", metadata: { icon: "🌿" } },
  ],
  room_requirements: [
    { value: "phong-kin", label: "Phòng kín" },
    { value: "can-cach-am", label: "Cần cách âm" },
    { value: "can-linh-hoat-chuyen-doi", label: "Cần linh hoạt chuyển đổi" },
    { value: "phong-thuy", label: "Phong thủy" },
    { value: "ky-thuat-rieng", label: "Kỹ thuật riêng (smart home, năng lượng mặt trời...)" },
    { value: "khac", label: "Khác" },
  ],
  architecture_styles: [
    { value: "modern", label: "Hiện đại", description: "Đường nét rõ, hình khối gọn", image_url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?modern", metadata: { tone: "neutral" } },
    { value: "indochine", label: "Indochine", description: "Đông Dương sang trọng", image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", metadata: { tone: "heritage" } },
    { value: "minimalism", label: "Minimalism", description: "Tối giản tuyệt đối", image_url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e", metadata: { tone: "clean" } },
    { value: "mediterranean", label: "Mediterranean", description: "Địa Trung Hải phóng khoáng", image_url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?mediterranean", metadata: { tone: "warm" } },
    { value: "contemporary", label: "Contemporary", description: "Đương đại, linh hoạt", image_url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80", metadata: { tone: "modern" } },
  ],
  interior_styles: [
    { value: "japandi", label: "Japandi", description: "Tinh giản, gỗ sáng, mộc mạc", image_url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511", metadata: { tone: "warm" } },
    { value: "modern", label: "Modern", description: "Đương đại, tối giản đường nét", image_url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?modern", metadata: { tone: "neutral" } },
    { value: "minimalism", label: "Minimalism", description: "Tối giản tuyệt đối", image_url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e", metadata: { tone: "clean" } },
    { value: "scandinavian", label: "Scandinavian", description: "Bắc Âu ấm áp", image_url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?scandi", metadata: { tone: "soft" } },
    { value: "wabi-sabi", label: "Wabi Sabi", description: "Mộc, thô, tự nhiên", image_url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?wabisabi", metadata: { tone: "earthy" } },
  ],
  colour_combos: [
    { value: "milk-tea", label: "Milk tea & Walnut", accent_color: "#B99A78", image_url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?palette1", metadata: { colors: [{ hex: "#B99A78", name: "Milk tea" }, { hex: "#5A341E", name: "Walnut" }, { hex: "#D9C8B4", name: "Ivory" }] } },
    { value: "olive-stone", label: "Olive & Stone", accent_color: "#42523F", image_url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?palette2", metadata: { colors: [{ hex: "#42523F", name: "Olive" }, { hex: "#A48D74", name: "Stone" }, { hex: "#E5DACD", name: "Sand" }] } },
    { value: "charcoal-gold", label: "Charcoal & Gold", accent_color: "#C58B3B", image_url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80", metadata: { colors: [{ hex: "#1F1B16", name: "Charcoal" }, { hex: "#C58B3B", name: "Gold" }, { hex: "#7A6A58", name: "Taupe" }] } },
  ],
  materials: [
    { value: "wood-natural", label: "Gỗ tự nhiên", image_url: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353", metadata: { variants: [{ id: "walnut", name: "Walnut", image_url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?walnut" }, { id: "oak", name: "Oak", image_url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?oak" }, { id: "teak", name: "Teak", image_url: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?teak" }] } },
    { value: "stone-quartz", label: "Đá / Quartz", image_url: "https://images.unsplash.com/photo-1503602642458-232111445657", metadata: { variants: [{ id: "calacatta", name: "Calacatta", image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?stone" }, { id: "nero", name: "Nero Marquina", image_url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?nero" }, { id: "travertine", name: "Travertine", image_url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?travertine" }] } },
    { value: "fabric-premium", label: "Vải cao cấp", image_url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?fabric", metadata: { variants: [{ id: "linen", name: "Linen", image_url: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?linen" }, { id: "boucle", name: "Bouclé", image_url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?boucle" }, { id: "velvet", name: "Velvet", image_url: "https://images.unsplash.com/photo-1503602642458-232111445657?velvet" }] } },
  ],
  uu_tien_phan_bo: [
    { value: "uu_tien_noi_that", label: "Ưu tiên nội thất" },
    { value: "uu_tien_vat_lieu", label: "Ưu tiên vật liệu" },
    { value: "can_bang", label: "Cân bằng" },
  ],
  muc_hoan_thien: [
    { value: "co_ban", label: "Cơ bản" },
    { value: "kha", label: "Khá" },
    { value: "cao_cap", label: "Cao cấp" },
  ],
  loai_cong_trinh: [
    { value: "nha-pho", label: "Nhà phố" },
    { value: "chung-cu", label: "Chung cư" },
    { value: "biet-thu", label: "Biệt thự" },
    { value: "nha-hang", label: "Nhà hàng" },
    { value: "van-phong", label: "Văn phòng" },
  ],
};

const OPTION_GROUPS = FORM_SECTIONS.flatMap((section) =>
  section.fields
    .filter((field) => field.multiSelect !== undefined)
    .map((field) => ({
      slug: field.code,
      title: field.label,
      description: field.description || "",
      multi_select: field.multiSelect ? 1 : 0,
      tableName: section.tableName,
      sectionTitle: section.title,
      inputType: field.inputType,
      order: field.order || 0,
    }))
);

const OPTION_GROUP_BY_SLUG = Object.fromEntries(OPTION_GROUPS.map((group) => [group.slug, group]));

function assertSafeTableName(tableName) {
  if (!FORM_SECTIONS.some((section) => section.tableName === tableName)) {
    throw new Error(`Unknown form section table: ${tableName}`);
  }
  return tableName;
}

function formFieldTableSchema(tableName) {
  assertSafeTableName(tableName);
  return `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ten_truong VARCHAR(160) NOT NULL,
      ma_truong VARCHAR(80) NOT NULL UNIQUE,
      kieu_nhap VARCHAR(40) NOT NULL,
      bat_buoc TINYINT(1) DEFAULT 0,
      placeholder VARCHAR(255) DEFAULT '',
      mo_ta VARCHAR(500) DEFAULT '',
      thu_tu INT DEFAULT 0,
      trang_thai VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_thu_tu (thu_tu),
      KEY idx_trang_thai (trang_thai)
    );
  `;
}

const OPTION_DETAIL_TABLE = "chi_tiet_lua_chon";

function optionDetailTableSchema() {
  return `
    CREATE TABLE IF NOT EXISTS \`${OPTION_DETAIL_TABLE}\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bang_cha VARCHAR(80) NOT NULL,
      field_id INT NOT NULL,
      nhom_lua_chon VARCHAR(160) NOT NULL,
      gia_tri VARCHAR(80) NOT NULL,
      noi_dung VARCHAR(160) NOT NULL,
      mo_ta VARCHAR(255) DEFAULT '',
      hinh_anh TEXT,
      mau_sac VARCHAR(32),
      metadata JSON,
      thu_tu INT DEFAULT 0,
      trang_thai VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_option_per_field (bang_cha, field_id, gia_tri),
      KEY idx_bang_field (bang_cha, field_id),
      KEY idx_thu_tu (thu_tu),
      KEY idx_trang_thai (trang_thai)
    );
  `;
}

module.exports = {
  FORM_SECTIONS,
  OPTION_DETAIL_TABLE,
  OPTION_GROUPS,
  OPTION_GROUP_BY_SLUG,
  OPTION_SEEDS,
  assertSafeTableName,
  formFieldTableSchema,
  optionDetailTableSchema,
};
