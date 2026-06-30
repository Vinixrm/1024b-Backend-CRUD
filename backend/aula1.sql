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
