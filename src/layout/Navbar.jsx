import { NavLink } from "react-router-dom";
import "./Navbar.css"

export default function Navbar() {
  return (
    <>
      <header>
        <p>Tend</p>
        <nav>
          <NavLink to="/Dashboard" className="link">Home</NavLink>
          <NavLink to="/Commitment" className="link">Commitment</NavLink>
          <NavLink to="/Profile" className="link">Personal</NavLink>
        </nav>
      </header>
    </>
  );
}
