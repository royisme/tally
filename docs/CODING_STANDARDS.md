# FreelanceFlow Coding Standards

本文档定义项目的编码规范和开发约定，确保代码一致性和可维护性。

---

## 1. 项目架构

### 1.1 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vue 3)                      │
│  Components → Stores → API Layer → Wails Bindings       │
└───────────────────────────┬─────────────────────────────┘
                            │ Wails Bridge
┌───────────────────────────▼─────────────────────────────┐
│                    Backend (Go)                          │
│  Services → Mappers → DTOs ↔ Entities → Database        │
└─────────────────────────────────────────────────────────┘
```

### 1.2 数据流规则

1. **单向数据流**: Frontend → API → Service → Database
2. **DTO 边界**: Services 只接收/返回 DTO，不暴露 Entity
3. **Mapper 转换**: Entity ↔ DTO 转换必须通过 Mapper 层

---

## 2. Go 编码规范

### 2.1 目录结构

```
internal/
├── db/           # 数据库初始化
├── dto/          # 数据传输对象 (Input/Output)
├── mapper/       # Entity ↔ DTO 转换
├── models/       # 数据库实体
└── services/     # 业务逻辑
```

### 2.2 DTO 命名规范

| 类型     | 命名模式         | 用途               |
| -------- | ---------------- | ------------------ |
| 创建输入 | `CreateXxxInput` | 无 ID 字段         |
| 更新输入 | `UpdateXxxInput` | 必须含 ID          |
| 输出响应 | `XxxOutput`      | API 返回的完整对象 |

**示例**:

```go
// internal/dto/client.go
package dto

type CreateClientInput struct {
    Name          string `json:"name"`
    Email         string `json:"email"`
    Website       string `json:"website"`
    ContactPerson string `json:"contactPerson"`
    Address       string `json:"address"`
    Currency      string `json:"currency"`
    Status        string `json:"status"`
    Notes         string `json:"notes"`
}

type UpdateClientInput struct {
    ID            int    `json:"id"` // 必须
    Name          string `json:"name"`
    // ...其他字段
}

type ClientOutput struct {
    ID            int    `json:"id"`
    Name          string `json:"name"`
    // ...完整字段
}
```

### 2.3 Mapper 规范

```go
// internal/mapper/client.go
package mapper

import (
    "freelance-flow/internal/dto"
    "freelance-flow/internal/models"
)

// ToClientOutput 将 Entity 转换为 Output DTO
func ToClientOutput(e models.Client) dto.ClientOutput {
    return dto.ClientOutput{
        ID:            e.ID,
        Name:          e.Name,
        Email:         e.Email,
        // ...
    }
}

// ToClientOutputList 批量转换
func ToClientOutputList(entities []models.Client) []dto.ClientOutput {
    result := make([]dto.ClientOutput, len(entities))
    for i, e := range entities {
        result[i] = ToClientOutput(e)
    }
    return result
}

// ToClientEntity 将 CreateInput 转换为 Entity
func ToClientEntity(input dto.CreateClientInput) models.Client {
    return models.Client{
        Name:  input.Name,
        Email: input.Email,
        // ...
    }
}

// ApplyClientUpdate 将 UpdateInput 应用到现有 Entity
func ApplyClientUpdate(e *models.Client, input dto.UpdateClientInput) {
    e.Name = input.Name
    e.Email = input.Email
    // ...
}
```

### 2.4 Service 规范

```go
// internal/services/client_service.go
package services

import (
    "freelance-flow/internal/dto"
    "freelance-flow/internal/mapper"
)

// List 返回所有客户
func (s *ClientService) List() []dto.ClientOutput {
    entities := s.fetchFromDB()
    return mapper.ToClientOutputList(entities)
}

// Create 创建新客户
func (s *ClientService) Create(input dto.CreateClientInput) dto.ClientOutput {
    entity := mapper.ToClientEntity(input)
    saved := s.saveToDb(entity)
    return mapper.ToClientOutput(saved)
}

// Update 更新客户
func (s *ClientService) Update(input dto.UpdateClientInput) dto.ClientOutput {
    entity := s.findById(input.ID)
    mapper.ApplyClientUpdate(&entity, input)
    saved := s.saveToDb(entity)
    return mapper.ToClientOutput(saved)
}
```

### 2.5 Go 最佳实践

- **错误处理**: 使用 `error` 返回值，不使用 panic
- **命名**: 使用 camelCase，导出使用 PascalCase
- **注释**: 导出函数必须有文档注释
- **JSON 标签**: 使用 camelCase 与前端对齐

---

## 3. TypeScript 编码规范

### 3.1 目录结构

```
frontend/src/
├── api/          # API 层 (服务抽象)
│   ├── mock/     # 开发模拟数据
│   └── wails/    # Wails 服务适配器
├── components/   # Vue 组件
├── stores/       # Pinia 状态管理
├── types/        # TypeScript 类型定义
└── views/        # 页面视图
```

### 3.2 类型定义规范

```typescript
// types/client.types.ts

// 对应 Go dto.ClientOutput
export interface Client {
  id: number;
  name: string;
  email: string;
  website?: string;
  contactPerson?: string;
  address?: string;
  currency: string;
  status: "active" | "inactive";
  notes?: string;
}

// 对应 Go dto.CreateClientInput
export interface CreateClientInput {
  name: string;
  email: string;
  website?: string;
  contactPerson?: string;
  address?: string;
  currency: string;
  status: "active" | "inactive";
  notes?: string;
}

// 对应 Go dto.UpdateClientInput
export interface UpdateClientInput extends CreateClientInput {
  id: number;
}

// Service 接口
export interface IClientService {
  list(): Promise<Client[]>;
  get(id: number): Promise<Client | undefined>;
  create(input: CreateClientInput): Promise<Client>;
  update(input: UpdateClientInput): Promise<Client>;
  delete(id: number): Promise<void>;
}
```

### 3.3 Store 规范

```typescript
// stores/clients.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "@/api";
import type { Client, CreateClientInput, UpdateClientInput } from "@/types";

export const useClientStore = defineStore("clients", () => {
  const clients = ref<Client[]>([]);
  const loading = ref(false);

  async function fetchClients() {
    loading.value = true;
    try {
      clients.value = await api.clients.list();
    } finally {
      loading.value = false;
    }
  }

  async function createClient(input: CreateClientInput) {
    loading.value = true;
    try {
      await api.clients.create(input);
      await fetchClients();
    } finally {
      loading.value = false;
    }
  }

  // ... 其他方法

  return { clients, loading, fetchClients, createClient };
});
```

### 3.4 API 层规范

```typescript
// api/index.ts
import type { IClientService, IProjectService } from "@/types";
import { mockClientService } from "./mock";
import { wailsClientService } from "./wails";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const api = {
  clients: USE_MOCK ? mockClientService : wailsClientService,
  // ...其他服务
};
```

---

## 4. 前后端类型对齐

| Go DTO                  | TypeScript Type     | 说明              |
| ----------------------- | ------------------- | ----------------- |
| `dto.CreateClientInput` | `CreateClientInput` | 创建时使用，无 id |
| `dto.UpdateClientInput` | `UpdateClientInput` | 更新时使用，含 id |
| `dto.ClientOutput`      | `Client`            | API 响应对象      |

**规则**:

- Go JSON tag 使用 camelCase: `json:"clientId"`
- TypeScript 字段名与 Go JSON tag 完全一致
- 可选字段在两端都标记为可选

---

## 5. Wails 开发规范

### 5.1 绑定生成

```bash
# 生成 TypeScript 绑定
wails generate bindings
```

### 5.2 Service 绑定

所有 Service 必须在 `main.go` 的 `Bind` 中注册:

```go
wails.Run(&options.App{
    Bind: []interface{}{
        clientService,
        projectService,
        // ...
    },
})
```

### 5.3 适配器模式

```typescript
// api/wails/client.service.ts
import * as ClientService from "@/wailsjs/go/services/ClientService";
import type { IClientService, Client, CreateClientInput } from "@/types";

export const wailsClientService: IClientService = {
  async list(): Promise<Client[]> {
    return ClientService.List();
  },
  async create(input: CreateClientInput): Promise<Client> {
    return ClientService.Create(input);
  },
  // ...
};
```

---

## 6. 开发工作流

1. **后端优先**: 先定义 DTO → Mapper → Service
2. **生成绑定**: `wails generate bindings`
3. **前端对齐**: 更新 TypeScript types
4. **适配器**: 创建/更新 Wails service adapter
5. **Store**: 更新 Store 使用新 API
6. **测试**: `wails dev` 手动验证

---

## 7. 版本控制

- 提交信息格式: `<type>(<scope>): <description>`
- 类型: `feat`, `fix`, `refactor`, `docs`, `test`
- 示例: `feat(client): add DTO and mapper layer`
