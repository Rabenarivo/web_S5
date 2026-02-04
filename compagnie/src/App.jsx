import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🚀 Mon projet React</h1>
        <p>Projet initial prêt à être développé</p>
      </header>

      <main className="app-main">
        <p>Compteur de test :</p>
        <button onClick={() => setCount(count + 1)}>
          Compter : {count}
        </button>
      </main>

      <footer className="app-footer">
        <small>© {new Date().getFullYear()} - Mon App</small>
      </footer>
    </div>
  );
}

export default App;
