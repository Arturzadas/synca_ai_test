import "./App.css";
import { Provider } from "./components/ui/provider";
import { PokeDash } from "./components/PokeDash";

function App() {
  return (
    <Provider>
      <PokeDash />
    </Provider>
  );
}

export default App;
