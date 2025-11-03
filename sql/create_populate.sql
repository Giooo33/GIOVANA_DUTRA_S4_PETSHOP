-- Ficheiro: create_populate.sql
-- Projeto: Sistema de Gestão Pet Shop "Amigo Fiel"
-- Este script representa a estrutura lógica da base de dados e a
-- inserção de 3 registos de exemplo por tabela, conforme solicitado.

-- NOTA: O Django ORM gera nomes de tabela como 'api_cliente', 'api_produto'.
-- Usaremos nomes simplificados aqui para clareza do DER.

-- 1. Tabela de Utilizadores (para Login)
CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(128) NOT NULL, -- O Django armazena hashes, não texto puro
    email VARCHAR(254) NOT NULL,
    is_staff BOOLEAN DEFAULT 0
);

-- 2. Tabela de Clientes
CREATE TABLE IF NOT EXISTS Cliente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(254) NOT NULL UNIQUE
);

-- 3. Tabela de Produtos
CREATE TABLE IF NOT EXISTS Produto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    preco DECIMAL(10, 2) NOT NULL,
    quantidade_estoque INTEGER NOT NULL CHECK (quantidade_estoque >= 0)
);

-- 4. Tabela de Vendas (Registo mestre da venda)
CREATE TABLE IF NOT EXISTS Venda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_venda DATETIME NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    cliente_id INTEGER,
    usuario_id INTEGER,
    FOREIGN KEY (cliente_id) REFERENCES Cliente(id),
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
);

-- 5. Tabela de Itens da Venda (Tabela de Junção N-para-N)
CREATE TABLE IF NOT EXISTS ItemVenda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quantidade_comprada INTEGER NOT NULL,
    preco_unitario_momento DECIMAL(10, 2) NOT NULL,
    venda_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    FOREIGN KEY (venda_id) REFERENCES Venda(id),
    FOREIGN KEY (produto_id) REFERENCES Produto(id)
);

---
--- DADOS DE POPULAÇÃO (3 REGISTOS POR TABELA)
---

-- 1. Utilizadores
-- (As senhas são hashes de exemplo, não '123')
INSERT INTO Usuario (username, password_hash, email, is_staff) VALUES
('admin', 'pbkdf2_sha256$720000$hash...1$hash...2', 'admin@amigofiel.com', 1),
('giovana', 'pbkdf2_sha256$720000$hash...3$hash...4', 'giovana@amigofiel.com', 0),
('vendedor', 'pbkdf2_sha256$720000$hash...5$hash...6', 'vendedor@amigofiel.com', 0);

-- 2. Clientes
INSERT INTO Cliente (nome, telefone, email) VALUES
('Ana Silva', '91234-5678', 'ana.silva@teste.com'),
('Bruno Costa', '98765-4321', 'bruno.costa@exemplo.com'),
('Carla Dias', '91111-2222', 'carla.dias@email.com');

-- 3. Produtos
-- (Um produto com stock baixo para testar o Alerta Visual)
INSERT INTO Produto (nome, categoria, preco, quantidade_estoque) VALUES
('Ração Premium Cães Adultos 15kg', 'Alimento', 189.90, 25),
('Osso de Nylon Resistente', 'Brinquedo', 49.50, 40),
('Shampoo Antialérgico Pulgas 500ml', 'Higiene', 75.00, 3); -- <- Stock baixo

-- 4. Vendas
INSERT INTO Venda (data_venda, valor_total, cliente_id, usuario_id) VALUES
('2025-10-30 10:30:00', 189.90, 1, 2), -- Ana comprou (Giovana vendeu)
('2025-10-30 14:45:00', 99.00, 2, 3), -- Bruno comprou (Vendedor vendeu)
('2025-10-31 09:15:00', 75.00, 1, 2); -- Ana comprou de novo (Giovana vendeu)

-- 5. Itens da Venda
INSERT INTO ItemVenda (quantidade_comprada, preco_unitario_momento, venda_id, produto_id) VALUES
(1, 189.90, 1, 1), -- Venda 1: 1 Ração
(2, 49.50, 2, 2),  -- Venda 2: 2 Ossos
(1, 75.00, 3, 3);  -- Venda 3: 1 Shampoo

