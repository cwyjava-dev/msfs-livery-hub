# Flight Livery Hub - 本地独立部署改造计划

## 📋 改造目标

将 Flight Livery Hub 从 Manus 云依赖的版本改造为：
1. ✅ 完全独立的用户注册/登录系统
2. ✅ 本地文件存储（不依赖 S3）
3. ✅ 可自定义文件存储路径
4. ✅ 完全本地化部署
5. ✅ 移除所有 Manus 依赖

---

## 🏗️ 架构设计

### 当前架构（Manus 依赖）
```
用户 → OAuth (Manus) → 应用 → S3 存储 (Manus)
```

### 目标架构（本地独立）
```
用户 → 本地注册/登录 → 应用 → 本地文件存储
```

---

## 📝 改造清单

### Phase 1: 数据库升级
- [ ] 扩展 users 表（添加密码、邮箱验证等字段）
- [ ] 创建 sessions 表（本地会话管理）
- [ ] 创建 password_reset_tokens 表（密码重置）
- [ ] 创建 email_verification_tokens 表（邮箱验证）

### Phase 2: 后端认证系统
- [ ] 实现密码加密（bcrypt）
- [ ] 实现 JWT 令牌生成和验证
- [ ] 实现用户注册 API
- [ ] 实现用户登录 API
- [ ] 实现密码重置流程
- [ ] 实现邮箱验证流程
- [ ] 移除 Manus OAuth 依赖

### Phase 3: 前端 UI
- [ ] 创建注册页面
- [ ] 创建登录页面
- [ ] 创建密码重置页面
- [ ] 更新认证上下文
- [ ] 移除 Manus 登录按钮

### Phase 4: 文件存储
- [ ] 实现本地文件上传 API
- [ ] 配置文件存储路径
- [ ] 实现文件删除功能
- [ ] 添加文件访问控制

### Phase 5: 测试和部署
- [ ] 单元测试
- [ ] 集成测试
- [ ] Docker 配置更新
- [ ] 部署文档

---

## 🔑 关键技术选择

| 功能 | 技术 | 说明 |
|------|------|------|
| 密码加密 | bcrypt | 安全的密码哈希 |
| 会话管理 | JWT + Cookie | 无状态认证 |
| 邮件发送 | nodemailer | 本地邮件服务 |
| 文件存储 | 本地文件系统 | /uploads 目录 |
| 数据库 | MySQL | 已有 |

---

## 📊 数据库架构变更

### 扩展 users 表
```sql
ALTER TABLE users ADD COLUMN (
  password_hash VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP NULL,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 新增 sessions 表
```sql
CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### 新增 email_verification_tokens 表
```sql
CREATE TABLE email_verification_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### 新增 password_reset_tokens 表
```sql
CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔐 认证流程

### 用户注册流程
```
1. 用户输入邮箱、密码、用户名
2. 验证输入（邮箱格式、密码强度）
3. 检查邮箱是否已注册
4. 密码加密（bcrypt）
5. 创建用户记录
6. 生成邮箱验证令牌
7. 发送验证邮件
8. 返回成功消息
```

### 用户登录流程
```
1. 用户输入邮箱和密码
2. 查询用户记录
3. 验证密码（bcrypt）
4. 检查邮箱是否已验证
5. 生成 JWT 令牌
6. 设置 HttpOnly Cookie
7. 返回用户信息
```

### 密码重置流程
```
1. 用户输入邮箱
2. 查询用户记录
3. 生成重置令牌
4. 发送重置链接邮件
5. 用户点击链接
6. 验证令牌有效性
7. 用户输入新密码
8. 更新密码哈希
9. 删除重置令牌
```

---

## 📁 文件存储结构

```
/home/ubuntu/msfs-livery-hub/
├── uploads/                    # 文件存储根目录
│   ├── liveries/              # 涂装文件
│   │   ├── livery_1/
│   │   │   ├── livery.zip
│   │   │   └── screenshots/
│   │   │       ├── 1.jpg
│   │   │       ├── 2.jpg
│   │   │       └── 3.jpg
│   │   └── livery_2/
│   ├── temp/                  # 临时文件
│   └── logs/                  # 日志文件
```

---

## 🔧 配置文件示例

### .env.local（本地部署）
```env
# 数据库
DATABASE_URL=mysql://livery_user:livery_password123@localhost:3306/msfs_livery_hub

# 文件存储
UPLOAD_DIR=/home/ubuntu/msfs-livery-hub/uploads
MAX_FILE_SIZE=104857600  # 100MB

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@flightlivery.hub

# JWT 配置
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRES_IN=7d

# 应用配置
APP_URL=http://localhost:3000
APP_NAME=Flight Livery Hub
NODE_ENV=development
```

---

## 📦 依赖包

新增依赖：
```json
{
  "bcryptjs": "^2.4.3",           // 密码加密
  "jsonwebtoken": "^9.1.2",       // JWT 令牌
  "nodemailer": "^6.9.7",         // 邮件发送
  "multer": "^1.4.5-lts.1",       // 文件上传
  "uuid": "^9.0.1"                // 生成唯一 ID
}
```

---

## 🚀 实施步骤

### 第 1 周：数据库和后端
1. 升级数据库架构
2. 实现密码加密和 JWT
3. 实现用户注册/登录 API
4. 实现密码重置流程

### 第 2 周：前端和文件存储
1. 创建注册/登录 UI
2. 实现本地文件上传
3. 配置文件存储路径
4. 更新认证上下文

### 第 3 周：测试和部署
1. 单元测试
2. 集成测试
3. Docker 配置
4. 部署文档

---

## ✅ 验收标准

- [ ] 用户可以注册新账户
- [ ] 用户可以登录/登出
- [ ] 邮箱验证功能正常
- [ ] 密码重置功能正常
- [ ] 文件可以上传到本地目录
- [ ] 文件可以下载
- [ ] 文件可以删除
- [ ] 所有 API 都有单元测试
- [ ] 没有 Manus 依赖
- [ ] Docker 本地部署成功

---

## 📚 参考资源

- [bcryptjs 文档](https://github.com/dcodeIO/bcrypt.js)
- [jsonwebtoken 文档](https://github.com/auth0/node-jsonwebtoken)
- [nodemailer 文档](https://nodemailer.com)
- [multer 文档](https://github.com/expressjs/multer)

---

## 🎯 预期结果

完成改造后，用户将能够：
1. ✅ 在本地完全独立运行应用
2. ✅ 自己管理用户账户
3. ✅ 自己管理文件存储
4. ✅ 完全控制数据
5. ✅ 无需云服务依赖
