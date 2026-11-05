# 批量图片交叉检查脚本

新增只读脚本：`scripts/storage_audit.py`，使用 Python 3 标准库，无需安装依赖。

## 操作

1. 在 Supabase SQL Editor 运行 `supabase/storage-image-audit-readonly.sql`，导出完整 Storage CSV。
2. 在 Supabase SQL Editor 运行下面查询，导出 Hero CSV：

```sql
SELECT section_key, image_url, content::text AS hero_config
FROM public.homepage_sections
WHERE section_key LIKE 'hero:%'
ORDER BY section_key;
```

3. 下载/克隆 PR #168 分支的完整代码，在项目根目录执行（文件路径按实际位置修改）：

```bash
python3 scripts/storage_audit.py --storage "/path/to/storage.csv" --heroes "/path/to/heroes.csv" --out "./storage-audit-output"
```

生成 `storage-audit-output/storage-crosscheck.csv` 和 `storage-audit-output/summary.md`。

## 结果含义

- `KEEP - REFERENCE FOUND`：数据库初筛、当前 Hero 配置或源码存在引用，必须保留。
- `REVIEW - BASENAME MATCH ONLY`：仅文件名在代码出现，需人工判断是否对应同一 Storage 对象。
- `REVIEW - NO REFERENCE FOUND`：本次扫描未找到引用，**不是**可删除证明。

脚本扫描当前本地仓库常见文本源码，排除依赖和构建目录；不扫描其他数据库表、广告后台、第三方页面、历史链接或运行时拼接引用。数据库导出与代码应尽量使用同一时间点快照。

**没有删除功能，不连接 Supabase，不上传图片或密钥。** 批量删除前仍需备份、复核并取得明确批准。