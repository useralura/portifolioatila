// Verifica se o navegador suporta Service Workers
if ('serviceWorker' in navigator) {
    // Aguarda o carregamento completo da página
    window.addEventListener('load', () => {
        // Registra o Service Worker, que vai permitir o site funcionar offline
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registrado com sucesso: ', registration);
            }).catch((registrationError) => {
                console.error('ServiceWorker falhou ao registrar: ', registrationError);
            });
    });
}

// Função para inicializar o banco de dados IndexedDB
function initializeIndexedDB() {
    return new Promise((resolve, reject) => {
        // Verifica se o navegador suporta IndexedDB
        if (!window.indexedDB) {
            console.error("Seu navegador não suporta IndexedDB");
            return reject("IndexedDB não suportado");
        }

        // Abre ou cria o banco de dados chamado "tradutor-db" com versão 1
        const request = window.indexedDB.open("tradutor-db", 1);

        // Trata o erro ao tentar abrir o banco de dados
        request.onerror = function (event) {
            console.error("Erro ao abrir o banco de dados:", event.target.error);
            return reject(event.target.error);
        };

        // Executa ao criar ou atualizar o banco de dados
        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            // Cria um object store chamado "palavras" com chave primária "id"
            const objectStore = db.createObjectStore("palavras", { keyPath: "id", autoIncrement: true });
            // Cria um índice para a coluna "english"
            objectStore.createIndex("english", "english", { unique: false });
            // Cria um índice para a coluna "portuguese"
            objectStore.createIndex("portuguese", "portuguese", { unique: false });
        };

        // Executa ao abrir o banco de dados com sucesso
        request.onsuccess = function (event) {
            const db = event.target.result;
            return resolve(db);
        };
    });
}

// Função para adicionar dados ao IndexedDB a partir de um array de dados (ex: arquivo CSV)
function addDataToIndexedDB(db, data) {
    return new Promise((resolve, reject) => {
        // Inicia uma transação de leitura/escrita no object store "palavras"
        const transaction = db.transaction(["palavras"], "readwrite");
        const objectStore = transaction.objectStore("palavras");

        // Adiciona cada item do array de dados ao object store
        data.forEach(item => {
            const request = objectStore.add({ english: item[0].trim().toLowerCase(), portuguese: item[1].trim().toLowerCase() });

            // Trata erros ao adicionar itens
            request.onerror = function (event) {
                console.error("Erro ao adicionar item:", event.target.error);
                return reject(event.target.error);
            };

            // Loga o sucesso ao adicionar cada item
            request.onsuccess = function (event) {
                console.log("Item adicionado com sucesso:", item);
            };
        });

        // Executa ao finalizar a transação
        transaction.oncomplete = function () {
            console.log("Todos os itens foram adicionados ao IndexedDB");
            return resolve();
        };
    });
}

// Função para buscar uma palavra no IndexedDB (suporta busca em inglês e português)
function searchWordInIndexedDB(db, word) {
    return new Promise((resolve, reject) => {
        // Inicia uma transação de leitura no object store "palavras"
        const transaction = db.transaction(["palavras"], "readonly");
        const objectStore = transaction.objectStore("palavras");

        // Tenta buscar a palavra no índice "english"
        let index = objectStore.index("english");
        let request = index.get(word);

        // Trata erro na busca em inglês
        request.onerror = function (event) {
            console.error("Erro ao buscar a palavra em inglês:", event.target.error);
            return reject("Erro ao buscar a palavra");
        };

        // Se a palavra for encontrada em inglês, retorna a tradução
        request.onsuccess = function (event) {
            const result = event.target.result;
            if (result) {
                return resolve(result.portuguese);
            } else {
                // Se não encontrou a palavra em inglês, tenta buscar no índice "portuguese"
                index = objectStore.index("portuguese");
                request = index.get(word);

                // Trata erro na busca em português
                request.onerror = function (event) {
                    console.error("Erro ao buscar a palavra em português:", event.target.error);
                    return reject("Erro ao buscar a palavra");
                };

                // Se a palavra for encontrada em português, retorna a tradução
                request.onsuccess = function (event) {
                    const result = event.target.result;
                    if (result) {
                        return resolve(result.english);
                    } else {
                        // Se não encontrou em nenhum dos índices, rejeita a promessa
                        return reject("Tradução não encontrada");
                    }
                };
            }
        };
    });
}

// Função principal para traduzir uma palavra
async function traduzir() {
    // Pega o valor do campo de entrada, remove espaços em branco e converte para minúsculas
    const palavraInput = document.getElementById("palavraInput").value.trim().toLowerCase();

    // Se o campo estiver vazio, exibe uma mensagem de aviso
    if (!palavraInput) {
        return exibirTraducao("Por favor, insira uma palavra");
    }

    try {
        // Inicializa o banco de dados
        const db = await initializeIndexedDB();

        //
