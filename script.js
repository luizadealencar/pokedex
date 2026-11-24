const resultado = document.querySelector("#resultado");
const formulario = document.querySelector("#formulario");
const campoBusca = document.querySelector("#busca");

const tiposEmPortugues = {
    normal: "Normal",
    fire: "Fogo",
    water: "Agua",
    electric: "Eletrico",
    grass: "Planta",
    ice: "Gelo",
    fighting: "Lutador",
    poison: "Veneno",
    ground: "Terra",
    flying: "Voador",
    psychic: "Psíquico",
    bug: "Inseto",
    rock: "Pedra",
    ghost: "Fantasma",
    dragon: "Dragão",
    dark: "Sombrio",
    steel: "Aço",
    fairy: "Fada"
};

const habilidadesEmPortugues = {
    static: "Estática",
    "lightning-rod": "Para-raios",
    "overgrow": "Supercrescimento",
    "blaze": "Chama",
    "torrent": "Torrent",
    "shield-dust": "Pó de Escudo",
    "shed-skin": "Troca de Pele",
    "compound-eyes": "Olhos Compostos",
    "swarm": "Enxame",
    "keen-eye": "Olhos de Gato",
    "run-away": "Fuga",
    "sand-veil": "Velo de Areia",
    "poison-point": "Ponto Venenoso",
    "inner-focus": "Foco Interno",
    "water-absorb": "Absorção de Agua",
    "chlorophyll": "Clorofila",
    "synchronize": "Sincronizar",
    "levitate": "Levitação",
    "flash-fire": "Fogo Chamuscante",
    "pressure": "Pressão"
};

const nomesEmPortugues = {
    pikachu: "Pikachu"
};

async function buscarNomePortugues(dados, idioma = "pt-BR") {
    const nomes = dados.names;
    if (!nomes) return dados.name;

    const nomeLocalizado = nomes.find((item) =>
        item.language.name === idioma ||
        item.language.name === "pt"
    );

    if (nomeLocalizado) return nomeLocalizado.name;
    return nomesEmPortugues[dados.name] || dados.name;
}

async function buscarPokemon(busca = "pikachu") {
    resultado.innerHTML = "<p>Carregando...</p>";

    try {
        const resposta = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(busca.toLowerCase())}`
        );

        if (!resposta.ok) throw new Error("Pokemon nao encontrado");

        const pokemon = await resposta.json();
        const dadosTraducao = await Promise.all([
            fetch(pokemon.species.url).then((resposta) => resposta.json()),
            Promise.all(pokemon.types.map((item) =>
                fetch(item.type.url).then((resposta) => resposta.json())
            )),
            Promise.all(pokemon.abilities.map((item) =>
                fetch(item.ability.url).then((resposta) => resposta.json())
            ))
        ]);

        const [especie, tiposInfo, habilidadesInfo] = dadosTraducao;
        const nomePokemon = await buscarNomePortugues(especie);
        const tipos = (await Promise.all(
            tiposInfo.map((tipo) =>
                tiposEmPortugues[tipo.name] || buscarNomePortugues(tipo)
            )
        )).join(", ");
        const habilidades = (await Promise.all(
            habilidadesInfo.map((habilidade) =>
                habilidadesEmPortugues[habilidade.name] ||
                buscarNomePortugues(habilidade)
            )
        )).join(", ");
        const imagem = pokemon.sprites.other["official-artwork"].front_default
            || pokemon.sprites.front_default;

        const card = document.createElement("article");
        card.className = "pokemon";

        if (imagem) {
            const foto = document.createElement("img");
            foto.src = imagem;
            foto.alt = pokemon.name;
            card.appendChild(foto);
        }

        const numero = document.createElement("p");
        numero.className = "numero";
        numero.textContent = `#${String(pokemon.id).padStart(3, "0")}`;

        const nome = document.createElement("h2");
        nome.textContent = nomePokemon;

        const detalhes = document.createElement("p");
        detalhes.innerHTML =
            `<strong>Tipo:</strong> ${tipos}<br>` +
            `<strong>Habilidades:</strong> ${habilidades}<br>` +
            `<strong>Altura:</strong> ${pokemon.height / 10} m<br>` +
            `<strong>Peso:</strong> ${pokemon.weight / 10} kg`;

        card.append(numero, nome, detalhes);
        resultado.replaceChildren(card);
    } catch (erro) {
        resultado.innerHTML = "<p>Pokemon nao encontrado. Tente outro nome ou numero.</p>";
        console.error(erro);
    }
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    buscarPokemon(campoBusca.value.trim() || "pikachu");
});

buscarPokemon();
