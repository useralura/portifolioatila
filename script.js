function traduzir() {
    var palavraInput = document.getElementById("palavraInput").value.trim().toLowerCase();

    // Requisição AJAX para carregar o arquivo CSV
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var linhas = xhr.responseText.split("\n");
                var traducao = encontrarTraducao(palavraInput, linhas);
                exibirTraducao(traducao);
            } else {
                console.error("Erro ao carregar o arquivo CSV");
            }
        }
    };
    xhr.open("GET", "palavras.csv", true);
    xhr.send();
}

function encontrarTraducao(palavra, linhas) {
    // Variável para armazenar a palavra com a menor distância
    var melhorCorrespondencia = { palavra: "", distancia: Infinity };

    for (var i = 0; i < linhas.length; i++) {
        var colunas = linhas[i].split(",");
        if (colunas.length >= 2) {
            // Verifica se a palavra está na primeira coluna
            if (colunas[0].trim().toLowerCase() === palavra) {
                return colunas[1].trim();
            }
            // Verifica se a palavra está na segunda coluna
            else if (colunas[1].trim().toLowerCase() === palavra) {
                return colunas[0].trim();
            } else {
                // Calcula a distância de Levenshtein entre a palavra e a palavra na planilha
                var distancia = levenshtein(palavra, colunas[0].trim().toLowerCase());
                // Se a distância for menor do que a melhor correspondência até agora, atualiza a melhor correspondência
                if (distancia < melhorCorrespondencia.distancia) {
                    melhorCorrespondencia.palavra = colunas[0].trim();
                    melhorCorrespondencia.distancia = distancia;
                }
                distancia = levenshtein(palavra, colunas[1].trim().toLowerCase());
                if (distancia < melhorCorrespondencia.distancia) {
                    melhorCorrespondencia.palavra = colunas[1].trim();
                    melhorCorrespondencia.distancia = distancia;
                }
            }
        }
    }
    // Se a melhor correspondência tiver uma distância aceitável, retorna a palavra correspondente
    if (melhorCorrespondencia.distancia <= 2) {
        return "Você quis dizer: " + melhorCorrespondencia.palavra;
    } else {
        return "Tradução não encontrada";
    }
}

function exibirTraducao(traducao) {
    document.getElementById("traducao").innerText = "Tradução: " + traducao;
}

// Função para calcular a distância de Levenshtein
function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    var matrix = [];

    // Inicializa a matriz
    for (var i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (var j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Calcula a distância
    for (var i = 1; i <= b.length; i++) {
        for (var j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // Substituição
                    matrix[i][j - 1] + 1,     // Inserção
                    matrix[i - 1][j] + 1      // Remoção
                );
            }
        }
    }

    return matrix[b.length][a.length];
}
