const apiUrl = "https://pokeapi.co/api/v2/pokemon/";

function fetchData(url) {
  // returns a promise with resolve and reject
  // based on the response status of the fetch request
  return new Promise(async function (resolve, reject) {
    const response = await fetch(url);
    if (response.status === 200) {
      resolve(response.json());
    } else {
      reject("Response status: ", response.status);
    }
  });
}

function capitalize(string) {
  // capitalize the first letter of a string
  return string[0].toUpperCase() + string.slice(1);
}

export async function fetchPokePages(page) {
  // fetches data from primary apiUrl
  // then fetches further data as pages are called
  const url = page.pageParam ? page.pageParam : apiUrl;
  const res = await fetch(url);
  return res.json();
}

export async function fetchPokemonByUrls(query) {
  // fetches detailed Pokemon data based on initial
  // query results
  let urls = [];
  query.queryKey[1].forEach(arr => arr.forEach(item => urls.push(item)));
  let returnResults = [];
  let promises = [];
  urls.forEach((url) => {
    promises.push(
      fetchData(url)
        .then((detailedData) => detailedData)
        .catch((message) => console.error(message))
    );
  })
  for await (const pokePromise of promises) {
    returnResults.push({
      pokedexNumber: pokePromise.id,
      name: capitalize(pokePromise.name),
      height: pokePromise.height / 10,
      weight: pokePromise.weight / 10,
      types: pokePromise.types.map((type) => type.type.name),
      sprite: pokePromise.sprites.front_default,
      shiny: pokePromise.sprites.front_shiny,
    });
  }
  return returnResults;
}
