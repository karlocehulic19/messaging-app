import SearchBar from "./SearchBar";
import styles from "./styles/Navbar.module.css";
import OptionsButton from "./OptionsButton";

export default function Navbar() {
  return (
    <div id={styles.navbar}>
      <SearchBar />
      <OptionsButton />
    </div>
  );
}
