import { useEffect, useState } from 'react';

interface Pessoa {
  id: number;
  nome: string;
}

interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  data_criacao: string;
  data_modificacao: string | null;
}

type Aba = 'pessoas' | 'produtos';

function App() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [novoId, setNovoId] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nomeEditado, setNomeEditado] = useState('');

  const [abaAtiva, setAbaAtiva] = useState<Aba>('pessoas');
  const [temaEscuro, setTemaEscuro] = useState(false);

  const [produtos, setProdutos] = useState<Produto[]>([]);

const [novoProdutoId, setNovoProdutoId] = useState('');
const [novoProdutoNome, setNovoProdutoNome] = useState('');
const [novaCategoria, setNovaCategoria] = useState('');
const [novoPreco, setNovoPreco] = useState('');

const [editandoProdutoId, setEditandoProdutoId] = useState<number | null>(null);

const [produtoEditado, setProdutoEditado] = useState({
  nome: '',
  categoria: '',
  preco: '',
});

  async function carregarProdutos() {
  try {
    const resposta = await fetch('http://localhost:8000/produtos');

    if (!resposta.ok) {
      throw new Error('Erro ao buscar produtos');
    }

    const dados = await resposta.json();
    setProdutos(dados);
  } catch (erro) {
    console.error(erro);
  }
}

async function handleSalvarProduto() {
  try {
    const id = Number(novoProdutoId);
    const preco = Number(novoPreco);

    if (
      novoProdutoId.trim() === '' ||
      novoProdutoNome.trim() === '' ||
      novaCategoria.trim() === '' ||
      novoPreco.trim() === ''
    ) {
      alert('Preencha todos os campos do produto.');
      return;
    }

    if (Number.isNaN(id) || Number.isNaN(preco) || id <= 0) {
      alert('ID e preço devem ser números válidos.');
      return;
    }

    const resposta = await fetch('http://localhost:8000/produtos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        nome: novoProdutoNome,
        categoria: novaCategoria,
        preco,
      }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.mensagem);
    }

    setNovoProdutoId('');
    setNovoProdutoNome('');
    setNovaCategoria('');
    setNovoPreco('');

    await carregarProdutos();
  } catch (erro) {
    if (erro instanceof Error) {
      alert(erro.message);
    }
  }
}

async function handleDeletarProduto(id: number) {
  try {
    const resposta = await fetch(
      `http://localhost:8000/produto/${id}`,
      {
        method: 'DELETE',
      }
    );

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.mensagem);
    }

    setProdutos((lista) =>
      lista.filter((produto) => produto.id !== id)
    );
  } catch (erro) {
    if (erro instanceof Error) {
      alert(erro.message);
    }
  }
}

function iniciarEdicaoProduto(produto: Produto) {
  setEditandoProdutoId(produto.id);

  setProdutoEditado({
    nome: produto.nome,
    categoria: produto.categoria,
    preco: String(produto.preco),
  });
}

function cancelarEdicaoProduto() {
  setEditandoProdutoId(null);

  setProdutoEditado({
    nome: '',
    categoria: '',
    preco: '',
  });
}

async function handleEditarProduto(id: number) {
  try {
    const precoEditado = Number(produtoEditado.preco);

    if (
      produtoEditado.nome.trim() === '' ||
      produtoEditado.categoria.trim() === '' ||
      produtoEditado.preco.trim() === ''
    ) {
      alert('Preencha todos os campos do produto.');
      return;
    }

    if (Number.isNaN(precoEditado)) {
      alert('Preço deve ser um número válido.');
      return;
    }

    const resposta = await fetch(
      `http://localhost:8000/produto/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: produtoEditado.nome,
          categoria: produtoEditado.categoria,
          preco: precoEditado,
        }),
      }
    );

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.mensagem);
    }

    await carregarProdutos();

    setEditandoProdutoId(null);
  } catch (erro) {
    if (erro instanceof Error) {
      alert(erro.message);
    }
  }
}

  useEffect(() => {
    async function carregarPessoas() {
      try {
        setCarregando(true);
        setErro(null);

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

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function recarregarPessoas() {
    try {
      setCarregando(true);
      setErro(null);

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
      await recarregarPessoas();
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

  async function handleEditar(id: number) {
    try {
      const resposta = await fetch(`http://localhost:8000/pessoa/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nomeEditado,
        }),
      });

      if (!resposta.ok) {
        const erroResposta = await resposta.json();
        throw new Error(erroResposta.mensagem || 'Erro ao editar pessoa');
      }

      setPessoas((listaAtual) =>
        listaAtual.map((pessoa) =>
          pessoa.id === id ? { ...pessoa, nome: nomeEditado } : pessoa
        )
      );

      setEditandoId(null);
      setNomeEditado('');
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert('Erro desconhecido ao editar.');
      }
    }
  }

  function iniciarEdicao(id: number, nome: string) {
    setEditandoId(id);
    setNomeEditado(nome);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setNomeEditado('');
  }

  function alternarTema() {
    setTemaEscuro((valorAtual) => !valorAtual);
  }

  function gerarIniciais(nome: string) {
    return nome
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('');
  }

  const estilos = {
    app: {
      minHeight: '100vh',
      backgroundColor: temaEscuro ? '#171614' : '#f7f6f2',
      color: temaEscuro ? '#cdccca' : '#28251d',
      fontFamily: 'Arial, sans-serif',
      transition: 'all 0.2s ease',
    } as React.CSSProperties,

    topbar: {
      height: '60px',
      borderBottom: temaEscuro ? '1px solid #393836' : '1px solid #d4d1ca',
      backgroundColor: temaEscuro ? '#1c1b19' : '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      boxShadow: temaEscuro
        ? '0 2px 10px rgba(0,0,0,0.25)'
        : '0 2px 10px rgba(0,0,0,0.05)',
    } as React.CSSProperties,

    logo: {
      fontSize: '18px',
      fontWeight: 700,
      color: temaEscuro ? '#4f98a3' : '#01696f',
    } as React.CSSProperties,

    botaoTema: {
      padding: '8px 14px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: temaEscuro ? '#313b3b' : '#e0f0ef',
      color: temaEscuro ? '#4f98a3' : '#01696f',
      fontWeight: 600,
    } as React.CSSProperties,

    abas: {
      display: 'flex',
      gap: '8px',
      padding: '0 24px',
      backgroundColor: temaEscuro ? '#1c1b19' : '#ffffff',
      borderBottom: temaEscuro ? '1px solid #393836' : '1px solid #d4d1ca',
    } as React.CSSProperties,

    aba: (ativa: boolean): React.CSSProperties => ({
      padding: '14px 18px',
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 700,
      color: ativa ? (temaEscuro ? '#4f98a3' : '#01696f') : '#7a7974',
      borderBottom: ativa
        ? `3px solid ${temaEscuro ? '#4f98a3' : '#01696f'}`
        : '3px solid transparent',
    }),

    container: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '24px',
    } as React.CSSProperties,

    tituloPagina: {
      fontSize: '28px',
      fontWeight: 700,
      marginBottom: '6px',
    } as React.CSSProperties,

    subtitulo: {
      color: '#7a7974',
      marginBottom: '24px',
    } as React.CSSProperties,

    cardInfo: {
      backgroundColor: temaEscuro ? '#1c1b19' : '#ffffff',
      border: temaEscuro ? '1px solid #393836' : '1px solid #d4d1ca',
      borderRadius: '14px',
      padding: '18px 20px',
      marginBottom: '20px',
      boxShadow: temaEscuro
        ? '0 4px 16px rgba(0,0,0,0.25)'
        : '0 4px 16px rgba(0,0,0,0.05)',
    } as React.CSSProperties,

    numeroInfo: {
      fontSize: '30px',
      fontWeight: 700,
      color: temaEscuro ? '#4f98a3' : '#01696f',
    } as React.CSSProperties,

    legendaInfo: {
      fontSize: '13px',
      color: '#7a7974',
    } as React.CSSProperties,

    card: {
      backgroundColor: temaEscuro ? '#1c1b19' : '#ffffff',
      border: temaEscuro ? '1px solid #393836' : '1px solid #d4d1ca',
      borderRadius: '14px',
      marginBottom: '20px',
      overflow: 'hidden',
      boxShadow: temaEscuro
        ? '0 4px 16px rgba(0,0,0,0.25)'
        : '0 4px 16px rgba(0,0,0,0.05)',
    } as React.CSSProperties,

    cardHeader: {
      padding: '16px 20px',
      borderBottom: temaEscuro ? '1px solid #393836' : '1px solid #ece8e2',
      fontWeight: 700,
      fontSize: '16px',
    } as React.CSSProperties,

    cardBody: {
      padding: '20px',
    } as React.CSSProperties,

    formGrid: {
      display: 'grid',
      gridTemplateColumns: '120px 1fr auto',
      gap: '10px',
      alignItems: 'end',
    } as React.CSSProperties,

    campo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    } as React.CSSProperties,

    label: {
      fontSize: '13px',
      fontWeight: 600,
      color: '#7a7974',
    } as React.CSSProperties,

    input: {
      height: '40px',
      padding: '0 12px',
      borderRadius: '8px',
      border: temaEscuro ? '1px solid #393836' : '1px solid #d4d1ca',
      backgroundColor: temaEscuro ? '#252421' : '#f7f6f2',
      color: temaEscuro ? '#cdccca' : '#28251d',
      outline: 'none',
    } as React.CSSProperties,

    botaoPrimario: {
      height: '40px',
      padding: '0 18px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: temaEscuro ? '#4f98a3' : '#01696f',
      color: '#ffffff',
      fontWeight: 700,
    } as React.CSSProperties,

    erro: {
      marginBottom: '16px',
      padding: '12px 14px',
      borderRadius: '8px',
      backgroundColor: temaEscuro ? '#2a1a24' : '#f8eef4',
      color: temaEscuro ? '#d163a7' : '#a12c7b',
      fontSize: '14px',
      fontWeight: 600,
    } as React.CSSProperties,

    tabelaWrapper: {
      overflowX: 'auto',
    } as React.CSSProperties,

    tabela: {
      width: '100%',
      borderCollapse: 'collapse',
    } as React.CSSProperties,

    th: {
      textAlign: 'left',
      padding: '12px 16px',
      fontSize: '12px',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      color: '#7a7974',
      backgroundColor: temaEscuro ? '#252421' : '#f3f0ec',
      borderBottom: temaEscuro ? '1px solid #393836' : '1px solid #d4d1ca',
    } as React.CSSProperties,

    td: {
      padding: '14px 16px',
      borderBottom: temaEscuro ? '1px solid #2a2927' : '1px solid #ece8e2',
      verticalAlign: 'middle',
    } as React.CSSProperties,

    avatarLinha: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    } as React.CSSProperties,

    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: temaEscuro ? '#313b3b' : '#e0f0ef',
      color: temaEscuro ? '#4f98a3' : '#01696f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: '12px',
    } as React.CSSProperties,

    acoes: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px',
    } as React.CSSProperties,

    botaoSecundario: {
      height: '32px',
      padding: '0 12px',
      borderRadius: '8px',
      border: temaEscuro ? '1px solid #393836' : '1px solid #d4d1ca',
      backgroundColor: 'transparent',
      color: temaEscuro ? '#cdccca' : '#28251d',
      cursor: 'pointer',
      fontWeight: 600,
    } as React.CSSProperties,

    botaoPerigo: {
      height: '32px',
      padding: '0 12px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: temaEscuro ? '#2a1a24' : '#f8eef4',
      color: temaEscuro ? '#d163a7' : '#a12c7b',
      cursor: 'pointer',
      fontWeight: 600,
    } as React.CSSProperties,

    vazio: {
      padding: '40px 20px',
      textAlign: 'center' as const,
      color: '#7a7974',
    },

    inputEdicao: {
      height: '34px',
      padding: '0 10px',
      borderRadius: '8px',
      border: temaEscuro ? '1px solid #393836' : '1px solid #d4d1ca',
      backgroundColor: temaEscuro ? '#252421' : '#f7f6f2',
      color: temaEscuro ? '#cdccca' : '#28251d',
      outline: 'none',
      minWidth: '220px',
    } as React.CSSProperties,
  };

  return (
    <div style={estilos.app}>
      <header style={estilos.topbar}>
        <div style={estilos.logo}>Instituto Federal — CRUD</div>

        <button style={estilos.botaoTema} onClick={alternarTema}>
          {temaEscuro ? 'Tema claro' : 'Tema escuro'}
        </button>
      </header>

      <nav style={estilos.abas}>
        <button
          style={estilos.aba(abaAtiva === 'pessoas')}
          onClick={() => setAbaAtiva('pessoas')}
        >
          Pessoas ({pessoas.length})
        </button>

        <button
          style={estilos.aba(abaAtiva === 'produtos')}
          onClick={() => setAbaAtiva('produtos')}
        >
          Produtos
        </button>
      </nav>

      <main style={estilos.container}>
        {abaAtiva === 'pessoas' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={estilos.tituloPagina}>Pessoas</h1>
              <p style={estilos.subtitulo}>
                Cadastro, edição e exclusão de pessoas em uma interface mais organizada.
              </p>
            </div>

            <div style={estilos.cardInfo}>
              <div style={estilos.numeroInfo}>{pessoas.length}</div>
              <div style={estilos.legendaInfo}>Total de pessoas cadastradas</div>
            </div>

            <div style={estilos.card}>
              <div style={estilos.cardHeader}>Cadastrar pessoa</div>

              <div style={estilos.cardBody}>
                <div style={estilos.formGrid}>
                  <div style={estilos.campo}>
                    <label style={estilos.label}>ID</label>
                    <input
                      type="number"
                      value={novoId}
                      onChange={(e) => setNovoId(e.target.value)}
                      style={estilos.input}
                      placeholder="Ex: 1"
                    />
                  </div>

                  <div style={estilos.campo}>
                    <label style={estilos.label}>Nome</label>
                    <input
                      type="text"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      style={estilos.input}
                      placeholder="Digite o nome"
                    />
                  </div>

                  <button
                    onClick={handleSalvar}
                    disabled={salvando}
                    style={estilos.botaoPrimario}
                  >
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>

            {erro && <div style={estilos.erro}>Erro: {erro}</div>}

            <div style={estilos.card}>
              <div
                style={{
                  ...estilos.cardHeader,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Lista de pessoas</span>

                <button style={estilos.botaoSecundario} onClick={recarregarPessoas}>
                  Atualizar
                </button>
              </div>

              <div style={estilos.tabelaWrapper}>
                <table style={estilos.tabela}>
                  <thead>
                    <tr>
                      <th style={estilos.th}>ID</th>
                      <th style={estilos.th}>Nome</th>
                      <th style={{ ...estilos.th, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {carregando ? (
                      <tr>
                        <td colSpan={3} style={estilos.td}>
                          Carregando...
                        </td>
                      </tr>
                    ) : pessoas.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={estilos.vazio}>
                          Nenhuma pessoa encontrada.
                        </td>
                      </tr>
                    ) : (
                      pessoas.map((pessoa) => (
                        <tr key={pessoa.id}>
                          <td style={estilos.td}>{pessoa.id}</td>

                          <td style={estilos.td}>
                            {editandoId === pessoa.id ? (
                              <input
                                type="text"
                                value={nomeEditado}
                                onChange={(e) => setNomeEditado(e.target.value)}
                                style={estilos.inputEdicao}
                              />
                            ) : (
                              <div style={estilos.avatarLinha}>
                                <div style={estilos.avatar}>
                                  {gerarIniciais(pessoa.nome)}
                                </div>
                                <span>{pessoa.nome}</span>
                              </div>
                            )}
                          </td>

                          <td style={estilos.td}>
                            <div style={estilos.acoes}>
                              {editandoId === pessoa.id ? (
                                <>
                                  <button
                                    style={estilos.botaoPrimario}
                                    onClick={() => handleEditar(pessoa.id)}
                                  >
                                    Salvar edição
                                  </button>

                                  <button
                                    style={estilos.botaoSecundario}
                                    onClick={cancelarEdicao}
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    style={estilos.botaoSecundario}
                                    onClick={() =>
                                      iniciarEdicao(pessoa.id, pessoa.nome)
                                    }
                                  >
                                    Editar
                                  </button>

                                  <button
                                    style={estilos.botaoPerigo}
                                    onClick={() => handleDeletar(pessoa.id)}
                                  >
                                    Deletar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
{abaAtiva === 'produtos' && (
  <>
    <div style={{ marginBottom: '24px' }}>
      <h1 style={estilos.tituloPagina}>Produtos</h1>
      <p style={estilos.subtitulo}>
        Cadastro, edição e exclusão de produtos.
      </p>
    </div>

    <div style={estilos.cardInfo}>
      <div style={estilos.numeroInfo}>{produtos.length}</div>
      <div style={estilos.legendaInfo}>
        Total de produtos cadastrados
      </div>
    </div>

    <div style={estilos.card}>
      <div style={estilos.cardHeader}>
        Cadastrar produto
      </div>

      <div style={estilos.cardBody}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '100px 1fr 1fr 120px auto',
            gap: '10px',
          }}
        >
          <input
            type="number"
            placeholder="ID"
            value={novoProdutoId}
            onChange={(e) =>
              setNovoProdutoId(e.target.value)
            }
            style={estilos.input}
          />

          <input
            type="text"
            placeholder="Nome"
            value={novoProdutoNome}
            onChange={(e) =>
              setNovoProdutoNome(e.target.value)
            }
            style={estilos.input}
          />

          <input
            type="text"
            placeholder="Categoria"
            value={novaCategoria}
            onChange={(e) =>
              setNovaCategoria(e.target.value)
            }
            style={estilos.input}
          />

          <input
            type="number"
            placeholder="Preço"
            value={novoPreco}
            onChange={(e) =>
              setNovoPreco(e.target.value)
            }
            style={estilos.input}
          />

          <button
            style={estilos.botaoPrimario}
            onClick={handleSalvarProduto}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>

    <div style={estilos.card}>
      <div style={estilos.cardHeader}>
        Lista de produtos
      </div>

      <div style={estilos.tabelaWrapper}>
        <table style={estilos.tabela}>
          <thead>
            <tr>
              <th style={estilos.th}>ID</th>
              <th style={estilos.th}>Nome</th>
              <th style={estilos.th}>Categoria</th>
              <th style={estilos.th}>Preço</th>
              <th style={estilos.th}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td colSpan={5} style={estilos.vazio}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              produtos.map((produto) => (
                <tr key={produto.id}>
                  <td style={estilos.td}>{produto.id}</td>

                  <td style={estilos.td}>
                    {editandoProdutoId === produto.id ? (
                      <input
                        value={produtoEditado.nome}
                        onChange={(e) =>
                          setProdutoEditado({
                            ...produtoEditado,
                            nome: e.target.value,
                          })
                        }
                        style={estilos.inputEdicao}
                      />
                    ) : (
                      produto.nome
                    )}
                  </td>

                  <td style={estilos.td}>
                    {editandoProdutoId === produto.id ? (
                      <input
                        value={produtoEditado.categoria}
                        onChange={(e) =>
                          setProdutoEditado({
                            ...produtoEditado,
                            categoria: e.target.value,
                          })
                        }
                        style={estilos.inputEdicao}
                      />
                    ) : (
                      produto.categoria
                    )}
                  </td>

                  <td style={estilos.td}>
                    {editandoProdutoId === produto.id ? (
                      <input
                        type="number"
                        value={produtoEditado.preco}
                        onChange={(e) =>
                          setProdutoEditado({
                            ...produtoEditado,
                            preco: e.target.value,
                          })
                        }
                        style={estilos.inputEdicao}
                      />
                    ) : (
                      `R$ ${produto.preco}`
                    )}
                  </td>

                  <td style={estilos.td}>
                    <div style={estilos.acoes}>
                      {editandoProdutoId === produto.id ? (
                        <>
                          <button
                            style={estilos.botaoPrimario}
                            onClick={() =>
                              handleEditarProduto(
                                produto.id
                              )
                            }
                          >
                            Salvar
                          </button>

                          <button
                            style={estilos.botaoSecundario}
                            onClick={
                              cancelarEdicaoProduto
                            }
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            style={estilos.botaoSecundario}
                            onClick={() =>
                              iniciarEdicaoProduto(
                                produto
                              )
                            }
                          >
                            Editar
                          </button>

                          <button
                            style={estilos.botaoPerigo}
                            onClick={() =>
                              handleDeletarProduto(
                                produto.id
                              )
                            }
                          >
                            Deletar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </>
)}
      </main>
    </div>
  );
}


export default App;