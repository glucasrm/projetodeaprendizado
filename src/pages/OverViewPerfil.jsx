import React from 'react';
import VisaoGeralCard from '../components/VisaoGeralCard'; // ✅ corrigido aqui
import { MockBio } from '../MockBio'; // ✅

const OverViewPerfil = () => {
  return (    
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MockBio.map((usuario) => (
          <div key={usuario.id}>
            <VisaoGeralCard {...usuario} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default OverViewPerfil;
