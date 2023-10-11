document.addEventListener("DOMContentLoaded", function() {
    const pokemonDropdown = document.getElementById("pokemonDropdown");
    const selectedPokemonElement = document.getElementById("selectedPokemon");

    // Fetch list of Pokemon
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1000")
        .then(response => response.json())
        .then(data => {
            const pokemonArray = data.results;
            pokemonArray.forEach(pokemon => {
                const option = document.createElement("option");
                option.textContent = pokemon.name;
                pokemonDropdown.appendChild(option);
            });

            // Add event listener to the dropdown
            pokemonDropdown.addEventListener("change", () => {
                const selectedPokemonName = pokemonDropdown.value;
                const selectedPokemon = pokemonArray.find(p => p.name === selectedPokemonName);
                fetchPokemonDetails(selectedPokemon.url);
            });
        })
        .catch(error => console.error("Error fetching Pokemon list:", error));

    // Fetch and display Pokemon details
    function fetchPokemonDetails(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const spriteUrl = data.sprites.front_default;
                const types = data.types.map(type => type.type.name);

                // Create container for advantages
                const advantagesContainer = document.createElement("div");
                advantagesContainer.className = "advantages";
                selectedPokemonElement.innerHTML = ""; // Clear the existing content
                selectedPokemonElement.appendChild(advantagesContainer);

                // Fetch and display types that the selected Pokemon is weak against (disadvantages)
                getDoubleDamageTo(types)
                    .then(advantageTypes => {
                        advantageTypes.forEach(type => {
                            const advantageImage = createTypeImage(type, "disadvantage");
                            advantagesContainer.appendChild(advantageImage);
                        });
                    })
                    .catch(error => console.error("Error fetching Pokemon advantages types:", error));

                // Display sprite below advantages
                const pokemonImage = document.createElement("img");
                pokemonImage.src = spriteUrl;
                selectedPokemonElement.appendChild(pokemonImage);

                // Add separator for disadvantages
                const separatorDisadvantages = document.createElement("div");
                separatorDisadvantages.className = "separator";
                selectedPokemonElement.appendChild(separatorDisadvantages);

                // Create container for disadvantages
                const disadvantagesContainer = document.createElement("div");
                disadvantagesContainer.className = "disadvantages";
                selectedPokemonElement.appendChild(disadvantagesContainer);

                
				// Fetch and display types that the selected Pokemon is strong against (advantages)
                getDoubleDamageFrom(types)
                    .then(disadvantageTypes => {
                        disadvantageTypes.forEach(type => {
                            const disadvantageImage = createTypeImage(type, "advantage");
                            disadvantagesContainer.appendChild(disadvantageImage);
                        });
                    })
                    .catch(error => console.error("Error fetching Pokemon disadvantages types:", error));
            })
            .catch(error => console.error("Error fetching Pokemon details:", error));
    }

    // Fetch types that the selected Pokemon is strong against (advantages)
    function getDoubleDamageFrom(types) {
        const promises = types.map(type => {
            return fetch(`https://pokeapi.co/api/v2/type/${type}`)
                .then(response => response.json())
                .then(data => {
                    const doubleDamageFrom = data.damage_relations.double_damage_from.map(type => type.name);
                    return doubleDamageFrom;
                });
        });

        return Promise.all(promises)
            .then(results => [].concat(...results))
            .catch(error => {
                console.error("Error fetching type details:", error);
                return [];
            });
    }

    // Fetch types that the selected Pokemon is weak against (disadvantages)
    function getDoubleDamageTo(types) {
        const promises = types.map(type => {
            return fetch(`https://pokeapi.co/api/v2/type/${type}`)
                .then(response => response.json())
                .then(data => {
                    const doubleDamageTo = data.damage_relations.double_damage_to.map(type => type.name);
                    return doubleDamageTo;
                });
        });

        return Promise.all(promises)
            .then(results => [].concat(...results))
            .catch(error => {
                console.error("Error fetching type details:", error);
                return [];
            });
    }

    // Create an image element for a type
    function createTypeImage(type, className = "") {
        const typeImage = document.createElement("img");
        typeImage.className = className + " " + type; // Set class name
        typeImage.src = `Icon_${type}.webp`; // Adjust the path
        typeImage.alt = type;
        typeImage.title = type;
        return typeImage;
    }
});
