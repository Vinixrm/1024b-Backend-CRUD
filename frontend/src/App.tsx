import { useEffect, useState } from 'react';

interface Pessoa {
  id: number;
  nome: string;
}

function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [novoId, setNovoId] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarPessoas() {
      try {
        const resposta = await fetch('http://localhost:8000/pessoas');

        if (!resposta.ok) {
          throw new Error('Erro ao buscar pessoas');
        }

        const dados = await resposta.json();
        setPessoas(dados);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setErro(e.message);
        } else {
          setErro('Erro inesperado');
        }
      } finally {
        setCarregando(false);
      }
    }

    carregarPessoas();
  }, []);

  async function handleSalvar() {
    try {
      setSalvando(true);

      const resposta = await fetch('http://localhost:8000/pessoas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: Number(novoId),
          nome: novoNome,
        }),
      });

      if (!resposta.ok) {
        const erroResposta = await resposta.json();
        throw new Error(erroResposta.mensagem || 'Erro ao cadastrar pessoa');
      }

      setNovoId('');
      setNovoNome('');

      const respostaLista = await fetch('http://localhost:8000/pessoas');
      const dadosAtualizados = await respostaLista.json();
      setPessoas(dadosAtualizados);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert('Erro desconhecido ao salvar');
      }
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar(id: number) {
    try {
      const resposta = await fetch(`http://localhost:8000/pessoa/${id}`, {
        method: 'DELETE',
      });

      if (!resposta.ok) {
        const erroResposta = await resposta.json();
        throw new Error(erroResposta.mensagem || 'Erro ao deletar pessoa');
      }

      setPessoas((listaAtual) =>
        listaAtual.filter((pessoa) => pessoa.id !== id)
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert('Erro desconhecido ao deletar.');
      }
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Lista de Pessoas</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Cadastrar pessoa</h2>

        <div style={{ marginBottom: '10px' }}>
          <label>
            ID:{' '}
            <input
              type="number"
              value={novoId}
              onChange={(e) => setNovoId(e.target.value)}
            />
          </label>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>
            Nome:{' '}
            <input
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />
          </label>
        </div>

        <button onClick={handleSalvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {carregando && <p>Carregando...</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {!carregando && !erro && pessoas.length === 0 && (
        <p>Nenhuma pessoa encontrada.</p>
      )}

      <ul>
        {pessoas.map((pessoa) => (
          <li key={pessoa.id}>
            {pessoa.id} - {pessoa.nome}{' '}
            <button onClick={() => handleDeletar(pessoa.id)}>
              Deletar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;