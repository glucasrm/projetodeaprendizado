import Main from './components/Main'
import Final from './components/Final'
import "tailwindcss";


function App() {
  return (
    <>
    {/*adiciona o fundo */}
    
      <div 
       className= ' bg-gray-900'
        >
         
         
          <div className='' >
          <Main />
          <div/>
          
          <div className=''> 
          <Final/>
          </div>
            
          
      </div>
        
          
      </div>
     

      
    </>
  );
}

export default App