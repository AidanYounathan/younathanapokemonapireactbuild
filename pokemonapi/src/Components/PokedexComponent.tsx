import React, { useCallback, useEffect, useState } from "react";
import "../Components/PokedexComponent.css";
import unfavhrt from "./Assets/Vector.png";
import favhrt from "./Assets/favorited.png";
import bulb from "./Assets/1 2.png";
import {
  Evolution,
  Location1,
  Location2,
  Pokemon,
  RegEvolution,
} from "../DataServices/Interfaces/Interfaces";
import {
  PokemonEvolutionId,
  PokemonEvolutionImageName,
  getAPI,
  pokeData,
  pokeDataEvo,
} from "../DataServices/DataServices";

const PokedexComponent = () => {
  const [userInput, setUserInput] = useState<string>("Bulbasaur");

  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [location, setLocation] = useState<Location1>();
  const [evoData, setEvoData] = useState<Evolution>();
  const [imgSrc, setImgSrc] = useState<string>("");
  const [pokeNum, setPokeNum] = useState<string>("")
  const [pokemonEvolution, setPokemonEvolution] = useState<RegEvolution | null>(
    null
  );
  const [pokemonEvoData, setPokeEvoData] = useState<string[]>([]);
  const [evolutionDatas, setEvolutionData] = useState<
    { evolutionImage: string; evolutionId: string }[]
  >([]);
  const [favorite, setFavorite] = useState<string>(unfavhrt);
  const [favorites, setFavorites] = useState<Pokemon[]>([]);

  useEffect(() => {
    const getData = async () => {
      const pokemonData = await pokeData(userInput);
      const data: Pokemon = pokemonData;
      const locationData = await getAPI(data.location_area_encounters);
      const locData: Location1 = locationData;
      const evolutionData = await pokeDataEvo(userInput);
      const evoData: Evolution = evolutionData;
      const evoTypeData = await getAPI(evoData.evolution_chain.url);
      
      const evoType:
        | {
          evolution_chain: {
            chain: {
              species: { name: string };
              evolves_to: { species: { name: string }[] }[];
            };
          };
        }
        | any
        | RegEvolution = evoTypeData;
      console.log(evoType);
      setPokemonEvolution(evoType);
      setEvoData(evoData);
      setLocation(locData);
      setPokemon(data);
      setPokeNum(pokemon && pokemon.id ? `#${pokemon.id}` : "Loading")
      const favorites = getLocalStorage();
      const isFavorite = favorites.some(
        (favPokemon: Pokemon) =>
          favPokemon.name === userInput || String(favPokemon.id) === userInput
      );
      if (isFavorite) {
        setFavorite(favhrt);
      } else {
        setFavorite(unfavhrt);
      }
      const pokemonEvolutionChain: string[] = [];
      if (evoType && evoType.chain) {
        pokemonEvolutionChain.push(evoType.chain.species.name);
        evoType.chain.evolves_to.forEach(
          (e: { species: { name: string }; evolves_to: string[] }) => {
            e.species && pokemonEvolutionChain.push(e.species.name);
            e.evolves_to.forEach((e: any) => {
              e.species && pokemonEvolutionChain.push(e.species.name);
            });
          }
        );
      }
      setPokeEvoData(pokemonEvolutionChain);
      console.log(pokemonEvolutionChain);
    };
    const favoritesData = getLocalStorage();
    setFavorites(favoritesData);
    console.log(favorites);
    console.log(location);
    getData();
    
  }, [userInput, favorite]);

  const getLocalStorage = () => {
    let localStorageData = localStorage.getItem("Favorites");
    if (localStorageData == null) {
      return [];
    }
    return JSON.parse(localStorageData);
  };

  const fetchEvolutionData = useCallback(async () => {
    const promise = pokemonEvoData.map(async (evolutionName: string) => {
      const evolutionImage = await PokemonEvolutionImageName(evolutionName);
      const evolutionId = await PokemonEvolutionId(evolutionName);
      return { evolutionImage, evolutionId: String(evolutionId) };
    });
    const dataEvo = await Promise.all(promise);
    setEvolutionData(dataEvo);
  }, [pokemonEvoData]);

  useEffect(() => {
    fetchEvolutionData();
  }, [fetchEvolutionData]);

  useEffect(() => {
    const favoritesData = getLocalStorage();
    setFavorites(favoritesData);
    console.log(evolutionDatas);
  }, []);


  useEffect(() => {
    const checkIfFavorite = () => {
      const currentFavorites = getLocalStorage(); // Fetch current favorites from local storage
      const isFavorited = currentFavorites.some((fav : Pokemon) => fav.name === pokemon?.name);
      setFavorite(isFavorited ? favhrt : unfavhrt);
    };
  
    if (pokemon) {
      checkIfFavorite();
    }
  }, [pokemon , favorites]);
  


  const CapitalFirstLetter = (userInput: string) => {
    if (!userInput) return "";

    let uncapped = userInput.split("-");
    let cappedWords = uncapped.map(
      (uncapped) => uncapped.charAt(0).toUpperCase() + uncapped.slice(1)
    );
    let formattedInput = cappedWords.join(" ");

    return formattedInput;
  };

  const saveToLS = (pokemon: Pokemon | null) => {
    let favorites = getLocalStorage();
    if (pokemon && !favorites.includes(pokemon)) {
      favorites.push(pokemon);
      localStorage.setItem("Favorites", JSON.stringify(favorites));
    }
  };

  const removeFromLS = (pokemon: Pokemon | null) => {
    let favorites = getLocalStorage();
    if (pokemon) {
      const pokemonName = pokemon.name;
      const namedIndex = favorites.findIndex(
        (favPokemon: Pokemon) => favPokemon.name === pokemonName
      );
      if (namedIndex !== -1) {
        favorites.splice(namedIndex, 1);
        localStorage.setItem("Favorites", JSON.stringify(favorites));
      }
    }
  };


  // const pokemonName = pokemon?.name;
  // const isAlreadyFavorite = favorites.some((favPokemon: Pokemon) => favPokemon.name === pokemonName);


//   const handleFavoriteClick = () => {
//     const pokemonName = pokemon?.name;
//     if (pokemonName) {
//         const favorites = getLocalStorage();
//         const isAlreadyFavorite = favorites.some((favPokemon: Pokemon) => favPokemon.name === pokemonName);
//         if (isAlreadyFavorite) {
            
//             setFavorite(unfavhrt);
//             removeFromLS(pokemon);
//         } else {
//             setFavorite(favhrt)
//             saveToLS(pokemon);
//         }
//     }
// };

// const handleRemoveFavorite = (pokemonToRemove: Pokemon) => {
//   const favorites = getLocalStorage();
//   const updatedFavorites = favorites.filter((favPokemon : Pokemon) => favPokemon.name !== pokemonToRemove.name);
//   localStorage.setItem("Favorites", JSON.stringify(updatedFavorites));
//   setFavorites(updatedFavorites);
//   // Update the favorite icon if the currently viewed Pokémon is removed
//   if (pokemon?.name === pokemonToRemove.name) {
//     setFavorite(unfavhrt);
//   }
// };



const addFavorite = (pokemon: Pokemon) => {
  const favorites = getLocalStorage();
  if (!favorites.some((favPokemon: Pokemon) => favPokemon.name === pokemon.name)) {
    const updatedFavorites = [...favorites, pokemon];
    localStorage.setItem("Favorites", JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);
  }
};

// const handleFavoriteClick = (pokemon: Pokemon) => {
//   const favorites = getLocalStorage();
//   const isAlreadyFavorite = favorites.some((favPokemon: Pokemon) => favPokemon.name === pokemon.name);

//   if (isAlreadyFavorite) {
//     removeFavorite(pokemon);
//     setFavorite(unfavhrt); // Assuming you're toggling the icon in UI
//   } else {
//     addFavorite(pokemon);
//     setFavorite(favhrt); // Toggling the icon to show it's a favorite
//   }
// };

const handleFavoriteClick = () => {
  if (pokemon) {  // This checks if there is a currently selected pokemon
    const favorites = getLocalStorage();
    const isAlreadyFavorite = favorites.some((favPokemon: Pokemon) => favPokemon.name === pokemon.name);

    if (isAlreadyFavorite) {
      removeFavorite(pokemon);
      setFavorite(unfavhrt); // Assuming you're toggling the icon in UI
    } else {
      addFavorite(pokemon);
      setFavorite(favhrt); // Toggling the icon to show it's a favorite
    }
  }
};

const removeFavorite = (pokemon: Pokemon) => {
  const favorites = getLocalStorage();
  const updatedFavorites = favorites.filter((favPokemon: Pokemon) => favPokemon.name!== pokemon.name);
  localStorage.setItem("Favorites", JSON.stringify(updatedFavorites));
  setFavorites(updatedFavorites);
};

  // const handleFavoriteClick = () => {
  //   if (pokemonName) {
  //     const favorites = getLocalStorage();
  //     if (isAlreadyFavorite) {
  //       setFavorite(unfavhrt);
  //       removeFromLS(pokemon);
  //     } else {
  //       setFavorite(favhrt);
  //       saveToLS(pokemon);
  //     }
  //   }
  // };

  const [favClassName, setFavClassName] = useState<string>("-translate-x-full");
  const handleFavDrawerClick = () => {
    if (favClassName !== "-translate-x-full") {
      setFavClassName("-translate-x-full");
    } else {
      setFavClassName("");
    }
  }
  

  const genRandomNumber = async () => {
    const randomId: string = String(Math.floor(Math.random() * 898) + 1);
    const getName: Pokemon = await pokeData(randomId);
    setUserInput(getName.name);
    setImgSrc("");
  };

  const handleShinyClick = () => {
    const shinyPic = pokemon?.sprites.other?.["official-artwork"].front_shiny;
    const defaultPic =
      pokemon?.sprites.other?.["official-artwork"].front_default;

    if (shinyPic && imgSrc !== shinyPic) {
      setImgSrc(shinyPic);
    } else if (defaultPic && imgSrc !== defaultPic) {
      setImgSrc(defaultPic);
    }
  };



  return (
    <div className="  bg-slate-600 m-3 md:m-8 flex justify-center">
      <div className="mb-6">
        <p className="text-center title text-6xl mt-4 md:text-8xl">One Dex</p>

        <div className="mb-5 mt-11 flex justify-center">
          <input
            type="text"
            id="searchBar"
            placeholder="Pokemon Name/Number"
            className="bg-gray-50 border  md:text-4xl w-60 md:w-[500px] border-gray-300 text-gray-900  rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onKeyDown={(
              e:
                | React.KeyboardEvent<HTMLInputElement>
                | React.ChangeEvent<HTMLInputElement>
            ) => {
              if (
                (e as React.KeyboardEvent<HTMLInputElement>).key === "Enter"
              ) {
                setUserInput(
                  (e as React.ChangeEvent<HTMLInputElement>).target.value
                );
              }
            }}
          />
        </div>

        <div className="flex justify-center">
          <button
            id="btn2"
            type="button"
            className="text-white bg-gradient-to-r md:text-3xl from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg  px-5 py-2.5 text-center me-5 md:me-11 mb-2 "
            onClick={handleFavDrawerClick}
          >
            Favorites
          </button>
          <button
            id="btn"
            type="button"
            className="text-white bg-gradient-to-r md:text-3xl  from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-1 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg  px-5 py-2.5 text-center me-2 mb-2"
            onClick={genRandomNumber}

          >
            Random
          </button>
        </div>

        <div className="flex justify-center">
          <div className="flex">
            <div className="">
              <p id="pokeName" className="text-4xl md:text-5xl mt-5">
                {pokemon && pokemon
                  ? CapitalFirstLetter(pokemon.name)
                  : "Bulbasaur"}
              </p>
            </div>
            <div className="favEmpt ">
              <img
                onClick={() => handleFavoriteClick()}
                className="h-[25px] md:h-[33px] flex ml-5 cursor-pointer"
                src={favorite}
                alt="favorite pokemon btn"
              />
            </div>
          </div>
        </div>
        <div>
          <p className="text-center text-4xl mt-4" id="pokeNum">
            {pokemon && pokemon.id ? `#${pokemon.id.toString().padStart(3, '0')}` : "Loading"}
          </p>
        </div>
        <div id="pokeTypes" className="flex  mt-9 justify-evenly"></div>

        <div className="flex justify-center">
          <img
            className="w-[475px]"
            id="pokeImg"
            src={
              imgSrc ||
              pokemon?.sprites.other?.["official-artwork"].front_default
            }
            onClick={handleShinyClick}
            alt="A pokemon"
          />
        </div>

        <div className="max-w-[600px] px-5">
          <p className="outlined decoration-white decoration-2 underline text-center text-6xl text-white">
            Evolutions
          </p>
          <div
            id="evoPath"
            className="text-center text-[40px] text-white outlined2 pb-1"
          >
            {evolutionDatas.map(({ evolutionImage, evolutionId }, index) => (
              <div>
                <p className="  text-center text-white">
                  {CapitalFirstLetter(pokemonEvoData[index])}
                </p>
              </div>
            ))}
          </div>
          <hr className="breakers" />
          <div className="flex text-white outlined2 text-3xl md:text-5xl mb-5 mt-4 ">
            <p className="mr-5">Location:</p>
            <p className=" overflow-scroll max-h-[100px]">
              {location && Array.isArray(location) && location.length > 0
                ? location.map(
                  (
                    locationItem: { location_area: { name: string } },
                    index: number
                  ) => (
                    <span key={index}>
                      {CapitalFirstLetter(
                        `${locationItem.location_area.name}`
                      )}
                      {index !== location.length - 1 && ", "}
                    </span>
                  )
                )
                : "Location Unknown"}
            </p>
          </div>
          <hr className="breakers" />
          <div className="flex text-white outlined2 text-3xl md:text-5xl my-4">
            <p className="mr-5">Abilities:</p>
            <p>

              {pokemon?.abilities.map(
                (ability: { ability: { name: string } }, index: number) => (
                  <span key={index}>
                    {CapitalFirstLetter(`${ability.ability.name}`)}
                    {index !== pokemon.abilities.length - 1 && ", "}
                  </span>
                )
              )}
            </p>
          </div>
          <hr className="breakers" />
          <div className="flex text-white outlined2 text-3xl md:text-5xl mt-4 ">
            <p className="mr-5">Moves:</p>
            <p className="overflow-scroll max-h-[187px]">
              {pokemon?.moves.map(
                (move: { move: { name: string } }, index: number) => (
                  <span key={index}>
                    {CapitalFirstLetter(`${move.move.name}`)}
                    {index !== pokemon.moves.length - 1 && ", "}
                  </span>
                )
              )}
            </p>
          </div>
        </div>
      </div>

      <div id="drawer-navigation" className={`fixed top-0 bg-[#D9D9D9] left-0 z-40 w-full lg:w-[420px] h-screen p-4 overflow-y-auto transition-transform dark:bg-gray-800 ${favClassName}`}>
        <p id="drawer-navigation-label" className=" text-[2.8rem] ">Favorites</p>
        <button onClick={handleFavDrawerClick} type="button" className=" bg-transparent  hover:text-gray-500 absolute top-6 end-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
          <svg aria-hidden="true" className="w-[50px] h-[50px] grid" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"></path></svg>
        </button>
        <div className="py-4 overflow-y-auto ">
          <div id="getFavoritesDiv">
            {favorites.map((pokemonName: Pokemon, index: number) => (
              <div key={index} className="flex justify-between flex-row">
                <p className=" text-black  text-[32px] w-full rounded-l-lg px-2 cursor-pointer" onClick={() => setUserInput(pokemonName.name)}>
                  <span>{`${CapitalFirstLetter(pokemonName.name)}`}</span>
                </p>
                <button className=" text-[32px]  hover:text-gray-500 px-5 h-full" onClick={handleFavoriteClick}  >
                  {"X"}
                </button>
              </div>
            ))}


          </div>
        </div>


      </div>


    </div>
  );
};

export default PokedexComponent;
