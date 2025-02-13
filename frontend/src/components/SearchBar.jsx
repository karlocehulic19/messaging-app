import { useCallback, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import SearchCard from "./SearchCard";
import customFetch from "../utils/customFetch";

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);

  useDebounce(
    useCallback(() => {
      if (search != "") {
        customFetch(`/users?s=${search}`)
          .then((response) => response.json())
          .then((users) => setUsers(users));
      }
    }, [search]),
    500,
    search
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
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
        {users.map((user) => (
          <SearchCard key={user.username} username={user.username}></SearchCard>
        ))}
      </div>
    </div>
  );
}
