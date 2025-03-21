# Termos utilizados no Simulex

- Usuario = User
- Disciplina = Discipline
- Assunto = Topic
- Simulado = Quiz
- Question = Question
- Option = Option
- Gabarito = Key
- Entidade = Entity (Entidade organizadora do concurso)
- Orgao = Institution (Instituição ofertante da vaga do concurso)
- Cargo = Position (Cargo da vaga do concurso)

# Tipos de usuários

- Gratuito = Free
- Dirigido = Member
- Professor = Teacher
- Administrador = Administrator

# Tipos de simulados

- Aleatório = Random
- Reforço = Review
- Aprendizado = Learning
  - Nivelamento => Seleciona um tópico diferente até que todos os tópicos mudem de nível (NAO_VERIFICADO)
  - Frequência dos assuntos => Prioriza FrequencyInDepth, selecionando questões do menor nível de aprendizado do usuário, incluíndo também do próximo nível, de forma a reforçar os mesmos tópicos até que evoluam para dois níveis acima do nível de aprendizado mais baixo do usuário (opção de restringir por origem da questão para cálculo das frequências)
  - Dificuldade coletiva => Seleciona 10 tópicos por CollectiveDifficultyRecursive e substitui quando o tópico muda para o próximo nível de aprendizado (opção de restringir por origem da questão para cálculo das frequências)
  - Senso comum => Seleciona 10 tópicos pela média do aprendizado coletivo (Ignorante / Leigo / Bacharel / Doutor)
  - Super foco => Usuário escolhe o nível de aprendizado e frequência ou dificuldade (opção de restringir por origem)
- Verificação = Check

# HOSPEDAGEM

DigitalOcean ssh weber@134.199.217.117

Here's how to copy a Docker container to your DigitalOcean server at 134.199.217.117:

1. Save the Docker container as an image
   List containers to get the container ID
   docker ps

Create an image from the container
docker commit <container_id> simulex-image

2. Save the image to a tar file
   docker save simulex-image > simulex-image.tar

3. Copy the tar file to the DigitalOcean server
   scp simulex-image.tar weber@134.199.217.117:~/

4. SSH into the server and load the image
   ssh weber@134.199.217.117
   docker load < simulex-image.tar

5. Run the container on the server
   docker run -d --name simulex -p 3030:3030 simulex-image

# BANCO DE DADOS

Acessar banco de dados no servidor:
sudo su postgres
psql -d simulex

pgAdmin4

- werepa@gmail.com => b3r1c4

# USUÁRIOS

- werepa@gmail.com => asdf1234 (perfil: Gratuito)
- member@gmail.com => asdf1234 (perfil: Member)
- admin@gmail.com => asdf1234 (perfil: Administrador)

# ESTRATÉGIAS

Logo após o login do usuário (ESQUECIMENTO):

- percorrer os assuntos do usuário onde a data de atualização seja menor que hoje;

- subtrair da pontuação do assunto o fator de esquecimento (valor fixo ou percentagem, verificar melhor abordagem)

Adicionar um assunto ao simulado:

- adicionar um registro de SRS para cada assunto e assunto-filho, caso ainda não exista.

Selecionar o próximo assunto do simulado:

- ordenar a tabela SRS pelo valor de SRS, filtrando apenas os assuntosRoot pertencentes ao simulado atual

Selecionar uma pergunta de um assunto (simulado de aprendizado - 30 perguntas por simulado):

- ordenar tabela SRS pelo valor de SRS (ASC) e selecionar o primeiro registro, filtrando por assunto_root_id
  diferente do ultimo_assunto_root_id do simulado, se consulta for vazia, desligar o filtro.

- criar consulta na tabela Pergunta, ordenada por dificuldade (ASC) e qtde_resolucoes (DESC),
  com dificuldade > que dificuldade atual no SRS do assunto, onde o registro não exista
  na tabela simuladoPergunta com "ativo = true";

- se consulta for vazia, ou o usuario errou a última pergunta => criar consulta na tabela Pergunta,
  ordenada por dificuldade (ASC) e qtde_resolucoes (DESC), com dificuldade <= que dificuldade atual
  no SRS do assunto, onde o registro não exista na tabela simuladoPergunta com "ativo = true",
  e selecionar o último registro;

- se consulta for vazia, atualizar "ativo = false" na tabela simuladoPergunta para o assunto atual;
  Verificar se existem perguntas cadastradas para o assunto => executar novamente adiciona
  pergunta ao simulado;

Selecionar uma pergunta de um assunto (simulado de verificação - 20 perguntas por simulado):

- ordenar os assuntos por data ultima alteração (DESC) e selecionar os 20 primeiros;

- criar consulta na tabela Pergunta, qtde_resolucoes (ASC), onde o registro não exista na tabela
  simuladoPergunta com "ativo = true"; selecionar a pergunta com menor qtde de resoluções.

- se consulta for vazia, atualizar "ativo = false" na tabela simuladoPergunta para o assunto atual;
  Verificar se existem perguntas cadastradas para o assunto => executar novamente seleciona pergunta
  de verificacao;

Corrigir a pergunta:

- atualizar o valor SRS do assunto; Não atualizar dificuldade se errou a última pergunta do assunto e dificuldade da pergunta for menor que a acumulada no SRS; (simulado de verificacao => não atualizar dificuldade SRS, pois a dificuldade da pergunta está sob avaliação)

- atualizar os parâmetros da pergunta;

- adicionar a pergunta em simuladoPergunta;

- se o usuário acertou a resposta, atualizar o campo "dificuldade" do SRS;

- calcular SRS e atualizar no assunto;

Frequência Relativa dos Assuntos (FRA):

- QA => Total de questões de um assunto

- QAR => Total de questões de todos os assuntos pertencentes ao assuntoRoot

- QA_max => Maior qtde de questões de um assunto pertencente ao assuntoRoot

- QAR_max => Maior qtde de questões de um assuntoRoot

- F_rel => Combinação da importância relativa entre assuntosRoot e também dos assuntos pertencentes ao assuntoRoot.
  - Valor será armazenado no próprio assunto
  - Deve ser atualizada após o cadastramento de questões, porém pode ser executada apenas quando qtde_novas_questoes = 10 questões, ou se qtde_novas_questoes < 10 e data_atual > data_cadastro, sendo esta última condição verificada no login de um administrador/professor)
  * O cálculo (normatização da frequência) deve ser realizado por função recursiva, totalizando os assuntosRoot, depois ir descendo na hierarquia até o último assunto pertencente ao assuntoRoot. O cálculo por SQL não contemplou os assuntosPai.

Cálculo do SRS:

- o SRS deve ser proporcional à pontuação acumulada e inversamente proporcional à dificuldade geral do assunto e frequencia;

- pontuacao => incrementa 1 a cada acerto e decrementa 2 a cada erro, se menor que zero => P = 0.

- frequencia do assunto root => FR = (qtde perguntas do assunto root / max(qtde de perguntas de cada assunto root)),

- frequencia do assunto => F = (qtde perguntas do assunto / max(qtde de perguntas de cada assunto)),
  de forma que o assunto mais frequente terá F = 1

- dificuldade do assunto => D = (1 - % de acertos em geral), de forma que dificuldade máxima será 1 e mínima 0

- Esquecimento => E = (1 - x/30), onde x é a qtde de dias desde a última realização de pergunta do assunto.
  (atribuir 0.1 se E < 0.1 => para não anular a sequência de SRS)

- SRS = E\*(4-FR-F-D)ˆP

Evitar ficar preso em um assunto:

- Monitorar a qtde de respostas erradas consecutivas (qrec) no mesmo micro-assunto, se igual a 5 => bloquear o micro-assunto
  por 10 acertos em outros micro-assuntos.

Gráficos:

- assunto root => mostrar em um mesmo gráfico as variáveis média móvel (últimas 20 notas), desvio padrão
  (divergência entre valores de srs dos assunto-filho)

- assunto => - média do dia, prioridade (% de questões em relacao ao total) - esforço (qtde questões do dia)

Nota:

A nota é mostrada ao usuário ao atingir a qtde mínima de questões por categoria:

- micro-assunto => 2 questões (nota inicial) e 3 questões (nota atual)
- assunto => quando todos os micro-assuntos possuem sua respectiva nota (inicial / atual)
- disciplina => quando todos os assuntos possuem sua respectiva nota (inicial / atual)

- Nota inicial simples => média aritmética simples das duas primeiras questões de um micro-assunto

- Nota atual simples => média aritmética simples das três últimas questões de um micro-assunto

- Nota inicial ponderada => média aritmética ponderada das duas primeiras questões de um micro-assunto (frequência do micro-assunto)

- Nota atual ponderada => média aritmética ponderada das três últimas questões de um micro-assunto (frequência do micro-assunto)

- Nota temporal => média aritmética simples de todas as questões resolvidas no último período de tempo (dia / semama / mês / semestre / ano)

- Nota histórica => média aritmética simples de todas as questões resolvidas

Conceito:

Será mostrado ao usuário o conceito atual no micro-assunto / assunto / disciplina:

- 0: não verificado (não respondeu nenhuma questão)
- 1: em análise (respondeu apenas uma questão)
- 2: ignorante
- 3: leigo
- 4: aprendiz
- 5: bacharel
- 6: mestre
- 7: doutor

A origem do aprendizado é categorizada como:

- em análise: menos que 3 respostas
- pré-existente: 100% acertos (3 primeiras questões no micro-assunto)
- adquirido: menos que 100% acertos (3 primeiras questões no micro-assunto)

# USO DE IA (ChatGPT ou similares)

- Recurso "Faça uma análise da minha evolução" => o Simulex fornece um json detalhado para a IA analisar e gerar uma crítica

# GOOGLE

ID Cliente Google: 937471846778-3k6hltnk8t7npp1minuetsp438olj2pr.apps.googleusercontent.com
Chave: y9nr6-5vprC0wNsWl-KRX7Na

# DOCKER

docker-compose up -d

docker exec -it <container_id_or_name> /bin/bash

- Exportar DB

docker exec -t simulex-postgres pg_dump -U <username> -s -d <database_name> -f /tmp/structure.sql
docker exec -t simulex-postgres pg_dump -U <username> -d <database_name> -f /tmp/structure_data.sql

docker cp simulex-postgres:/tmp/structure.sql .
docker cp simulex-postgres:/tmp/structure_data.sql .

- Importar DB

docker cp <caminho_do_arquivo_sql_no_host> <container_id_or_name>:/tmp/<nome_do_arquivo_sql>

docker exec -it <container_id_or_name> psql -U <username> -d <database_name> -f /tmp/<nome_do_arquivo_sql>
