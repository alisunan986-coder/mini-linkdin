import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Open DB
const dbPromise = open({
  filename: path.join(__dirname, 'database.sqlite'), // Corrected path: it's in the same folder as seed.js
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
  },
  {
    name: 'Robert Miller',
    email: 'robert@example.com',
    bio: 'Cybersecurity Analyst | Focus on ethical hacking and network security.',
    profile_picture: 'https://i.pravatar.cc/150?img=12'
  },
  {
    name: 'Sophie Lane',
    email: 'sophie@example.com',
    bio: 'Digital Marketing Specialist | Growth Hacker | SEO & SEM Expert.',
    profile_picture: 'https://i.pravatar.cc/150?img=32'
  },
  {
    name: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    bio: 'Full Stack Developer | Go & Python enthusiast | Cloud Architect.',
    profile_picture: 'https://i.pravatar.cc/150?img=15'
  },
  {
    name: 'Linda Gao',
    email: 'linda@example.com',
    bio: 'Backend Engineer | Distributed Systems | High-performance computing.',
    profile_picture: 'https://i.pravatar.cc/150?img=26'
  },
  {
    name: 'Chris Evans',
    email: 'chris@example.com',
    bio: 'Mobile App Developer | React Native & Flutter | Coffee Addict.',
    profile_picture: 'https://i.pravatar.cc/150?img=8'
  }
];

const FAKE_JOBS = [
  { title: 'Senior React Developer', company: 'TechFlow', location: 'Remote', type: 'Full-time', description: 'Seeking a React expert to lead our frontend team in building next-gen collaboration tools.' },
  { title: 'Junior UI Designer', company: 'CreativePulse', location: 'New York, NY', type: 'Internship', description: 'Join our design studio and learn from the best. Perfect for recent graduates.' },
  { title: 'Backend Engineer (Node.js)', company: 'DataSync', location: 'Seattle, WA', type: 'Full-time', description: 'Scale high-traffic APIs using Node.js and Redis. 5+ years experience required.' },
  { title: 'Project Management Intern', company: 'BuildRight', location: 'Austin, TX', type: 'Internship', description: 'Assisting project managers in coordinating large-scale infrastructure projects.' },
  { title: 'DevOps Engineer', company: 'CloudScale', location: 'London, UK', type: 'Contract', description: 'Help us automate our AWS infrastructure using Terraform and Kubernetes.' },
  { title: 'Sales Executive', company: 'SaaSPro', location: 'San Francisco, CA', type: 'Full-time', description: 'Drive growth for our market-leading CRM platform. High commission structure.' },
  { title: 'Marketing Coordinator', company: 'GrowthLabs', location: 'Remote', type: 'Part-time', description: 'Support our social media and email marketing campaigns 20 hours a week.' }
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

const SKILLS = ['React', 'Node.js', 'Express', 'SQLite', 'JavaScript', 'CSS', 'HTML', 'Git', 'Agile', 'AWS', 'Docker', 'Testing', 'UI/UX Design', 'TypeScript'];

async function seed() {
  const db = await dbPromise;
  console.log('Initializing schema...');
  
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
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      connected_user_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('pending', 'accepted')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, connected_user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (connected_user_id) REFERENCES users(id) ON DELETE CASCADE
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
    PRAGMA foreign_keys = ON;
  `);

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

  // Insert Skills
  for (const userId of insertedUsers) {
    // Give each user 3-5 random skills
    const numSkills = 3 + Math.floor(Math.random() * 3);
    const shuffledSkills = [...SKILLS].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numSkills; i++) {
      await db.run('INSERT INTO skills (user_id, skill_name) VALUES (?, ?)', [userId, shuffledSkills[i]]);
    }
  }
  console.log('Inserted fake skills!');

  // Insert posts
  const postIds = [];
  for (let i = 0; i < FAKE_POSTS.length; i++) {
    const userId = insertedUsers[i % insertedUsers.length];
    const pastDate = new Date(Date.now() - (Math.random() * 100000000)).toISOString().replace('T', ' ').slice(0, 19);

    const result = await db.run(
      'INSERT INTO posts (user_id, content, created_at) VALUES (?, ?, ?)',
      [userId, FAKE_POSTS[i], pastDate]
    );
    postIds.push(result.lastID);
  }
  console.log('Inserted fake posts!');

  // Insert comments and likes
  for (const postId of postIds) {
    // 2-3 random commenters
    const numComments = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numComments; i++) {
        const userId = insertedUsers[Math.floor(Math.random() * insertedUsers.length)];
        await db.run('INSERT INTO comments (post_id, user_id, comment_text) VALUES (?, ?, ?)', [postId, userId, 'Great post! Keep it up! 👏']);
        await db.run('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, insertedUsers[Math.floor(Math.random() * insertedUsers.length)]]).catch(() => {}); // catch unique constraint
    }
  }
  console.log('Inserted interactions (comments/likes)!');

  // Insert jobs
  for (const j of FAKE_JOBS) {
    const userId = insertedUsers[Math.floor(Math.random() * insertedUsers.length)];
    await db.run(
      'INSERT INTO jobs (user_id, title, company, location, type, description) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, j.title, j.company, j.location, j.type, j.description]
    );
  }
  console.log('Inserted fake jobs!');

  // Insert connections
  for (let i = 0; i < insertedUsers.length; i++) {
    const userId = insertedUsers[i];
    // Connect to 2-3 other users
    const targets = insertedUsers.filter(id => id !== userId).sort(() => 0.5 - Math.random()).slice(0, 3);
    for (const targetId of targets) {
        const status = Math.random() > 0.3 ? 'accepted' : 'pending';
        await db.run('INSERT INTO connections (user_id, connected_user_id, status) VALUES (?, ?, ?)', [userId, targetId, status]).catch(() => {});
    }
  }
  console.log('Inserted connections!');

  console.log('Seeding complete! You can log in as any of these users with the password: "password123"');
}

seed().catch(err => {
  console.error("Seeding failed:", err);
});
