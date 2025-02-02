import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

dotenv.config()
// App Configuration
const app = express();
const port = 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// Database Setup
const db = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());

// Routes
// Render the home page
app.get("/", async (req, res) => {
    try {
        // const username = req.params.username;
        const result = await db.query("SELECT * FROM tasks"); // Fetch all tasks
        res.render("index", { tasks: result.rows }); // Render 'index.ejs' and pass tasks
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading the home page.");
    }
});

// Add a new task
app.post("/add-task", async (req, res) => {
    let { userId, title, description, dueDate } = req.body;

    // Ensure required fields are present
    if (!title || title.trim() === "") {
        return res.status(400).send("Task title is required.");
    }

    if (!userId) userId = 1; // Temporary default user ID

    try {
        await db.query(
            "INSERT INTO tasks (user_id, title, description, due_date) VALUES ($1, $2, $3, $4)",
            [userId, title.trim(), description || "", dueDate || null]
        );
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding task.");
    }
});



// Update a task
app.post("/update-task", async (req, res) => {
    const { taskId, status } = req.body;
    try {
        await db.query("UPDATE tasks SET status = $1 WHERE id = $2", [status, taskId]);
        res.redirect("/"); // Redirect back to the home page
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating task.");
    }
});

// Delete a task
app.post("/delete-task/:id", async (req, res) => {
    const taskId = req.params.id;
    try {
        await db.query("DELETE FROM tasks WHERE id = $1", [taskId]);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting task.");
    }
});


app.post('/voice-command', async (req, res) => {
    const { command } = req.body;
    if (!command) {
        return res.status(400).json({ error: 'No command received' });
    }

    let userId = 1; // Temporary default user ID

    try {
        if (command.toLowerCase().includes('add task')) {
            const taskTitle = command.replace('add task', '').trim();

            if (!taskTitle) {
                return res.status(400).json({ error: 'Task title is empty' });
            }

            await db.query(
                "INSERT INTO tasks (user_id, title, description, due_date) VALUES ($1, $2, $3, $4)",
                [userId, taskTitle.trim(), "", null]
            );

            return res.json({ message: `Task "${taskTitle}" added successfully` });
        }
        else if (command.toLowerCase().includes("delete task")) {
            const taskTitle = command.replace("delete task", "").trim();

            if (!taskTitle) {
                return res.status(400).json({ error: "Task title is empty" });
            }

            const result = await db.query(
                "DELETE FROM tasks WHERE title = $1 RETURNING *", [taskTitle]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: "Task not found" });
            }

            return res.json({ message: `Task "${taskTitle}" deleted successfully.` });
        } 
        else {
            return res.status(400).json({ error: "Invalid command." });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
    }
});




// Start Program
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
