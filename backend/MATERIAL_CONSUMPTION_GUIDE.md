# Material Consumption Tracking Feature

## Overview
This feature allows you to track material consumption for both **Project Tasks** and **Production Lines/Schedules**. When materials are consumed, the system automatically deducts the quantity from inventory.

## Features

### 1. Task Material Consumption
Track materials used in project tasks with automatic inventory updates.

**Model**: `TaskMaterialConsumption`

**Fields**:
- `task` - The task consuming the material
- `material` - The material being consumed
- `quantity` - Amount consumed
- `consumed_at` - Timestamp when consumption was recorded
- `consumed_by` - User who logged the consumption
- `notes` - Optional notes about the consumption

### 2. Production Material Consumption
Track materials used in production schedules with automatic inventory updates.

**Model**: `ProductionMaterialConsumption`

**Fields**:
- `production_schedule` - The production schedule consuming the material
- `material` - The material being consumed
- `quantity` - Amount consumed
- `consumed_at` - Timestamp when consumption was recorded
- `consumed_by` - User who logged the consumption
- `notes` - Optional notes about the consumption

## API Endpoints

### Task Material Consumption

**Base URL**: `/api/project/task-material-consumption/`

- `GET /api/project/task-material-consumption/` - List all consumptions (filtered by user role)
- `POST /api/project/task-material-consumption/` - Record new material consumption
- `GET /api/project/task-material-consumption/{id}/` - Get consumption details
- `PUT /api/project/task-material-consumption/{id}/` - Update consumption record
- `DELETE /api/project/task-material-consumption/{id}/` - Delete consumption (returns material to inventory)

**Example POST Request**:
```json
{
  "task": 1,
  "material": 5,
  "quantity": 10.5,
  "notes": "Used for welding phase"
}
```

### Production Material Consumption

**Base URL**: `/api/production/production-material-consumption/`

- `GET /api/production/production-material-consumption/` - List all consumptions (filtered by user role)
- `POST /api/production/production-material-consumption/` - Record new material consumption
- `GET /api/production/production-material-consumption/{id}/` - Get consumption details
- `PUT /api/production/production-material-consumption/{id}/` - Update consumption record
- `DELETE /api/production/production-material-consumption/{id}/` - Delete consumption (returns material to inventory)

**Example POST Request**:
```json
{
  "production_schedule": 3,
  "material": 8,
  "quantity": 25.0,
  "notes": "Raw material for batch production"
}
```

## Permission Model

### Task Material Consumption
- **ADMIN**: Full CRUD access to all records
- **SUPERVISOR**: Full CRUD for their department's project tasks
- **MANAGER**: Full CRUD for tasks in their managed projects
- **OPERATOR**: Read and Create for tasks assigned to them

### Production Material Consumption
- **ADMIN**: Full CRUD access to all records
- **SUPERVISOR**: Full CRUD for their department's production
- **MANAGER**: Full CRUD for their workshops
- **OPERATOR**: Read and Create for their department's production

## Automatic Inventory Management

### When Creating a Consumption Record:
1. System validates that sufficient stock is available
2. If validation passes, material quantity is deducted from inventory
3. Consumption record is created with timestamp and user who logged it

### When Updating a Consumption Record:
1. System calculates the difference between old and new quantity
2. Inventory is adjusted accordingly (increase or decrease)

### When Deleting a Consumption Record:
1. System returns the consumed quantity back to inventory
2. Consumption record is permanently deleted

## Validation Rules

1. **Quantity must be positive** - Cannot record zero or negative consumption
2. **Sufficient stock required** - Cannot consume more than available inventory
3. **User tracking** - System automatically records who logged the consumption

## Django Admin Interface

Both consumption models are registered in Django Admin with:
- List view with filtering by date and material
- Search functionality
- Date hierarchy for easy navigation
- Raw ID fields for foreign key relationships

Access via: `/admin/`

## Usage Examples

### Example 1: Recording Material Consumption for a Task
```python
# In a Django shell or script
from project.models import TaskMaterialConsumption, Task
from inventory.models import Material

task = Task.objects.get(id=1)
material = Material.objects.get(name="Steel Plates")

consumption = TaskMaterialConsumption.objects.create(
    task=task,
    material=material,
    quantity=15.5,
    consumed_by=request.user,  # From API request
    notes="Used for frame construction"
)
# Material inventory is automatically reduced by 15.5 units
```

### Example 2: Recording Material Consumption for Production
```python
from production.models import ProductionMaterialConsumption, ProductionSchedule
from inventory.models import Material

schedule = ProductionSchedule.objects.get(id=3)
material = Material.objects.get(name="Aluminum Sheet")

consumption = ProductionMaterialConsumption.objects.create(
    production_schedule=schedule,
    material=material,
    quantity=50.0,
    consumed_by=request.user,
    notes="Initial batch material"
)
# Material inventory is automatically reduced by 50.0 units
```

## Error Handling

### Insufficient Stock Error
```json
{
  "detail": "Insufficient stock. Available: 10.5 kg"
}
```

### Invalid Quantity Error
```json
{
  "detail": "Quantity must be greater than zero."
}
```

## Database Schema

### TaskMaterialConsumption Table
- Primary key: `id`
- Foreign keys: `task_id`, `material_id`, `consumed_by_id`
- Indexes: `(task, material)`, `consumed_at`
- Constraints: `quantity > 0`

### ProductionMaterialConsumption Table
- Primary key: `id`
- Foreign keys: `production_schedule_id`, `material_id`, `consumed_by_id`
- Indexes: `(production_schedule, material)`, `consumed_at`
- Constraints: `quantity > 0`

## Migration Files
- `project/migrations/0002_taskmaterialconsumption.py`
- `production/migrations/0003_productionmaterialconsumption.py`

## Notes
- All timestamp fields are automatically managed by Django
- Material inventory updates are wrapped in database transactions for data integrity
- The `consumed_by` field is automatically set to the current user when creating via API
