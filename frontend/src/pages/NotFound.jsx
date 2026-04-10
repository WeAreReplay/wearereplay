import { Link } from "react-router-dom";
import "../assets/css/notfound.css";
import NotFoundTitle from "../components/SVGs/NotFoundTitle";

export default function NotFound() {
  return (
    <main className="notfound-main">
      <section>
        <div className="width-wrap">
          <h1>
            <NotFoundTitle />
          </h1>
          <h2>Page Not Found</h2>
          <Link to="/">Back To Home</Link>
        </div>
      </section>
    </main>
  );
}
