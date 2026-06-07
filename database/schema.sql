CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(32) NOT NULL UNIQUE,
  nickname VARCHAR(64) NOT NULL,
  role ENUM('farmer','teacher','buyer','admin') NOT NULL DEFAULT 'farmer',
  region VARCHAR(128),
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS teacher_applications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  real_name VARCHAR(64) NOT NULL,
  expertise VARCHAR(255) NOT NULL,
  region VARCHAR(128),
  credential_url VARCHAR(512),
  intro TEXT,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reject_reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tutorials (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(64) NOT NULL,
  crop_or_breed VARCHAR(80),
  content TEXT NOT NULL,
  media_url VARCHAR(512),
  author_id BIGINT,
  status ENUM('pending','approved','rejected','offline') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  farmer_id BIGINT NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(64),
  crop_or_breed VARCHAR(80),
  region VARCHAR(128),
  media_url VARCHAR(512),
  status ENUM('pending','answered','closed','offline') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS answers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  teacher_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  media_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS supplies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  farmer_id BIGINT NOT NULL,
  product_name VARCHAR(120) NOT NULL,
  category VARCHAR(64),
  quantity DECIMAL(12,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  region VARCHAR(128) NOT NULL,
  available_at DATE,
  description TEXT,
  image_url VARCHAR(512),
  video_url VARCHAR(512),
  self_delivery_price DECIMAL(10,2),
  pickup_price DECIMAL(10,2),
  price_unit VARCHAR(20) DEFAULT '元/斤',
  contact_phone VARCHAR(32),
  status ENUM('pending','approved','rejected','offline') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS purchase_demands (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  buyer_id BIGINT NOT NULL,
  product_name VARCHAR(120) NOT NULL,
  category VARCHAR(64),
  quantity DECIMAL(12,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  region VARCHAR(128) NOT NULL,
  purchase_at DATE,
  quality_requirement TEXT,
  self_delivery_price DECIMAL(10,2),
  pickup_price DECIMAL(10,2),
  price_unit VARCHAR(20) DEFAULT '元/斤',
  contact_phone VARCHAR(32),
  status ENUM('pending','approved','rejected','closed','offline') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS review_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  target_type VARCHAR(40) NOT NULL,
  target_id BIGINT NOT NULL,
  action ENUM('approved','rejected','offline') NOT NULL,
  reason VARCHAR(255),
  reviewer_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
