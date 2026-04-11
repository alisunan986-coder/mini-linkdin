import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Open DB
const dbPromise = open({
  filename: path.join(__dirname, 'database.sqlite'),
  driver: sqlite3.Database
});

const FAKE_USERS = [
  {
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    bio: 'Senior Software Engineer | React & Node.js Enthusiast',
    profile_picture: 'https://i.pravatar.cc/150?img=47'
  },
  {
    name: 'Michael Rodriguez',
    email: 'michael@example.com',
    bio: 'Product Manager @ TechCorp | Agile Coach',
    profile_picture: 'https://i.pravatar.cc/150?img=11'
  },
  {
    name: 'Emily Watson',
    email: 'emily@example.com',
    bio: 'UX/UI Designer | Figma lover',
    profile_picture: 'https://i.pravatar.cc/150?img=5'
  },
  {
    name: 'David Kim',
    email: 'david@example.com',
    bio: 'Data Scientist specializing in Machine Learning',
    profile_picture: 'https://i.pravatar.cc/150?img=33'
  },
  {
    name: 'Jessica Taylor',
    email: 'jessica@example.com',
    bio: 'Technical Recruiter | Connecting top talent',
    profile_picture: 'https://i.pravatar.cc/150?img=44'
  }
];

const FAKE_POSTS = [
  "Just deployed my first full-stack application using React, Vite, and SQLite! 🚀 #webdev #reactjs",
  "We are hiring! Looking for a Senior Product Maker to join our dynamic team. 💼",
  "Is anyone else noticing how fast AI is advancing? The future is here! 🤖✨",
  "Just finished a great UX workshop on micro-interactions. Keep it subtle! 🎨",
  "Finally cracked that nasty database migration bug. Nothing feels better than green tests! ✅",
  "Excited to announce I'll be speaking at the upcoming Developer Summit! 🎤",
  "What's everyone's favorite database these days? I love the simplicity of SQLite. 📊"
];

const SKILLS = ['React', 'Node.js', 'Express', 'SQLite', 'JavaScript', 'CSS', 'HTML', 'Git', 'AWS', 'Docker', 'TypeScript'];

async function seed() {
  const db = await dbPromise;
  console.log('Initializing schema in seeder...');
  
  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      bio TEXT,
      profile_picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      skill_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment_text TEXT NOT NULL,
      parent_id INTEGER DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS reposts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );
    PRAGMA foreign_keys = ON;
  `);

  console.log('Seeding database...');
  const defaultPassword = await bcrypt.hash('password123', 10);
  const insertedUsers = [];
  
  for (const u of FAKE_USERS) {
    const row = await db.get('SELECT id FROM users WHERE email = ?', [u.email]);
    if (!row) {
      const result = await db.run(
        'INSERT INTO users (name, email, password, bio, profile_picture) VALUES (?, ?, ?, ?, ?)',
        [u.name, u.email, defaultPassword, u.bio, u.profile_picture]
      );
      insertedUsers.push(result.lastID);
    } else {
      insertedUsers.push(row.id);
    }
  }

  // Insert posts
  for (let i = 0; i < FAKE_POSTS.length; i++) {
    const userId = insertedUsers[i % insertedUsers.length];
    await db.run(
      'INSERT INTO posts (user_id, content) VALUES (?, ?)',
      [userId, FAKE_POSTS[i]]
    );
  }

  console.log('Seeding complete! Log in with "password123"');
}

seed().catch(err => console.error("Seeding failed:", err));
