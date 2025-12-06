# Leviatan v2.0

API Backend para plataforma educativa desarrollada con NestJS, TypeORM y PostgreSQL.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Entidades (Base de Datos)](#entidades-base-de-datos)
- [Módulos y Endpoints](#módulos-y-endpoints)
- [DTOs](#dtos)

---

## 📖 Descripción

Leviatan es una plataforma educativa que permite a los usuarios gestionar materias, documentos, quizzes, flashcards y planes de estudio personalizados.

---

## 🛠 Tecnologías

| Tecnología | Versión |
|------------|---------|
| NestJS | ^11.0.1 |
| TypeORM | ^0.3.28 |
| PostgreSQL | pg ^8.16.3 |
| JWT | @nestjs/jwt ^11.0.1 |
| bcryptjs | ^3.0.3 |
| class-validator | ^0.14.3 |

---

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo (con hot-reload)
npm run start:dev

# Modo producción
npm run start:prod

# Tests
npm run test
npm run test:e2e
```

---

## 📁 Estructura del Proyecto

```
src/
├── main.ts                 # Punto de entrada
├── app.module.ts           # Módulo principal
├── database/               # Configuración de base de datos
│   ├── database.module.ts
│   └── database.service.ts
├── entities/               # Entidades TypeORM
│   ├── user.entities.ts
│   ├── subject.entities.ts
│   ├── document.entities.ts
│   ├── quiz.entities.ts
│   ├── question.entities.ts
│   ├── option.entities.ts
│   ├── quiz-attempt.entities.ts
│   ├── quiz-answer.entities.ts
│   ├── flashcard.entities.ts
│   ├── summary.entities.ts
│   ├── chat-history.entities.ts
│   └── custom-study-plan.entities.ts
└── modules/
    ├── auth/               # Autenticación
    ├── user/               # Gestión de usuarios
    └── subject/            # Gestión de materias
```

---

## 🗃 Entidades (Base de Datos)

### User (users)
Representa a los usuarios de la plataforma.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | ID autoincremental |
| `name` | string (30) | Nombre del usuario |
| `last_name` | string (30) | Apellido del usuario |
| `email` | string (50) | Email único |
| `password` | string (255) | Contraseña hasheada |

**Relaciones:**
- `subjects` → OneToMany con Subject
- `quiz_attempts` → OneToMany con QuizAttempt
- `chat_histories` → OneToMany con ChatHistory
- `study_plans` → OneToMany con CustomStudyPlan

---

### Subject (subject)
Materias o asignaturas del usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | ID autoincremental |
| `name` | string | Nombre de la materia |
| `description` | string | Descripción de la materia |
| `user_id` | FK → User | Usuario propietario |

**Relaciones:**
- `user` → ManyToOne con User
- `documents` → OneToMany con Document

---

### Document (documents)
Documentos asociados a una materia.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | ID autoincremental |
| `title` | string (100) | Título del documento |
| `content` | string | Contenido del documento |
| `file_path` | string | Ruta del archivo |
| `audio_url` | string (nullable) | URL del audio |
| `subject_id` | FK → Subject | Materia asociada |

**Relaciones:**
- `subject` → ManyToOne con Subject
- `summaries` → OneToMany con Summary
- `flashcards` → OneToMany con Flashcard
- `quizzes` → OneToMany con Quiz
- `chat_histories` → OneToMany con ChatHistory
- `study_plans` → OneToMany con CustomStudyPlan

---

## 🔌 Módulos y Endpoints

### 🔐 Auth Module (`/auth`)

Maneja la autenticación y autorización de usuarios.

#### Endpoints:

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/auth/register` | Registrar nuevo usuario | ❌ |
| `POST` | `/auth/login` | Iniciar sesión | ❌ |
| `GET` | `/auth/profile?email=` | Obtener perfil del usuario | ✅ |
| `PATCH` | `/auth/change-password?email=` | Cambiar contraseña | ✅ |

#### Funcionalidades del AuthService:

**`singUp(registerDTO)`**
- Verifica si el usuario ya existe
- Hashea la contraseña con bcryptjs (salt: 10)
- Crea el nuevo usuario

**`singIn(loginDTO)`**
- Valida credenciales
- Genera token JWT
- Retorna: `{ token, email }`

**`changePassword(email, newPassword)`**
- Valida que la nueva contraseña tenga:
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número
  - Al menos un carácter especial (!@#$%^&*(),.?":{}|<>)
- Hashea y actualiza la contraseña

---

### 📚 Subject Module (`/subject`)

Gestión de materias/asignaturas.

#### Endpoints:

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/subject/create?email=` | Crear nueva materia | ✅ |
| `GET` | `/subject/by-user?email=` | Obtener materias del usuario | ✅ |
| `GET` | `/subject/documents?id=` | Obtener documentos de una materia | ✅ |
| `PATCH` | `/subject/update?id=` | Actualizar materia | ✅ |
| `DELETE` | `/subject/delete?id=` | Eliminar materia | ✅ |

#### Funcionalidades del SubjectService:

**`createSubject(createSubjectDTO, email)`**
- Busca el usuario por email
- Crea la materia asociada al usuario
- Retorna la materia creada

**`getSubjectsByUser(email)`**
- Obtiene todas las materias de un usuario

**`getDocumentsBySubject(id)`**
- Obtiene los documentos de una materia específica
- Carga la relación `documents`

**`updateSubject(id, updateSubjectDTO)`**
- Actualiza nombre y/o descripción de la materia

**`deleteSubject(id)`**
- Elimina la materia
- Retorna mensaje de confirmación

---

### 👤 User Module

Servicio interno para gestión de usuarios (no expone endpoints directamente).

#### Funcionalidades del UserService:

| Método | Descripción |
|--------|-------------|
| `create(createUserDTO)` | Crea un nuevo usuario |
| `findByEmail(email)` | Busca usuario por email |
| `updateUser(updateUserDTO, id)` | Actualiza datos del usuario |

---

## 📝 DTOs

### RegisterDTO
```typescript
{
  name: string,        // Requerido
  last_name: string,   // Requerido
  email: string,       // Requerido, formato email
  password: string     // Requerido, 8-10 caracteres
}
```

### LoginDTO
```typescript
{
  email: string,       // Requerido, formato email
  password: string     // Requerido, 8-10 caracteres
}
```

### CreateSubjectDTO
```typescript
{
  name: string,        // Requerido
  description: string  // Requerido
}
```

### UpdateSubjectDTO
```typescript
{
  name?: string,       // Opcional
  description?: string // Opcional
}
```

---

## 🔒 Autenticación

La API utiliza **JWT (JSON Web Tokens)** para autenticación.

### Flujo:
1. Usuario se registra (`/auth/register`)
2. Usuario inicia sesión (`/auth/login`) → recibe token
3. Para rutas protegidas, enviar token en header:
   ```
   Authorization: Bearer <token>
   ```

### Guard:
El `AuthGuard` protege las rutas que requieren autenticación. Se aplica con el decorador `@UseGuards(AuthGuard)`.

---

## 📊 Diagrama de Relaciones

```
User (1) ──────────── (N) Subject
  │                        │
  │                        └── (1) ──── (N) Document
  │                                          │
  │                                          ├── (N) Summary
  │                                          ├── (N) Flashcard
  │                                          ├── (N) Quiz
  │                                          │       │
  │                                          │       └── (N) Question
  │                                          │               │
  │                                          │               └── (N) Option
  │                                          │
  │                                          ├── (N) ChatHistory
  │                                          └── (N) CustomStudyPlan
  │
  ├── (N) QuizAttempt ──── (N) QuizAnswer
  ├── (N) ChatHistory
  └── (N) CustomStudyPlan
```

---

## 📌 Notas Importantes

1. **Contraseñas**: Se hashean con bcryptjs antes de guardarse
2. **Validaciones**: Se usan class-validator para validar DTOs
3. **Relaciones**: TypeORM maneja las relaciones automáticamente con `@ManyToOne`, `@OneToMany`
4. **Cascade**: Las relaciones con `{ cascade: true }` eliminan entidades hijas automáticamente

---

## 🚧 Módulos Pendientes

- [ ] Document Module (CRUD de documentos)
- [ ] Quiz Module (gestión de quizzes)
- [ ] Flashcard Module (tarjetas de estudio)
- [ ] Summary Module (resúmenes)
- [ ] ChatHistory Module (historial de chat)
- [ ] CustomStudyPlan Module (planes de estudio)

---


