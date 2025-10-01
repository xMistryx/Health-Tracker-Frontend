import meditate from "../../assets/images/meditate.png";
import "./Error404.css";

export default function Error404() {
  return (
  <div className="errcontainer">
    <div className="errtop">
      <h1 className="errh1">404</h1>
      <img src={meditate} alt="person in lotus position" className="errimg" />
    </div>
    <div className="errmessage">
    <p className="errp">Page not found.</p>
    <p className="errp">Oops! That page didn’t pass the taste test or skipped leg day.</p>
    <p className="errp">Maybe it was a low-carb route that went too low...</p>
    <p><a href="/dashboard" className="erra">Return to dashboard before your smoothie melts</a></p>
    </div>
  </div>
  );
}
