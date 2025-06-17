import Main from './components/home/Mainhome'
import Final from './components/home/Finalhome'
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