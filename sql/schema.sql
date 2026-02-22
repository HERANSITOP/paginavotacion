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

CREATE TABLE IF NOT EXISTS voters (
    email_hash CHAR(64) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    option_id TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (option_id),
    CONSTRAINT fk_votes_option FOREIGN KEY (option_id) REFERENCES options(id)
);
