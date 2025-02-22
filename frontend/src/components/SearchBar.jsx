import { useCallback, useState, useRef } from "react";
import useDebounce from "../hooks/useDebounce";
import SearchCard from "./SearchCard";
import customFetch from "../utils/customFetch";
import apiErrorLogger from "../utils/apiErrorLogger";

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [searchBarState, setSearchBarState] = useState("result");
  const [focused, setFocus] = useState(false);
  const searchBarRef = useRef();

  if (!users.length && search && searchBarState == "result")
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
            setSearchBarState("result");
          })
          .catch((error) => {
            setSearchBarState("error");
            apiErrorLogger(error);
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

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setFocus(false);
    }
  };

  return (
    <div
      tabIndex={-1}
      onFocus={() => setFocus(true)}
      onBlur={handleBlur}
      role="search"
    >
      <input
        ref={searchBarRef}
        onChange={handleSearchChange}
        value={search}
        role="searchbox"
        type="text"
        name="searchbox"
      />
      {focused && (
        <div aria-label="Found users">
          {searchBarState == "error" && <span>Ups! An error occurred!</span>}
          {searchBarState == "loading" && <span>Searching...</span>}
          {searchBarState == "notfound" && <span>No users found</span>}
          {searchBarState == "result" &&
            users.map((user) => (
              <SearchCard
                key={user.username}
                username={user.username}
                searchBarRef={searchBarRef}
              ></SearchCard>
            ))}
        </div>
      )}
    </div>
  );
}
