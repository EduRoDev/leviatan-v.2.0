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
├── modules/
│   ├── auth/               # Autenticación
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── constants/
│   │   ├── dto/
│   │   └── guard/
│   ├── user/               # Gestión de usuarios
│   │   ├── user.controller.ts
│   │   ├── user.module.ts
│   │   └── user.service.ts
│   ├── subject/            # Gestión de materias
│   │   ├── subject.controller.ts
│   │   ├── subject.module.ts
│   │   ├── subject.service.ts
│   │   └── dto/
│   ├── document/           # Gestión de documentos
│   │   ├── document.controller.ts
│   │   ├── document.module.ts
│   │   ├── document.service.ts
│   │   └── dto/
│   ├── quiz/               # Generación de quizzes
│   │   ├── quiz.controller.ts
│   │   ├── quiz.module.ts
│   │   └── quiz.service.ts
│   ├── flashcard/          # Generación de flashcards
│   │   ├── flashcard.controller.ts
│   │   ├── flashcard.module.ts
│   │   └── flashcard.service.ts
│   ├── summary/            # Generación de resúmenes
│   │   ├── summary.controller.ts
│   │   ├── summary.module.ts
│   │   └── summary.service.ts
│   ├── chat/               # Chat con documentos
│   │   ├── chat.controller.ts
│   │   ├── chat.module.ts
│   │   └── chat.service.ts
│   ├── study-plan/         # Planes de estudio personalizados
│   │   ├── study-plan.controller.ts
│   │   ├── study-plan.module.ts
│   │   ├── study-plan.service.ts
│   │   
│   └── statistics/         # Estadísticas y resultados de quizzes
│       ├── statistics.controller.ts
│       ├── statistics.module.ts
│       ├── statistics.service.ts
│       └── dto/
└── utils/
    └── open-ai/            # Integración con OpenAI
        ├── open-ai.module.ts
        └── open-ai.service.ts
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

### 📄 Document Module (`/document`)

Gestión de documentos asociados a materias. Integra con un microservicio Python para extracción de datos y RAG (Retrieval-Augmented Generation).

#### Endpoints:

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/document/create?subjectId=` | Subir y crear documento | ✅ |
| `GET` | `/document/:id` | Obtener documento por ID | ✅ |
| `DELETE` | `/document/:id` | Eliminar documento | ✅ |
| `POST` | `/document/:id/retrieve` | Recuperar contexto para RAG | ✅ |

#### Archivos Permitidos:
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- PowerPoint (`.pptx`)
- **Tamaño máximo:** 10 MB

#### Funcionalidades del DocumentService:

**`createDocument(file, createDocumentDTO, subjectId)`**
- Valida que la materia exista
- Guarda el archivo en `/public/documents/`
- Envía el documento al microservicio Python para indexación
- Extrae el contenido y lo almacena en la base de datos
- Retorna documento con información de chunks indexados

**`getDocumentById(id)`**
- Busca y retorna un documento por su ID
- Lanza `NotFoundException` si no existe

**`deleteDocument(id)`**
- Elimina el documento de ChromaDB (microservicio Python)
- Elimina el archivo físico del servidor
- Elimina el registro de la base de datos

**`retrieveContext(documentId, query, nResults)`**
- Consulta al microservicio Python para obtener contexto relevante
- Utiliza RAG para búsqueda semántica
- `nResults` por defecto: 5

---

### 📝 Summary Module (`/summary`)

Generación de resúmenes automáticos utilizando OpenAI.

#### Endpoints:

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/summary/create?document=` | Generar resumen de documento | ❌ |

#### Funcionalidades del SummaryService:

**`create(documentId)`**
- Utiliza OpenAI para generar un resumen del documento
- Almacena el resumen en la base de datos
- Retorna el resumen creado con mensaje de confirmación

**`findById(id)`**
- Busca un resumen por su ID

**`findByDocumentId(documentId)`**
- Obtiene todos los resúmenes asociados a un documento

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

### CreateDocumentDTO
```typescript
{
  title: string        // Requerido, título del documento
}
```
> **Nota:** El documento se sube como `multipart/form-data` con el campo `file` para el archivo.

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

### 🎯 Quiz Module (`/quiz`)

Generación automática de quizzes con preguntas de opción múltiple utilizando OpenAI.

#### Endpoints:

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/quiz/create?documentId=` | Generar quiz de documento | ✅ |
| `GET` | `/quiz/by-document?documentId=` | Obtener quiz por documento | ✅ |

#### Estructura del Quiz Generado:

```json
{
  "title": "Título del quiz",
  "questions": [
    {
      "question_text": "¿Pregunta de ejemplo?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct_option": "Opción correcta"
    }
  ]
}
```

#### Funcionalidades del QuizService:

**`createQuiz(documentId)`**
- Utiliza OpenAI para generar preguntas basadas en el contenido del documento
- Crea la estructura completa: Quiz → Questions → Options
- Aprovecha `cascade: true` de TypeORM para guardar todas las entidades en una sola operación
- Retorna el quiz completo con todas sus preguntas y opciones

**Proceso de guardado:**
```typescript
// Se crea toda la estructura jerárquica de una vez
const quiz = {
  title: "...",
  document: { id: documentId },
  questions: [
    {
      question_text: "...",
      correct_option: "...",
      options: [
        { option_text: "Opción A" },
        { option_text: "Opción B" },
        // ...
      ]
    }
  ]
}
// TypeORM guarda automáticamente Quiz, Questions y Options
```

**`getQuizByDocument(documentId)`**
- Obtiene el quiz asociado a un documento
- Carga todas las relaciones: questions → options
- Lanza `BadRequestException` si no existe quiz

---

### 🎴 Flashcard Module (`/flashcard`)

Generación automática de tarjetas de estudio (flashcards) con preguntas y respuestas utilizando OpenAI.

#### Endpoints:

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/flashcard/create?document=` | Generar flashcards de documento | ✅ |
| `GET` | `/flashcard/find?id=` | Obtener flashcards por documento | ✅ |

#### Estructura de Flashcard:

```json
{
  "id": 1,
  "question": "¿Qué es...?",
  "answer": "Definición o respuesta detallada"
}
```

#### Funcionalidades del FlashcardService:

**`create(documentId)`**
- Utiliza OpenAI para generar pares de pregunta-respuesta basados en el contenido del documento
- Extrae conceptos clave y sus definiciones
- Guarda múltiples flashcards asociadas al documento
- Retorna mensaje de éxito con las flashcards creadas

**Proceso de creación:**
```typescript
// OpenAI genera:
[
  { subject: "Concepto 1", definition: "Definición 1" },
  { subject: "Concepto 2", definition: "Definición 2" }
]

// Se mapean a:
[
  { question: "Concepto 1", answer: "Definición 1", document: { id } },
  { question: "Concepto 2", answer: "Definición 2", document: { id } }
]
```

**`findByDocumentId(id)`**
- Obtiene todas las flashcards asociadas a un documento específico
- Retorna array de flashcards con pregunta y respuesta

---

### 💬 Chat Module (`/chat`)

Sistema de chat inteligente que permite hacer preguntas sobre documentos utilizando OpenAI. Mantiene historial de conversaciones.

#### Endpoints:

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/chat/chat?document=&user=` | Chatear con documento | ✅ |
| `GET` | `/chat/history?user=&document=` | Obtener historial de chat | ✅ |

#### Estructura del Chat:

```json
{
  "message": "Pregunta del usuario",
  "response": "Respuesta de la IA"
}
```

#### Funcionalidades del ChatService:

**`chatWithDocument(documentId, userId, message)`**
- Envía la pregunta al servicio de OpenAI para obtener respuesta basada en el contenido del documento
- Utiliza el contenido truncado del documento (máximo 10,000 caracteres)
- Guarda el mensaje y la respuesta en la entidad `ChatHistory`
- Asocia el chat al usuario y documento específicos
- Retorna la respuesta generada por la IA
- Límite de respuesta: 300 palabras

**Características de las respuestas:**
- Basadas únicamente en el contenido del documento
- Tono profesional y educativo
- Sin formato Markdown (sin negritas ni cursivas)
- Máximo 300 palabras por respuesta

**`findChatHistory(userId, documentId)`**
- Obtiene el historial completo de conversaciones de un usuario con un documento específico
- Ordenado cronológicamente (ASC)
- Retorna array de mensajes y respuestas con timestamps

---

### 📅 Study Plan Module (`/study-plan`)

Generación automática de planes de estudio personalizados según el nivel del estudiante (básico, intermedio, avanzado).

#### Endpoints:

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/study-plan/create?document=&user=&level=` | Crear plan de estudio | ✅ |
| `GET` | `/study-plan/find?user=&document=` | Obtener planes de estudio | ✅ |

#### Niveles Válidos:
- `basico` - Plan de estudio básico
- `intermedio` - Plan de estudio intermedio
- `avanzado` - Plan de estudio avanzado

#### Estructura del Plan de Estudio:

```json
{
  "message": "Study plan created successfully"
}
```

El plan contiene:
- `objectives`: Array de objetivos de aprendizaje
- `recommended_resources`: Recursos recomendados
- `schedule`: Cronograma de estudio organizado por días/semanas

#### Funcionalidades del StudyPlanService:

**`createStudyPlan(documentId, userId, level_plan)`**
- **Validación de nivel:** Verifica que el nivel sea uno de los válidos (basico, intermedio, avanzado)
- Si el nivel es inválido, lanza `BadRequestException` antes de consumir recursos de OpenAI
- Utiliza OpenAI para generar un plan personalizado basado en el contenido del documento y el nivel
- Crea el plan con título descriptivo: `"Plan de estudio - {nivel}"`
- Guarda el plan completo en la base de datos asociado al usuario y documento
- Retorna mensaje de confirmación

**Proceso de validación:**
```typescript
// 1. Validar nivel PRIMERO (antes de llamar OpenAI)
if (!['basico', 'intermedio', 'avanzado'].includes(level_plan.toLowerCase())) {
  throw new BadRequestException('Invalid level plan');
}
// 2. Generar plan con OpenAI
// 3. Guardar en base de datos
```

**`getStudyPlans(userId, documentId)`**
- Obtiene todos los planes de estudio creados por un usuario para un documento específico
- Permite ver diferentes planes con distintos niveles
- Retorna array de planes de estudio con todo su contenido

---

### 📊 Statistics Module (`/statistics`)

Gestión de intentos de quizzes, respuestas y estadísticas de rendimiento del usuario.

#### Endpoints:

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/statistics/quiz/:quizId/submit?user=` | Enviar respuestas de quiz | ✅ |
| `GET` | `/statistics/user/statistics?user=` | Obtener estadísticas del usuario | ✅ |
| `GET` | `/statistics/user/progress-by-subject?user=` | Progreso por materia/documento | ✅ |
| `GET` | `/statistics/quiz/:quizId/statistics` | Estadísticas de un quiz específico | ✅ |

#### Body para Submit Quiz:

```json
{
  "answers": [
    {
      "question_id": 1,
      "selected_option": "Opción A"
    },
    {
      "question_id": 2,
      "selected_option": "Opción C"
    }
  ],
  "time_taken": 180
}
```

#### Respuesta del Submit:

```json
{
  "message": "Quiz submitted successfully",
  "attempt": {
    "id": 1,
    "score": 80.5,
    "correct_answers": 4,
    "total_questions": 5,
    "time_taken": 180,
    "completed_at": "2025-12-17T01:30:00.000Z"
  }
}
```

#### Funcionalidades del StatisticsService:

**`recordQuizAttempt(userId, quizId, answers, timeTaken)`**
- Valida que el quiz exista
- Obtiene todas las preguntas del quiz
- Crea un registro de intento (`QuizAttempt`)
- Procesa cada respuesta comparándola con la respuesta correcta
- Guarda todas las respuestas individuales (`QuizAnswer`) con su estado de corrección
- Calcula el score: `(correctas / totales) * 100`
- Retorna el intento completo con el score calculado

**Proceso de guardado:**
```typescript
// 1. Verificar quiz existe
// 2. Crear QuizAttempt con score inicial 0
// 3. Por cada respuesta del usuario:
//    - Comparar con correct_option de la pregunta
//    - Crear QuizAnswer con is_correct
// 4. Calcular score final
// 5. Actualizar QuizAttempt con score y respuestas correctas
```

**`getUserStatistics(userId)`**
- Obtiene todos los intentos de quiz del usuario
- Calcula estadísticas globales:
  - **total_quizzes**: Cantidad de quizzes realizados
  - **average_score**: Promedio de scores
  - **total_time**: Tiempo total invertido
  - **best_score**: Mejor puntuación obtenida
  - **worst_score**: Peor puntuación obtenida
  - **recent_attempts**: Últimos 5 intentos con detalles
- Retorna objeto con todas las métricas

**`getUserProgressBySubject(userId)`**
- Agrupa los intentos de quiz por documento y materia
- Utiliza QueryBuilder para hacer joins con `quiz` y `document`
- Calcula por cada agrupación:
  - Cantidad de intentos totales
  - Promedio de score
- Útil para ver en qué materias tiene mejor/peor desempeño el usuario

**`getQuizStatistics(quizId)`**
- Obtiene todos los intentos realizados sobre un quiz específico
- Calcula métricas del quiz:
  - **total_attempts**: Cuántas veces se ha intentado
  - **average_score**: Promedio de scores de todos los usuarios
  - **pass_rate**: Porcentaje de usuarios que obtuvieron ≥70%
  - **difficult_questions**: Lista de preguntas con >50% de tasa de error
- Identifica las preguntas más difíciles del quiz

**`identifyDifficultQuestions(quizId)`** (método privado)
- Agrupa respuestas por pregunta
- Calcula la tasa de error: `((total - correctas) / total) * 100`
- Filtra preguntas con tasa de error > 50%
- Ordena por tasa de error descendente
- Retorna lista de preguntas problemáticas con su error rate

---

## 🚧 Módulos Implementados

- [x] Auth Module (autenticación y autorización con JWT)
- [x] User Module (gestión de usuarios)
- [x] Subject Module (gestión de materias)
- [x] Document Module (CRUD de documentos + integración RAG)
- [x] Quiz Module (generación de quizzes con OpenAI)
- [x] Flashcard Module (generación de flashcards con OpenAI)
- [x] Summary Module (resúmenes con OpenAI)
- [x] Chat Module (chat inteligente con documentos)
- [x] Study Plan Module (planes de estudio personalizados)
- [x] Statistics Module (estadísticas y seguimiento de rendimiento)

---


