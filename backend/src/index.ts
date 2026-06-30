import express from 'express';
import cors from 'cors';
import connection from './mysql_connection.js';
import MysqlErrorHandle from './mysql_error_handle.js';
import { type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

const categoriasPermitidas = ['mangas', 'super-herois', 'hqs', 'romance'] as const;

type Categoria = (typeof categoriasPermitidas)[number];

interface IManga extends RowDataPacket {
  id: number;
  titulo: string;
  autor: string;
  categoria: Categoria;
  preco: string | number;
  estoque: number;
  imagem_url: string;
  descricao: string;
  destaque: number | boolean;
  data_criacao: Date;
  data_modificacao: Date | null;
}

interface IResumoCategoria extends RowDataPacket {
  categoria: Categoria;
  total: number;
  estoque: number;
  preco_medio: string | number | null;
}

interface ITotal extends RowDataPacket {
  total: number;
}

interface MangaInput {
  titulo: string;
  autor: string;
  categoria: Categoria;
  preco: number;
  estoque: number;
  imagem_url: string;
  descricao: string;
  destaque: boolean;
}

const mangasIniciais: MangaInput[] = [
  {
    titulo: 'Naruto Vol. 1',
    autor: 'Masashi Kishimoto',
    categoria: 'mangas',
    preco: 34.9,
    estoque: 18,
    imagem_url: 'https://covers.openlibrary.org/b/isbn/9781569319000-L.jpg',
    descricao: 'O inicio da jornada ninja de Naruto Uzumaki.',
    destaque: true,
  },
  {
    titulo: 'One Piece Vol. 1',
    autor: 'Eiichiro Oda',
    categoria: 'mangas',
    preco: 39.9,
    estoque: 15,
    imagem_url: 'https://covers.openlibrary.org/b/isbn/9781569319017-L.jpg',
    descricao: 'Luffy parte em busca do maior tesouro dos mares.',
    destaque: true,
  },
  {
    titulo: 'Demon Slayer Vol. 1',
    autor: 'Koyoharu Gotouge',
    categoria: 'mangas',
    preco: 42.9,
    estoque: 12,
    imagem_url: 'https://covers.openlibrary.org/b/isbn/9781974700523-L.jpg',
    descricao: 'Tanjiro encara demonios para salvar sua irma.',
    destaque: true,
  },
  {
    titulo: 'Chainsaw Man Vol. 1',
    autor: 'Tatsuki Fujimoto',
    categoria: 'mangas',
    preco: 44.9,
    estoque: 10,
    imagem_url: 'https://covers.openlibrary.org/b/isbn/9781974709939-L.jpg',
    descricao: 'Acao brutal, humor estranho e um anti-heroi memoravel.',
    destaque: false,
  },
  {
    titulo: 'Jujutsu Kaisen Vol. 1',
    autor: 'Gege Akutami',
    categoria: 'mangas',
    preco: 41.9,
    estoque: 14,
    imagem_url: 'https://covers.openlibrary.org/b/isbn/9781974710027-L.jpg',
    descricao: 'Maldicoes, escolas ocultas e combates sobrenaturais.',
    destaque: false,
  },
  {
    titulo: 'Batman: Ano Um',
    autor: 'Frank Miller',
    categoria: 'super-herois',
    preco: 64.9,
    estoque: 8,
    imagem_url: 'https://covers.openlibrary.org/b/isbn/9781401207526-L.jpg',
    descricao: 'Uma das origens definitivas do Cavaleiro das Trevas.',
    destaque: true,
  },
  {
    titulo: 'Ms. Marvel Vol. 1',
    autor: 'G. Willow Wilson',
    categoria: 'super-herois',
    preco: 59.9,
    estoque: 7,
    imagem_url: 'https://covers.openlibrary.org/b/isbn/9780785190219-L.jpg',
    descricao: 'Kamala Khan descobre seus poderes e sua propria voz.',
    destaque: false,
  },
  {
    titulo: 'Watchmen',
    autor: 'Alan Moore',
    categoria: 'hqs',
    preco: 89.9,
    estoque: 6,
    imagem_url: 'https://covers.openlibrary.org/b/isbn/9780930289232-L.jpg',
    descricao: 'Uma HQ adulta sobre poder, vigilancia e moralidade.',
    destaque: true,
  },
  {
    titulo: 'Heartstopper Vol. 1',
    autor: 'Alice Oseman',
    categoria: 'romance',
    preco: 49.9,
    estoque: 11,
    imagem_url: 'https://covers.openlibrary.org/b/isbn/9781338617436-L.jpg',
    descricao: 'Romance delicado sobre amizade, afeto e descoberta.',
    destaque: true,
  },
  {
    titulo: 'A Silent Voice Vol. 1',
    autor: 'Yoshitoki Oima',
    categoria: 'romance',
    preco: 43.9,
    estoque: 9,
    imagem_url: 'https://covers.openlibrary.org/b/isbn/9781632360564-L.jpg',
    descricao: 'Uma historia sensivel sobre culpa, reparacao e empatia.',
    destaque: false,
  },
];

function categoriaExiste(categoria: string): categoria is Categoria {
  return categoriasPermitidas.includes(categoria as Categoria);
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

function numero(valor: unknown): number {
  if (typeof valor === 'number') {
    return valor;
  }

  if (typeof valor === 'string' && valor.trim() !== '') {
    return Number(valor);
  }

  return Number.NaN;
}

function booleano(valor: unknown): boolean {
  if (typeof valor === 'boolean') {
    return valor;
  }

  if (typeof valor === 'number') {
    return valor === 1;
  }

  if (typeof valor === 'string') {
    return ['true', '1', 'sim', 'on'].includes(valor.toLowerCase());
  }

  return false;
}

function serializarManga(manga: IManga) {
  return {
    ...manga,
    preco: Number(manga.preco),
    destaque: Boolean(manga.destaque),
  };
}

function validarManga(body: Record<string, unknown>, parcial = false) {
  const dados: Partial<MangaInput> = {};
  const erros: string[] = [];

  if (!parcial || body.titulo !== undefined) {
    const titulo = texto(body.titulo);
    if (!titulo) {
      erros.push('Titulo e obrigatorio.');
    } else {
      dados.titulo = titulo;
    }
  }

  if (!parcial || body.autor !== undefined) {
    const autor = texto(body.autor);
    if (!autor) {
      erros.push('Autor e obrigatorio.');
    } else {
      dados.autor = autor;
    }
  }

  if (!parcial || body.categoria !== undefined) {
    const categoria = texto(body.categoria);
    if (!categoriaExiste(categoria)) {
      erros.push('Categoria invalida.');
    } else {
      dados.categoria = categoria;
    }
  }

  if (!parcial || body.preco !== undefined) {
    const preco = numero(body.preco);
    if (Number.isNaN(preco) || preco <= 0) {
      erros.push('Preco deve ser maior que zero.');
    } else {
      dados.preco = preco;
    }
  }

  if (!parcial || body.estoque !== undefined) {
    const estoque = numero(body.estoque);
    if (!Number.isInteger(estoque) || estoque < 0) {
      erros.push('Estoque deve ser um numero inteiro maior ou igual a zero.');
    } else {
      dados.estoque = estoque;
    }
  }

  if (!parcial || body.imagem_url !== undefined) {
    dados.imagem_url = texto(body.imagem_url);
  }

  if (!parcial || body.descricao !== undefined) {
    dados.descricao = texto(body.descricao);
  }

  if (!parcial || body.destaque !== undefined) {
    dados.destaque = booleano(body.destaque);
  }

  if (parcial && Object.keys(dados).length === 0) {
    erros.push('Informe ao menos um campo para atualizar.');
  }

  return { dados, erros };
}

async function prepararBanco() {
  try {
    await connection.execute('SELECT 1');
  } catch (erro) {
    console.warn('Banco MySQL indisponível. Pulando inicialização da tabela manga.', erro);
    return;
  }

  const createTableSql = connection.isSqlite
    ? `
      CREATE TABLE IF NOT EXISTS manga (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      )
    `
    : `
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
      )
    `;

  await connection.execute(createTableSql);

  const createClientesSql = connection.isSqlite
    ? `
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cidade TEXT NOT NULL
      )
    `
    : `
      CREATE TABLE IF NOT EXISTS clientes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nome VARCHAR(120) NOT NULL,
        cidade VARCHAR(120) NOT NULL
      )
    `;

  const createPedidosSql = connection.isSqlite
    ? `
      CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        numero_pedido TEXT NOT NULL UNIQUE,
        total DECIMAL(10,2) NOT NULL,
        data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `
    : `
      CREATE TABLE IF NOT EXISTS pedidos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        cliente_id INT NOT NULL,
        numero_pedido VARCHAR(50) NOT NULL UNIQUE,
        total DECIMAL(10,2) NOT NULL,
        data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `;

  await connection.execute(createClientesSql);
  await connection.execute(createPedidosSql);

  const [linhas] = await connection.execute<ITotal[]>(
    'SELECT COUNT(*) AS total FROM manga'
  );

  if (linhas[0]?.total !== 0) {
    const [contagemClientes] = await connection.execute<ITotal[]>(
      'SELECT COUNT(*) AS total FROM clientes'
    );

    if (contagemClientes[0]?.total === 0) {
      await connection.execute(
        'INSERT INTO clientes (nome, cidade) VALUES (?, ?), (?, ?), (?, ?)',
        ['Ana Silva', 'São Paulo', 'Bruno Costa', 'Rio de Janeiro', 'Carla Mendes', 'Belo Horizonte']
      );

      await connection.execute(
        'INSERT INTO pedidos (cliente_id, numero_pedido, total) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)',
        [1, 'PED-1001', 89.9, 2, 'PED-1002', 129.8, 3, 'PED-1003', 59.9]
      );
    }

    return;
  }

  for (const manga of mangasIniciais) {
    await connection.execute<ResultSetHeader>(
      `INSERT INTO manga
        (titulo, autor, categoria, preco, estoque, imagem_url, descricao, destaque)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        manga.titulo,
        manga.autor,
        manga.categoria,
        manga.preco,
        manga.estoque,
        manga.imagem_url,
        manga.descricao,
        manga.destaque,
      ]
    );
  }

  await connection.execute(
    'INSERT INTO clientes (nome, cidade) VALUES (?, ?), (?, ?), (?, ?)',
    ['Ana Silva', 'São Paulo', 'Bruno Costa', 'Rio de Janeiro', 'Carla Mendes', 'Belo Horizonte']
  );

  await connection.execute(
    'INSERT INTO pedidos (cliente_id, numero_pedido, total) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)',
    [1, 'PED-1001', 89.9, 2, 'PED-1002', 129.8, 3, 'PED-1003', 59.9]
  );
}

app.get('/health', (_req, res) => {
  return res.status(200).json({ mensagem: 'API da Manga Store online.' });
});

app.get('/sql/exemplos', async (_req, res) => {
  return res.status(200).json({
    mensagem: 'Exemplos de consultas SQL disponíveis.',
    exemplos: [
      '/sql/exemplos/where',
      '/sql/exemplos/inner-join',
      '/sql/exemplos/left-join',
      '/sql/exemplos/right-join',
      '/sql/exemplos/group-by',
      '/sql/exemplos/subconsulta',
    ],
  });
});

app.get('/sql/exemplos/:tipo', async (req, res) => {
  const tipo = req.params.tipo;

  try {
    if (tipo === 'where') {
      const [dados] = await connection.execute<Array<{ id: number; titulo: string; categoria: string; preco: number }>>(
        'SELECT id, titulo, categoria, preco FROM manga WHERE categoria = ? AND destaque = ? ORDER BY titulo',
        ['mangas', 1]
      );

      return res.status(200).json({
        descricao: 'SELECT com WHERE para filtrar obras por categoria e destaque.',
        sql: 'SELECT id, titulo, categoria, preco FROM manga WHERE categoria = ? AND destaque = ? ORDER BY titulo',
        dados,
      });
    }

    if (tipo === 'inner-join') {
      const [dados] = await connection.execute<Array<{ nome: string; numero_pedido: string; total: number }>>(
        `SELECT c.nome, p.numero_pedido, p.total
         FROM clientes c
         INNER JOIN pedidos p ON c.id = p.cliente_id
         ORDER BY p.numero_pedido`
      );

      return res.status(200).json({
        descricao: 'INNER JOIN para relacionar clientes com seus pedidos.',
        sql: 'SELECT c.nome, p.numero_pedido, p.total FROM clientes c INNER JOIN pedidos p ON c.id = p.cliente_id ORDER BY p.numero_pedido',
        dados,
      });
    }

    if (tipo === 'left-join') {
      const [dados] = await connection.execute<Array<{ nome: string; numero_pedido: string | null; total: number | null }>>(
        `SELECT c.nome, p.numero_pedido, p.total
         FROM clientes c
         LEFT JOIN pedidos p ON c.id = p.cliente_id
         ORDER BY c.id`
      );

      return res.status(200).json({
        descricao: 'LEFT JOIN para listar todos os clientes, mesmo sem pedidos.',
        sql: 'SELECT c.nome, p.numero_pedido, p.total FROM clientes c LEFT JOIN pedidos p ON c.id = p.cliente_id ORDER BY c.id',
        dados,
      });
    }

    if (tipo === 'right-join') {
      const [dados] = await connection.execute<Array<{ nome: string; numero_pedido: string | null; total: number | null }>>(
        `SELECT c.nome, p.numero_pedido, p.total
         FROM pedidos p
         RIGHT JOIN clientes c ON p.cliente_id = c.id
         ORDER BY c.id`
      );

      return res.status(200).json({
        descricao: 'RIGHT JOIN para listar todos os clientes mesmo quando não houver pedidos.',
        sql: 'SELECT c.nome, p.numero_pedido, p.total FROM pedidos p RIGHT JOIN clientes c ON p.cliente_id = c.id ORDER BY c.id',
        dados,
      });
    }

    if (tipo === 'group-by') {
      const [dados] = await connection.execute<Array<{ categoria: string; total: number; estoque_total: number }>>(
        `SELECT categoria, COUNT(*) AS total, SUM(estoque) AS estoque_total
         FROM manga
         GROUP BY categoria
         HAVING COUNT(*) >= 2
         ORDER BY total DESC`
      );

      return res.status(200).json({
        descricao: 'GROUP BY e HAVING para agrupar obras por categoria e filtrar grupos.',
        sql: 'SELECT categoria, COUNT(*) AS total, SUM(estoque) AS estoque_total FROM manga GROUP BY categoria HAVING COUNT(*) >= 2 ORDER BY total DESC',
        dados,
      });
    }

    if (tipo === 'subconsulta') {
      const [dados] = await connection.execute<Array<{ titulo: string; preco: number }>>(
        `SELECT titulo, preco
         FROM manga
         WHERE preco > (SELECT AVG(preco) FROM manga)
         ORDER BY preco DESC`
      );

      return res.status(200).json({
        descricao: 'Subconsulta para buscar obras acima da média de preço.',
        sql: 'SELECT titulo, preco FROM manga WHERE preco > (SELECT AVG(preco) FROM manga) ORDER BY preco DESC',
        dados,
      });
    }

    return res.status(404).json({ mensagem: 'Tipo de exemplo SQL nao encontrado.' });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

app.get('/categorias', async (_req, res) => {
  try {
    const [dados] = await connection.execute<IResumoCategoria[]>(
      `SELECT
        categoria,
        COUNT(*) AS total,
        COALESCE(SUM(estoque), 0) AS estoque,
        AVG(preco) AS preco_medio
       FROM manga
       GROUP BY categoria
       ORDER BY categoria`
    );

    return res.status(200).json(
      dados.map((item) => ({
        categoria: item.categoria,
        total: Number(item.total),
        estoque: Number(item.estoque),
        preco_medio: Number(item.preco_medio ?? 0),
      }))
    );
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

app.get('/mangas', async (req, res) => {
  const categoria = texto(req.query.categoria);
  const busca = texto(req.query.busca);
  const destaque = texto(req.query.destaque);
  const filtros: string[] = [];
  const parametros: Array<string | number | boolean> = [];

  if (categoria) {
    if (!categoriaExiste(categoria)) {
      return res.status(400).json({ mensagem: 'Categoria invalida.' });
    }

    filtros.push('categoria = ?');
    parametros.push(categoria);
  }

  if (busca) {
    filtros.push('(titulo LIKE ? OR autor LIKE ? OR descricao LIKE ?)');
    parametros.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
  }

  if (destaque === 'true') {
    filtros.push('destaque = ?');
    parametros.push(true);
  }

  const where = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

  try {
    const [dados] = await connection.execute<IManga[]>(
      `SELECT * FROM manga ${where} ORDER BY destaque DESC, titulo ASC`,
      parametros
    );

    return res.status(200).json(dados.map(serializarManga));
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

app.get('/mangas/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensagem: 'ID invalido.' });
  }

  try {
    const [dados] = await connection.execute<IManga[]>(
      'SELECT * FROM manga WHERE id = ?',
      [id]
    );

    if (dados.length === 0) {
      return res.status(404).json({ mensagem: 'Manga nao encontrado.' });
    }

    return res.status(200).json(serializarManga(dados[0] as IManga));
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

app.post('/mangas', async (req, res) => {
  const { dados, erros } = validarManga(req.body as Record<string, unknown>);

  if (erros.length > 0) {
    return res.status(400).json({ mensagem: erros.join(' ') });
  }

  const manga = dados as MangaInput;

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO manga
        (titulo, autor, categoria, preco, estoque, imagem_url, descricao, destaque)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        manga.titulo,
        manga.autor,
        manga.categoria,
        manga.preco,
        manga.estoque,
        manga.imagem_url,
        manga.descricao,
        manga.destaque,
      ]
    );

    const [criado] = await connection.execute<IManga[]>(
      'SELECT * FROM manga WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      mensagem: 'Manga cadastrado com sucesso!',
      manga: serializarManga(criado[0] as IManga),
    });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

app.patch('/mangas/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensagem: 'ID invalido.' });
  }

  const { dados, erros } = validarManga(
    req.body as Record<string, unknown>,
    true
  );

  if (erros.length > 0) {
    return res.status(400).json({ mensagem: erros.join(' ') });
  }

  const atualizacoes: string[] = [];
  const valores: Array<string | number | boolean> = [];

  if (dados.titulo !== undefined) {
    atualizacoes.push('titulo = ?');
    valores.push(dados.titulo);
  }

  if (dados.autor !== undefined) {
    atualizacoes.push('autor = ?');
    valores.push(dados.autor);
  }

  if (dados.categoria !== undefined) {
    atualizacoes.push('categoria = ?');
    valores.push(dados.categoria);
  }

  if (dados.preco !== undefined) {
    atualizacoes.push('preco = ?');
    valores.push(dados.preco);
  }

  if (dados.estoque !== undefined) {
    atualizacoes.push('estoque = ?');
    valores.push(dados.estoque);
  }

  if (dados.imagem_url !== undefined) {
    atualizacoes.push('imagem_url = ?');
    valores.push(dados.imagem_url);
  }

  if (dados.descricao !== undefined) {
    atualizacoes.push('descricao = ?');
    valores.push(dados.descricao);
  }

  if (dados.destaque !== undefined) {
    atualizacoes.push('destaque = ?');
    valores.push(dados.destaque);
  }

  valores.push(id);

  try {
    const nowFunction = connection.isSqlite ? 'CURRENT_TIMESTAMP' : 'NOW()';

    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE manga
       SET ${atualizacoes.join(', ')}, data_modificacao = ${nowFunction}
       WHERE id = ?`,
      valores
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Manga nao encontrado.' });
    }

    const [atualizado] = await connection.execute<IManga[]>(
      'SELECT * FROM manga WHERE id = ?',
      [id]
    );

    return res.status(200).json({
      mensagem: 'Manga atualizado com sucesso!',
      manga: serializarManga(atualizado[0] as IManga),
    });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

app.delete('/mangas/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ mensagem: 'ID invalido.' });
  }

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM manga WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Manga nao encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Manga deletado com sucesso!' });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

prepararBanco()
  .catch((erro: unknown) => {
    console.error('Nao foi possivel preparar a tabela manga.', erro);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Servidor iniciado na porta ${PORT}`);
    });
  });
