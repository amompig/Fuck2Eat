# 等等吃啥 - 完整設計稿件、UI 架構與原始碼文件

## 1. 產品設計概觀 (Design Overview)

- **產品名稱**：等等吃啥（桃園美食決策收斂器）
- **核心定位**：採用硬條件（預算、營業時間、行政區、分類）先濾掉不可能的店家，再以「日式經典萬代風格扭蛋機」進行一鍵決策。
- **UI 模式**：100% 一頁式純淨版面（Mobile & Desktop 全適配、零滾動條）。

---

## 2. 視覺規範與色彩設計 (Color Palette & Tokens)

| 元素 | 色碼 (Light Mode) | 色碼 (Dark Mode) | 說明 |
| :--- | :--- | :--- | :--- |
| **頁面背景** | `#f8fafc` (Slate 50) | `#0f172a` (Slate 900) | 舒適淡雅底色 |
| **卡片底色** | `#ffffff` | `#1e293b` (Slate 800) | 機身與對話框卡片底色 |
| **品牌主色** | `#dc2626` (Bandai Red) | `#ef4444` | 經典日系扭蛋紅 |
| **金屬/邊框** | `#cbd5e1` (Slate 300) | `#334155` (Slate 700) | 機身厚實邊緣質感 |
| **投幣/旋鈕環** | `#1e40af` (Blue 800) | `#3b82f6` (Blue 500) | 經典藍色導向環與標籤 |
| **指示標籤** | `#fef3c7` / `#f59e0b` | `#78350f` | 日式警告貼紙標準配色 |

---

## 3. 機台核心 UI 結構 (Gashapon 2D Showcase)

1. **頂部標籤區**：
   - 品牌 LOGO：紅白方塊萬代經典識別標記。
2. **上層透明艙 (Showcase Chamber)**：
   - 背景色階：`#f9ece1` 至 `#f2dac5` 暖木色襯底。
   - 雙色實體扭蛋：紅白、藍白、黃白等多色膠囊，具高光與排氣通風孔。
   - 白色垂直導引肋盤：位於扭蛋前方，遮覆球體下緣，呈現深淺立體層次。
3. **中央控制面板 (Control Faceplate)**：
   - 投幣孔與橢圓 `コイン COIN IN ▶` 貼紙。
   - 金屬反光質感投幣金屬孔。
   - 迴轉轉鈕：雙向扇葉握把，點擊旋轉 720 度流暢旋鈕。
4. **出貨口 (Dispense Bay)**：
   - 深黑凹槽暗室，搭配自然落體動畫。
   - 右側日式安全警語（▲ 注意 ちゅうい）與退幣口。

---

## 4. 專案目錄結構 (Project Structure)

```text
├── index.html                   # HTML 入口，包含 SEO 與 OGP Meta 資訊
├── package.json                 # 專案依賴 (React 19, Tailwind v4, Vite 8, Lucide)
├── tsconfig.json                # TypeScript 配置
├── vite.config.ts               # Vite 構建配置
├── public/                      # 靜態資源 (含 taoyuan-food-project.zip)
└── src/
    ├── main.tsx                 # React App 掛載入口
    ├── index.css                # Tailwind CSS v4 主樣式與 CSS 變數
    ├── types.ts                 # 完整 TypeScript 型別定義
    ├── App.tsx                  # 核心頁面、狀態同步、模態視窗調度
    ├── components/
    │   ├── Header.tsx           # 頂部置中標題、主題切換與匯出按鈕
    │   ├── Gashapon2D.tsx       # 經典日系 2D 扭蛋機核心元件
    │   ├── TimeWidget.tsx       # 時間判定模組（支援當前/午餐/宵夜切換）
    │   ├── LeftIconNav.tsx      # 左側直立圖示功能列與滑出式選單
    │   ├── WinnerModal.tsx      # 中獎店家彈窗（卡片、Google Maps 連結）
    │   ├── RestaurantListModal.tsx # 篩選後店家名單列表
    │   ├── TaoyuanSvgMap.tsx    # 桃園十三行政區向量互動地圖
    │   └── VerificationDrawer.tsx # 驗證與統計抽屜
    ├── data/
    │   └── seed.json            # 82 間真實桃園在地美食資料集
    └── utils/
        ├── filterEngine.ts      # 營業時間精準計算、行政區、價位過濾器
        ├── random.ts            # Web Crypto API 密碼級真隨機抽樣
        └── urlState.ts          # URL Query 雙向同步儲存狀態
```

---

## 5. 本地執行與一鍵部署 (How to Run & Deploy)

### 本地開發 (Local Development)
```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發伺服器 (Port 3000)
npm run dev

# 3. 建置靜態發布包
npm run build
```

### 免費部署至 Vercel / Cloudflare Pages
- 本專案產物為純靜態檔案（`dist/`），直接連結 GitHub 倉庫後，指定構建指令為 `npm run build`，發布目錄設為 `dist`，即可永久免費運行！
