# Heroes 第一轮代码交叉核实（2026-10-12）

**状态：只读检查，未删除任何文件。**

## 数据来源
用户导出的 Supabase SQL 审计 CSV（402 个对象），其中 `heroes/` 目录有 24 个对象：
- 9 个被扫描的数据库表引用（保留）
- 15 个未发现数据库引用（共约 **26.27 MiB**），全部为最近 30 天上传的文件

## 本轮 GitHub 源码核实
检查了 main 分支的 13 个关键源码文件：
`app/HomePageClient.tsx`、`app/admin/page.tsx`、`app/components/ManagedHero.tsx`、`app/components/SiteChrome.tsx`、`app/about/page.tsx`、`app/page.tsx`、`app/destinations/page.tsx`、`app/tours/page.tsx`、`app/travel-guide/page.tsx`、`app/globals.css`、`app/contact/page.tsx`、`app/quote/page.tsx`、`app/reviews/page.tsx`。

在上述文件中没有发现下列 15 个候选对象的可辨识文件名/UUID/素材名的**字面硬编码引用**。这并不能排除运行时动态拼接 URL、其他源码、外部链接、缓存、历史草稿或分享链接。

## 15 个需要人工复核的 Hero 对象

| 对象路径 | 大小 MiB | 状态 |
|---|---:|---|
| `heroes/travel-guide-1790473419068-travel_banner_02.png` | 4.12 | 需人工复核 |
| `heroes/about-1790473671347-about_us_mountain_01.png` | 3.60 | 需人工复核 |
| `heroes/home-1790417246990-china_banner_background.png` | 2.95 | 需人工复核 |
| `heroes/home-image-1791779990219-Facebook--.png` | 2.81 | 需人工复核 |
| `heroes/home-mobile_image-1790590580625-ChatGPT----2026-9-28--18_05_10.png` | 2.43 | 需人工复核 |
| `heroes/destinations-1790474100794-cb1913b2-fbb3-49d8-a9b3-d9eaa083a07d.png` | 2.38 | 需人工复核 |
| `heroes/home-1790574396126-----_20260928134553_761_308.png` | 2.28 | 需人工复核 |
| `heroes/home-1790569709899-9413bfe8-d2ad-4d44-a383-7db5637a27e2.png` | 2.01 | 需人工复核 |
| `heroes/tours-1790401179752-----2-.jpg` | 0.99 | 需人工复核 |
| `heroes/tours-1790401230313---.jpeg` | 0.52 | 需人工复核 |
| `heroes/tours-1790401397424---.jpeg` | 0.52 | 需人工复核 |
| `heroes/tours-1790401441760---.jpeg` | 0.52 | 需人工复核 |
| `heroes/tours-1790401546339---.jpeg` | 0.52 | 需人工复核 |
| `heroes/home-1790401583986-logo.jpg` | 0.41 | 需人工复核（品牌资产优先保留） |
| `heroes/destinations-1790472708878-222.jpg` | 0.22 | 需人工复核 |

## 结论
本轮 **没有任何一张图片被判定为“确定可删除”**。数据库无引用 + 部分源码无硬编码引用，只能缩小范围。后续还需要：
1. 对照当前官网每个 Hero 的电脑/手机图 URL，确认当前配置；
2. 核对 Supabase 后台草稿、外部广告页面、历史分享链接；
3. 对候选对象先备份，再逐个取得负责人确认。

不得依据本报告执行自动删除。报告不包含删除 SQL 或 Storage remove 操作。
