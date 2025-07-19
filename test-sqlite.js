try {
  const Database = require("better-sqlite3");
  const db = new Database(":memory:");

  // Create table
  db.exec("CREATE TABLE test (info TEXT)");

  // Insert data
  const insert = db.prepare("INSERT INTO test VALUES (?)");
  insert.run("Hello");

  // Query data
  const stmt = db.prepare("SELECT rowid AS id, info FROM test");
  const rows = stmt.all();

  rows.forEach((row) => {
    console.log(row.id + ": " + row.info);
  });

  db.close();
  console.log("✅ SQLite test passed");
} catch (err) {
  console.error("❌ SQLite failed:", err);
  process.exit(1);
}
