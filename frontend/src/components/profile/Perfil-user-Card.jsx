
const PerfilCard = ({ avatar, nome, bio, banner }) => {
  return (
    <div className="flex flex-col items-center text-center w-full">
      {/* Banner com gradiente escuro */}

      {/* Avatar sobreposto */}
      <div className="absolute top-86 transform -translate-x-1/2 left-1/2">
        <img
          src={avatar}
          alt="Avatar do usuário"
          className="w-36 h-36 rounded-full object-cover shadow-lg bg-white"
        />
      </div>

      {/* Nome e Bio */}
      <div >
        <h1 className="text-3xl font-bold text-white">{nome}</h1>
        <p className="text-gray-400 mt-2 max-w-xl">{bio}</p>
      </div>
    </div>
  );
};

export default PerfilCard;