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

