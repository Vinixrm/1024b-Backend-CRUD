import { type Response } from 'express'

class MysqlErrorHandle {
  constructor(readonly erro: unknown, readonly res: Response) {}

  validar() {
    console.log(this.erro)

    if (
      this.erro instanceof Error &&
      'code' in this.erro &&
      this.erro.code === 'ECONNREFUSED'
    ) {
      this.res.status(500).json({ mensagem: 'Erro: Ligue o LARAGON!' })
    } else if (
      this.erro instanceof Error &&
      'code' in this.erro &&
      this.erro.code === 'ER_BAD_DB_ERROR'
    ) {
      this.res
        .status(500)
        .json({ mensagem: 'Erro: Crie o banco de dados aula1.' })
    } else if (
      this.erro instanceof Error &&
      'code' in this.erro &&
      this.erro.code === 'ER_ACCESS_DENIED_ERROR'
    ) {
      this.res
        .status(500)
        .json({ mensagem: 'Erro: Confira usuario e senha da conexao.' })
    } else if (
      this.erro instanceof Error &&
      'code' in this.erro &&
      this.erro.code === 'ER_NO_SUCH_TABLE'
    ) {
      this.res
        .status(500)
        .json({ mensagem: 'Erro: Confira se a tabela manga foi criada.' })
    } else if (
      this.erro instanceof Error &&
      'code' in this.erro &&
      this.erro.code === 'ER_PARSE_ERROR'
    ) {
      this.res.status(500).json({ mensagem: 'Erro: Confira o SQL.' })
    } else if (
      this.erro instanceof Error &&
      'code' in this.erro &&
      this.erro.code === 'ER_DUP_ENTRY'
    ) {
      this.res
        .status(409)
        .json({ mensagem: 'Erro: Ja existe um registro com esses dados.' })
    } else {
      this.res.status(500).json({ mensagem: 'Erro no servidor!' })
    }
  }
}

export default MysqlErrorHandle
