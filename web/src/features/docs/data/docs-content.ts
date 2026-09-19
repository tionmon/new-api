/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
export interface DocTopic {
  id: string
  titleKey: string
  titleEn: string
  badge?: string
}

export interface DocCategory {
  id: string
  titleKey: string
  titleEn: string
  topics: DocTopic[]
}

export const DOCS_CATEGORIES: DocCategory[] = [
  {
    id: 'quickstart',
    titleKey: '快速起步',
    titleEn: 'Quickstart',
    topics: [
      {
        id: 'overview',
        titleKey: '网关服务概览',
        titleEn: 'Gateway Overview',
      },
      {
        id: 'api-specs',
        titleKey: 'API 规范与端点说明',
        titleEn: 'API Specs & Endpoints',
      },
      {
        id: 'first-request',
        titleKey: '30秒发送第一条请求',
        titleEn: 'First Request in 30s',
      },
    ],
  },
  {
    id: 'codex-setup',
    titleKey: '极速安装脚本',
    titleEn: 'CLI Setup Scripts',
    topics: [
      {
        id: 'codex-script',
        titleKey: 'Codex 极速安装与配置脚本',
        titleEn: 'Codex One-Click Setup Script',
        badge: '推荐',
      },
      {
        id: 'env-presets',
        titleKey: '通用 Shell 环境变量预设',
        titleEn: 'Shell Environment Presets',
      },
    ],
  },
  {
    id: 'clients',
    titleKey: '开发工具与生态集成',
    titleEn: 'Developer Tools & SDKs',
    topics: [
      {
        id: 'claude-code',
        titleKey: 'Claude Code 终端接入',
        titleEn: 'Claude Code Integration',
      },
      {
        id: 'cursor-setup',
        titleKey: 'Cursor IDE 配置',
        titleEn: 'Cursor Configuration',
      },
      {
        id: 'aider-setup',
        titleKey: 'Aider 终端结对编程',
        titleEn: 'Aider AI Pair Programming',
      },
      {
        id: 'sdks',
        titleKey: 'OpenAI 官方 SDK 集成',
        titleEn: 'OpenAI SDKs (Python / Node)',
      },
    ],
  },
  {
    id: 'architecture',
    titleKey: '智能路由与高可用',
    titleEn: 'Routing & High Availability',
    topics: [
      {
        id: 'failover',
        titleKey: '秒级自动故障转移机制',
        titleEn: 'Smart Failover Engine',
      },
      {
        id: 'load-balance',
        titleKey: '权重轮询与多渠道分流',
        titleEn: 'Weighted Load Balancing',
      },
    ],
  },
  {
    id: 'faq',
    titleKey: '常见问题与排错',
    titleEn: 'FAQ & Troubleshooting',
    topics: [
      {
        id: 'common-errors',
        titleKey: '常见 HTTP 状态码排查',
        titleEn: 'HTTP Status Code Diagnostics',
      },
      {
        id: 'connection-test',
        titleKey: '网络连通性自测指南',
        titleEn: 'Connection Test Guide',
      },
    ],
  },
]
