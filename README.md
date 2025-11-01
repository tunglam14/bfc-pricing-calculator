<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Bizfly Cloud Cost Calculator

Công cụ tính toán chi phí dịch vụ Bizfly Cloud với API endpoint.

## Yêu cầu

- **Node.js** >= 18.x (khuyến nghị >= 20.x)
- **npm** hoặc **yarn**

## Development

### Chạy Development Server

1. Cài đặt dependencies:
   ```bash
   npm install
   ```

2. Chạy server development (với hot-reload):
   ```bash
   npm run dev
   ```

   Server sẽ chạy tại `http://localhost:3000`

### Test API

Chạy test với server mặc định (localhost:3000):
```bash
npm run test:api
```

Hoặc chạy trực tiếp:
```bash
node test-api.js
```

Hoặc chỉ định API URL khác:
```bash
API_URL=http://localhost:3000 node test-api.js
```

**Tính năng test:**
- Chạy tất cả test cases tự động
- So sánh kết quả với giá trị kỳ vọng (tolerance: ±100 VNĐ)
- Hiển thị chi tiết request/response
- Tóm tắt kết quả (passed/failed)
- Màu sắc rõ ràng (✅/❌)

## Production

### Build cho Production

1. **Build frontend và backend:**
   ```bash
   npm run build
   ```

   Lệnh này sẽ:
   - Build frontend (React app) vào thư mục `dist/`
   - Build backend (TypeScript) vào thư mục `dist-server/`
   - Copy các file pricing từ `public/api/pricing/` vào `dist/api/pricing/`
   - Copy các file i18n từ `i18n/` vào `dist/i18n/`

2. **Kiểm tra các file đã được build:**
   ```bash
   # Kiểm tra frontend build
   ls dist/
   
   # Kiểm tra backend build
   ls dist-server/
   
   # Kiểm tra pricing files
   ls dist/api/pricing/
   
   # Kiểm tra i18n files
   ls dist/i18n/
   ```

### Chạy Production Server

1. **Cài đặt chỉ production dependencies (optional):**
   ```bash
   npm ci --omit=dev
   ```

2. **Chạy server production:**
   ```bash
   NODE_ENV=production npm start
   ```

   Hoặc:
   ```bash
   NODE_ENV=production PORT=3000 node dist-server/server.js
   ```

   Server sẽ chạy tại `http://localhost:3000` (hoặc port được chỉ định trong biến môi trường `PORT`)

### Biến môi trường

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `NODE_ENV` | Môi trường chạy (`production` hoặc `development`) | `development` |
| `PORT` | Port cho server | `3000` |


### Kiểm tra Production

1. **Test API endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/calculate \
     -H "Content-Type: application/json" \
     -d '{"billingCycle":1,"discountPercent":0,"items":[{"id":"CloudServer","quantity":1,"options":{"chipModel":"intelGen2","billingMethod":"subscription","tier":"basic","cpuCores":4,"ramGb":8,"diskType":"ssd","diskSize":10}}]}'
   ```

2. **Test frontend:**
   Mở trình duyệt và truy cập `http://localhost:3000`

3. **Test với script:**
   ```bash
   API_URL=http://your-domain.com npm run test:api
   ```

## Troubleshooting

### Lỗi "Cannot find module" khi chạy production

Đảm bảo bạn đã build đầy đủ:
```bash
npm run build
```

### Lỗi "ENOENT: no such file or directory" khi load pricing files

Kiểm tra các file pricing đã được copy vào `dist/api/pricing/`:
```bash
ls -la dist/api/pricing/
```

### Port đã được sử dụng

Thay đổi port:
```bash
PORT=8080 NODE_ENV=production npm start
```

## API Documentation

Xem tài liệu API tại: `http://localhost:3000` (trang API Docs trong ứng dụng)

Endpoint chính:
- `POST /api/calculate` - Tính toán chi phí
- `GET /api/pricing/*` - Lấy pricing data