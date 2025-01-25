const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'users.json');

app.use(bodyParser.json());

// Load or initialize users data
const loadUsers = () => {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return [];
};

const saveUsers = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

let users = loadUsers();

// Endpoint to check if a name is taken
app.get('/check_name', (req, res) => {
  const { name } = req.query;
  const isTaken = users.some((user) => user.name === name);
  res.json({ taken: isTaken });
});

// Endpoint to save a new user
app.post('/save_user', (req, res) => {
  const { name, score } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: 'Name is required.' });
  }

  const existingUser = users.find((user) => user.name === name);

  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: 'User already exists.' });
  }
  users.push({ name, score: 0 });
  saveUsers(users);
  res.json({ success: true, message: 'User saved successfully.' });
});

app.post('/update_score', (req, res) => {
  const { name, score } = req.body;

  console.log("HI")

  const user = users.find((user) => user.name === name);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  if (score > user.score) {
    user.score = score;
  }
  saveUsers(users);
  res.json({ success: true, message: 'Score updated successfully.', user });
});// Endpoint to load user data
app.get('/load_user', (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: 'Name is required.' });
  }

  const user = users.find((user) => user.name === name);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  res.json({ success: true, user });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
