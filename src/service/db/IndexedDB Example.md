# Example usage

```` typescript
  interface User {
    id?: number;
    name: string;
    email: string;
  }

  const dbConfig: DBConfig = {
    dbName: 'myDatabase',
    storeName: 'users'
  };

  const dbService = new IndexedDBService(dbConfig);

  const user: User = { name: "John Doe", email: "john@example.com" };

  // Add user
  dbService.add<User>(user, () => {
    console.log("User added successfully");
  });

  // Find user
  const userIdToFind: number = 1;
  dbService.find<User>(userIdToFind, (user: User | null) => {
      if (user !== null) {
          console.log("User found:", user);
      } else {
          console.log("User not found");
      }
  });

  // Get all users
  dbService.getAll<User>((users) => {
    console.log("Users:", users);
  });

  // Delete user by key
  const userIdToDelete: number = 1;
  dbService.delete(userIdToDelete, () => {
    console.log("User deleted successfully");
  });
````