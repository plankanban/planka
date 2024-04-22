# Planka Server Documentation

The backend was developed using the SailsJS framework, which facilitates complex operations in web applications, especially when combined with the Knex database migration manager.

## Modifying the Database Structure

### Creating a Migration

**Step 1:** Navigate to the corresponding folder within the project:
```bash
cd ROOT_PATH/server/db
```

**Step 2:** Execute the following command to create a new migration file:
```bash
npm run db:create-migration add_change_in_the_database_structure
```

This command creates a file in the migration folder named based on the provided argument. The generated file will have the following initial structure:
```Javascript
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Add the changes that will be applied to the database
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Add the changes that will revert the operations done in up
};
```

#### Adapting to Asynchronous Functions:
In the project, asynchronous functions are used by default. Modify the migration file to adhere to this standard:

```Javascript
exports.up = async (knex) => {
  // Migration logic to apply changes
};

exports.down = async (knex) => {
  // Migration logic to revert changes
};
```

#### Implementation
Implement the necessary logic in the up and down methods to apply or revert changes in the database. To understand how migrations work and explore detailed examples, refer to the [official Knex documentation on migrations](https://knexjs.org/guide/migrations.html#migration-api).

