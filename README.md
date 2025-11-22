# Belo's Salon & Store

> **Elegância & Beleza** - Sistema de Gestão Completo para Salão de Beleza e Loja de Acessórios.

Este projeto é uma aplicação web moderna desenvolvida para o **Belo's Salon & Store**, integrando um site institucional, sistema de agendamento de serviços, loja virtual de acessórios e semi-jóias, e um dashboard administrativo robusto para gestão do negócio.

## 🚀 Funcionalidades Principais

### 👤 Para o Cliente
*   **Vitrine Digital**: Apresentação elegante dos serviços e do espaço (Portfolio).
*   **Agendamento Online**: Sistema intuitivo de 3 passos para marcar serviços (Cabelo, Manicure, Spa, etc.) com validação de dias/horários de funcionamento.
*   **Loja Virtual**: Catálogo de acessórios e semi-jóias com filtros por categoria e busca.
*   **Área do Cliente**: Histórico de compras e agendamentos (simulado).
*   **Revendedores**: Formulário de cadastro para novos revendedores com verificação via SMS (simulada).

### 💼 Dashboard Administrativo (Gestão)
*   **Visão Geral (KPIs)**: Gráficos de faturamento, serviços populares e métricas de crescimento.
*   **Gestão de Agendamentos**: Visualização completa, busca e status dos agendamentos.
*   **Gestão de Clientes**: Base de dados com histórico financeiro e filtros (Salão vs. Loja).
*   **Gestão de Estoque e Serviços**: Adicionar, editar e remover produtos e serviços com upload de imagens.
*   **Ponto de Venda (POS)**:
    *   Registro de vendas rápidas.
    *   Carrinho misto (Serviços + Produtos).
    *   **Lógica de Revenda**: Desconto automático de 25% para compras de revendedores acima de 2500 MT.
*   **Gestão de Equipe**: Controle de usuários (Admin, Gestores) e permissões.
*   **Relatórios**: Exportação de relatórios financeiros formatados para impressão/PDF.
*   **Configurações**: Ajuste dinâmico dos dias e horários de funcionamento do salão.

## 🛠️ Tecnologias Utilizadas

*   **Frontend**: React 19, TypeScript
*   **Estilização**: Tailwind CSS
*   **Ícones**: Lucide React
*   **Gráficos**: Recharts
*   **Build Tool**: Vite (Recomendado)

## 📦 Como Rodar o Projeto

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/seu-usuario/belo-salon-store.git
    cd belo-salon-store
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento**
    ```bash
    npm run dev
    ```

4.  **Acesse no navegador**
    O projeto estará rodando em `http://localhost:5173` (ou porta similar).

## 🔑 Acesso de Demonstração

O sistema possui dados mockados (fictícios) para teste imediato. Utilize as credenciais abaixo para testar os diferentes perfis:

| Perfil | Email | Senha | Acesso |
|---|---|---|---|
| **Administrador** | `admin@belosalon.store` | `123` | Acesso Total (Financeiro, Config, Equipe) |
| **Gestor** | `gestor@belosalon.store` | `123` | Gestão Operacional (Sem acesso financeiro) |
| **Cliente** | `cliente@gmail.com` | `123` | Agendamento e Histórico Pessoal |

## 📱 Contato e Redes Sociais

*   **TikTok**: [@belos.salon.e.store](https://www.tiktok.com/@belos.salon.e.store)
*   **Instagram**: [@belos_salon.store](https://www.instagram.com/belos_salon.store)
*   **Localização**: Av. Julius Nyerere, Maputo, Moçambique

---

Desenvolvido com ❤️ para Belo's Salon & Store.
