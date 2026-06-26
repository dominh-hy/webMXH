import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')

const headers = [
  'tieu_de',
  'noi_dung',
  'nen_tang',
  'danh_muc',
  'tags',
  'trang_thai',
  'slug',
  'tom_tat',
  'anh_bia',
]

const sampleRows = [
  {
    tieu_de: '5 cách tăng reach Facebook không cần chạy ads',
    noi_dung: `# 5 cách tăng reach Facebook

## 1. Đăng đúng khung giờ vàng
Theo dõi Insights để biết khi nào fan online nhiều nhất.

## 2. Dùng video ngắn dưới 60 giây
Video giữ chân người xem lâu hơn giúp thuật toán ưu tiên bài viết.

## 3. Kêu gọi tương tác tự nhiên
Đặt câu hỏi cuối bài để khuyến khích bình luận.`,
    nen_tang: 'facebook',
    danh_muc: '',
    tags: 'facebook,reach,tuong-tac',
    trang_thai: 'draft',
    slug: '',
    tom_tat: '',
    anh_bia: '',
  },
  {
    tieu_de: 'Cách lên xu hướng TikTok với video 15 giây',
    noi_dung: `# Cách lên xu hướng TikTok

- Mở video bằng câu hook mạnh trong 2 giây đầu
- Dùng nhạc trending phù hợp chủ đề
- Thêm phụ đề lớn, dễ đọc trên điện thoại
- Reply comment nhanh trong 30 phút đầu`,
    nen_tang: 'tiktok',
    danh_muc: '',
    tags: 'tiktok,xu-huong,viral',
    trang_thai: 'draft',
    slug: 'cach-len-xu-huong-tiktok-video-15-giay',
    tom_tat: 'Checklist ngắn giúp video TikTok dễ được đẩy lên For You.',
    anh_bia: '',
  },
]

const worksheet = XLSX.utils.json_to_sheet(sampleRows, { header: headers })
worksheet['!cols'] = [
  { wch: 42 },
  { wch: 60 },
  { wch: 14 },
  { wch: 18 },
  { wch: 24 },
  { wch: 12 },
  { wch: 28 },
  { wch: 32 },
  { wch: 24 },
]

const workbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(workbook, worksheet, 'BaiViet')

const outputDir = path.join(rootDir, 'public', 'templates')
fs.mkdirSync(outputDir, { recursive: true })
const outputPath = path.join(outputDir, 'bai-viet-import-mau.xlsx')
XLSX.writeFile(workbook, outputPath)
console.log('Created', outputPath)
