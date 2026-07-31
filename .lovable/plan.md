## Objetivo
Liberar manualmente o acesso de `contanumero1aq@gmail.com` como **aluno comprador** (não admin), simulando uma compra da Cakto, para você testar o fluxo de entrega ponta a ponta.

## O que será feito no banco

1. **Garantir a conta em `auth.users`** — se não existir, criar (sem senha, confirmada). Se já existir, normalizar os campos de token para evitar o bug de login.
2. **Perfil (`profiles`)** — garantir `is_active = true` e e-mail normalizado.
3. **Papel (`user_roles`)** — garantir papel `aluno`. **Remover** qualquer papel `admin` que tenha ficado de teste anterior.
4. **Compra (`purchases`)** — inserir uma compra do produto principal (K-Slim Protocolo 21 Dias) com `source = 'manual'` e um `external_id` único, sem duplicar caso já exista.
5. **Preferências (`user_profile_prefs`)** — deixar `onboarded = false` para que ele passe pelo onboarding real das 3 perguntas (fluxo idêntico ao de um comprador de verdade).

## O que você faz depois
- Abrir `k-slim-protocol.lovable.app/login`
- Digitar `contanumero1aq@gmail.com` → receber link mágico (checar spam)
- Clicar no link → cair no onboarding → responder → entrar no protocolo

## Detalhes técnicos
- Operação feita via SQL de dados (insert/update idempotente), sem alterar schema.
- Nenhum código do app é modificado.
- Não envio de link mágico pelo servidor agora — você aciona pelo próprio `/login` (é o fluxo mais próximo do que a aluna real fará).
