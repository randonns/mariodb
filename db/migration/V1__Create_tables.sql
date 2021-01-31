
CREATE TABLE Users
(
	id                   INTEGER AUTO_INCREMENT,
	name                 VARCHAR(100) NOT NULL,
	age                  INTEGER NOT NULL,
	deleted              TINYINT(1) NOT NULL,
	createdAt            DATETIME NOT NULL,
	PRIMARY KEY (id)
);
