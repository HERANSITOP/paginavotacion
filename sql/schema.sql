CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(128) PRIMARY KEY,
    data TEXT,
    last_activity INT
);

CREATE TABLE IF NOT EXISTS options (
    id TINYINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT INTO options (id, name) VALUES
(1,'Anormalidad Academica'),
(2,'Asamblea Escalonada'),
(3,'Asamblea Permanente'),
(4,'Paro'),
(5,'Normalidad');

CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email_hash VARCHAR(64) NOT NULL,
    option_id TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (email_hash)
);
