import Main from './components/home/Mainhome';
import Final from './components/home/Finalhome';
import "tailwindcss";

function App() {
  return (
    <div className='bg-gray-900'>
      <div>
        <Main />
        <div/>
        <div>
          <Final />
        </div>
      </div>
    </div>
  );
}

export default App;
