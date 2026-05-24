# What You MUST add in Audit Log: 
<!-- 
For SaaS, always log:

User login / logout

Failed login attempts

Password change

Role / permission changes

Create / Update / Delete (important data)

Subscription / payment actions

Admin activities

Tenant-level configuration changes -->

## 1. Basic Information

- **Timestamp**: When the event occurred.
- **User**: Who performed the action.
- **Action**: What happened (e.g., CREATE, UPDATE, DELETE).
- **Entity**: What was affected (e.g., Product, Order).
- **Entity ID**: The ID of the affected entity.
- **Tenant ID**: The ID of the tenant.
- **IP Address**: The IP address of the user.
- **User Agent**: The user agent of the user.

## 2. Change Tracking

- **Old Value**: The value of the entity before the change.
- **New Value**: The value of the entity after the change.

## 3. Additional Information

- **Description**: A human-readable description of the event.
- **Metadata**: Any additional information about the event.

## 4. Example Audit Log Entry

```json
{
    "timestamp": "2022-01-01T00:00:00Z",
    "user": "user-id",
    "action": "CREATE",
    "entity": "Product",
    "entityId": "product-id",
    "tenantId": "tenant-id",
    "ipAddress": "[IP_ADDRESS]",
    "userAgent": "user-agent",
    "oldValue": null,
    "newValue": {
        "name": "Product Name",
        "price": 100
    },
    "description": "Product created",
    "metadata": {}
}
```