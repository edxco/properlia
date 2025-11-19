import { Search } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative h-screen">
      <div className="absolute inset-0 bg-stone-900/20 z-10"></div>

      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://videos.pexels.com/video-files/15204933/15204933-hd_1920_1080_24fps.mp4"
          type="video/mp4"
        />
      </video>

      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
              Buy, rent & invest in Real state<br />
              Residencial, commercial, industrial
            </h1>
            <p className="text-xl text-white/90 mb-8 font-light tracking-wide">
              Discover exceptional properties in Puebla's most desirable neighborhoods
            </p>

            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-sm shadow-2xl">
              <div className="flex flex-col md:flex-row gap-3">
                <select className="flex-1 px-4 py-3 bg-transparent border border-stone-200 text-stone-700 text-sm focus:outline-none focus:border-stone-400">
                  <option>Buy</option>
                  <option>Rent</option>
                  <option>Invest</option>
                </select>

                <select className="flex-1 px-4 py-3 bg-transparent border border-stone-200 text-stone-700 text-sm focus:outline-none focus:border-stone-400">
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Industrial</option>
                </select>

                <input
                  type="text"
                  placeholder="Location, neighborhood..."
                  className="flex-1 px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
                />

                <button className="bg-stone-900 text-white px-8 py-3 hover:bg-stone-800 transition-colors flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  <span className="text-sm tracking-wide">Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
