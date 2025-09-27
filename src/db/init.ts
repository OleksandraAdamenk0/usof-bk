import 'dotenv/config';
import rootConnection from "./rootConnection.js";
import {pool} from "./connection.js";

async function init() {
  if (!process.env.DB_NAME) {
    console.error('Missing DB_NAME');
  }
  await rootConnection.query(`CREATE USER IF NOT EXISTS '${process.env.DB_USER}'@'localhost' IDENTIFIED BY '${process.env.DB_PASSWORD}';`);

  await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);

  await rootConnection.query(`GRANT ALL PRIVILEGES ON \`${process.env.DB_NAME}\`.* TO '${process.env.DB_USER}'@'localhost';`);

  await rootConnection.end();
  console.log(`Database "${process.env.DB_NAME}" ensured.`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(100) UNIQUE NOT NULL,
      login VARCHAR(100) UNIQUE NOT NULL,
      fullName VARCHAR(100) NOT NULL,
      description TEXT DEFAULT NULL,
      profilePicture VARCHAR(255) DEFAULT 'images/defaultAvatar.png',
      role ENUM('admin', 'user') DEFAULT 'user',
      status ENUM('active', 'banned') DEFAULT 'active',
      github VARCHAR(255),
      linkedin VARCHAR(255),
      password_hash VARCHAR(255) NOT NULL,
      is_verified BOOLEAN DEFAULT FALSE,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  console.log('Table "user" created or exists.');

  // Workspace
  await pool.query(`
      CREATE TABLE IF NOT EXISTS workspace (
         id INT AUTO_INCREMENT PRIMARY KEY,
         name VARCHAR(100) NOT NULL UNIQUE,
         description TEXT,
         owner INT NOT NULL,
         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
         FOREIGN KEY (owner) REFERENCES user(id) ON DELETE CASCADE
      );
  `);
  console.log('Table "workspace" created or exists.');

  await pool.query(`
  CREATE TABLE IF NOT EXISTS contentItem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author INT,
    workspace INT NOT NULL,
    type ENUM('post', 'comment') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author) REFERENCES user(id) ON DELETE SET NULL,
    FOREIGN KEY (workspace) REFERENCES workspace(id) ON DELETE CASCADE 
  );
`);
  console.log('Table "contentItem" created or exists.');

  // Post
  await pool.query(`
  CREATE TABLE IF NOT EXISTS post (
    contentItemId INT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    acceptedComment INT DEFAULT NULL,
    views INT DEFAULT 0,
    FOREIGN KEY (contentItemId) REFERENCES contentItem(id) ON DELETE CASCADE
  );
`);
  console.log('Table "post" created or exists.');

  // Comment
  await pool.query(`
  CREATE TABLE IF NOT EXISTS comment (
    contentItemId INT PRIMARY KEY,
    post INT NOT NULL,
    target INT,
    content TEXT NOT NULL,
    FOREIGN KEY (contentItemId) REFERENCES contentItem(id) ON DELETE CASCADE,
    FOREIGN KEY (post) REFERENCES post(contentItemId) ON DELETE CASCADE,
    FOREIGN KEY (target) REFERENCES contentItem(id) ON DELETE CASCADE
  );
`);
  console.log('Table "Comment" created or exists.');

  // FK from Post on Comment
  await pool.query(`
  ALTER TABLE post
  ADD CONSTRAINT fk_post_acceptedComment
  FOREIGN KEY (acceptedComment) REFERENCES comment(contentItemId);
  `);

  // Tag
  await pool.query(`
  CREATE TABLE IF NOT EXISTS tag (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workspace INT NOT NULL,
    author INT,
    title VARCHAR(100) NOT NULL,
    FOREIGN KEY (workspace) REFERENCES workspace(id) ON DELETE CASCADE,
    FOREIGN KEY (author) REFERENCES user(id) ON DELETE SET NULL,
    UNIQUE (workspace, title)
  );
`);
  console.log('Table "Tag" created or exists.');

// PostsTags
  await pool.query(`
  CREATE TABLE IF NOT EXISTS postsTags (
    tag INT NOT NULL,
    post INT NOT NULL,
    PRIMARY KEY (tag, post),
    FOREIGN KEY (tag) REFERENCES tag(id) ON DELETE CASCADE,
    FOREIGN KEY (post) REFERENCES post(contentItemId) ON DELETE CASCADE
  );
`);
  console.log('Table "PostsTags" created or exists.');

  // Category
  await pool.query(`
  CREATE TABLE IF NOT EXISTS category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workspace INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    FOREIGN KEY (workspace) REFERENCES workspace(id) ON DELETE CASCADE,
    UNIQUE (workspace, title)
  );
`);
  console.log('Table "Category" created or exists.');

// PostsCategories
  await pool.query(`
  CREATE TABLE IF NOT EXISTS postsCategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category INT,
    post INT NOT NULL,
    FOREIGN KEY (category) REFERENCES category(id) ON DELETE SET NULL,
    FOREIGN KEY (post) REFERENCES post(contentItemId) ON DELETE CASCADE
  );
`);
  console.log('Table "PostsCategories" created or exists.');

  // Reaction
  await pool.query(`
  CREATE TABLE IF NOT EXISTS reaction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user INT NOT NULL,
    contentItemId INT NOT NULL,
    type ENUM('like', 'dislike', 'love', 'laugh', 'angry') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (contentItemId) REFERENCES contentItem(id) ON DELETE CASCADE,
    UNIQUE (user, contentItemId, type)
  );
`);
  console.log('Table "Reaction" created or exists.');


  await pool.query(`
  CREATE TABLE IF NOT EXISTS savedPost (
      post INT NOT NULL,
      user INT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user) REFERENCES user(id) ON DELETE CASCADE,
      FOREIGN KEY (post) REFERENCES post(contentItemId) ON DELETE CASCADE 
  );`);

  console.log('Table "savedPost" created or exists.');

  await pool.query(`
  CREATE TABLE IF NOT EXISTS workspacesUsers (
      workspace INT NOT NULL,
      user INT NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      rating INT NOT NULL DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user) REFERENCES user(id) ON DELETE CASCADE,
      FOREIGN KEY (workspace) REFERENCES workspace(id) ON DELETE CASCADE 
  );`);

  console.log('Table "savedPost" created or exists.');
  // TO DO: create other tables here
}

if (import.meta.url === `file://${process.argv[1]}`)  {
  init().then(() => {
    console.log(`init finished`)
    process.exit(0);
  });
}