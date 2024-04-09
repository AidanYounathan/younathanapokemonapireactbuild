import React, { useEffect, useState } from 'react'
import '../Components/PokedexComponent.css'
import unfavhrt from "./Assets/Vector.png"
import favhrt from "./Assets/favorited.png"
import bulb from "./Assets/1 2.png"
import { Evolution, Pokemon, RegEvolution } from '../DataServices/Interfaces/Interfaces'
import { getAPI, pokeData, pokeDataEvo } from '../DataServices/DataServices'




const PokedexComponent = () => {

  const [userInput, setUserInput] = useState<string>("Bulbasaur");




  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [location, setLocation] = useState<Location>();
  const [evoData, setEvoData] = useState<Evolution>();
  const [imgSrc, setImgSrc] = useState<string>("");
  const [pokemonEvolution, setPokemonEvolution] = useState<RegEvolution | null>(null);
  const [pokemonEvoData, setPokeEvoData] = useState<string[]>([]);
  const [evolutionDatas, setEvolutionData] = useState<{ evolutionImage: string, evolutionId: string }[]>([])
  const [favorite, setFavorite] = useState<string>(unfavhrt);
  const [favorites, setFavorites] = useState<Pokemon[]>([]);
  

  useEffect(() => {
    const getData = async () => {
        const pokemonData = await pokeData(userInput);
        const data: Pokemon = pokemonData;

        const locationData = await getAPI(data.location_area_encounters);
        const locData: Location = locationData;

        const evolutionData = await pokeDataEvo(userInput);
        const evoData: Evolution = evolutionData;
        console.log(evoData.evolution_chain.url);
        const evoTypeData = await getAPI(evoData.evolution_chain.url);
        const evoType: {evolution_chain:{chain:{species:{name:string}; evolves_to:{species:{name:string}[]}[]}}}| any | RegEvolution = evoTypeData;
        console.log(evoType);
        setPokemonEvolution(evoType);
        setEvoData(evoData);
        setLocation(locData);
        setPokemon(data);
        
        
        const favorites = getLocalStorage();
        const isFavorite = favorites.some((favPokemon: Pokemon) => favPokemon.name === userInput || String(favPokemon.id) === userInput);
        if (isFavorite) {
            setFavorite(favhrt);
        } else {
            setFavorite(unfavhrt);
        }
        const pokemonEvolutionChain: string[] = [];
        if (evoType && evoType.chain) {
            pokemonEvolutionChain.push(evoType.chain.species.name);
            evoType.chain.evolves_to.forEach((e: {species:{name:string;}; evolves_to: string[];}) => {
                e.species && pokemonEvolutionChain.push(e.species.name);
                e.evolves_to.forEach((e: any) => {
                    e.species && pokemonEvolutionChain.push(e.species.name);
                });
            });
        }
        setPokeEvoData(pokemonEvolutionChain);
        console.log(pokemonEvolutionChain);
    };
    const favoritesData = getLocalStorage();
    setFavorites(favoritesData);
    console.log(favorites)
    getData();

}, [userInput, favorite]);


const getLocalStorage = () => {
  let localStorageData = localStorage.getItem("Favorites");
  if (localStorageData == null) {
      return [];
  }
  return JSON.parse(localStorageData);
}


  const CapitalFirstLetter = (userInput: string) => {
    if (!userInput) return "";

    let uncapped = userInput.split("-");
    let cappedWords = uncapped.map(uncapped => uncapped.charAt(0).toUpperCase() + uncapped.slice(1));
    let formattedInput = cappedWords.join(" ");

    return formattedInput;
  }










  return (
    <div className=' h-[100vh] bg-slate-600 m-3 md:m-8 flex justify-center'>
      <div className='mb-6'>
        <p className="text-center title text-6xl mt-4 md:text-8xl">One Dex</p>

        <div className="mb-5 mt-11 flex justify-center">
          <input type="text" id="searchBar" placeholder="Pokemon Name/Number" className="bg-gray-50 border  md:text-4xl w-60 md:w-[500px] border-gray-300 text-gray-900  rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div>

        <div className="flex justify-center">
          <button id="btn2" type="button" className="text-white bg-gradient-to-r md:text-3xl from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg  px-5 py-2.5 text-center me-5 md:me-11 mb-2 ">Favorites</button>
          <button id="btn" type="button" className="text-white bg-gradient-to-r md:text-3xl  from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-1 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg  px-5 py-2.5 text-center me-2 mb-2">Random</button>

        </div>


        <div className="flex justify-center">
          <div className='flex'>


            <div className=""><p id="pokeName" className="text-4xl md:text-5xl mt-5">{pokemon && pokemon ? CapitalFirstLetter(pokemon.name) : "Bulbasaur"}</p></div>
            <div className="favEmpt "><img id="favBtn" className="h-[25px] md:h-[33px] flex ml-5" src={favorite} alt="favorite pokemon btn" /></div>

          </div>
        </div>
        <div>
          <p className="text-center text-4xl mt-4" id="pokeNum">#<span>001</span> </p>
        </div>
        <div id="pokeTypes" className="flex  mt-9 justify-evenly">


        </div>

        <div className="flex justify-center">
          <img className="w-[475px]" id="pokeImg" src={bulb} alt="A pokemon" />
        </div>

        <div className="max-w-[600px] px-5">
          <p className="outlined decoration-white decoration-2 underline text-center text-6xl text-white">Evolutions</p>
          <div id="evoPath" className="text-center text-[40px] text-white outlined2">
            <p>Bulbasaur</p>
            <p>Ivysaur</p>
            <p>Venasaur</p>
          </div>
          <hr className="breakers" />
          <div className="flex text-white outlined2 text-3xl md:text-5xl mb-4 ">
            <p className="mr-5">Location:</p>
            <p id="loc"></p>
          </div>
          <hr className="breakers" />
          <div className="flex text-white outlined2 text-3xl md:text-5xl my-4">
            <p className="mr-5"> Abilities:</p>
            <p id="abilities" className="overflow-scroll max-h-[100px]"> </p>

          </div>
          <hr className="breakers" />
          <div className="flex text-white outlined2 text-3xl md:text-5xl mt-4 ">
            <p className="mr-5">Moves:</p>
            <p id="moves" className="overflow-scroll max-h-[187px]"></p>

          </div>

        </div>





      </div>
    </div>
  )
}

export default PokedexComponent
