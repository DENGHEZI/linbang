# GitHub 上传指南

## 方法一：使用 Git 命令行（推荐）

### 步骤 1：注册 GitHub 账号

1. 访问 [https://github.com](https://github.com)
2. 点击 "Sign up" 注册账号
3. 完成邮箱验证

### 步骤 2：创建新仓库

1. 登录后点击右上角 "+" → "New repository"
2. 填写仓库名称：`linbang`（或自定义名称）
3. 选择类型：Public（公开）或 Private（私有）
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 "Create repository"

### 步骤 3：上传代码

打开终端（PowerShell 或 CMD），执行：

```bash
# 进入项目目录
cd d:\新建文件夹

# 设置远程仓库地址（替换为你的用户名和仓库名）
git remote add origin https://github.com/你的用户名/linbang.git

# 将本地 master 分支重命名为 main（可选）
git branch -M main

# 推送代码到 GitHub
git push -u origin main
```

### 步骤 4：配置 Git 认证（如果需要）

如果提示输入用户名和密码：
- 用户名：你的 GitHub 用户名
- 密码：使用 Personal Access Token（不是 GitHub 登录密码）

**获取 Token：**
1. 访问 [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token"
3. 选择 `repo` 权限
4. 生成并复制 Token

### 步骤 5：刷新 GitHub 页面

推送成功后，刷新 GitHub 仓库页面，你应该能看到所有文件。

---

## 方法二：使用 GitHub Desktop（图形界面）

1. 下载 GitHub Desktop：[https://desktop.github.com](https://desktop.github.com)
2. 安装并登录 GitHub 账号
3. 点击 "File" → "Add Local Repository"
4. 选择 `d:\新建文件夹` 目录
5. 点击 "Publish repository"
6. 填写仓库信息并发布

---

## 方法三：使用 VS Code

1. 在 VS Code 中打开项目
2. 点击左侧 "源代码管理" 图标
3. 点击 "发布" 或 "同步更改" 按钮
4. 选择 "发布到 GitHub"
5. 授权并填写仓库信息

---

## 推广建议

### 1. 完善 GitHub 仓库资料

- 添加仓库描述：校园跑腿服务小程序
- 添加关键词：uni-app, campus, errand, mini-program
- 添加 License：MIT License

### 2. 发布 Release 版本

```bash
# 打标签
git tag -a v1.0.0 -m "v1.0.0 正式版本发布"

# 推送标签
git push origin v1.0.0
```

### 3. 分享项目

- 在技术社区（CSDN、知乎、掘金）分享
- 在微信朋友圈、QQ 群分享
- 提交到 GitHub Trending
- 参与 uni-app 社区分享

### 4. 创建演示视频

- 录制小程序使用演示
- 上传到 B 站、YouTube
- 嵌入到 README.md

---

## 常见问题

### Q: 推送时提示认证失败？
A: 使用 Personal Access Token 代替密码。

### Q: 如何设置仓库为公开/私有？
A: 创建仓库时选择，或在仓库 Settings 中修改。

### Q: 如何邀请协作者？
A: 仓库 Settings → Collaborators → 添加协作者用户名。

### Q: 如何删除仓库？
A: 仓库 Settings → 最底部 Danger Zone → Delete repository。

---

## 有用的 Git 命令

```bash
# 查看远程仓库
git remote -v

# 修改远程仓库地址
git remote set-url origin https://github.com/新用户名/linbang.git

# 查看提交历史
git log --oneline

# 添加新文件并提交
git add .
git commit -m "描述你的更改"
git push

# 创建新分支
git checkout -b feature/new-feature
git push origin feature/new-feature

# 合并分支
git checkout main
git merge feature/new-feature
git push
```

---

## 联系我们

如果遇到问题，可以通过以下方式联系：
- 💬 微信：dh1118zh
- 📱 电话：19976889490
