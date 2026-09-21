# New API 部署与协同开发工作流指南 (Deployment & Agent Handbook)

> **文档定位**：本文档记录了本项目专有的 GitHub 仓库关系、服务器路径拓扑、Docker 容器编排细节以及标准运维操作流程（SOP）。供开发者、协作同伴以及 AI Agent（如 Antigravity / Cursor / Claude 等）在后续迭代时快速理解环境上下文。

---

## 2026-09-20 源码集成记录

- 本次来源：`QuantumNous/new-api` 官方 `main` 提交 `972aed1972820389ea0b603ca58f03f846fbf790`，包含最新发布版 `v1.0.0-rc.38` 及其后的 8 个修复提交；相对当前 fork 的官方基线新增 34 个提交。
- 保留 TokenMetro 已验收的单屏首页、深浅主题、公共导航与卡网购码钱包；底层支付模块和服务器支付配置不变。`DocsLink` 默认空值及仅启用英/中文的 fork 决策保持不变。
- 语言包按 key 三方合并，两种在用语言完整纳入官方新增文案；其余五种已停用的前端语言维持删除。
- 验证：`bun install --frozen-lockfile`、`bun run typecheck`、`bun run build`、`bun run test`（1960/1960）、`bun run test:browser`（首页与钱包 55 项）通过；根模块与 `relaykit` 的 `GOWORK=off go vet ./...` / `go build ./...`、`make test` 通过；另完成 Linux/amd64 构建。
- 数据库：真实 SQLite 3.50.4、MySQL 9.7.1、PostgreSQL 15.19 的请求策略、系统任务、迁移/唯一性和任务结算测试通过。临时数据库分别演练新建、由原 fork 升级，以及重复迁移；MySQL/PostgreSQL 同时覆盖独立日志库，保留合成用户的余额、分组、旧 OAuth 绑定、配置与消费日志。没有使用生产数据，未验证最低兼容版本或 ClickHouse。
- ~~全仓 lint 不是全绿~~ → **2026-09-21 晚已全绿**（提交 `724ae3019`：全仓 `oxlint` 180 → 0 error，`copyright:check` 的 10 个既有失败同时补齐；`format:check` / `copyright:check` / `oxlint` 三道门现在都可当门用）。⚠️ 跑 `lint:fix` 后必须接 `tsgo -b`——它的自动修复有类型不安全的（`.at(-1)` 返回可空、`Array.from` 被换成展开等），详见 `Plans/TokenMetro-线上前端源码与发布流程.md` 第十三节。
- 本记录只证明源码集成及本地验收。推送 GitHub 不等于生产容器已更新；服务器发布需单独执行备份、构建和切换。

## 1. 核心项目与环境元数据 (Environment Metadata)

### 1.1 Git 仓库架构
* **个人专属开发/生产仓库 (`origin`)**：`https://github.com/tionmon/new-api.git` (分支: `main`)
* **官方原版上游仓库 (`upstream`)**：`https://github.com/QuantumNous/new-api.git` (分支: `main`)
* **开发协同模式**：你与协作者均基于 `tionmon/new-api` 进行日常分支创建、合并与推送。

### 1.2 服务器环境与路径拓扑
* **操作系统**：Linux (x86_64 / amd64)
* **生产运行目录**：`/home/newapi` (存放生产配置 `docker-compose.yml`、日志目录 `./logs` 及挂载数据)
* **源码构建目录**：`/home/newapi-src` (存放 Git 克隆的完整源码，专门用于本地镜像构建 `docker build`)
* **服务暴露端口**：`3000` (映射宿主机 `3000:3000`)
* **服务运行模式**：Docker Compose

### 1.3 Docker 拓扑与依赖网络
* **应用容器 (`new-api`)**：
  * 使用本地镜像：`image: my-new-api:latest`
  * 容器名称：`container_name: new-api`
  * 启动命令：`command: --log-dir /app/logs`
  * 关联网络：同时加入内部桥接网 `new-api-network` 与外部网络 `sub2api-network` (名称: `sub2api_sub2api-network`)
* **数据库依赖 (`postgres`)**：
  * 镜像：`postgres:15`
  * 持久化卷：Docker Named Volume `pg_data` (独立存储，镜像重建不影响数据安全)
* **缓存依赖 (`redis`)**：
  * 镜像：`redis:latest`

---

## 2. 日常开发与部署操作规程 (Routine Workflow SOP)

```text
[ 本地修改 Web UI / 功能 ] ──► git commit & push ──► [ GitHub (tionmon/new-api) ] ──► [ 服务器拉取并重启 ]
```

### 步骤一：本地开发 (Local Dev)
在本地 Windows 环境 (`c:\Users\T\Dropbox\ag\newapiweb`) 修改代码后验证：
```powershell
cd web
npm run build   # 验证前端打包是否成功 (0 报错)
```

### 步骤二：推送到 GitHub 远程仓库 (Push to Origin)
```powershell
cd c:\Users\T\Dropbox\ag\newapiweb
git add .
git commit -m "feat: 描述本次更新的内容"
git push origin main
```

### 步骤三：服务器一键编译与无缝重启 (Server Deploy)
SSH 登录服务器，执行以下整合命令：
```bash
# 1. 在源码目录拉取最新代码并重新构建镜像 (耗时约 1~2 分钟，旧容器正常对外服务)
cd /home/newapi-src && git pull origin main && docker build -t my-new-api:latest .

# 2. 进入运行目录，使用新镜像平滑重启 new-api 服务 (Postgres 与 Redis 保持运行不受影响)
cd /home/newapi && docker compose up -d new-api

# 3. 查看实时启动日志
docker compose logs -f new-api
```

---

## 3. 未来同步官方原版更新操作 (Sync Upstream Updates)

当官方原版（`QuantumNous/new-api`）发布新功能或漏洞修复时，在本地执行以下流程合并：

```powershell
cd c:\Users\T\Dropbox\ag\newapiweb

# 1. 抓取官方上游更新
git fetch upstream

# 2. 合并官方代码到当前 main 分支
git checkout main
git merge upstream/main

# 3. 解决极少数可能出现的文件冲突 (通常前端样式与 Wiki 文档互不冲突)
# 4. 本地测试打包
cd web && npm run build && cd ..

# 5. 推送到自己的仓库并触发服务器部署
git push origin main
```

---

## 4. 关键避坑与注意事项 (Safety Guidelines for AI & Humans)

1. **严禁破坏数据卷挂载**：
   生产运行中绝对不可删除 `pg_data` 卷或在没有确认的情况下修改 `docker-compose.yml` 中的网络配置（`new-api-network` 和 `sub2api-network` 是服务通信的关键前提）。
2. **服务器源码与运行目录分离**：
   * `/home/newapi-src` 仅用于执行 `git pull` 与 `docker build`；
   * `/home/newapi` 仅用于存放 `docker-compose.yml`、证书、运行时日志与环境变量。
   * 严禁在服务器上手动直接修改前端源码，避免后续 `git pull` 发生代码冲突。
