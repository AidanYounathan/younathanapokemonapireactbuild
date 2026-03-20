import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./PokedexComponent.css";
import unfavhrt from "./Assets/Vector.png";
import favhrt from "./Assets/favorited.png";
import {
  Evolution,
  Location1,
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

/* ── Helpers (pure, outside component) ── */

const capitalize = (str: string): string => {
  if (!str) return "";
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const readFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem("Favorites");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeFavorites = (favs: string[]) => {
  localStorage.setItem("Favorites", JSON.stringify(favs));
};

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SPA",
  "special-defense": "SPD",
  speed: "SPE",
};

const STAT_COLORS: Record<string, string> = {
  hp: "#ef4444",
  attack: "#f97316",
  defense: "#eab308",
  "special-attack": "#6366f1",
  "special-defense": "#22c55e",
  speed: "#ec4899",
};

/* ── Component ── */

const PokedexComponent: React.FC = () => {
  const [userInput, setUserInput] = useState("Bulbasaur");
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [location, setLocation] = useState<Location1>();
  const [imgSrc, setImgSrc] = useState("");
  const [pokemonEvoData, setPokeEvoData] = useState<string[]>([]);
  const [evolutionDatas, setEvolutionData] = useState<
    { evolutionImage: string; evolutionId: string }[]
  >([]);
  const [favorites, setFavorites] = useState<string[]>(readFavorites);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ref to avoid stale closure in search handler
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Fetch pokemon data ── */
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setImgSrc("");

      try {
        const pokemonData = await pokeData(userInput);
        if (cancelled) return;

        const [locationData, evolutionData] = await Promise.all([
          getAPI(pokemonData.location_area_encounters),
          pokeDataEvo(userInput),
        ]);
        if (cancelled) return;

        const evoTypeData = await getAPI(
          (evolutionData as Evolution).evolution_chain.url
        );
        if (cancelled) return;

        const evoType: RegEvolution | any = evoTypeData;

        // Parse evolution chain
        const chain: string[] = [];
        if (evoType?.chain) {
          chain.push(evoType.chain.species.name);
          evoType.chain.evolves_to.forEach(
            (e: { species: { name: string }; evolves_to: any[] }) => {
              if (e.species) chain.push(e.species.name);
              e.evolves_to?.forEach((e2: any) => {
                if (e2.species) chain.push(e2.species.name);
              });
            }
          );
        }

        setPokemon(pokemonData);
        setLocation(locationData);
        setPokeEvoData(chain);
      } catch (err) {
        // silently fail for bad input
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [userInput]);

  /* ── Fetch evolution images once chain names change ── */
  const fetchEvolutionData = useCallback(async () => {
    if (pokemonEvoData.length === 0) return;

    const results = await Promise.all(
      pokemonEvoData.map(async (name) => {
        const [evolutionImage, evolutionId] = await Promise.all([
          PokemonEvolutionImageName(name),
          PokemonEvolutionId(name),
        ]);
        return { evolutionImage, evolutionId: String(evolutionId) };
      })
    );
    setEvolutionData(results);
  }, [pokemonEvoData]);

  useEffect(() => {
    fetchEvolutionData();
  }, [fetchEvolutionData]);

  /* ── Favorite logic ── */
  const isFavorite = useMemo(
    () => (pokemon ? favorites.includes(pokemon.name) : false),
    [pokemon, favorites]
  );

  const toggleFavorite = useCallback(
    (name: string) => {
      setFavorites((prev) => {
        const next = prev.includes(name)
          ? prev.filter((n) => n !== name)
          : [...prev, name];
        writeFavorites(next);
        return next;
      });
    },
    []
  );

  /* ── Actions ── */
  const handleRandom = useCallback(async () => {
    const id = String(Math.floor(Math.random() * 898) + 1);
    const data = await pokeData(id);
    setUserInput(data.name);
  }, []);

  const handleShiny = useCallback(() => {
    if (!pokemon) return;
    const shiny = pokemon.sprites.other?.["official-artwork"].front_shiny;
    const def = pokemon.sprites.other?.["official-artwork"].front_default;
    if (shiny && imgSrc !== shiny) setImgSrc(shiny);
    else if (def && imgSrc !== def) setImgSrc(def);
  }, [pokemon, imgSrc]);

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const val = (e.target as HTMLInputElement).value.trim();
        if (val) setUserInput(val);
      }
    },
    []
  );

  /* ── Memoized stat bars ── */
  const statBars = useMemo(() => {
    if (!pokemon?.stats) return null;
    return pokemon.stats.map(
      (s: { base_stat: number; stat: { name: string } }) => {
        const pct = Math.min((s.base_stat / 255) * 100, 100);
        const label = STAT_LABELS[s.stat.name] || s.stat.name.toUpperCase();
        const color = STAT_COLORS[s.stat.name] || "#818cf8";
        return (
          <div key={s.stat.name} className="stat-row">
            <span className="stat-name">{label}</span>
            <div className="stat-bar-bg">
              <div
                className="stat-bar-fill"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
              />
            </div>
            <span className="stat-val">{s.base_stat}</span>
          </div>
        );
      }
    );
  }, [pokemon]);

  /* ── Memoized move tags ── */
  const moveTags = useMemo(() => {
    if (!pokemon?.moves) return null;
    return pokemon.moves.map(
      (m: { move: { name: string } }, i: number) => (
        <span key={i} className="move-tag">
          {capitalize(m.move.name)}
        </span>
      )
    );
  }, [pokemon]);

  /* ── Render ── */
  const displayImg =
    imgSrc ||
    pokemon?.sprites.other?.["official-artwork"].front_default;

  return (
    <div className="pokedex-shell">
      {/* ===== TOP BAR ===== */}
      <div className="top-bar">
        <p className="title">One Dex</p>
        <input
          ref={inputRef}
          type="text"
          placeholder="Name or #"
          className="search-input"
          onKeyDown={handleSearch}
        />
        <div className="btn-group">
          <button className="btn-modern btn-favorites" onClick={() => setDrawerOpen((o) => !o)}>
            Favorites
          </button>
          <button className="btn-modern btn-random" onClick={handleRandom}>
            Random
          </button>
          <button className="btn-modern btn-shiny" onClick={handleShiny}>
            ✦ Shiny
          </button>
        </div>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="main-grid">
        {/* — Left Panel — */}
        <div className="left-panel">
          <div className="pokemon-header">
            <p className="poke-name">
              {loading ? (
                <span className="skeleton skeleton-text" style={{ width: "8rem", display: "inline-block" }}>&nbsp;</span>
              ) : (
                pokemon ? capitalize(pokemon.name) : "—"
              )}
            </p>
            <span className="poke-id">
              {pokemon?.id ? `#${String(pokemon.id).padStart(3, "0")}` : ""}
            </span>
            {pokemon && (
              <img
                onClick={() => toggleFavorite(pokemon.name)}
                className="fav-heart-img"
                src={isFavorite ? favhrt : unfavhrt}
                alt="favorite"
              />
            )}
          </div>

          <div className="type-row">
            {pokemon?.types.map(
              (t: { type: { name: string } }, i: number) => (
                <span key={i} className={`type-badge type-${t.type.name}`}>
                  {t.type.name}
                </span>
              )
            )}
          </div>

          <div className="pokemon-image-container">
            {loading ? (
              <div className="skeleton skeleton-img" />
            ) : (
              displayImg && (
                <img
                  key={displayImg}
                  src={displayImg}
                  onClick={handleShiny}
                  alt={pokemon?.name || "Pokemon"}
                />
              )
            )}
          </div>

          {/* Evolution Chain */}
          <div className="evo-section">
            <p className="info-label">Evolution Chain</p>
            <div className="evo-chain">
              {evolutionDatas.length > 0
                ? evolutionDatas.map((evo, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="evo-arrow">→</span>}
                      <div
                        className="evo-item"
                        onClick={() => setUserInput(pokemonEvoData[i])}
                      >
                        <img
                          className="evo-img"
                          src={evo.evolutionImage}
                          alt={pokemonEvoData[i]}
                          loading="lazy"
                        />
                        <span className="evo-name">
                          {capitalize(pokemonEvoData[i])}
                        </span>
                      </div>
                    </React.Fragment>
                  ))
                : pokemonEvoData.map((name, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="evo-arrow">→</span>}
                      <span className="evo-name-tag">{capitalize(name)}</span>
                    </React.Fragment>
                  ))}
            </div>
          </div>
        </div>

        {/* — Right Panel — */}
        <div className="right-panel">
          {/* Location */}
          <div className="info-section">
            <p className="info-label">Location</p>
            <div className="info-content info-scroll">
              {location && Array.isArray(location) && location.length > 0
                ? (location as any[]).map(
                    (loc: { location_area: { name: string } }, i: number) => (
                      <span key={i}>
                        {capitalize(loc.location_area.name)}
                        {i !== (location as any[]).length - 1 && ", "}
                      </span>
                    )
                  )
                : "Location Unknown"}
            </div>
          </div>

          {/* Abilities */}
          <div className="info-section">
            <p className="info-label">Abilities</p>
            <div className="info-content">
              {pokemon?.abilities.map(
                (a: { ability: { name: string } }, i: number) => (
                  <span key={i}>
                    {capitalize(a.ability.name)}
                    {i !== pokemon.abilities.length - 1 && ", "}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Base Stats */}
          <div className="info-section stats-section">
            <p className="info-label">Base Stats</p>
            <div className="stats-grid">{statBars}</div>
          </div>

          {/* Moves */}
          <div className="info-section moves-section">
            <p className="info-label">Moves</p>
            <div className="info-content moves-content">
              <div className="moves-grid">{moveTags}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DRAWER OVERLAY ===== */}
      <div
        className={`drawer-overlay ${drawerOpen ? "visible" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ===== FAVORITES DRAWER ===== */}
      <div className={`drawer-panel ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <p className="drawer-title">Favorites</p>
          <button
            onClick={() => setDrawerOpen(false)}
            className="fav-remove-btn"
          >
            ✕
          </button>
        </div>
        <div>
          {favorites.map((name, i) => (
            <div key={i} className="fav-item">
              <span
                className="fav-item-name"
                onClick={() => {
                  setUserInput(name);
                  setDrawerOpen(false);
                }}
              >
                {capitalize(name)}
              </span>
              <button
                className="fav-remove-btn"
                onClick={() => toggleFavorite(name)}
              >
                ✕
              </button>
            </div>
          ))}
          {favorites.length === 0 && (
            <p className="fav-empty">No favorites yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PokedexComponent;
