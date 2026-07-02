# 📦 User Manual – eCommerce Multi-Store SaaS

This manual provides instructions for setting up, developing, and managing the eCommerce Multi-Store SaaS platform.

## 1. Project Overview
The platform allows multiple stores to create and manage their own eCommerce landing pages. It features a shared codebase with store isolation, custom domain support, and a scalable architecture.

## 2. Prerequisites
Before you begin, ensure you have the following installed on your local machine:
- **Docker** and **Docker Compose**
- **Node.js** (v20+ recommended)
- **npm** (v10+ recommended)

## 3. Getting Started (Development Environment)

The project uses Docker to manage the database, Redis, and application services.

### 1. Clone the repository
```bash
git clone <repository-url>
cd eCommerce-multi-store-saas
```

### 2. Configure Environment Variables
Create a `.env.development` file in the `server` directory (you can use `.env.example` as a template). Ensure the database credentials match your docker-compose setup.

### 3. Spin up the infrastructure
Run the following command from the project root:
```bash
docker compose -f docker-compose.dev.yml up -d
```
This will start:
- `postgres-db-dev`: PostgreSQL database
- `redis-dev`: Redis cache
- `server-dev`: NestJS backend
- `client-dev`: Next.js frontend
- `pgadmin_ecommerce`: Database management UI (accessible at `http://localhost:5051`)
- `redis-commander-dev`: Redis management UI (accessible at `http://localhost:8088`)

## 4. Database Migrations (The "A to Z" Guide)

Database migrations are like **Version Control (Git)** for your database. While Git tracks changes in your code, migrations track changes in your database schema (tables, columns, indexes).

### Why do we use Migrations instead of `synchronize: true`?
You might see `synchronize: true` in some TypeORM tutorials. **Never use this in production.**
- **Synchronize** will try to make the database match your entities automatically. If you delete a property in your entity, it might delete the column and **all your data** along with it.
- **Migrations** are explicit. You can see exactly what SQL will run, you can test it, and you can roll it back if something goes wrong.

### ⚠️ The "Synchronize Trap" (Important!)
Some developers think: *"I will use `synchronize: true` in dev to be fast, and migrations in production."*
**This is a trap.** Here is why:
- `migration:generate` works by comparing your **Entities** to your **Database**.
- If `synchronize: true` has already updated your dev database, TypeORM will think your database and entities are **identical**.
- When you run `migration:generate`, it will create an **empty migration file**.
- You will have nothing to commit to Git, and your production database will never get the updates.

> [!CAUTION]
> **Keep `synchronize: false` in development** if you intend to use migrations for production. This ensures your dev database reflects the state of your migrations, not just your entities.

### The Migration Workflow (Step-by-Step)

Follow these steps whenever you need to change the database schema (add/remove columns, create tables, etc.):

#### Step 1: Modify your Entities
Update the relevant `.entity.ts` file in `server/src/modules/*/entities/`. 
For example, adding a new column to `review.entity.ts`:
```typescript
@Column({ name: 'new_column' })
newColumn: string;
```

#### Step 2: Generate the Migration File
This command compares your entities with the current database and generates a new script.
```bash
docker exec -it server-dev npm run migration:generate --name=DescriptionOfChange
```
> [!IMPORTANT]
> A new file will be created in `server/src/database/migrations/`. You should open and review this file to ensure it captures exactly what you intended.

#### Step 3: Run the Migration
Apply the generated changes to the actual database.
```bash
docker exec -it server-dev npm run migration:run
```

#### Step 4: Verify the Changes
Check your database (e.g., via pgAdmin at `http://localhost:5051`) or run the "Show" command to see all applied migrations:
```bash
docker exec server-dev npm run typeorm migration:show
```

### Other Migration Commands

| Action | Command |
| :--- | :--- |
| **Revert Last Migration** | `docker exec -it server-dev npm run migration:revert` |
| **Create Empty Migration** | `docker exec -it server-dev npm run migration:create --name=Description` |

### 💡 Best Practices for Developers

1.  **Commit Migrations to Git**: Always include the generated migration files in your Pull Request. They are part of the codebase.
2.  **Review the SQL**: Before running `migration:run`, open the generated file and look at the `up` and `down` methods. Make sure the SQL looks correct.
3.  **One Change = One Migration**: Don't group 10 unrelated schema changes into one giant migration. Keep them small and focused.
4.  **Never Edit an Old Migration**: If you made a mistake in a migration that has already been pushed/run, **do not edit the file**. Instead, create a *new* migration to fix the mistake. Editing old files will break the database history for other developers.
5.  **Revert if Necessary**: If a migration fails or causes issues, use `migration:revert` immediately.

### ⚠️ Common Pitfalls

-   **Duplicate Migration Names**: If two developers create a migration with the same name at the same time, TypeORM might get confused.
-   **Missing Environment Variables**: The migrations use `.env.development`. If your database connection fails, double-check your `.env` file and ensure the Docker container is healthy.
-   **Table Already Exists**: This usually happens if you try to `run` a migration that you've already manually applied via pgAdmin. Always use the migration tools to keep things in sync.

---

## 5. How to Fix Mistakes (Revert Workflow)

If you generated a migration and ran it, but then realized you made a mistake (e.g., misspelled a column), follow this **"Undo"** workflow:

### Step 1: Revert the Migration
This command will undo the **last applied** migration in your database.
```bash
docker exec -it server-dev npm run migration:revert
```
After running this, use `npm run migration:show` to check the status:
- `[X]` means **Applied** (Stay in DB - Do NOT delete)
- `[ ]` means **Pending/Reverted** (NOT in DB - Safe to delete)

### Step 2: Delete the Migration File
Look at the list from `migration:show`. You can safely delete the files that are marked with `[ ]`.
**Example:**
If `migration:show` says:
- `[X] AddTestMigration123` (KEEP THIS)
- `[ ] WrongSpelling456` (DELETE THIS)
- `[ ] BrokenFeature789` (DELETE THIS)

### Step 3: Fix your Entity
Go back to your `.entity.ts` file and correct the mistake (e.g., fix the spelling).

### Step 4: Generate & Run Again
Now that the code is fixed, follow the standard workflow:
1.  **Generate**: `docker exec -it server-dev npm run migration:generate --name=FixedSpelling`
2.  **Run**: `docker exec -it server-dev npm run migration:run`

> [!CAUTION]
> **Never delete a migration file if it is still marked as `[X]` (Applied) in `migration:show`.** Always `revert` it first!

---

## 5. Production Migration Strategy

In production, you **never** generate migrations. You only **run** the ones you generated in development.

### The Production Workflow

1.  **Generate & Test in Dev**: Always generate your migrations locally. Test them by running `migration:run` and `migration:revert` to ensure they are safe.
2.  **Commit Migrations**: Push the new files in `server/src/database/migrations/` to your repository.
3.  **Deployment (The Migration Step)**:
    When you deploy your application, you must run the migrations **before** the new version of your app starts serving traffic.

#### Option A: Manual Deployment (Via SSH)
If you manually deploy to a VPS using Docker:
1.  Connect to your server via SSH.
2.  Pull the latest code/images.
3.  Run the migration command inside the server container:
    ```bash
    docker exec -it server-prod npm run migration:run
    ```

#### Option B: CI/CD Pipeline (Recommended)
If you use GitHub Actions, GitLab CI, or Jenkins, add a "Migration" step to your pipeline:
```yaml
# Example GitHub Action Step
- name: Run Database Migrations
  run: docker exec server-prod npm run migration:run
  env:
    NODE_ENV: production
    DB_HOST: ${{ secrets.PROD_DB_HOST }}
    DB_USERNAME: ${{ secrets.PROD_DB_USER }}
    DB_PASSWORD: ${{ secrets.PROD_DB_PASSWORD }}
    DB_DATABASE: ${{ secrets.PROD_DB_NAME }}
```

### 🔐 Managing Production Environment Variables
In production, your `AppDataSource` will look for a `.env.production` file or system environment variables. 
> [!IMPORTANT]
> Ensure all `DB_*` variables are correctly set in your production environment (e.g., in your `docker-compose.prod.yml` or as Secrets in your cloud provider).

### 🚨 Critical Rules for Production
-   **Backup First**: Always backup your production database before running new migrations.
-   **Test in Staging**: Always run migrations in a staging environment (which matches production data) before touching the live database.
-   **No Auto-Generate**: Never run `migration:generate` on a production server. It might create conflicting files or use incorrect staging data.

---

## 7. Summary: Dev vs Prod Workflow

| Activity | Development Environment | Production Environment |
| :--- | :--- | :--- |
| **Change Entities?** | ✅ Yes | ❌ Never |
| **Generate Migrations?** | ✅ Yes (always) | ❌ Never |
| **Run Migrations?** | ✅ Yes | ✅ Yes (during deploy) |
| **Revert Migrations?** | ✅ Yes (to fix mistakes) | ⚠️ Only if Emergency |
| **Commit to Git?** | ✅ Yes (include migration files) | ❌ N/A |

---

## 8. Development Workflow

### Backend (NestJS)
The backend is located in the `server` directory. It uses Hot Module Replacement (HMR) to reflect changes immediately when running in Docker.
- Port: `3900`
- Logs: `docker logs -f server-dev`

### Frontend (Next.js)
The frontend is located in the `client` directory.
- Port: `3000`
- Logs: `docker logs -f client-dev`

## 6. Architecture & Design
For deep technical details on the system architecture, please refer to:
- [System Design](file:///media/gowtamkumar/ba015ba5-d67a-4dd3-a76f-71a0b397e404/projects/eCommerce-multi-store-saas/doc/system-design.md)
- [Super Admin Guidelines](file:///media/gowtamkumar/ba015ba5-d67a-4dd3-a76f-71a0b397e404/projects/eCommerce-multi-store-saas/doc/super-admin-guidelines.md)
