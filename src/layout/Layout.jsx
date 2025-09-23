import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  const location = useLocation();
  const hideNavbar = ["/", "/signin", "/signup"].includes(location.pathname);
  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>
        <Outlet />
      </main>
    </>
  );
}
