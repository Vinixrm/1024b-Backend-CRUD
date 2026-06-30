import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'

const API_URL = 'http://localhost:8000'

const CATEGORIAS = [
  { slug: 'todos', label: 'Todos' },
  { slug: 'mangas', label: 'Mangas' },
  { slug: 'super-herois', label: 'Super-herois' },
  { slug: 'hqs', label: 'HQs' },
  { slug: 'romance', label: 'Romance' },
] as const

const CAPA_FALLBACK =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="360" height="540" viewBox="0 0 360 540"%3E%3Crect width="360" height="540" fill="%23171822"/%3E%3Crect x="28" y="28" width="304" height="484" fill="%23f6c453" opacity=".9"/%3E%3Ctext x="180" y="255" text-anchor="middle" font-family="Arial" font-size="32" font-weight="700" fill="%23171822"%3EManga%3C/text%3E%3Ctext x="180" y="295" text-anchor="middle" font-family="Arial" font-size="20" fill="%23171822"%3ESem capa%3C/text%3E%3C/svg%3E'

type Categoria = Exclude<(typeof CATEGORIAS)[number]['slug'], 'todos'>
type Pagina = (typeof CATEGORIAS)[number]['slug']

interface Manga {
  id: number
  titulo: string
  autor: string
  categoria: Categoria
  preco: number
  estoque: number
  imagem_url: string
  descricao: string
  destaque: boolean
  data_criacao: string
  data_modificacao: string | null
}

interface ResumoCategoria {
  categoria: Categoria
  total: number
  estoque: number
  preco_medio: number
}

interface ItemCarrinho {
  manga: Manga
  quantidade: number
}

interface FormularioManga {
  titulo: string
  autor: string
  categoria: Categoria
  preco: string
  estoque: string
  imagem_url: string
  descricao: string
  destaque: boolean
}

const formularioInicial: FormularioManga = {
  titulo: '',
  autor: '',
  categoria: 'mangas',
  preco: '',
  estoque: '',
  imagem_url: '',
  descricao: '',
  destaque: false,
}

function paginaPelaHash(): Pagina {
  const slug = window.location.hash.replace('#/', '')
  const categoria = CATEGORIAS.find((item) => item.slug === slug)

  return categoria?.slug ?? 'todos'
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function labelCategoria(categoria: Categoria | Pagina) {
  return CATEGORIAS.find((item) => item.slug === categoria)?.label ?? categoria
}

async function obterJson<T>(url: string, options?: RequestInit): Promise<T> {
  const resposta = await fetch(url, options)

  if (!resposta.ok) {
    const erro = await resposta
      .json()
      .catch(() => ({ mensagem: 'Nao foi possivel concluir a requisicao.' }))
    const mensagem =
      typeof erro.mensagem === 'string'
        ? erro.mensagem
        : 'Nao foi possivel concluir a requisicao.'

    throw new Error(mensagem)
  }

  return resposta.json() as Promise<T>
}

function App() {
  const [paginaAtiva, setPaginaAtiva] = useState<Pagina>(() => paginaPelaHash())
  const [mangas, setMangas] = useState<Manga[]>([])
  const [resumos, setResumos] = useState<ResumoCategoria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [formulario, setFormulario] =
    useState<FormularioManga>(formularioInicial)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [mangaSelecionado, setMangaSelecionado] = useState<Manga | null>(null)
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [versaoCatalogo, setVersaoCatalogo] = useState(0)

  const totalCatalogo = useMemo(
    () => resumos.reduce((total, item) => total + item.total, 0),
    [resumos]
  )

  const estoqueTotal = useMemo(
    () => resumos.reduce((total, item) => total + item.estoque, 0),
    [resumos]
  )

  const totalCarrinho = useMemo(
    () =>
      carrinho.reduce(
        (total, item) => total + item.manga.preco * item.quantidade,
        0
      ),
    [carrinho]
  )

  const quantidadeCarrinho = useMemo(
    () => carrinho.reduce((total, item) => total + item.quantidade, 0),
    [carrinho]
  )

  const destaques = useMemo(
    () => mangas.filter((manga) => manga.destaque).slice(0, 4),
    [mangas]
  )

  const resumosPorCategoria = useMemo(() => {
    return new Map(resumos.map((item) => [item.categoria, item]))
  }, [resumos])

  useEffect(() => {
    function sincronizarHash() {
      setPaginaAtiva(paginaPelaHash())
    }

    sincronizarHash()
    window.addEventListener('hashchange', sincronizarHash)

    return () => window.removeEventListener('hashchange', sincronizarHash)
  }, [])

  useEffect(() => {
    let ativo = true

    async function carregarCatalogo() {
      const parametros = new URLSearchParams()

      if (paginaAtiva !== 'todos') {
        parametros.set('categoria', paginaAtiva)
      }

      if (buscaAplicada) {
        parametros.set('busca', buscaAplicada)
      }

      const query = parametros.toString()
      const url = query ? `${API_URL}/mangas?${query}` : `${API_URL}/mangas`

      try {
        setCarregando(true)
        setErro(null)
        const dados = await obterJson<Manga[]>(url)

        if (ativo) {
          setMangas(dados)
        }
      } catch (e) {
        if (ativo) {
          setErro(e instanceof Error ? e.message : 'Erro inesperado.')
          setMangas([])
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarCatalogo()

    return () => {
      ativo = false
    }
  }, [paginaAtiva, buscaAplicada, versaoCatalogo])

  useEffect(() => {
    let ativo = true

    async function carregarResumos() {
      try {
        const dados = await obterJson<ResumoCategoria[]>(
          `${API_URL}/categorias`
        )

        if (ativo) {
          setResumos(dados)
        }
      } catch {
        if (ativo) {
          setResumos([])
        }
      }
    }

    carregarResumos()

    return () => {
      ativo = false
    }
  }, [versaoCatalogo])

  function navegarPara(pagina: Pagina) {
    window.location.hash = `#/${pagina}`
    setPaginaAtiva(pagina)
  }

  function recarregarCatalogo() {
    setVersaoCatalogo((valor) => valor + 1)
  }

  function atualizarCampo<K extends keyof FormularioManga>(
    campo: K,
    valor: FormularioManga[K]
  ) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }))
  }

  function limparFormulario() {
    setFormulario(formularioInicial)
    setEditandoId(null)
  }

  function prepararEdicao(manga: Manga) {
    setEditandoId(manga.id)
    setFormulario({
      titulo: manga.titulo,
      autor: manga.autor,
      categoria: manga.categoria,
      preco: String(manga.preco),
      estoque: String(manga.estoque),
      imagem_url: manga.imagem_url,
      descricao: manga.descricao,
      destaque: manga.destaque,
    })

    document
      .getElementById('gerenciar-catalogo')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function salvarManga(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const preco = Number(formulario.preco)
    const estoque = Number(formulario.estoque)

    if (
      !formulario.titulo.trim() ||
      !formulario.autor.trim() ||
      !formulario.descricao.trim()
    ) {
      alert('Preencha titulo, autor e descricao.')
      return
    }

    if (Number.isNaN(preco) || preco <= 0) {
      alert('Preco deve ser maior que zero.')
      return
    }

    if (!Number.isInteger(estoque) || estoque < 0) {
      alert('Estoque deve ser um numero inteiro maior ou igual a zero.')
      return
    }

    const payload = {
      titulo: formulario.titulo.trim(),
      autor: formulario.autor.trim(),
      categoria: formulario.categoria,
      preco,
      estoque,
      imagem_url: formulario.imagem_url.trim(),
      descricao: formulario.descricao.trim(),
      destaque: formulario.destaque,
    }

    const editando = editandoId !== null
    const url = editando ? `${API_URL}/mangas/${editandoId}` : `${API_URL}/mangas`

    try {
      setSalvando(true)
      await obterJson(url, {
        method: editando ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      limparFormulario()
      recarregarCatalogo()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao salvar manga.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluirManga(manga: Manga) {
    const confirmou = window.confirm(`Excluir "${manga.titulo}" do catalogo?`)

    if (!confirmou) {
      return
    }

    try {
      await obterJson<{ mensagem: string }>(`${API_URL}/mangas/${manga.id}`, {
        method: 'DELETE',
      })

      if (editandoId === manga.id) {
        limparFormulario()
      }

      setCarrinho((itens) =>
        itens.filter((item) => item.manga.id !== manga.id)
      )
      setMangaSelecionado((selecionado) =>
        selecionado?.id === manga.id ? null : selecionado
      )
      recarregarCatalogo()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir manga.')
    }
  }

  async function abrirDetalhes(id: number) {
    try {
      const manga = await obterJson<Manga>(`${API_URL}/mangas/${id}`)
      setMangaSelecionado(manga)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao abrir detalhes.')
    }
  }

  function adicionarAoCarrinho(manga: Manga) {
    if (manga.estoque <= 0) {
      alert('Item sem estoque.')
      return
    }

    setCarrinho((itens) => {
      const itemAtual = itens.find((item) => item.manga.id === manga.id)

      if (!itemAtual) {
        return [...itens, { manga, quantidade: 1 }]
      }

      if (itemAtual.quantidade >= manga.estoque) {
        alert('Quantidade maxima em estoque adicionada.')
        return itens
      }

      return itens.map((item) =>
        item.manga.id === manga.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
    })
  }

  function removerDoCarrinho(id: number) {
    setCarrinho((itens) =>
      itens
        .map((item) =>
          item.manga.id === id
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter((item) => item.quantidade > 0)
    )
  }

  function pesquisar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBuscaAplicada(busca.trim())
  }

  function limparPesquisa() {
    setBusca('')
    setBuscaAplicada('')
  }

  function totalDaCategoria(pagina: Pagina) {
    if (pagina === 'todos') {
      return totalCatalogo
    }

    return resumosPorCategoria.get(pagina)?.total ?? 0
  }

  const tituloPagina =
    paginaAtiva === 'todos'
      ? 'Catalogo completo'
      : `Categoria ${labelCategoria(paginaAtiva)}`

  return (
    <div className="store-app">
      <header className="store-header">
        <button className="brand" type="button" onClick={() => navegarPara('todos')}>
          <span className="brand-mark">MS</span>
          <span>
            Manga Store
            <small>CRUD</small>
          </span>
        </button>

        <nav className="top-nav" aria-label="Categorias principais">
          {CATEGORIAS.map((categoria) => (
            <button
              className={categoria.slug === paginaAtiva ? 'active' : ''}
              key={categoria.slug}
              type="button"
              onClick={() => navegarPara(categoria.slug)}
            >
              {categoria.label}
            </button>
          ))}
        </nav>

        <div className="cart-pill">
          <span>{quantidadeCarrinho} itens</span>
          <strong>{formatarMoeda(totalCarrinho)}</strong>
        </div>
      </header>

      <main>
        <section className="catalog-band">
          <div className="catalog-copy">
            <p className="eyebrow">Loja online</p>
            <h1>{tituloPagina}</h1>
            <p>
              Mangas, HQs, super-herois e romances graficos em um catalogo com
              estoque, capas e gerenciamento completo.
            </p>

            <form className="search-row" onSubmit={pesquisar}>
              <input
                aria-label="Buscar por titulo, autor ou descricao"
                placeholder="Buscar titulo, autor ou descricao"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
              <button type="submit">Buscar</button>
              {buscaAplicada && (
                <button className="ghost-button" type="button" onClick={limparPesquisa}>
                  Limpar
                </button>
              )}
            </form>
          </div>

          <div className="cover-rail" aria-label="Capas em destaque">
            {(destaques.length > 0 ? destaques : mangas.slice(0, 4)).map((manga) => (
              <button
                className="rail-cover"
                key={manga.id}
                type="button"
                onClick={() => abrirDetalhes(manga.id)}
                title={manga.titulo}
              >
                <img
                  alt={`Capa de ${manga.titulo}`}
                  src={manga.imagem_url || CAPA_FALLBACK}
                  onError={(event) => {
                    event.currentTarget.onerror = null
                    event.currentTarget.src = CAPA_FALLBACK
                  }}
                />
              </button>
            ))}
          </div>
        </section>

        <section className="metrics-row" aria-label="Resumo do catalogo">
          <div>
            <span>{totalCatalogo}</span>
            <p>Titulos</p>
          </div>
          <div>
            <span>{estoqueTotal}</span>
            <p>Unidades</p>
          </div>
          <div>
            <span>{CATEGORIAS.length - 1}</span>
            <p>Categorias</p>
          </div>
          <div>
            <span>{formatarMoeda(totalCarrinho)}</span>
            <p>Sacola</p>
          </div>
        </section>

        <div className="store-layout">
          <aside className="side-panel">
            <h2>Subpaginas</h2>
            <div className="category-list">
              {CATEGORIAS.map((categoria) => (
                <button
                  className={categoria.slug === paginaAtiva ? 'active' : ''}
                  key={categoria.slug}
                  type="button"
                  onClick={() => navegarPara(categoria.slug)}
                >
                  <span>{categoria.label}</span>
                  <strong>{totalDaCategoria(categoria.slug)}</strong>
                </button>
              ))}
            </div>
          </aside>

          <section className="catalog-area">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Vitrine</p>
                <h2>{tituloPagina}</h2>
              </div>
              <button className="ghost-button" type="button" onClick={recarregarCatalogo}>
                Atualizar
              </button>
            </div>

            {erro && <div className="feedback error">{erro}</div>}

            {carregando ? (
              <div className="feedback">Carregando catalogo...</div>
            ) : mangas.length === 0 ? (
              <div className="feedback">Nenhum titulo encontrado.</div>
            ) : (
              <div className="product-grid">
                {mangas.map((manga) => (
                  <article className="product-card" key={manga.id}>
                    <button
                      className="cover-button"
                      type="button"
                      onClick={() => abrirDetalhes(manga.id)}
                    >
                      <img
                        alt={`Capa de ${manga.titulo}`}
                        src={manga.imagem_url || CAPA_FALLBACK}
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = CAPA_FALLBACK
                        }}
                      />
                    </button>

                    <div className="product-body">
                      <div className="product-tags">
                        <span>{labelCategoria(manga.categoria)}</span>
                        {manga.destaque && <strong>Destaque</strong>}
                      </div>
                      <h3>{manga.titulo}</h3>
                      <p>{manga.autor}</p>
                      <div className="product-meta">
                        <strong>{formatarMoeda(manga.preco)}</strong>
                        <span>{manga.estoque} un.</span>
                      </div>
                    </div>

                    <div className="product-actions">
                      <button type="button" onClick={() => adicionarAoCarrinho(manga)}>
                        Comprar
                      </button>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => prepararEdicao(manga)}
                      >
                        Editar
                      </button>
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => excluirManga(manga)}
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="cart-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Sacola</p>
                <h2>{quantidadeCarrinho} itens</h2>
              </div>
              {carrinho.length > 0 && (
                <button className="ghost-button" type="button" onClick={() => setCarrinho([])}>
                  Limpar
                </button>
              )}
            </div>

            {carrinho.length === 0 ? (
              <p className="empty-text">Sua sacola esta vazia.</p>
            ) : (
              <div className="cart-list">
                {carrinho.map((item) => (
                  <div className="cart-item" key={item.manga.id}>
                    <img
                      alt=""
                      src={item.manga.imagem_url || CAPA_FALLBACK}
                      onError={(event) => {
                        event.currentTarget.onerror = null
                        event.currentTarget.src = CAPA_FALLBACK
                      }}
                    />
                    <div>
                      <strong>{item.manga.titulo}</strong>
                      <span>
                        {item.quantidade} x {formatarMoeda(item.manga.preco)}
                      </span>
                    </div>
                    <button type="button" onClick={() => removerDoCarrinho(item.manga.id)}>
                      -
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="cart-total">
              <span>Total</span>
              <strong>{formatarMoeda(totalCarrinho)}</strong>
            </div>
          </aside>
        </div>

        <section className="admin-section" id="gerenciar-catalogo">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Gerenciamento</p>
              <h2>{editandoId ? 'Editar titulo' : 'Cadastrar titulo'}</h2>
            </div>
            {editandoId && (
              <button className="ghost-button" type="button" onClick={limparFormulario}>
                Cancelar edicao
              </button>
            )}
          </div>

          <form className="admin-form" onSubmit={salvarManga}>
            <label>
              Titulo
              <input
                value={formulario.titulo}
                onChange={(event) => atualizarCampo('titulo', event.target.value)}
                placeholder="Ex: Spy x Family Vol. 1"
              />
            </label>

            <label>
              Autor
              <input
                value={formulario.autor}
                onChange={(event) => atualizarCampo('autor', event.target.value)}
                placeholder="Ex: Tatsuya Endo"
              />
            </label>

            <label>
              Categoria
              <select
                value={formulario.categoria}
                onChange={(event) =>
                  atualizarCampo('categoria', event.target.value as Categoria)
                }
              >
                {CATEGORIAS.filter((categoria) => categoria.slug !== 'todos').map(
                  (categoria) => (
                    <option key={categoria.slug} value={categoria.slug}>
                      {categoria.label}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Preco
              <input
                min="0"
                step="0.01"
                type="number"
                value={formulario.preco}
                onChange={(event) => atualizarCampo('preco', event.target.value)}
                placeholder="39.90"
              />
            </label>

            <label>
              Estoque
              <input
                min="0"
                step="1"
                type="number"
                value={formulario.estoque}
                onChange={(event) => atualizarCampo('estoque', event.target.value)}
                placeholder="12"
              />
            </label>

            <label>
              Link da capa
              <input
                value={formulario.imagem_url}
                onChange={(event) =>
                  atualizarCampo('imagem_url', event.target.value)
                }
                placeholder="https://..."
              />
            </label>

            <label className="wide-field">
              Descricao
              <textarea
                value={formulario.descricao}
                onChange={(event) => atualizarCampo('descricao', event.target.value)}
                placeholder="Resumo curto para a vitrine"
              />
            </label>

            <label className="toggle-field">
              <input
                checked={formulario.destaque}
                type="checkbox"
                onChange={(event) => atualizarCampo('destaque', event.target.checked)}
              />
              Marcar como destaque
            </label>

            <div className="form-actions">
              <button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : editandoId ? 'Salvar edicao' : 'Cadastrar'}
              </button>
              <button className="ghost-button" type="button" onClick={limparFormulario}>
                Limpar
              </button>
            </div>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Categoria</th>
                  <th>Preco</th>
                  <th>Estoque</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {mangas.map((manga) => (
                  <tr key={manga.id}>
                    <td>
                      <strong>{manga.titulo}</strong>
                      <span>{manga.autor}</span>
                    </td>
                    <td>{labelCategoria(manga.categoria)}</td>
                    <td>{formatarMoeda(manga.preco)}</td>
                    <td>{manga.estoque}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => prepararEdicao(manga)}>
                          Editar
                        </button>
                        <button
                          className="danger-button"
                          type="button"
                          onClick={() => excluirManga(manga)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {mangaSelecionado && (
        <div className="modal-backdrop" role="presentation">
          <article className="detail-modal" role="dialog" aria-modal="true">
            <button
              className="close-button"
              type="button"
              onClick={() => setMangaSelecionado(null)}
              aria-label="Fechar"
            >
              x
            </button>
            <img
              alt={`Capa de ${mangaSelecionado.titulo}`}
              src={mangaSelecionado.imagem_url || CAPA_FALLBACK}
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = CAPA_FALLBACK
              }}
            />
            <div>
              <span className="detail-category">
                {labelCategoria(mangaSelecionado.categoria)}
              </span>
              <h2>{mangaSelecionado.titulo}</h2>
              <p className="detail-author">{mangaSelecionado.autor}</p>
              <p>{mangaSelecionado.descricao}</p>
              <div className="detail-price">
                <strong>{formatarMoeda(mangaSelecionado.preco)}</strong>
                <span>{mangaSelecionado.estoque} unidades em estoque</span>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => adicionarAoCarrinho(mangaSelecionado)}
                >
                  Comprar
                </button>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => prepararEdicao(mangaSelecionado)}
                >
                  Editar
                </button>
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  )
}

export default App
