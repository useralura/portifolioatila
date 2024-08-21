// Registra o Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registrado com sucesso: ', registration);
            }).catch((registrationError) => {
                console.error('ServiceWorker falhou ao registrar: ', registrationError);
            });
    });
}

// Função para inicializar o IndexedDB
function initializeIndexedDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            console.error("Seu navegador não suporta IndexedDB");
            return reject("IndexedDB não suportado");
        }

        const request = window.indexedDB.open("tradutor-db", 1);

        request.onerror = function (event) {
            console.error("Erro ao abrir o banco de dados:", event.target.error);
            return reject(event.target.error);
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            const objectStore = db.createObjectStore("palavras", { keyPath: "id", autoIncrement: true });
            objectStore.createIndex("english", "english", { unique: false });
            objectStore.createIndex("portuguese", "portuguese", { unique: false });
        };

        request.onsuccess = function (event) {
            const db = event.target.result;
            return resolve(db);
        };
    });
}

// Função para adicionar dados ao IndexedDB a partir do arquivo CSV
function addDataToIndexedDB(db, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["palavras"], "readwrite");
        const objectStore = transaction.objectStore("palavras");

        data.forEach(item => {
            const request = objectStore.add({ english: item[0].trim().toLowerCase(), portuguese: item[1].trim().toLowerCase() });

            request.onerror = function (event) {
                console.error("Erro ao adicionar item:", event.target.error);
                return reject(event.target.error);
            };

            request.onsuccess = function (event) {
                console.log("Item adicionado com sucesso:", item);
            };
        });

        transaction.oncomplete = function () {
            console.log("Todos os itens foram adicionados ao IndexedDB");
            return resolve();
        };
    });
}

// Função para buscar uma palavra no IndexedDB (suporta busca em inglês e português)
function searchWordInIndexedDB(db, word) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["palavras"], "readonly");
        const objectStore = transaction.objectStore("palavras");

        // Tenta buscar pela palavra em inglês
        let index = objectStore.index("english");
        let request = index.get(word);

        request.onerror = function (event) {
            console.error("Erro ao buscar a palavra em inglês:", event.target.error);
            return reject("Erro ao buscar a palavra");
        };

        request.onsuccess = function (event) {
            const result = event.target.result;
            if (result) {
                return resolve(result.portuguese);
            } else {
                // Se não encontrou a palavra em inglês, tenta buscar pela palavra em português
                index = objectStore.index("portuguese");
                request = index.get(word);

                request.onerror = function (event) {
                    console.error("Erro ao buscar a palavra em português:", event.target.error);
                    return reject("Erro ao buscar a palavra");
                };

                request.onsuccess = function (event) {
                    const result = event.target.result;
                    if (result) {
                        return resolve(result.english);
                    } else {
                        return reject("Tradução não encontrada");
                    }
                };
            }
        };
    });
}

// Função principal para traduzir uma palavra
async function traduzir() {
    const palavraInput = document.getElementById("palavraInput").value.trim().toLowerCase();

    if (!palavraInput) {
        return exibirTraducao("Por favor, insira uma palavra");
    }

    try {
        const db = await initializeIndexedDB();

        // Verifica se a palavra está no IndexedDB
        try {
            const translation = await searchWordInIndexedDB(db, palavraInput);
            exibirTraducao(translation);
        } catch (error) {
            console.error(error);
            exibirTraducao("Tradução não encontrada");
        }
    } catch (error) {
        console.error(error);
        exibirTraducao("Erro ao carregar o banco de dados");
    }
}

// Função para exibir a tradução na página
function exibirTraducao(translation) {
    document.getElementById("traducao").innerText = "Tradução: " + translation;
}

// Função para verificar se há conexão com a Internet
function checkOnlineStatus() {
    return navigator.onLine;
}

// Função para verificar e atualizar os dados do IndexedDB quando a conexão estiver disponível
async function checkAndSyncData() {
    if (checkOnlineStatus()) {
        try {
            const response = await fetch("palavras.csv");
            const text = await response.text();
            const rows = text.split("\n").map(row => row.split(","));

            const db = await initializeIndexedDB();
            const transaction = db.transaction(["palavras"], "readwrite");
            const objectStore = transaction.objectStore("palavras");

            // Limpa o IndexedDB antes de adicionar os novos dados
            await clearObjectStore(objectStore);

            // Adiciona os novos dados ao IndexedDB
            await addDataToIndexedDB(db, rows);

            console.log("Dados sincronizados com sucesso.");
        } catch (error) {
            console.error("Erro ao verificar e sincronizar os dados:", error);
        }
    } else {
        console.log("O dispositivo está offline. Não foi possível verificar e sincronizar os dados.");
    }
}

// Função para limpar o object store do IndexedDB
function clearObjectStore(objectStore) {
    return new Promise((resolve, reject) => {
        const request = objectStore.clear();

        request.onerror = function (event) {
            console.error("Erro ao limpar o object store:", event.target.error);
            return reject(event.target.error);
        };

        request.onsuccess = function (event) {
            console.log("Object store limpo com sucesso.");
            return resolve();
        };
    });
}

// Verifica e sincroniza os dados do IndexedDB quando o usuário ficar online novamente
window.addEventListener('online', checkAndSyncData);

// Inicia o processo de verificação e sincronização quando o script é carregado
checkAndSyncData();
