//componente usado em Main.jsx
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { futurosTorneios } from '../../mockData'
import TorneioCard from './Tournaments-Card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function TorneiosCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState([])

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
  }, [emblaApi, onSelect])

  return (
    <section className="mt-20">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Próximos Torneios</h2>

      <div className="relative">
        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {futurosTorneios.map((torneio) => (
              <div className="min-w-[300px] max-w-[300px] flex-shrink-0" key={torneio.id}>
                <TorneioCard {...torneio} />
              </div>
            ))}
          </div>
        </div>

        {/* Setas de navegação */}
        <button
          onClick={scrollPrev}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full hover:bg-gray-700"
        >
          <ChevronLeft className="text-white" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full hover:bg-gray-700"
        >
          <ChevronRight className="text-white" />
        </button>
      </div>

      {/* Indicadores */}
      <div className="flex justify-center gap-2 mt-4">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full ${
              index === selectedIndex ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
