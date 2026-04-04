import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Open DB
const dbPromise = open({
  filename: path.join(__dirname, '..', 'database', 'database.sqlite'),
  driver: sqlite3.Database
});

const FAKE_USERS = [
  {
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    bio: 'Senior Software Engineer | React & Node.js Enthusiast | Passionate about building scalable UI.',
    profile_picture: 'https://i.pravatar.cc/150?img=47'
  },
  {
    name: 'Michael Rodriguez',
    email: 'michael@example.com',
    bio: 'Product Manager @ TechCorp | Agile Coach | Always learning.',
    profile_picture: 'https://i.pravatar.cc/150?img=11'
  },
  {
    name: 'Emily Watson',
    email: 'emily@example.com',
    bio: 'UX/UI Designer | Creating seamless user experiences | Figma lover.',
    profile_picture: 'https://i.pravatar.cc/150?img=5'
  },
  {
    name: 'David Kim',
    email: 'david@example.com',
    bio: 'Data Scientist specializing in Machine Learning and AI models.',
    profile_picture: 'https://i.pravatar.cc/150?img=33'
  },
  {
    name: 'Jessica Taylor',
    email: 'jessica@example.com',
    bio: 'Technical Recruiter | Connecting top talent with amazing companies.',
    profile_picture: 'https://i.pravatar.cc/150?img=44'
  }
];

const FAKE_POSTS = [
  "Just deployed my first full-stack application using React, Vite, and SQLite! The productivity boost from Vite's fast refresh is absolutely insane. Highly recommend it to anyone still on Create React App. 🚀 #webdev #reactjs",
  "We are hiring! Looking for a Senior Product Maker to join our dynamic team. If you love solving complex problems with beautiful design, send me a message! 💼",
  "Is anyone else noticing how fast AI is advancing? I just integrated an LLM into my side project and it completely revolutionized the user experience. The future is here! 🤖✨",
  "Just finished a great UX workshop on micro-interactions. Remember: sometimes the smallest animations can create the biggest impact on user trust. Keep it subtle! 🎨",
  "Finally cracked that nasty database migration bug that was haunting me all weekend. Nothing feels better than seeing those tests turn green! ✅",
  "Excited to announce I'll be speaking at the upcoming Developer Summit about state management strategies in modern React! 🎤",
  "What's everyone's favorite database these days? I've been really enjoying the simplicity of SQLite for MVP projects. No servers to manage, just a file! 📊"
];

async function seed() {
  const db = await dbPromise;
  console.log('Seeding database...');
  
  const defaultPassword = await bcrypt.hash('password123', 10);

  const insertedUsers = [];
  
  for (const u of FAKE_USERS) {
    // Check if exists
    const row = await db.get('SELECT id FROM users WHERE email = ?', [u.email]);
    if (!row) {
      const result = await db.run(
        'INSERT INTO users (name, email, password, bio, profile_picture) VALUES (?, ?, ?, ?, ?)',
        [u.name, u.email, defaultPassword, u.bio, u.profile_picture]
      );
      insertedUsers.push(result.lastID);
      console.log(`Inserted user: ${u.name}`);
    } else {
      insertedUsers.push(row.id);
      console.log(`User ${u.name} already exists.`);
    }
  }

  // Insert posts
  // Distribute posts randomly among fake users
  for (let i = 0; i < FAKE_POSTS.length; i++) {
    const userId = insertedUsers[i % insertedUsers.length];
    
    // Slight jitter to timestamps so they aren't all EXACTLY the same
    const pastDate = new Date(Date.now() - (Math.random() * 100000000)).toISOString().replace('T', ' ').slice(0, 19);

    await db.run(
      'INSERT INTO posts (user_id, content, created_at) VALUES (?, ?, ?)',
      [userId, FAKE_POSTS[i], pastDate]
    );
  }
  
  console.log('Inserted fake posts!');
  console.log('Seeding complete! You can log in as any of these users with the password: "password123"');
}

seed().catch(err => {
  console.error("Seeding failed:", err);
});
