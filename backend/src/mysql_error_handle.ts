import {type Response} from 'express'
class MysqlErrorHandle {
    constructor(readonly erro: unknown, readonly res: Response) {
    }
    validar() {
        console.log(this.erro);
        if (this.erro instanceof Error && 'code' in this.erro && this.erro.code === 'ECONNREFUSED') {
            this.res.status(500).json({ mensagem: "Erro: Ligue o LARAGON!" })
        }
        else if (this.erro instanceof Error && 'code' in this.erro && this.erro.code === 'ER_BAD_DB_ERROR') {
            this.res.status(500).json({ mensagem: "Erro: Crie o banco de dados ou confira se o nome está correto!" })
        }
        else if (this.erro instanceof Error && 'code' in this.erro && this.erro.code === 'ER_ACCESS_DENIED_ERROR') {
            this.res.status(500).json({ mensagem: "Erro: Confira o Usuario e Senha da Conexão!" })
        }
        else if (this.erro instanceof Error && 'code' in this.erro && this.erro.code === 'ER_NO_SUCH_TABLE') {
            this.res.status(500).json({ mensagem: "Erro: Confira o nome da tabela no banco ou crie a tabela!" })
        }
        else if (this.erro instanceof Error && 'code' in this.erro && this.erro.code === 'ER_PARSE_ERROR') {
            this.res.status(500).json({ mensagem: "Erro: Confira o código SQL do EXECUTE!" })
        }
        else {
            this.res.status(500).json({ mensagem: "Erro no servidor!" })
        }
    }
}
export default MysqlErrorHandle