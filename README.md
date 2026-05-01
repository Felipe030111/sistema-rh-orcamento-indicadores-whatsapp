# Sistema de Orcamento de Pessoal e Controle de Headcount

Monolito inicial com FastAPI, SQLAlchemy, SQLite, React e Vite.

## Usuario inicial

- E-mail: `admin@local`
- Senha: `admin123`

## Rodar backend no Windows

```powershell
cd orcamento-pessoal\backend
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

A API ficara em:

```text
http://localhost:8000
http://localhost:8000/docs
```

## Rodar frontend no Windows

Abra outro terminal:

```powershell
cd orcamento-pessoal\frontend
npm install
npm run dev
```

O frontend ficara em:

```text
http://localhost:5173
```

## Modelo minimo de Excel para importacao

Colunas obrigatorias:

```text
nome
cargo
departamento
centro_custo
salario
```

Colunas opcionais:

```text
tipo
matricula
grupo
data_admissao
data_desligamento
status
```
