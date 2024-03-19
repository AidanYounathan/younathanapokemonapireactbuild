import React from 'react'
import '../Components/PokedexComponent.css'
import favhrt from "./Assets/Vector.png"



const PokedexComponent = () => {
  return (
    <div className=' h-[100vh] bg-slate-600 m-3 md:m-8 flex justify-center'>
      <div className='mb-3'>
        <p className="text-center title text-6xl mt-4 md:text-8xl">One Dex</p>

        <div className="mb-5 mt-11 flex justify-center">
          <input type="text" id="searchBar" placeholder="Pokemon Name/Number" className="bg-gray-50 border  md:text-4xl w-60 md:w-[500px] border-gray-300 text-gray-900  rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div>

        <div className="flex justify-center">
          <button id="btn2" type="button" className="text-white bg-gradient-to-r md:text-3xl from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg  px-5 py-2.5 text-center me-5 md:me-11 mb-2 ">Favorites</button>
          <button id="btn" type="button" className="text-white bg-gradient-to-r md:text-3xl  from-red-500 via-red-600 to-red-700 hover:bg-gradient-to-br focus:ring-1 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg  px-5 py-2.5 text-center me-2 mb-2">Random</button>

        </div>


        <div className="flex justify-center">
          <div>


            <div className=""><p id="pokeName" className="text-4xl md:text-5xl mt-5">Bulbasaur</p></div>
            <div className="favEmpt "><img id="favBtn" className="h-[25px] md:h-[33px] flex ml-5" src={favhrt} alt="favorite pokemon btn" /></div>
            
          </div>
        </div>
        <div>
          <p className="text-center text-4xl mt-4" id="pokeNum">#<span>001</span> </p>
        </div>
        <div id="pokeTypes" className="flex  mt-9 justify-evenly">


        </div>

        <div className="flex justify-center">
          <img className="w-[475px]" id="pokeImg" src="" alt="A pokemon" />
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
