import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png';
export default function Cadastro() {
    
    const navigate = useNavigate();
return (
    <div className="flex justify-center h-full bg-gray-950 text-white">

        <div className=" px-4 py-8 rounded-2xl bg-gray-900 shadow-md">
            <p className="flex justify-center mx-auto"
                  >
                    <button onClick={() =>navigate('/')}>
                    <img src={Logo} className="w-10 h-auto" alt="Trem Loco" />
                    </button>
                  </p>

          <h1 className=" flex justify-center font-bold text-5xl mb-1 mt-6">Cadastre-se
          </h1>

          <p className="flex justify-center mt-5 flex row text-gray-500"> Já tem conta?
            <button className="hover:text-blue-500 text-blue-400"onClick={() =>navigate('/login')} >Login</button>
          </p>

<div className="mt-4">
    
<button
  type="button"
  className="text-white bg-[#3b5998] hover:bg-[#3b5998]/90 focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 me-2 mb-2"
>
  <svg
    className="w-4 h-4 me-2"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 8 19"
  >
    <path
      fillRule="evenodd"
      d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
      clipRule="evenodd"
    />
  </svg>
  Entrar com o Facebook
</button>





<button
  type="button"
  className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2"
>
  <svg
    className="w-4 h-4 me-2"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 18 19"
  >
    <path
      fillRule="evenodd"
      d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
      clipRule="evenodd"
    />
  </svg>
  Entrar com o google
</button>

<button
  type="button"
  className="text-white bg-[#050708] hover:bg-[#050708]/90 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 me-2 mb-2"
>
  <svg
    className="w-5 h-5 me-2 -ms-1"
    aria-hidden="true"
    focusable="false"
    data-prefix="fab"
    data-icon="apple"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
  >
    <path
      fill="currentColor"
      d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
    ></path>
  </svg>
  Entrar com a apple
</button>

<p className=" flex justify-center mt-4">
    ou
</p>

</div>

            <div className="mt-4">
            <form>
  <div className="grid gap-6 mb-6 md:grid-cols-2">
    <div>
      <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Nome
      </label>
      <input
        type="text"
        id="first_name"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 
                   focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
                   dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Jacinto"
        required
      />
    </div>
    <div>
      <label htmlFor="last_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Sobrenome
      </label>
      <input
        type="text"
        id="last_name"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 
                   focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
                   dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Pinto"
        required
      />
    </div>
   
    <div>
      <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Telefone
      </label>
      <input
        type="tel"
        id="phone"
        pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 
                   focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
                   dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="4002-8922"
        required
      />
    </div>
 
    
  </div>

  <div className="mb-6">
    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      Email
    </label>
    <input
      type="email"
      id="email"
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 
                 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
                 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder="Jaincintopinto@ado.com"
      required
    />
  </div>

  <div className="mb-6">
    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      Crie sua senha
    </label>
    <input
      type="password"
      id="password"
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 
                 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
                 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder="•••••••••"
      required
    />
  </div>

  <div className="mb-6">
    <label htmlFor="confirm_password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      Confirme sua senha
    </label>
    <input
      type="password"
      id="confirm_password"
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 
                 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
                 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder="•••••••••"
      required
    />
  </div>

  <div className="flex items-start mb-6">
    <div className="flex items-center h-5">
      <input
        id="remember"
        type="checkbox"
        className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 
                   dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
        required
      />
    </div>
    <label htmlFor="remember" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
      Eu concordo com os termos{' '}
      <a href="#" className="text-blue-600 hover:underline dark:text-blue-500">
        Termos de uso
      </a>
      .
    </label>
  </div>

  <button
    type="submit"
    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 
               font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center 
               dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
  >
    Cadastrar
  </button>
</form>

            </div>

        </div>
      
      </div>
)
    
}