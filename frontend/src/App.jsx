import Main from './components/home/Mainhome';
import Final from './components/home/Finalhome';
import "tailwindcss";

function App() {
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <Main />
      <Final />
    </div>
  );
}

export default App;
