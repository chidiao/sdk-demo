# 腾讯IM UserSig生成接口

## 配置说明

### 方式一：使用本地配置文件（推荐）

为了保护敏感信息，建议使用本地配置文件：

1. 复制 `config.local.example.js` 为 `config.local.js`
2. 在 `config.local.js` 中填写你的真实配置：

```javascript
module.exports = {
  tencentIM: {
    sdkAppID: 你的SDKAppID, // 替换为你的实际SDKAppID
    key: '你的密钥' // 替换为你的实际密钥
  }
};
```

**注意：** `config.local.js` 已被添加到 `.gitignore`，不会被提交到Git仓库。

### 方式二：直接修改默认配置

如果不使用本地配置文件，可以直接修改 `config.js` 中的默认配置：

```javascript
tencentIM: {
  sdkAppID: 1400000000, // 替换为你的实际SDKAppID
  key: 'your-key-here', // 替换为你的实际密钥
  expireTime: 86400 * 180 // 默认180天
}
```

**警告：** 直接修改 `config.js` 可能会将密钥泄露到Git仓库，不推荐使用此方式。

### 获取配置信息

1. 登录 [腾讯云IM控制台](https://console.cloud.tencent.com/im)
2. 选择你的应用
3. 在「基本配置」中获取 SDKAppID
4. 在「基本配置」->「密钥」中获取密钥

## 接口说明

### 生成UserSig

**接口地址：** `POST /api/genUserSig`

**请求参数：**
```json
{
  "userId": "用户ID",
  "expireTime": 86400  // 可选，过期时间（秒），不传则使用默认值
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "userSig": "eJxNj11Pg0...",
    "expireTime": 15552000,
    "sdkAppID": 1400000000
  }
}
```

## 使用示例

### 启动服务器
```bash
cd backend
yarn start
```

### 调用接口

**使用 curl：**
```bash
curl -X POST http://localhost:3000/api/genUserSig \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

**使用 axios：**
```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3000/api/genUserSig', {
  userId: 'user123',
  expireTime: 86400 * 7 // 7天过期
});

console.log(response.data);
```

**使用 fetch：**
```javascript
const response = await fetch('http://localhost:3000/api/genUserSig', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'user123'
  })
});

const data = await response.json();
console.log(data);
```

## 注意事项

1. **密钥安全**：请妥善保管密钥，不要泄露给他人
2. **UserSig有效期**：建议根据实际需求设置合理的过期时间
3. **用户ID限制**：用户ID长度不超过32字节，只能包含数字、字母和下划线
