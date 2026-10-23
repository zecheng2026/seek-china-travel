# SCT Storage 历史图片审计（只读）

此 PR **不删除任何图片，不改动正式网站或数据库结构**。

## 操作
1. 在 Supabase SQL Editor 运行 `supabase/storage-image-audit-readonly.sql`。
2. 导出结果 CSV，查看 `object_key`、`size_mb`、`audit_status`。
3. 对 `CANDIDATE - MANUAL REVIEW ONLY` 逐一核对前台、后台、历史文章和外部页面；先备份，再请求明确删除授权。

## 扫描范围
存储桶 `website-media`；数据库表 `homepage_sections`、`destinations`、`tours`、`tour_days`、`travel_guides`、`traveler_reviews`。以完整路径字符串搜索 JSON/富文本中的引用。

## 重要限制
- 未发现数据库引用 **不等于** 文件未使用。静态代码、外部链接、未扫描表、草稿、编码过的 URL 和备份可能漏检。
- 最近 30 天文件单独标注，不能自动删除。
- Logo、游客评价截图、重要历史素材需特别保留。
- 这只是快照；真正清理前重新核查并备份。不要直接把候选清单当作删除名单。
- 如果表不存在或权限不足，SQL 可能报错；不要为了运行而修改安全权限。
- 清理闲置文件通常节省 Storage 容量，不直接解决 Cached Egress。
