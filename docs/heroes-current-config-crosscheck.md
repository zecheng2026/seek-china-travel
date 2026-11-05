# SCT Heroes 当前配置交叉核实（2026-10-12）

**数据：** 用户导出的 `storage-image-audit-readonly.sql` 结果（402 条）及 `homepage_sections` 当前 Hero 配置 CSV（8 行）。只读分析；未删除任何文件。

## 当前配置中引用的 9 个对象（必须保留）
- `heroes/about-1790474118216-c62b7c58-b5a2-41d0-b99b-cf3c188ffa23.png`
- `heroes/contact-image-1790647287988-china_banner_background.png`
- `heroes/destinations-image-1791780873331-7qtunk.webp`
- `heroes/9413bfe8-d2ad-4d44-a383-7db5637a27e2.webp`（首页电脑）
- `heroes/home-mobile_image-1791780764878-0ptqw0.webp`（首页手机）
- `heroes/quote-image-1790647334841-logo.jpg`
- `heroes/reviews-image-1791775327563-about_us_mountain_01.png`
- `heroes/tours-1790472516548-122.jpg`
- `heroes/travel-guide-1790473692143-444.jpg`

## 未被当前 Hero 配置引用
第一轮报告列出的 15 个对象，共约 26.27 MiB，在本次导出的 8 个 Hero 配置中均未出现。仍标记为 **待人工复核**，不是确定可删除。

## 风险与后续
- 导出是某个时间点的快照，后续可能有新上传或修改。
- 仍需排查静态代码、外部广告落地页、历史分享链接及其他服务的直接 Storage URL。
- 删除前应备份文件，并由负责人逐项确认；此 PR 无删除逻辑。
