CREATE DATABASE lms_indobismar;
USE lms_indobismar;

-- =============================
-- 1. ROLES
-- =============================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

INSERT INTO roles (role_name) VALUES
('super_admin'),
('admin_cabang'),
('trainer'),
('user');


-- =============================
-- 2. BRANCHES
-- =============================
CREATE TABLE branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================
-- 3. USERS
-- =============================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    branch_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);


-- =============================
-- 4. PARTICIPANTS (Peserta PKL)
-- 1 Trainer → Banyak Peserta
-- =============================
CREATE TABLE participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    trainer_id INT,
    university VARCHAR(150),
    start_date DATE,
    end_date DATE,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (trainer_id) REFERENCES users(id)
);


-- =============================
-- 5. COURSES
-- =============================
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(200) NOT NULL,
    description TEXT,
    branch_id INT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);


-- =============================
-- 6. COURSE ENROLLMENT
-- =============================
CREATE TABLE course_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    user_id INT,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


-- =============================
-- 7. MATERIALS
-- =============================
CREATE TABLE materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    title VARCHAR(200),
    file_path VARCHAR(255),
    material_type ENUM('pdf','video','doc'),
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);


-- =============================
-- 8. ASSIGNMENTS
-- =============================
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    title VARCHAR(200),
    description TEXT,
    due_date DATETIME,
    created_by INT,

    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);


-- =============================
-- 9. SUBMISSIONS
-- =============================
CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT,
    user_id INT,
    file_path VARCHAR(255),
    submitted_at DATETIME,

    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


-- =============================
-- 10. EXAMS
-- =============================
CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    title VARCHAR(200),
    total_score INT,
    created_by INT,

    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);


-- =============================
-- 11. SCORES
-- =============================
CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    exam_id INT,
    technical_score DECIMAL(5,2),
    nontechnical_score DECIMAL(5,2),
    final_score DECIMAL(5,2),

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);


-- =============================
-- 12. PROGRESS
-- =============================
CREATE TABLE progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    course_id INT,
    progress_percentage INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);


-- =============================
-- 13. ACTIVITY LOGS
-- =============================
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    activity TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);