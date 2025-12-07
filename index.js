// Import faker library to generate fake data (UUID, name, email, password)
const { faker, fa } = require('@faker-js/faker');

// Import MySQL driver for database connection
const mysql = require('mysql2');

// Import Express framework to create server and routes
const express = require('express');
const app = express();

// Import path module for file path handling
const path = require('path');

// Import method-override to support PATCH & DELETE requests
const methodOverride = require('method-override');

// Parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));

// Enable override of HTTP methods using query parameter (_method)
app.use(methodOverride('_method'));

// Setting EJS as template/view engine
app.set('view engine', 'ejs');

// Setting directory for EJS views
app.set("views", path.join(__dirname, "/views"));

// Create MySQL database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'delta'
});

// Function to generate fake user details (not used currently)
let getuser = () => {
   return [
    faker.string.uuid(),
    faker.person.fullName(),
    faker.internet.email(),
    faker.internet.password()
   ];
};

// ==================== HOME ROUTE ====================
app.get('/', (req, res) => {
    let q = 'SELECT COUNT(*) FROM users'; // Query to count number of users
    try {
        connection.query(q, (err, result) => { // Execute query
            if (err) throw err;
            let count = result[0]['COUNT(*)']; // Extract count value
            res.render("home.ejs", { count }); // Render Home Page with count
        });
    } catch (err) {
        res.send("some error");
    }
});

// ==================== SHOW ALL USERS ROUTE ====================
app.get('/users', (req, res) => {
    let q = 'SELECT * FROM users'; // Get all users
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            res.render("show.ejs", { users: result }); // Render list of users
        });
    } catch (err) {
        res.send("some error");
    }
});

// ==================== EDIT USER FORM ROUTE ====================
app.get('/user/:id/edit', (req, res) => {
    let { id } = req.params; // Extract user id from URL
    let q = `SELECT * FROM users WHERE id = '${id}'`; // Query user by id
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            res.render("edit.ejs", { user: result[0] }); // Render edit form
        });
    } catch (err) {
        res.send("some error");
    }
});

// ==================== UPDATE USER ROUTE ====================
app.patch('/user/:id/update', (req, res) => {
    let { id } = req.params;
    let { password: formPass, username: newUsername } = req.body; // Get form values
    let q = `SELECT * FROM users WHERE id = '${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];

            // Check password to confirm update
            if (formPass !== user.password) {
                res.send("Password incorrect. Cannot update username.");
            } else {
                let q2 = `UPDATE users SET name = '${newUsername}' WHERE id = '${id}'`; // Update username

                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    res.redirect('/users'); // Redirect to updated list
                });
            }
        });
    } catch (err) {
        res.send("some error");
    }
});

// ==================== DELETE CONFIRMATION PAGE ====================
app.get('/user/:id/delete', (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM users WHERE id = '${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            res.render("delete.ejs", { user: result[0] }); // Render delete confirmation page
        });
    } catch (err) {
        res.send("some error");
    }
});

// ==================== DELETE USER ROUTE ====================
app.delete('/user/:id/delete', (req, res) => {
    let { id } = req.params;
    let { email, password } = req.body;
    let q = `SELECT * FROM users WHERE id = '${id}'`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];

            // Check both email & password match before delete
            if (email !== user.email && password !== user.password) {
                res.send("Email or Password incorrect. Cannot delete user.");
            } else {
                let q2 = `DELETE FROM users WHERE id = '${id}'`; // Delete the user

                connection.query(q2, (err, result) => {
                    if (err) throw err;
                    res.redirect('/users'); // Refresh user list
                });
            }
        });
    } catch (err) {
        res.send("some error");
    }
});

// ==================== ADD USER FORM ROUTE ====================
app.get('/add', (req, res) => {
    res.render("add.ejs"); // Show Add user form
});

// ==================== ADD USER SUBMIT ROUTE ====================
app.post('/adduser', (req, res) => {
    let { name, email, password } = req.body; // Get form data
    let q = `INSERT INTO users (id,name,email,password) VALUES ('${faker.string.uuid()}','${name}','${email}','${password}')`;

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            res.redirect('/users'); // Go back to list after adding
        });
    } catch (err) {
        res.send("some error");
    }
});

// ==================== SEARCH USER ROUTE ====================
app.get("/search", (req, res) => {
    const search = req.query.q; // Get search keyword
    const q = `SELECT * FROM users WHERE name LIKE '%${search}%' OR email LIKE '%${search}%'`;

    connection.query(q, (err, result) => {
        if (err) throw err;
        res.render("show.ejs", { users: result }); // Show only matching users
    });
});

// ==================== START EXPRESS SERVER ====================
app.listen(8080, () => {
    console.log("Server is running on port http://localhost:8080");
});
