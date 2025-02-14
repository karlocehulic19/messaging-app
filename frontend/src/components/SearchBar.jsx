import { useCallback, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import SearchCard from "./SearchCard";
import customFetch from "../utils/customFetch";

// searching state -> while typing, or while fetching
// not found state -> while something in searchbar but none of the users are found
// states: empty -> might be controlled with users (when search is empty)
//         nonempty -> when users are found
//         loading -> while typing and fetching data, really should be there when users data aren't representing searched ones
//         notfound -> while users represent right data but that data is empty

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [searchBarState, setSearchBarState] = useState("result");

  if (
    !users.length &&
    search &&
    searchBarState != "notfound" &&
    searchBarState != "loading"
  )
    setSearchBarState("notfound");
  else if (search == "" && searchBarState == "loading")
    setSearchBarState("result");
  useDebounce(
    useCallback(() => {
      if (search != "") {
        customFetch(`/users?s=${search}`)
          .then((response) => response.json())
          .then((users) => {
            setUsers(users);
          })
          .finally(() => {
            setSearchBarState("result");
          });
      }
    }, [search]),
    500,
    search
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setSearchBarState("loading");
  };

  return (
    <div role="search">
      <input
        onChange={handleSearchChange}
        value={search}
        role="searchbox"
        type="text"
        name="searchbox"
      />
      <div aria-label="Found users">
        {searchBarState == "loading" && <span>Searching...</span>}
        {searchBarState == "notfound" && <span>No users found</span>}
        {searchBarState == "result" &&
          users.map((user) => (
            <SearchCard
              key={user.username}
              username={user.username}
            ></SearchCard>
          ))}
      </div>
    </div>
  );
}
