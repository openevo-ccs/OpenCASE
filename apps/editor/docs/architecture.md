# Architecture & Project Instructions (DDD + Clean Architecture)

## What this project is

This repository is an **open-source editor for 1EdTech CASE frameworks**. It supports creating and editing a framework (CFDocument), its items (CFItem), and associations (CFAssociation), using a **draft → publish** lifecycle. It intentionally focuses on core authoring capabilities and is not intended to compete with commercial CASE products.

The UI is a **canvas-first framework editor** using **React Flow**. The CASE model is treated as a **graph** (items + associations); the “tree” is a particular visualization of that graph.

## Tech stack

* React + TypeScript (Vite)
* Tailwind CSS v4
* shadcn/ui components
* React Flow (`@xyflow/react`)

---

## Architectural goals (non-negotiables)

1. **Domain model is the source of truth**
   The domain representation of a framework (items + associations) is authoritative.

2. **React Flow is a projection of the domain graph**
   React Flow nodes/edges are derived from the domain model. They are not the canonical data model.

3. **All user interactions become application commands**
   UI events (edit node, add child, connect nodes, delete edge) must translate to commands handled by the application layer.

4. **Clean architecture dependency direction**

* `domain` has no dependencies on React, React Flow, APIs, or storage
* `application` depends on `domain`
* `infrastructure` implements interfaces defined by `application`
* `ui` depends on `application` (and uses `infrastructure` through composition)

---

## Folder structure

This structure is intended to keep the mapping between domain graph and React Flow graph explicit and testable.

```
src
├── app
│   ├── App.tsx
│   ├── main.tsx
│   ├── providers
│   └── routes

├── domain
│   ├── framework
│   │   ├── model
│   │   │   ├── Framework.ts
│   │   │   ├── Item.ts
│   │   │   ├── Association.ts
│   │   │   └── types.ts
│   │   ├── services
│   │   │   ├── FrameworkValidator.ts
│   │   │   └── DraftPolicy.ts
│   │   └── index.ts
│   └── shared
│       ├── Result.ts
│       ├── errors.ts
│       └── types.ts

├── application
│   ├── framework
│   │   ├── commands
│   │   │   ├── AddItem.ts
│   │   │   ├── UpdateItem.ts
│   │   │   ├── RemoveItem.ts
│   │   │   ├── AddAssociation.ts
│   │   │   ├── RemoveAssociation.ts
│   │   │   └── PublishFramework.ts
│   │   ├── ports
│   │   │   ├── FrameworkRepository.ts
│   │   │   └── IdGenerator.ts
│   │   ├── mappers
│   │   │   ├── CaseDtoMapper.ts
│   │   │   └── CaseTypes.ts
│   │   └── index.ts
│   └── shared
│       └── CommandBus.ts

├── infrastructure
│   ├── caseApi
│   │   ├── CaseApiClient.ts
│   │   ├── CaseFrameworkRepository.ts
│   │   └── http.ts
│   ├── persistence
│   │   └── DraftLocalCache.ts
│   └── index.ts

├── ui
│   ├── editor
│   │   ├── EditorPage.tsx
│   │   ├── components
│   │   │   ├── Canvas.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── NodePropertiesPanel.tsx
│   │   │   ├── PublishDialog.tsx
│   │   │   └── ConfirmLeaveFrameworkDialog.tsx
│   │   ├── reactflow
│   │   │   ├── nodeTypes
│   │   │   │   ├── CaseItemNode.tsx
│   │   │   │   └── index.ts
│   │   │   ├── edgeTypes
│   │   │   │   ├── CaseAssociationEdge.tsx
│   │   │   │   └── index.ts
│   │   │   ├── mapping
│   │   │   │   ├── toReactFlow.ts
│   │   │   │   ├── fromReactFlow.ts
│   │   │   │   ├── layout
│   │   │   │   │   ├── dagreLayout.ts
│   │   │   │   │   └── elkLayout.ts
│   │   │   │   └── types.ts
│   │   │   └── interactions
│   │   │       ├── onNodesChange.ts
│   │   │       ├── onEdgesChange.ts
│   │   │       └── onConnect.ts
│   │   ├── state
│   │   │   ├── FrameworkEditorContext.tsx
│   │   │   ├── reducer.ts
│   │   │   └── selectors.ts
│   │   └── terminology
│   │       ├── lens.ts
│   │       └── strings.ts
│   └── shared
│       ├── components
│       │   └── ui
│       ├── hooks
│       └── utils

├── styles
│   └── index.css

└── lib
    └── utils.ts
```

### Moving existing files (current repo)

* `src/App.tsx` → `src/app/App.tsx`
* `src/main.tsx` → `src/app/main.tsx`
* `src/NodePropertiesPanel.tsx` → `src/ui/editor/components/NodePropertiesPanel.tsx`
* `src/TextUpdaterNode.tsx` → `src/ui/editor/reactflow/nodeTypes/CaseItemNode.tsx` (rename)
* `src/components/ui/*` → `src/ui/shared/components/ui/*` (shadcn)
* `src/index.css` → `src/styles/index.css` (optional)
* `src/lib/utils.ts` stays

---

## Domain model rules (how we represent CASE in code)

Treat CASE as a **graph**:

* `Item` = node (`CFItem`)
* `Association` = edge (`CFAssociation`)
* `Framework` = aggregate root owning items + associations (`CFDocument` + supporting structures)

**Important:** The domain model does not depend on React Flow types or UI concerns.

---

## Mapping rules: Domain graph ↔ React Flow graph (critical)

The mapping code is intentionally centralized in:

* `src/ui/editor/reactflow/mapping/toReactFlow.ts`
* `src/ui/editor/reactflow/mapping/fromReactFlow.ts`

### Rule 1: Domain → React Flow is derived

React Flow nodes/edges should be built from the domain `Framework`:

* `Item → ReactFlowNode`
* `Association → ReactFlowEdge`

### Rule 2: UI changes must become commands

React Flow events should not mutate “React Flow state as truth”.

Instead:

* User drags/edits/connects
* UI converts that action into an **application command**
* Application layer updates the domain model
* UI re-renders by re-projecting domain → React Flow

### Rule 3: Layout is separate from domain data

Layout (x,y positions) is a UI concern.

* Store layout in UI state or a separate persistence layer
* Do not mix layout into domain entities unless explicitly decided and documented

---

## Application layer rules

Commands define the user-intent operations. Examples:

* `AddItem`
* `UpdateItem`
* `RemoveItem`
* `AddAssociation`
* `RemoveAssociation`
* `PublishFramework`

Command handlers:

* validate inputs
* enforce domain invariants (e.g., no illegal association types)
* update the domain model
* call repository ports as needed

---

## Infrastructure rules

Infrastructure implements interfaces defined in `application/ports`:

* `FrameworkRepository` (load/save/publish)
* `IdGenerator` (GUID/URI generator)

Infrastructure may include:

* HTTP client for your CASE API
* local draft cache (optional)
* serialization/deserialization between domain and CASE JSON DTOs

---

## UI rules (React + shadcn + Tailwind)

### UI responsibilities

* Render the canvas editor (React Flow)
* Provide panels/dialogs for editing properties
* Translate UI events → commands
* Display draft status and explicit publishing flow
* Apply terminology “lens” (K-12 / HE / Workforce)

### Terminology lens

Terminology mapping must be in `ui/editor/terminology/*` and should not leak into domain.
Example: show “Standard” vs “Skill” label depending on lens, but store a consistent domain item type.

---

## Draft vs Publish behavior (required)

* All edits occur in a **draft state**
* Switching frameworks discards the draft (with a warning)
* Publishing is an explicit action:

  * show a summary of changes
  * optionally capture release notes
  * call `PublishFramework` command

---

## Conventions for contributors

* If you need a new concept:

  * Add it in `domain` if it’s business meaning
  * Add it in `application` if it’s a use-case/command
  * Add it in `ui` if it’s presentation
  * Add it in `infrastructure` only to integrate external systems
* If you are changing how nodes/edges render:

  * Prefer changing node/edge components in `ui/editor/reactflow/*`
  * Keep mapping logic centralized in `mapping/*`

---

## Why the mapping is emphasized

CASE frameworks are inherently items + associations (a graph). Even if the current UX displays a tree, future features (crosswalks, alignment links, references) will require edges that aren’t purely hierarchical. Designing the mapping cleanly now prevents a re-architecture later.

