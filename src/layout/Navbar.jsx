import { NavLink } from "react-router-dom";
import sprouticon from "../assets/images/sprout-icon.jpeg"
import "./Navbar.css"

export default function Navbar() {
  return (
    <>
      <header>
        <NavLink to="/Dashboard" className="link">
        <div className="tend">
          <img src={sprouticon} alt="Sprout Icon" className="sprout-icon" />
          <p className="tend-text">Tend</p>
        </div>
        </NavLink>
        <nav>
          <NavLink to="/Dashboard" className="link">Home</NavLink>
          <NavLink to="/Commitment" className="link">Commitment</NavLink>
          <NavLink to="/Profile" className="link">Personal</NavLink>
        </nav>
      </header>
    </>
  );
}
