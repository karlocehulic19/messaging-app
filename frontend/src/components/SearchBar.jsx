import { useEffect, useCallback, useState, useRef } from "react";
import useDebounce from "../hooks/useDebounce";
import SearchCard from "./SearchCard";
import customFetch from "../utils/customFetch";
import apiErrorLogger from "../utils/apiErrorLogger";
import styles from "./styles/SearchBar.module.css";

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [searchBarState, setSearchBarState] = useState("result");
  const [focused, setFocus] = useState(false);
  const searchBarRef = useRef();
  const searchDivRef = useRef();

  const isOpen =
    (users.length ||
      searchBarState == "loading" ||
      searchBarState == "notfound" ||
      searchBarState == "error") &&
    focused;

  const fetchUsers = useCallback((url) => {
    customFetch(url)
      .then((response) => response.json())
      .then((users) => {
        setUsers(users);
        setSearchBarState("result");
      })
      .catch((error) => {
        setSearchBarState("error");
        apiErrorLogger(error);
      });
  }, []);

  if (!users.length && search && searchBarState == "result")
    setSearchBarState("notfound");
  else if (search == "" && searchBarState == "loading")
    setSearchBarState("result");
  useDebounce(
    useCallback(() => {
      if (search != "") {
        fetchUsers(`/users?s=${search}`);
      }
    }, [search, fetchUsers]),
    500,
    search
  );

  useEffect(() => {
    fetchUsers("/users");
  }, [fetchUsers]);

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
      ref={searchDivRef}
      role="search"
      id={styles["user-search-bar"]}
      className={isOpen ? styles.open : null}
    >
      <input
        ref={searchBarRef}
        onChange={handleSearchChange}
        value={search}
        role="searchbox"
        type="text"
        name="searchbox"
        placeholder="Search for users by username..."
        id={styles.searchbar}
      />
      {focused && (
        <div id={styles["user-search-listings"]} aria-label="Found users">
          {searchBarState == "error" && <span>Ups! An error occurred!</span>}
          {searchBarState == "loading" && <span>Searching...</span>}
          {searchBarState == "notfound" && <span>No users found</span>}
          {searchBarState == "result" &&
            users.map((user) => (
              <SearchCard
                key={user.username}
                username={user.username}
                closeSearchbar={() => setFocus(false)}
              ></SearchCard>
            ))}
        </div>
      )}
    </div>
  );
}
