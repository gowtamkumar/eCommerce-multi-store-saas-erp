# Team Management & HRM Architecture

**Author:** Senior Engineering Team
**Context:** Multi-tenant, multi-branch ERP SaaS.
**Objective:** Define the relationship between system authentication (Users) and operational payroll (Employees), and detail how physical branch access is granted and strictly enforced.

---

## 1. The Core Separation: Users vs. Employees

In a mature ERP system, there is a strict separation between a person's **System Access Profile** and their **HR Profile**.

### 💻 System Access Profile (`UserEntity`)
This entity lives in the **Team Management** module. It handles digital authentication and application authorization.
*   **Key Fields:** `username`, `password`, `role` (Admin, Store Manager, Operator), `branchId`.
*   **Purpose:** Determines *if* someone can log in, *what* screens they can see, and *which branch's data* they are allowed to read/write.

### 👔 HR Profile (`EmployeeEntity`)
This entity lives in the **HRM** module. It handles legal and operational employment records.
*   **Key Fields:** `salaryConfig`, `contractType`, `status` (Probation, Active), `departmentId`, `managerId`.
*   **Purpose:** Determines payroll, performance reviews, document tracking, and attendance tracking.

**The Link:** An `EmployeeEntity` has a One-to-One relationship (`user_id`) with a `UserEntity`. 
*   *Note: A warehouse cleaner might have an `EmployeeEntity` (for salary) but no `UserEntity` (because they don't log into the software).*

---

## 2. How Branch Access is Granted & Enforced

Physical branch access is tied to the **System Access Profile (`UserEntity`)**, because it controls software security boundaries.

### Step 1: Granting Access (Global Admin)
When a corporate administrator creates or updates a staff member's account in the Team Management dashboard:
1. They assign a **Role** (e.g., `UserRole.OPERATOR`).
2. They assign a **Home Branch** (`branchId = 'branch-uuid-123'`).

### Step 2: The Login Session
When the staff member logs into the dashboard:
1. The backend retrieves their `UserEntity`, including their assigned `branchId` and `role`.
2. This `User` profile is attached to the Express Request (`req.user`) via the `JwtAuthGuard`.

### Step 3: The Security Check (`BranchScopeGuard`)
Any time the staff member makes an API request (e.g., fetching a product list, submitting a POS order, or clocking into an attendance session), our newly built `BranchScopeGuard` executes automatically:

*   **If the user is a `SUPER_ADMIN` or `ADMIN` (Store Owner):** The guard ignores their assigned `branchId` and grants them global access. They can use the "Branch Switcher" dropdown in the UI to seamlessly navigate and view data across **all** branches.
*   **If the user is an `OPERATOR` (Cashier) or `STORE_MANAGER`:** 
    *   The guard checks if they sent an `X-Branch-Id` header.
    *   If they try to switch to a branch that does NOT match their assigned `req.user.branchId`, the guard blocks them with a `ForbiddenException`.
    *   If they simply make a request without switching, the guard automatically binds their assigned `req.user.branchId` to the `RequestContext`, ensuring their checkout transactions and attendance clock-ins are forcefully tied to their correct home branch.

---

## 3. Operational Workflows (Examples)

### Scenario A: Onboarding a New Cashier for Branch "Dhaka North"
1. **HR Action:** Create an `EmployeeEntity` (Sets Salary, Contract, sets department to "Retail").
2. **IT Action:** Create a `UserEntity` linked to the employee. Set Role to `OPERATOR` and `branchId` to the Dhaka North branch.
3. **Result:** When the cashier logs in, they only see the Dhaka North POS register. They cannot switch to the "Dhaka South" branch.

### Scenario B: Transferring a Store Manager
1. A manager is moving from Branch A to Branch B.
2. The Global Admin simply updates the manager's `UserEntity` and changes the `branchId` from A to B.
3. **Result:** The manager's historical sales remain attached to Branch A (thanks to our `SET NULL` foreign keys), but any new logins instantly restrict their dashboard to Branch B.

### Scenario C: Regional Managers (Future Enhancement)
If the business eventually hires a Regional Manager who needs access to *three* specific branches (but not all of them), the architecture will require a minor upgrade:
*   Transition `UserEntity.branchId` (One-to-Many) into a join table `user_branches` (Many-to-Many).
*   The `BranchScopeGuard` would then check: `if (!user.assignedBranchIds.includes(requestedBranchId)) throw ForbiddenException()`.
*   *Current State:* For now, relying on `ADMIN` role for cross-branch management perfectly satisfies Phase 1 ERP requirements.
