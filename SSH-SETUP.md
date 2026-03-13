# 🔑 SSH Key 配置指南

## ✅ SSH Key 已生成

**公钥内容**：
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILiTJrMMXPxNBm7MXRKj6pnj2OivX3PZXJ27eR/2L9L+ Thelu1996@users.noreply.github.com
```

**私钥位置**: `~/.ssh/github_ed25519`
**公钥位置**: `~/.ssh/github_ed25519.pub`

---

## 📋 配置步骤

### 步骤 1: 复制公钥

```bash
cat ~/.ssh/github_ed25519.pub
```

复制上面的输出内容（整个一行）。

### 步骤 2: 添加到 GitHub

1. 访问：https://github.com/settings/keys
2. 点击 **"New SSH key"**
3. Title: `Thelu-WSL2-New` (或任意名称)
4. Key type: **Authentication Key**
5. 粘贴公钥内容
6. 点击 **"Add SSH key"**

### 步骤 3: 测试连接

```bash
ssh -T git@github.com
```

应该显示：
```
Hi Thelu1996! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## 🚀 推送到 GitHub

配置完成后，运行：

```bash
cd /home/thelu/openclaw-launcher

# 确保使用 SSH
git remote set-url origin git@github.com:Thelu1996/openclaw-launcher.git

# 推送
git push -u origin main

# 添加标签
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin --tags
```

---

## ⚠️ 如果仍然失败

### 方法 1: 使用现有的 SSH key

你已经在 GitHub 上有一个 key `Thelu-WSL2`，检查本地是否有对应的私钥：

```bash
ls -la ~/.ssh/id_*
```

如果存在，测试连接：
```bash
ssh -T git@github.com
```

### 方法 2: 重新配置 SSH

编辑 `~/.ssh/config`：

```bash
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_ed25519
  IdentitiesOnly yes
```

然后测试：
```bash
ssh -T git@github.com
```

---

## 🎯 快速命令

```bash
# 1. 复制公钥
cat ~/.ssh/github_ed25519.pub

# 2. 添加到 GitHub 后测试
ssh -T git@github.com

# 3. 推送代码
cd /home/thelu/openclaw-launcher
git push -u origin main
```

---

**完成后告诉我，我会继续推送！** 🚀
