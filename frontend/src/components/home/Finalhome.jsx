{/*componente usado na página home */}

export default function Final() {
  return (
    <footer className="flex flex-row items-center justify-center py-9 bg-gray-900">
      <div className="w-full max-w-4xl flex flex-row gap-5 items-start">
        <div className="text-white">
          <p>© TremLoco 2025</p>
        </div>
        <div className="text-white">
          <p>Termos de uso</p>
        </div>
        <div>
          <p className="text-white">
            Políticas de Privacidade
          </p>
        </div>
      </div>
    </footer>
  );
}


