CREATE DATABASE IF NOT EXISTS aula1;
USE aula1;

CREATE TABLE IF NOT EXISTS manga (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(180) NOT NULL,
  autor VARCHAR(120) NOT NULL,
  categoria VARCHAR(40) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  estoque INT NOT NULL DEFAULT 0,
  imagem_url TEXT,
  descricao TEXT,
  destaque BOOLEAN NOT NULL DEFAULT false,
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_modificacao DATETIME NULL
);

INSERT INTO manga
  (id, titulo, autor, categoria, preco, estoque, imagem_url, descricao, destaque)
VALUES
  (1, 'Naruto Vol. 1', 'Masashi Kishimoto', 'mangas', 34.90, 18, 'https://covers.openlibrary.org/b/isbn/9781569319000-L.jpg', 'O inicio da jornada ninja de Naruto Uzumaki.', true),
  (2, 'One Piece Vol. 1', 'Eiichiro Oda', 'mangas', 39.90, 15, 'https://covers.openlibrary.org/b/isbn/9781569319017-L.jpg', 'Luffy parte em busca do maior tesouro dos mares.', true),
  (3, 'Demon Slayer Vol. 1', 'Koyoharu Gotouge', 'mangas', 42.90, 12, 'https://covers.openlibrary.org/b/isbn/9781974700523-L.jpg', 'Tanjiro encara demonios para salvar sua irma.', true),
  (4, 'Chainsaw Man Vol. 1', 'Tatsuki Fujimoto', 'mangas', 44.90, 10, 'https://covers.openlibrary.org/b/isbn/9781974709939-L.jpg', 'Acao brutal, humor estranho e um anti-heroi memoravel.', false),
  (5, 'Jujutsu Kaisen Vol. 1', 'Gege Akutami', 'mangas', 41.90, 14, 'https://covers.openlibrary.org/b/isbn/9781974710027-L.jpg', 'Maldicoes, escolas ocultas e combates sobrenaturais.', false),
  (6, 'Batman: Ano Um', 'Frank Miller', 'super-herois', 64.90, 8, 'https://covers.openlibrary.org/b/isbn/9781401207526-L.jpg', 'Uma das origens definitivas do Cavaleiro das Trevas.', true),
  (7, 'Ms. Marvel Vol. 1', 'G. Willow Wilson', 'super-herois', 59.90, 7, 'https://covers.openlibrary.org/b/isbn/9780785190219-L.jpg', 'Kamala Khan descobre seus poderes e sua propria voz.', false),
  (8, 'Watchmen', 'Alan Moore', 'hqs', 89.90, 6, 'https://covers.openlibrary.org/b/isbn/9780930289232-L.jpg', 'Uma HQ adulta sobre poder, vigilancia e moralidade.', true),
  (9, 'Heartstopper Vol. 1', 'Alice Oseman', 'romance', 49.90, 11, 'https://covers.openlibrary.org/b/isbn/9781338617436-L.jpg', 'Romance delicado sobre amizade, afeto e descoberta.', true),
  (10, 'A Silent Voice Vol. 1', 'Yoshitoki Oima', 'romance', 43.90, 9, 'https://covers.openlibrary.org/b/isbn/9781632360564-L.jpg', 'Uma historia sensivel sobre culpa, reparacao e empatia.', false)
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  autor = VALUES(autor),
  categoria = VALUES(categoria),
  preco = VALUES(preco),
  estoque = VALUES(estoque),
  imagem_url = VALUES(imagem_url),
  descricao = VALUES(descricao),
  destaque = VALUES(destaque);

CREATE TABLE IF NOT EXISTS clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  cidade VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  numero_pedido VARCHAR(50) NOT NULL UNIQUE,
  total DECIMAL(10,2) NOT NULL,
  data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

INSERT INTO clientes (id, nome, cidade) VALUES
  (1, 'Ana Silva', 'São Paulo'),
  (2, 'Bruno Costa', 'Rio de Janeiro'),
  (3, 'Carla Mendes', 'Belo Horizonte')
ON DUPLICATE KEY UPDATE
  nome = VALUES(nome),
  cidade = VALUES(cidade);

INSERT INTO pedidos (id, cliente_id, numero_pedido, total) VALUES
  (1, 1, 'PED-1001', 89.90),
  (2, 2, 'PED-1002', 129.80),
  (3, 3, 'PED-1003', 59.90)
ON DUPLICATE KEY UPDATE
  cliente_id = VALUES(cliente_id),
  numero_pedido = VALUES(numero_pedido),
  total = VALUES(total);

-- SELECT com WHERE
SELECT id, titulo, categoria, preco
FROM manga
WHERE categoria = 'mangas' AND destaque = true
ORDER BY titulo;

-- INNER JOIN
SELECT c.nome, p.numero_pedido, p.total
FROM clientes c
INNER JOIN pedidos p ON c.id = p.cliente_id
ORDER BY p.numero_pedido;

-- LEFT JOIN
SELECT c.nome, p.numero_pedido, p.total
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id
ORDER BY c.id;

-- RIGHT JOIN
SELECT c.nome, p.numero_pedido, p.total
FROM pedidos p
RIGHT JOIN clientes c ON p.cliente_id = c.id
ORDER BY c.id;

-- GROUP BY + HAVING
SELECT categoria, COUNT(*) AS total, SUM(estoque) AS estoque_total
FROM manga
GROUP BY categoria
HAVING COUNT(*) >= 2
ORDER BY total DESC;

-- Subconsulta
SELECT titulo, preco
FROM manga
WHERE preco > (SELECT AVG(preco) FROM manga)
ORDER BY preco DESC;
