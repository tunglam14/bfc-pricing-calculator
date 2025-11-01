<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ReN1g15x2Wes6Qv8H-9etZJR7Ae9IsaL

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Test

# Chạy test với server mặc định (localhost:3000)
npm run test:api

# Hoặc chạy trực tiếp
node test-api.js

# Hoặc chỉ định API URL khác
API_URL=http://localhost:3000 node test-api.js

Tính năng:

- Chạy tất cả test cases tự động
- So sánh kết quả với giá trị kỳ vọng (tolerance: ±100 VNĐ)
- Hiển thị chi tiết request/response
- Tóm tắt kết quả (passed/failed)
- Màu sắc rõ ràng (✅/❌)