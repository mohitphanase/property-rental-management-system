DROP DATABASE IF EXISTS property_db;

CREATE DATABASE property_db;
USE property_db;


CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','OWNER','TENANT') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE properties (
    property_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    owner_id BIGINT NOT NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT,

    address VARCHAR(255),
    city VARCHAR(100),

    price DECIMAL(10,2) NOT NULL,

    property_type ENUM(
        'APARTMENT',
        'HOUSE',
        'VILLA',
        'PG',
        'ROOM'
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_id)
    REFERENCES users(user_id)
);


CREATE TABLE property_images (
    image_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    property_id BIGINT NOT NULL,

    image_url VARCHAR(500) NOT NULL,

    FOREIGN KEY (property_id)
    REFERENCES properties(property_id)
    ON DELETE CASCADE
);


CREATE TABLE bookings (
    booking_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    property_id BIGINT NOT NULL,

    tenant_id BIGINT NOT NULL,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    status ENUM(
        'PENDING',
        'APPROVED',
        'REJECTED',
        'COMPLETED',
        'CANCELLED'
    ) DEFAULT 'PENDING',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (property_id)
    REFERENCES properties(property_id),

    FOREIGN KEY (tenant_id)
    REFERENCES users(user_id)
);


CREATE TABLE payments (
    payment_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    booking_id BIGINT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    payment_status ENUM(
        'PENDING',
        'SUCCESS',
        'FAILED',
        'REFUNDED'
    ) DEFAULT 'PENDING',

    transaction_id VARCHAR(255),

    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id)
    REFERENCES bookings(booking_id)
);


CREATE TABLE wishlist (
    wishlist_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id BIGINT NOT NULL,

    property_id BIGINT NOT NULL,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,

    FOREIGN KEY (property_id)
    REFERENCES properties(property_id)
    ON DELETE CASCADE,

    UNIQUE(user_id, property_id)
);


CREATE TABLE reviews (
    review_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    property_id BIGINT NOT NULL,

    tenant_id BIGINT NOT NULL,

    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),

    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (property_id)
    REFERENCES properties(property_id)
    ON DELETE CASCADE,

    FOREIGN KEY (tenant_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,

    UNIQUE(property_id, tenant_id)
);


USE property_db;

-- USERS
INSERT INTO users(name,email,phone,password,role) VALUES
('Admin User','admin@gmail.com','9999999991','admin123','ADMIN'),
('Raj Owner','raj@gmail.com','9999999992','owner123','OWNER'),
('Priya Owner','priya@gmail.com','9999999993','owner123','OWNER'),
('Amit Tenant','amit@gmail.com','9999999994','tenant123','TENANT'),
('Neha Tenant','neha@gmail.com','9999999995','tenant123','TENANT');

-- PROPERTIES
INSERT INTO properties
(owner_id,title,description,address,city,price,property_type)
VALUES
(2,'Sea View Apartment','2 BHK near beach',
 'Juhu Beach Road','Mumbai',25000,'APARTMENT'),

(2,'Luxury Villa','4 BHK Villa with pool',
 'Palm Street','Goa',75000,'VILLA'),

(3,'Student PG','PG with WiFi and Food',
 'FC Road','Pune',8000,'PG'),

(3,'Independent House','3 BHK Family House',
 'Baner Road','Pune',30000,'HOUSE');

-- PROPERTY IMAGES
INSERT INTO property_images(property_id,image_url) VALUES
(1,'https://example.com/apartment1.jpg'),
(1,'https://example.com/apartment2.jpg'),
(2,'https://example.com/villa1.jpg'),
(3,'https://example.com/pg1.jpg'),
(4,'https://example.com/house1.jpg');

-- BOOKINGS
INSERT INTO bookings
(property_id,tenant_id,start_date,end_date,status)
VALUES
(1,4,'2025-07-01','2025-07-05','APPROVED'),
(2,4,'2025-07-15','2025-07-20','PENDING'),
(3,5,'2025-08-01','2025-08-10','APPROVED'),
(4,5,'2025-08-15','2025-08-25','REJECTED');

-- PAYMENTS
INSERT INTO payments
(booking_id,amount,payment_status,transaction_id)
VALUES
(1,5000,'SUCCESS','TXN1001'),
(2,7000,'PENDING','TXN1002'),
(3,3000,'SUCCESS','TXN1003'),
(4,0,'FAILED','TXN1004');

-- WISHLIST
INSERT INTO wishlist(user_id,property_id) VALUES
(4,2),
(4,3),
(5,1),
(5,4);

-- REVIEWS
INSERT INTO reviews
(property_id,tenant_id,rating,comment)
VALUES
(1,4,5,'Excellent property and location'),
(3,5,4,'Good PG with decent facilities'),
(2,4,5,'Amazing villa experience');

