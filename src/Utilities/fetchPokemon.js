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
  return string[0].toUpperCase() + string.slice(1);
}

export default async function fetchPokeData() {
  // fetches data from primary apiUrl
  // then fetches detailed data from response urls
  return fetchData(apiUrl)
    .then(async (data) => {
      const results = data.results;
      let promises = [];
      let returnResults = [];
      results.forEach((result) => {
        promises.push(
          fetchData(result.url)
            .then((detailedData) => detailedData)
            .catch((message) => console.error(message))
        );
      });
      for await (const pokePromise of promises) {
        returnResults.push({
          pokedexNumber: pokePromise.id,
          name: capitalize(pokePromise.name),
          height: pokePromise.height / 10,
          weight: pokePromise.weight / 10,
          types: pokePromise.types.map((type) => type.type.name),
          sprite: pokePromise.sprites.front_default
        });
      }
      return returnResults;
    })
    .catch((message) => console.error(message));
}
