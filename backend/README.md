# 🌱 Seed Data Management Commands

This project ships a set of Django **management commands** for populating a development database with realistic sample data — users, departments, workshops, machines, inventory, production lines, manufacturing processes, products, schedules, projects, and skills.

These replace the older standalone `backend/scripts/script1.py` … `script11.py` files. They now run through Django's own command framework (`manage.py <command>`), so there's no manual `django.setup()` bootstrapping required — Django is already configured by the time each command runs.

---

## 📍 Location

```sh
backend/main/management/commands/
├── seed_01_users.py
├── seed_02_departments.py
├── seed_03_workshops.py
├── seed_04_machines.py
├── seed_05_suppliers.py
├── seed_06_production_lines.py
├── seed_07_processes.py
├── seed_08_products.py
├── seed_09_schedules.py
├── seed_10_projects.py
└── seed_11_skills.py
```

Shared sample data (skill names, department lists, machine catalogs, etc.) lives in:

```sh
backend/main/info.py
```

---

## ▶️ Running the Commands

Run from the `backend/` directory, **in numeric order** — each command depends on data created by the ones before it (e.g. you can't assign workshops to departments that don't exist yet).

```sh
uv run manage.py seed_01_users
uv run manage.py seed_02_departments
uv run manage.py seed_03_workshops
uv run manage.py seed_04_machines
uv run manage.py seed_05_suppliers
uv run manage.py seed_06_production_lines
uv run manage.py seed_07_processes
uv run manage.py seed_08_products
uv run manage.py seed_09_schedules
uv run manage.py seed_10_projects
uv run manage.py seed_11_skills
```

> 💡 The numeric prefix (`seed_01_`, `seed_02_`, …) preserves the original run order from the legacy scripts and keeps the commands sorted correctly in `manage.py help`.

To see all available commands and confirm these are discovered correctly:

```sh
uv run manage.py help
```

To see the help text for any individual command:

```sh
uv run manage.py seed_10_projects --help
```

---

## 📋 What Each Command Does

| Command | Creates | Depends On |
|---|---|---|
| `seed_01_users` | 90 random users + assigns supervisor/manager/technician/purchasing roles | — |
| `seed_02_departments` | Departments, assigns supervisors and operators | `seed_01_users` |
| `seed_03_workshops` | Workshops per department, assigns managers | `seed_02_departments` |
| `seed_04_machines` | Machines per workshop | `seed_03_workshops` |
| `seed_05_suppliers` | Suppliers and inventory materials | — |
| `seed_06_production_lines` | Production lines, attaches machines | `seed_03_workshops`, `seed_04_machines` |
| `seed_07_processes` | Manufacturing processes | — |
| `seed_08_products` | Products, assigns manufacturing process sequences | `seed_07_processes` |
| `seed_09_schedules` | Production schedules across the next 30 days | `seed_06_production_lines`, `seed_08_products`, `seed_01_users` |
| `seed_10_projects` | Sample projects with tasks | `seed_01_users` |
| `seed_11_skills` | Skill matrix entries for all non-admin users | `seed_01_users` |

---

## ⚙️ Options

`seed_10_projects` accepts an optional `--limit` flag to create a subset of the sample projects instead of all of them — useful for quick local testing:

```sh
uv run manage.py seed_10_projects --limit 3
```

---

## 🔁 Re-running Commands

Most commands are written to be **idempotent** where it matters — they check for existing records (by username, email, or name) before creating duplicates, and will print a `⚠️` warning and skip if a record already exists rather than erroring out.

`seed_11_skills` is the exception: re-running it **clears and replaces** each user's existing skill matrix entries every time, so running it twice is safe but will regenerate (not accumulate) skill assignments.

To fully reset and reseed your local database:

```sh
uv run manage.py flush          # clears all data — irreversible, dev only
uv run manage.py migrate
uv run manage.py createsuperuser
uv run manage.py seed_01_users
uv run manage.py seed_02_departments
# ...continue through seed_11_skills
```

---

## ⚠️ Notes

- These commands generate **fake data via [Faker](https://faker.readthedocs.io/)** and are intended for local development and testing only. Do not run them against a production database.
- `faker` must be installed — it's currently listed as a dev dependency in `pyproject.toml`, so make sure your environment was synced with dev dependencies included:
  ```sh
  uv sync
  ```
- Each command's `handle()` method runs inside Django's standard command lifecycle, so standard `manage.py` flags like `--verbosity` and `--traceback` work as expected.
