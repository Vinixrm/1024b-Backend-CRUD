CREATE DATABASE IF NOT EXISTS aula1;
USE aula1;

CREATE TABLE pessoa (
  id INT NOT NULL,
  nome VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE produto (
  id INT PRIMARY KEY,
  nome VARCHAR(300),
  categoria VARCHAR(300),
  preco DECIMAL(10,2),
  data_criacao DATETIME,
  data_modificacao DATETIME
);