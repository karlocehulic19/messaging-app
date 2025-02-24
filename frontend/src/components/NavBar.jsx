import SearchBar from "./SearchBar";
import styles from "./styles/Navbar.module.css";

export default function Navbar() {
  return (
    <div id={styles.navbar}>
      <SearchBar />
    </div>
  );
}
