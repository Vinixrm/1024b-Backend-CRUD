import express from 'express';
import cors from 'cors';
import connection from './mysql_connection.js';
import MysqlErrorHandle from './mysql_error_handle.js';
import { type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';

const app = express();

app.use(cors());
app.use(express.json());

interface IPessoa extends RowDataPacket {
  id: number;
  nome: string;
}

interface IProduto extends RowDataPacket {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  data_criacao: Date;
  data_modificacao: Date | null;
}

// ==================== ROTAS PESSOA ====================

// GET /pessoas
app.get('/pessoas', async (req, res) => {
  try {
    const [dados] = await connection.execute<IPessoa[]>('SELECT * FROM pessoa');
    return res.status(200).json(dados);
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

// POST /pessoas
app.post('/pessoas', async (req, res) => {
  const { id, nome } = req.body;

  if (!id || !nome) {
    return res.status(400).json({
      mensagem: 'Campos id e nome são obrigatórios!',
    });
  }

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO pessoa (id, nome) VALUES (?, ?)',
      [id, nome]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        mensagem: 'Erro ao cadastrar pessoa!',
      });
    }

    return res.status(201).json({
      mensagem: 'Pessoa cadastrada com sucesso!',
    });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

// PATCH /pessoa/:id
app.patch('/pessoa/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({
      mensagem: 'O campo nome é obrigatório!',
    });
  }

  try {
    const [rows] = await connection.execute<IPessoa[]>(
      'SELECT * FROM pessoa WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Pessoa não encontrada!',
      });
    }

    const [result] = await connection.execute<ResultSetHeader>(
      'UPDATE pessoa SET nome = ? WHERE id = ?',
      [nome, id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        mensagem: 'Erro ao atualizar pessoa!',
      });
    }

    return res.status(200).json({
      mensagem: 'Pessoa atualizada com sucesso!',
    });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

// DELETE /pessoa/:id
app.delete('/pessoa/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM pessoa WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Pessoa não encontrada!',
      });
    }

    return res.status(200).json({
      mensagem: 'Pessoa deletada com sucesso!',
    });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

// ==================== ROTAS PRODUTO ====================

// GET /produtos
app.get('/produtos', async (req, res) => {
  try {
    const [dados] = await connection.execute<IProduto[]>('SELECT * FROM produto');
    return res.status(200).json(dados);
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

// POST /produtos
app.post('/produtos', async (req, res) => {
  const { id, nome, categoria, preco } = req.body;

  if (!id || !nome || !categoria || preco === undefined) {
    return res.status(400).json({
      mensagem: 'Campos id, nome, categoria e preco são obrigatórios!',
    });
  }

  const dataCriacao = new Date();
  const dataModificacao = null;

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO produto (id, nome, categoria, preco, data_criacao, data_modificacao) VALUES (?, ?, ?, ?, ?, ?)',
      [id, nome, categoria, preco, dataCriacao, dataModificacao]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        mensagem: 'Erro ao cadastrar produto!',
      });
    }

    return res.status(201).json({
      mensagem: 'Produto cadastrado com sucesso!',
    });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

// PATCH /produto/:id
app.patch('/produto/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, categoria, preco } = req.body;

  try {
    const [rows] = await connection.execute<IProduto[]>(
      'SELECT * FROM produto WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado!',
      });
    }

    const produtoAtual = rows[0] as IProduto;

    const novoNome = nome ?? produtoAtual.nome;
    const novaCategoria = categoria ?? produtoAtual.categoria;
    const novoPreco = preco ?? produtoAtual.preco;
    const dataModificacao = new Date();

    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE produto
       SET nome = ?, categoria = ?, preco = ?, data_modificacao = ?
       WHERE id = ?`,
      [novoNome, novaCategoria, novoPreco, dataModificacao, id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        mensagem: 'Erro ao atualizar produto!',
      });
    }

    return res.status(200).json({
      mensagem: 'Produto atualizado com sucesso!',
    });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

// DELETE /produto/:id
app.delete('/produto/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM produto WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado!',
      });
    }

    return res.status(200).json({
      mensagem: 'Produto deletado com sucesso!',
    });
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

app.listen(8000, () => {
  console.log('Servidor iniciado na porta 8000');
});