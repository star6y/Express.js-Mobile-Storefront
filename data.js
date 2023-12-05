// this package behaves just like the mysql one, but uses async await instead of callbacks
const mysql = require(`mysql-await`); // npm install mysql-await

// first -- I want a connection pool: https://www.npmjs.com/package/mysql#pooling-connections
// this is used a bit differently, but I think it's just better -- especially if server is doing heavy work.
var connPool = mysql.createPool({
  connectionLimit: 5, // it's a shared resource, let's not go nuts.
  host: "cse-mysql-classes-01.cse.umn.edu",// this will work
  user: "C4131F23U16",
  database: "C4131F23U16",
  password: "306", // we really shouldn't be saving this here long-term -- and I probably shouldn't be sharing it with you...
});

// later you can use connPool.awaitQuery(query, data) -- it will return a promise for the query results.



async function addContact(name, email, date, phone, case_){
    return await connPool.awaitQuery(`INSERT INTO contact (name_, email, delivery_date, phone_model, case_)
          VALUES (?, ?, ?, ?, ?)`, [name, email, date, phone, case_]);
}

async function deleteContact(id){
  const delettion = await connPool.awaitQuery("DELETE FROM contact WHERE id = ?", [id]);

  // Keep it simple. If "affectedRows" (returned by the mysql) is > 0, then we know
  // we deleted the row, so return true.
  return (delettion.affectedRows > 0);
}

async function getContacts() {
  return await connPool.awaitQuery("SELECT * FROM contact")
}

async function addSale(message) {
  return await connPool.awaitQuery("INSERT INTO sale (description_) VALUES (?)", [message])
}

async function endSale() {
  return await connPool.awaitQuery("UPDATE sale SET end_sale=CURRENT_TIMESTAMP  WHERE end_sale IS NULL")
}

async function getRecentSales() {
  return await connPool.awaitQuery("SELECT *   FROM sale   ORDER BY start_sale DESC   LIMIT 3;")
}


module.exports = {addContact, getContacts, deleteContact, addSale, endSale, getRecentSales}

// Testing:
// addContact("mmmmi", "emmmmil@emil.com", "12-12-20mm34", "S24+", "Yes").then(console.log)
// deleteContact(9).then(console.log)
// getContacts().then(console.log)
// addSale("Test sale").then(console.log)
// endSale().then(console.log)
// getRecentSales().then(console.log)
