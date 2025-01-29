import { useState } from "react";
import SearchCard from "./SearchCard";

export default function SearchBar() {
  const [search, setSearch] = useState("");

  return (
    <div role="search">
      <input
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        role="searchbox"
        type="text"
        name="searchbox"
      />
      {search && <div aria-label="Found users">Something</div>}
    </div>
  );
}
